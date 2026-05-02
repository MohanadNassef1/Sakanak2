import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { Webhook } from "https://esm.sh/svix@1.42.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Resend/Svix webhook signature — reject unauthenticated requests
    const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("RESEND_WEBHOOK_SECRET is not configured");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response(JSON.stringify({ error: "Missing signature headers" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawBody = await req.text();
    let payload: any;
    try {
      const wh = new Webhook(webhookSecret);
      payload = wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Inbound email payload:', JSON.stringify(payload).slice(0, 500));

    // Resend Inbound webhook shape: { type: 'email.received', data: { from, to, subject, text, html, headers, ... } }
    const data = payload?.data ?? payload;

    const fromRaw = data.from;
    const fromEmail = typeof fromRaw === 'string' ? fromRaw : (fromRaw?.email ?? fromRaw?.address ?? '');
    const fromName = typeof fromRaw === 'object' ? (fromRaw?.name ?? null) : null;

    const toRaw = data.to;
    const toEmail = Array.isArray(toRaw)
      ? (typeof toRaw[0] === 'string' ? toRaw[0] : toRaw[0]?.email ?? '')
      : (typeof toRaw === 'string' ? toRaw : toRaw?.email ?? '');

    if (!fromEmail || !toEmail) {
      return new Response(JSON.stringify({ error: 'Missing from or to' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error } = await supabase.from('inbound_emails').insert({
      from_email: fromEmail,
      from_name: fromName,
      to_email: toEmail,
      subject: data.subject ?? null,
      text_body: data.text ?? null,
      html_body: data.html ?? null,
      in_reply_to: data.in_reply_to ?? data.headers?.['in-reply-to'] ?? null,
      message_id: data.message_id ?? data.headers?.['message-id'] ?? null,
      raw_payload: payload,
    });

    if (error) {
      console.error('Insert error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
