import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { buildEmailHtml, statusCard } from "../_shared/email-template.ts";

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
    const { to, subject, name, from } = await req.json();
    console.log("Sending test email to:", to);

    const html = buildEmailHtml({
      subject: subject || "🧪 Test Email — Sakanak",
      preheader: "This is a test email from Sakanak",
      heading: "Test Email Successful!",
      headingEmoji: "🧪",
      body: `
        ${statusCard({ emoji: '✅', title: 'Email System Working!', titleAr: 'نظام البريد يعمل بنجاح', bgColor: '#f0fdf4', borderColor: '#bbf7d0', textColor: '#166534' })}
        <p style="margin: 0 0 16px 0;">
          Hey ${name || "there"}! 👋 This is a test email to verify everything is working correctly with the Sakanak email system.
        </p>
        <p style="margin: 0 0 16px 0; direction: rtl; text-align: right;">
          هذا بريد تجريبي للتحقق من أن نظام البريد الإلكتروني يعمل بشكل صحيح.
        </p>
      `,
      ctaText: "Visit Sakanak →",
      ctaUrl: "https://sakanakeg.com",
    });

    const { data, error } = await resend.emails.send({
      from: from || "Sakanak <noreply@sakanakeg.com>",
      to: [to],
      subject: subject || "🧪 Test Email — Sakanak",
      html,
    });

    console.log("Resend response - data:", JSON.stringify(data), "error:", JSON.stringify(error));

    if (error) {
      console.error("Resend error:", JSON.stringify(error));
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
