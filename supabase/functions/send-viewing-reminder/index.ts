import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import { buildEmailHtml, statusCard, infoBox } from "../_shared/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const REMINDER_AFTER_HOURS = 6;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const incomingSecret = req.headers.get("x-cron-secret");
    const authHeader = req.headers.get("Authorization");
    const bearer = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const cronOk = cronSecret && incomingSecret && incomingSecret === cronSecret;
    const serviceOk = bearer && bearer === serviceRoleKey;

    if (!cronOk && !serviceOk) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, serviceRoleKey);
    const appUrl = "https://sakanakeg.com";

    const cutoff = new Date(Date.now() - REMINDER_AFTER_HOURS * 60 * 60 * 1000).toISOString();

    // Viewing requests still awaiting a landlord response after 6h
    const { data: viewings, error: fetchError } = await supabaseAdmin
      .from("viewing_requests")
      .select("id, room_id, tenant_id, landlord_id, proposed_date, proposed_time_start, proposed_time_end, created_at")
      .eq("status", "pending")
      .lt("created_at", cutoff);

    if (fetchError) throw fetchError;

    let sent = 0;

    for (const viewing of viewings || []) {
      try {
        const messageId = `viewing-reminder-${viewing.id}`;

        // Only ever send one reminder per request
        const { data: already } = await supabaseAdmin
          .from("email_send_log")
          .select("id")
          .eq("message_id", messageId)
          .limit(1);
        if (already && already.length > 0) continue;

        const [{ data: landlord }, { data: tenant }, { data: room }] = await Promise.all([
          supabaseAdmin.from("profiles").select("email, full_name").eq("user_id", viewing.landlord_id).single(),
          supabaseAdmin.from("profiles").select("full_name").eq("user_id", viewing.tenant_id).single(),
          supabaseAdmin.from("rooms").select("title").eq("id", viewing.room_id).single(),
        ]);

        if (!landlord?.email) continue;

        const landlordName = escapeHtml(landlord.full_name || "there");
        const tenantName = escapeHtml(tenant?.full_name || "A tenant");
        const roomTitle = escapeHtml(room?.title || "your listing");
        const date = escapeHtml(viewing.proposed_date || "");
        const time = escapeHtml(
          `${viewing.proposed_time_start || ""}${viewing.proposed_time_end ? ` - ${viewing.proposed_time_end}` : ""}`
        );
        const subject = `⏰ Reminder: Viewing request still waiting — "${room?.title || "your listing"}"`;

        const html = buildEmailHtml({
          subject,
          preheader: `${tenantName} is still waiting for your reply`,
          heading: "You have an unanswered viewing request",
          headingEmoji: "⏰",
          body: `
            <p style="margin: 0 0 16px 0;">Hey ${landlordName}! <strong>${tenantName}</strong> requested a viewing more than ${REMINDER_AFTER_HOURS} hours ago and hasn't heard back yet:</p>
            ${infoBox(`<p style="margin: 0; color: #333;"><strong>🏠</strong> ${roomTitle}<br><strong>📅</strong> ${date}<br><strong>⏰</strong> ${time}</p>`)}
            ${statusCard("⏳", "Waiting for your response", "You can confirm, propose another time, or decline from your viewings dashboard.")}
          `,
          ctaText: "Respond Now →",
          ctaUrl: `${appUrl}/my-viewings`,
        });

        const { error: emailError } = await resend.emails.send({
          from: "Sakanak <noreply@sakanakeg.com>",
          to: [landlord.email],
          subject,
          html,
        });

        await supabaseAdmin.from("email_send_log").insert({
          message_id: messageId,
          template_name: "viewing-request-reminder",
          recipient_email: landlord.email,
          status: emailError ? "failed" : "sent",
          error_message: emailError ? JSON.stringify(emailError) : null,
          metadata: { viewing_id: viewing.id, landlord_id: viewing.landlord_id },
        });

        if (emailError) {
          console.error(`Failed reminder for viewing ${viewing.id}:`, emailError);
        } else {
          sent++;
        }
      } catch (err) {
        console.error(`Error processing viewing ${viewing.id}:`, err);
      }
    }

    return new Response(JSON.stringify({ sent }), {
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
