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

    const askerId = claimsData.claims.sub as string;

    const { roomId, questionId, question } = await req.json();

    if (!roomId || !questionId || !question) {
      return new Response(JSON.stringify({ error: "roomId, questionId and question are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the question exists and belongs to this asker (prevents spoofing)
    const { data: questionRow, error: qErr } = await supabaseAdmin
      .from("listing_questions")
      .select("id, asker_id, room_id")
      .eq("id", questionId)
      .single();

    if (qErr || !questionRow || questionRow.asker_id !== askerId || questionRow.room_id !== roomId) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch room (owner_id + title)
    const { data: room, error: roomError } = await supabaseAdmin
      .from("rooms")
      .select("owner_id, title")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      return new Response(JSON.stringify({ error: "Room not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch host profile (recipient)
    const { data: host, error: hostError } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", room.owner_id)
      .single();

    if (hostError || !host) {
      return new Response(JSON.stringify({ error: "Host not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch asker name
    const { data: asker } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("user_id", askerId)
      .single();

    const escape = (s: string) => s.replace(/[<>&"']/g, (c) => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;',
    }[c]!));

    const safeAsker = escape(asker?.full_name || "Someone");
    const safeRoomTitle = escape(room.title || "your listing");
    const safeQuestion = escape(question).slice(0, 500);
    const hostName = host.full_name || "there";
    const messageId = `question-notification-${questionId}`;

    const html = buildEmailHtml({
      subject: "New question on your listing",
      preheader: `${safeAsker} asked a question about ${safeRoomTitle}`,
      heading: `New question from ${safeAsker}`,
      headingEmoji: "❓",
      body: `
        <p style="margin: 0 0 16px 0;">
          Hey ${escape(hostName)}! Someone just asked a question about your listing <strong>${safeRoomTitle}</strong>.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 20px 0;">
          <tr>
            <td style="padding: 14px 16px; background-color: #f9fafb; border-left: 3px solid #FF7A00; border-radius: 4px;">
              <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.5;">"${safeQuestion}"</p>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 16px 0;">
          Log in to Sakanak to post your answer — public answers help future seekers and boost your listing visibility.
        </p>
        <p style="margin: 0 0 16px 0; direction: rtl; text-align: right; color: #555;">
          لديك سؤال جديد على إعلانك. سجل دخولك للرد.
        </p>
      `,
      ctaText: "View & Answer →",
      ctaUrl: `https://sakanakeg.com/rooms/${roomId}`,
      footerNote: "You're receiving this because someone asked a question on your listing.",
    });

    const { error: emailError } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [host.email],
      subject: `New question on "${room.title}" ❓`,
      html,
    });

    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'question-notification',
      recipient_email: host.email,
      status: emailError ? 'failed' : 'sent',
      error_message: emailError ? JSON.stringify(emailError) : null,
      metadata: { room_id: roomId, question_id: questionId, asker_id: askerId },
    });

    if (emailError) {
      console.error("Failed to send question notification:", emailError);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Question notification sent to ${host.email}`);

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
