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
    const callerId = claimsData.claims.sub as string;

    const { recipientId, roomTitle, conversationId } = await req.json();

    if (!recipientId || typeof recipientId !== 'string') {
      return new Response(JSON.stringify({ error: "recipientId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (callerId === recipientId) {
      return new Response(JSON.stringify({ error: "Cannot notify yourself" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // SECURITY: Verify caller and recipient share a conversation.
    // Reject if no conversation exists between them — prevents email harassment.
    const { data: convo, error: convoError } = await supabaseAdmin
      .from("conversations")
      .select("id, participant_one, participant_two")
      .or(
        `and(participant_one.eq.${callerId},participant_two.eq.${recipientId}),and(participant_one.eq.${recipientId},participant_two.eq.${callerId})`
      )
      .limit(1)
      .maybeSingle();

    if (convoError || !convo) {
      console.error("No conversation between caller and recipient:", convoError);
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SECURITY: Look up sender_name from the authenticated caller's profile — never trust client input.
    const { data: senderProfile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("user_id", callerId)
      .single();

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", recipientId)
      .single();

    if (profileError || !profile) {
      console.error("Recipient not found:", profileError);
      return new Response(JSON.stringify({ error: "Recipient not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeSenderName = (senderProfile?.full_name || "Someone").replace(/[<>&"']/g, '');
    const safeRoomTitle = (typeof roomTitle === 'string' ? roomTitle : "a listing").replace(/[<>&"']/g, '').slice(0, 200);
    const recipientName = profile.full_name || "there";
    const messageId = `message-notification-${recipientId}-${Date.now()}`;

    const html = buildEmailHtml({
      subject: "You have a new message on Sakanak",
      preheader: `${safeSenderName} sent you a message about ${safeRoomTitle}`,
      heading: `New message from ${safeSenderName}`,
      headingEmoji: "💬",
      body: `
        <p style="margin: 0 0 16px 0;">
          Hey ${recipientName}! You have a new message${roomTitle ? ` about <strong>${safeRoomTitle}</strong>` : ''}.
        </p>
        <p style="margin: 0 0 16px 0;">
          Log in to Sakanak to view and reply to your message.
        </p>
        <p style="margin: 0 0 16px 0; direction: rtl; text-align: right; color: #555;">
          لديك رسالة جديدة على سكنك. سجل دخولك للرد.
        </p>
      `,
      ctaText: "View Messages →",
      ctaUrl: "https://sakanakeg.com/chats",
      footerNote: "You're receiving this because someone messaged you on Sakanak.",
    });

    const { error: emailError } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [profile.email],
      subject: "You have a new message on Sakanak 💬",
      html,
    });

    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'message-notification',
      recipient_email: profile.email,
      status: emailError ? 'failed' : 'sent',
      error_message: emailError ? JSON.stringify(emailError) : null,
      metadata: { recipient_id: recipientId, sender_id: callerId, sender_name: safeSenderName, conversation_id: conversationId ?? convo.id },
    });

    if (emailError) {
      console.error("Failed to send message notification:", emailError);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Message notification sent to ${profile.email}`);

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
