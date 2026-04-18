import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.94.0";
import { Resend } from "npm:resend@4.0.0";
import { buildEmailHtml } from "../_shared/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const responderId = claimsData.claims.sub as string;

    const { questionId } = await req.json();

    if (!questionId) {
      return new Response(JSON.stringify({ error: "questionId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the question with its current answer
    const { data: questionRow, error: qErr } = await supabaseAdmin
      .from("listing_questions")
      .select("id, asker_id, room_id, question, answer")
      .eq("id", questionId)
      .single();

    if (qErr || !questionRow) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!questionRow.answer) {
      return new Response(JSON.stringify({ error: "Question has no answer yet" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the room and verify the responder is the owner (prevents spoofing)
    const { data: room, error: roomError } = await supabaseAdmin
      .from("rooms")
      .select("owner_id, title")
      .eq("id", questionRow.room_id)
      .single();

    if (roomError || !room) {
      return new Response(JSON.stringify({ error: "Room not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (room.owner_id !== responderId) {
      return new Response(JSON.stringify({ error: "Only the host can trigger this notification" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch asker profile (recipient)
    const { data: asker, error: askerError } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", questionRow.asker_id)
      .single();

    if (askerError || !asker) {
      return new Response(JSON.stringify({ error: "Asker not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch host name
    const { data: host } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("user_id", room.owner_id)
      .single();

    const escape = (s: string) => s.replace(/[<>&"']/g, (c) => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;',
    }[c]!));

    const safeHost = escape(host?.full_name || "The host");
    const safeRoomTitle = escape(room.title || "the listing");
    const safeQuestion = escape(questionRow.question).slice(0, 500);
    const safeAnswer = escape(questionRow.answer).slice(0, 1000);
    const askerName = asker.full_name || "there";
    const messageId = `answer-notification-${questionId}`;

    const html = buildEmailHtml({
      subject: "Your question has been answered",
      preheader: `${safeHost} answered your question about ${safeRoomTitle}`,
      heading: `${safeHost} answered your question`,
      headingEmoji: "💬",
      body: `
        <p style="margin: 0 0 16px 0;">
          Hey ${escape(askerName)}! Good news — the host just answered your question about <strong>${safeRoomTitle}</strong>.
        </p>
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Your question</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 16px 0;">
          <tr>
            <td style="padding: 12px 14px; background-color: #f3f4f6; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.5;">"${safeQuestion}"</p>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Host's answer</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 20px 0;">
          <tr>
            <td style="padding: 14px 16px; background-color: #f9fafb; border-left: 3px solid #FF7A00; border-radius: 4px;">
              <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.5;">${safeAnswer}</p>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 16px 0;">
          Like what you see? Book a viewing on Sakanak to take the next step.
        </p>
        <p style="margin: 0 0 16px 0; direction: rtl; text-align: right; color: #555;">
          المالك رد على سؤالك. شوف الرد وقرر خطوتك الجاية.
        </p>
      `,
      ctaText: "View Listing →",
      ctaUrl: `https://sakanakeg.com/rooms/${questionRow.room_id}`,
      footerNote: "You're receiving this because you asked a question on this listing.",
    });

    const { error: emailError } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [asker.email],
      subject: `${host?.full_name || 'The host'} answered your question 💬`,
      html,
    });

    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'answer-notification',
      recipient_email: asker.email,
      status: emailError ? 'failed' : 'sent',
      error_message: emailError ? JSON.stringify(emailError) : null,
      metadata: { room_id: questionRow.room_id, question_id: questionId, asker_id: questionRow.asker_id },
    });

    if (emailError) {
      console.error("Failed to send answer notification:", emailError);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Answer notification sent to ${asker.email}`);

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
});
