import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import { buildEmailHtml, statusCard, infoBox } from "../_shared/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface NotificationRequest {
  type: "new_viewing_request" | "counter_proposal" | "viewing_confirmed" | "viewing_cancelled" | "viewing_declined" | "viewing_completed" | "rental_confirmed";
  viewing_id: string;
  recipient_id: string;
  sender_name: string;
  room_title: string;
  proposed_date?: string;
  proposed_time?: string;
  counter_date?: string;
  counter_time?: string;
  decline_reason?: string;
  cancel_reason?: string;
}

const getEmailContent = (data: NotificationRequest, recipientName: string) => {
  const appUrl = "https://sakanakeg.com";
  const s = {
    sender: escapeHtml(data.sender_name || ''),
    room: escapeHtml(data.room_title || ''),
    recipient: escapeHtml(recipientName || ''),
    date: escapeHtml(data.proposed_date || ''),
    time: escapeHtml(data.proposed_time || ''),
    counterDate: escapeHtml(data.counter_date || ''),
    counterTime: escapeHtml(data.counter_time || ''),
    declineReason: escapeHtml(data.decline_reason || ''),
    cancelReason: escapeHtml(data.cancel_reason || ''),
  };

  switch (data.type) {
    case "new_viewing_request":
      return {
        subject: `New Viewing Request for "${s.room}"`,
        html: buildEmailHtml({
          subject: `New Viewing Request for "${s.room}"`,
          preheader: `${s.sender} wants to view your room`,
          heading: `New viewing request`,
          headingEmoji: "📅",
          body: `
            <p style="margin: 0 0 16px 0;">Hey ${s.recipient}! <strong>${s.sender}</strong> has requested a viewing for your listing:</p>
            ${infoBox(`<p style="margin: 0; color: #333;"><strong>🏠</strong> ${s.room}<br><strong>📅</strong> ${s.date}<br><strong>⏰</strong> ${s.time}</p>`)}
            <p style="margin: 0;">You can confirm, counter-propose, or decline from your viewings dashboard.</p>
          `,
          ctaText: "Review Request →",
          ctaUrl: `${appUrl}/my-viewings`,
        }),
      };

    case "counter_proposal":
      return {
        subject: `New Time Proposed for "${s.room}"`,
        html: buildEmailHtml({
          subject: `New Time Proposed for "${s.room}"`,
          preheader: `${s.sender} proposed a new viewing time`,
          heading: "New time proposed",
          headingEmoji: "🔄",
          body: `
            <p style="margin: 0 0 16px 0;">Hey ${s.recipient}! <strong>${s.sender}</strong> has proposed a new time for your viewing:</p>
            ${infoBox(`<p style="margin: 0; color: #333;"><strong>🏠</strong> ${s.room}<br><strong>📅 New Date:</strong> ${s.counterDate}<br><strong>⏰ New Time:</strong> ${s.counterTime}</p>`)}
            <p style="margin: 0;">Accept or propose a different time from your dashboard.</p>
          `,
          ctaText: "View Proposal →",
          ctaUrl: `${appUrl}/my-viewings`,
        }),
      };

    case "viewing_confirmed":
      return {
        subject: `Viewing Confirmed for "${s.room}" ✅`,
        html: buildEmailHtml({
          subject: `Viewing Confirmed for "${s.room}" ✅`,
          preheader: "Your viewing has been confirmed!",
          heading: `Viewing confirmed!`,
          headingEmoji: "🎉",
          body: `
            ${statusCard({ emoji: '✅', title: 'Viewing Confirmed', bgColor: '#f0fdf4', borderColor: '#bbf7d0', textColor: '#166534' })}
            <p style="margin: 0 0 16px 0;">Great news, ${s.recipient}! Your viewing has been confirmed by <strong>${s.sender}</strong>.</p>
            ${infoBox(`<p style="margin: 0; color: #333;"><strong>🏠</strong> ${s.room}<br><strong>📅</strong> ${s.date}<br><strong>⏰</strong> ${s.time}</p>`)}
            <p style="margin: 0;">Check your dashboard for contact details and location information.</p>
          `,
          ctaText: "View Details →",
          ctaUrl: `${appUrl}/my-viewings`,
          ctaColor: "#16a34a",
        }),
      };

    case "viewing_cancelled":
      return {
        subject: `Viewing Cancelled for "${s.room}"`,
        html: buildEmailHtml({
          subject: `Viewing Cancelled for "${s.room}"`,
          preheader: "A viewing has been cancelled",
          heading: "Viewing cancelled",
          headingEmoji: "❌",
          body: `
            ${statusCard({ emoji: '❌', title: 'Viewing Cancelled', bgColor: '#fef2f2', borderColor: '#fecaca', textColor: '#991b1b' })}
            <p style="margin: 0 0 16px 0;">${s.sender} has cancelled the viewing for <strong>${s.room}</strong>.</p>
            <p style="margin: 0;">Don't worry! There are plenty of other great rooms waiting for you on Sakanak.</p>
          `,
          ctaText: "Browse Other Rooms →",
          ctaUrl: `${appUrl}/rooms`,
        }),
      };

    case "viewing_declined":
      return {
        subject: `Viewing Update for "${s.room}"`,
        html: buildEmailHtml({
          subject: `Viewing Update for "${s.room}"`,
          preheader: "Feedback received after viewing",
          heading: "Feedback received",
          headingEmoji: "📋",
          body: `
            <p style="margin: 0 0 16px 0;">${s.sender} has declined the rental after viewing <strong>${s.room}</strong>.</p>
            ${s.declineReason ? infoBox(`<p style="margin: 0; color: #333;"><strong>📝 Reason:</strong> ${s.declineReason}</p>`) : ''}
            <p style="margin: 0;">This feedback helps improve your listing. Keep your profile updated for better matches!</p>
          `,
          ctaText: "View My Listings →",
          ctaUrl: `${appUrl}/my-viewings`,
        }),
      };

    case "viewing_completed":
      return {
        subject: `Viewing Completed for "${s.room}" ✅`,
        html: buildEmailHtml({
          subject: `Viewing Completed for "${s.room}" ✅`,
          preheader: "Your viewing has been marked as completed",
          heading: "Viewing completed!",
          headingEmoji: "🏠",
          body: `
            ${statusCard({ emoji: '✅', title: 'Viewing Completed', bgColor: '#f0fdf4', borderColor: '#bbf7d0', textColor: '#166534' })}
            <p style="margin: 0 0 16px 0;"><strong>${s.sender}</strong> has marked the viewing for <strong>${s.room}</strong> as completed.</p>
            <p style="margin: 0;">If you'd like to proceed with renting, confirm from your viewings dashboard. Otherwise, you can decline with feedback.</p>
          `,
          ctaText: "Go to My Viewings →",
          ctaUrl: `${appUrl}/my-viewings`,
          ctaColor: "#16a34a",
        }),
      };

    case "rental_confirmed":
      return {
        subject: `Rental Confirmed for "${s.room}" 🎉`,
        html: buildEmailHtml({
          subject: `Rental Confirmed for "${s.room}" 🎉`,
          preheader: "A rental has been confirmed!",
          heading: "Rental confirmed!",
          headingEmoji: "🤝",
          body: `
            ${statusCard({ emoji: '🤝', title: 'Rental Confirmed', bgColor: '#fffbeb', borderColor: '#fde68a', textColor: '#854d0e' })}
            <p style="margin: 0 0 16px 0;"><strong>${s.sender}</strong> has confirmed the rental for <strong>${s.room}</strong>.</p>
            <p style="margin: 0;">Please confirm from your side as well to finalize the agreement.</p>
          `,
          ctaText: "Confirm Rental →",
          ctaUrl: `${appUrl}/my-viewings`,
        }),
      };

    default:
      throw new Error("Unknown notification type");
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data: NotificationRequest = await req.json();
    console.log("Processing notification:", data.type);

    const { data: recipientProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", data.recipient_id)
      .single();

    if (profileError || !recipientProfile?.email) {
      console.error("Recipient not found:", profileError);
      return new Response(JSON.stringify({ error: "Recipient not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailContent = getEmailContent(data, recipientProfile.full_name || "there");
    const messageId = `viewing-${data.type}-${data.viewing_id}-${Date.now()}`;

    const { error: emailError } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [recipientProfile.email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: `viewing-${data.type}`,
      recipient_email: recipientProfile.email,
      status: emailError ? 'failed' : 'sent',
      error_message: emailError ? JSON.stringify(emailError) : null,
      metadata: { viewing_id: data.viewing_id, recipient_id: data.recipient_id, type: data.type },
    });

    if (emailError) {
      console.error("Failed to send email:", emailError);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Notification (${data.type}) sent to ${recipientProfile.email}`);

    return new Response(JSON.stringify({ success: true }), {
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