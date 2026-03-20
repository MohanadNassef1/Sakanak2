import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import { buildEmailHtml, statusCard, infoBox } from "../_shared/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

interface ReminderTier {
  label: string;
  minHours: number;
  maxHours: number;
  subject: (roomTitle: string) => string;
  heading: string;
  headingEmoji: string;
  bodyFn: (landlordName: string, tenantName: string, roomTitle: string) => string;
  statusEmoji: string;
  statusTitle: string;
  statusDesc: string;
}

const TIERS: ReminderTier[] = [
  {
    label: "24h",
    minHours: 24,
    maxHours: 48,
    subject: (t) => `⏰ Rental Confirmation Pending — "${t}"`,
    heading: "Rental confirmation needed",
    headingEmoji: "⏰",
    bodyFn: (ln, tn, rt) =>
      `<p style="margin: 0 0 16px 0;">Hey ${ln}! <strong>${tn}</strong> confirmed the rental for your listing over 24 hours ago:</p>
       ${infoBox(`<p style="margin: 0; color: #333;"><strong>🏠</strong> ${rt}</p>`)}`,
    statusEmoji: "⏳",
    statusTitle: "Waiting for your confirmation",
    statusDesc: "The tenant has already confirmed. Please confirm from your side to complete the rental process.",
  },
  {
    label: "48h",
    minHours: 48,
    maxHours: 72,
    subject: (t) => `🚨 Urgent: Confirm Rental Now — "${t}"`,
    heading: "Action required — rental still unconfirmed",
    headingEmoji: "🚨",
    bodyFn: (ln, tn, rt) =>
      `<p style="margin: 0 0 16px 0;">Hey ${ln}, this is a final reminder. <strong>${tn}</strong> confirmed the rental for your listing <strong>over 48 hours ago</strong> and is still waiting:</p>
       ${infoBox(`<p style="margin: 0; color: #333;"><strong>🏠</strong> ${rt}</p>`)}`,
    statusEmoji: "🔴",
    statusTitle: "Urgent — tenant is waiting",
    statusDesc: "Please confirm the rental as soon as possible. Continued delays may cause the tenant to lose interest.",
  },
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const appUrl = "https://sakanakeg.com";
    let totalSent = 0;

    for (const tier of TIERS) {
      const minAgo = new Date(Date.now() - tier.minHours * 60 * 60 * 1000).toISOString();
      const maxAgo = new Date(Date.now() - tier.maxHours * 60 * 60 * 1000).toISOString();

      const { data: viewings, error: fetchError } = await supabaseAdmin
        .from("viewing_requests")
        .select("id, room_id, tenant_id, landlord_id, tenant_rental_confirmed_at")
        .eq("status", "confirmed")
        .eq("tenant_rental_confirmed", true)
        .eq("landlord_rental_confirmed", false)
        .lt("tenant_rental_confirmed_at", minAgo)
        .gt("tenant_rental_confirmed_at", maxAgo)
        .not("tenant_rental_confirmed_at", "is", null);

      if (fetchError) {
        console.error(`Error fetching ${tier.label} viewings:`, fetchError);
        continue;
      }

      if (!viewings || viewings.length === 0) {
        console.log(`No ${tier.label} reminders to send`);
        continue;
      }

      for (const viewing of viewings) {
        try {
          const [{ data: landlord }, { data: tenant }, { data: room }] = await Promise.all([
            supabaseAdmin.from("profiles").select("email, full_name").eq("user_id", viewing.landlord_id).single(),
            supabaseAdmin.from("profiles").select("full_name").eq("user_id", viewing.tenant_id).single(),
            supabaseAdmin.from("rooms").select("title").eq("id", viewing.room_id).single(),
          ]);

          if (!landlord?.email) continue;

          const tenantName = escapeHtml(tenant?.full_name || "The tenant");
          const roomTitle = escapeHtml(room?.title || "your listing");
          const landlordName = escapeHtml(landlord.full_name || "there");

          const html = buildEmailHtml({
            subject: tier.subject(room?.title || "Your listing"),
            preheader: `${tenantName} is waiting for your confirmation`,
            heading: tier.heading,
            headingEmoji: tier.headingEmoji,
            body: `
              ${tier.bodyFn(landlordName, tenantName, roomTitle)}
              ${statusCard(tier.statusEmoji, tier.statusTitle, tier.statusDesc)}
              <p style="margin: 16px 0 0 0;">If you don't want to proceed, you can cancel the booking from your viewings page.</p>
            `,
            ctaText: "Confirm Rental →",
            ctaUrl: `${appUrl}/my-viewings`,
          });

          const { error: emailError } = await resend.emails.send({
            from: "Sakanak <noreply@sakanakeg.com>",
            to: [landlord.email],
            subject: tier.subject(room?.title || "Your listing"),
            html,
          });

          if (emailError) {
            console.error(`Failed ${tier.label} reminder for viewing ${viewing.id}:`, emailError);
          } else {
            totalSent++;
            console.log(`${tier.label} reminder sent to ${landlord.email} for viewing ${viewing.id}`);
          }
        } catch (err) {
          console.error(`Error processing viewing ${viewing.id}:`, err);
        }
      }
    }

    return new Response(JSON.stringify({ sent: totalSent }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
