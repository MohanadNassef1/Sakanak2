import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
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
