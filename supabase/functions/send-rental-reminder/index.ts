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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find viewings where tenant confirmed rental 24-48 hours ago but landlord hasn't confirmed
    // Window ensures reminder is sent once (cron runs hourly, window is 24h wide)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: viewings, error: fetchError } = await supabaseAdmin
      .from("viewing_requests")
      .select("id, room_id, tenant_id, landlord_id, tenant_rental_confirmed_at")
      .eq("status", "confirmed")
      .eq("tenant_rental_confirmed", true)
      .eq("landlord_rental_confirmed", false)
      .lt("tenant_rental_confirmed_at", twentyFourHoursAgo)
      .gt("tenant_rental_confirmed_at", fortyEightHoursAgo)
      .not("tenant_rental_confirmed_at", "is", null);

    if (fetchError) {
      console.error("Error fetching viewings:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!viewings || viewings.length === 0) {
      console.log("No pending rental confirmations to remind");
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;

    for (const viewing of viewings) {
      try {
        // Get landlord profile
        const { data: landlord } = await supabaseAdmin
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", viewing.landlord_id)
          .single();

        // Get tenant name
        const { data: tenant } = await supabaseAdmin
          .from("profiles")
          .select("full_name")
          .eq("user_id", viewing.tenant_id)
          .single();

        // Get room title
        const { data: room } = await supabaseAdmin
          .from("rooms")
          .select("title")
          .eq("id", viewing.room_id)
          .single();

        if (!landlord?.email) continue;

        const tenantName = escapeHtml(tenant?.full_name || "The tenant");
        const roomTitle = escapeHtml(room?.title || "your listing");
        const landlordName = escapeHtml(landlord.full_name || "there");
        const appUrl = "https://sakanakeg.com";

        const html = buildEmailHtml({
          subject: `Rental Confirmation Pending — "${roomTitle}"`,
          preheader: `${tenantName} is waiting for your confirmation`,
          heading: "Rental confirmation needed",
          headingEmoji: "⏰",
          body: `
            <p style="margin: 0 0 16px 0;">Hey ${landlordName}! <strong>${tenantName}</strong> confirmed the rental for your listing over 24 hours ago:</p>
            ${infoBox(`<p style="margin: 0; color: #333;"><strong>🏠</strong> ${roomTitle}</p>`)}
            ${statusCard("⏳", "Waiting for your confirmation", "The tenant has already confirmed. Please confirm from your side to complete the rental process.")}
            <p style="margin: 16px 0 0 0;">If you don't want to proceed, you can cancel the booking from your viewings page.</p>
          `,
          ctaText: "Confirm Rental →",
          ctaUrl: `${appUrl}/my-viewings`,
        });

        const { error: emailError } = await resend.emails.send({
          from: "Sakanak <noreply@sakanakeg.com>",
          to: [landlord.email],
          subject: `⏰ Rental Confirmation Pending — "${room?.title || "Your listing"}"`,
          html,
        });

        if (emailError) {
          console.error(`Failed to send reminder for viewing ${viewing.id}:`, emailError);
        } else {
          sent++;
          console.log(`Reminder sent to ${landlord.email} for viewing ${viewing.id}`);
        }
      } catch (err) {
        console.error(`Error processing viewing ${viewing.id}:`, err);
      }
    }

    return new Response(JSON.stringify({ sent, total: viewings.length }), {
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
