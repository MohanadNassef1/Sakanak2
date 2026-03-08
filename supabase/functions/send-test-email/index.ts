import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

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
    const { to, subject, name } = await req.json();
    console.log("Sending test email to:", to);

    const { data, error } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [to],
      subject: subject || "🧪 Test Email — Sakanak Logo Check",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0; font-size: 24px;">Sakanak</h1>
            <p style="color: #666; margin-top: 5px;">سكنك</p>
          </div>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
            <h2 style="color: #166534; margin: 0 0 8px 0;">Test Email Successful!</h2>
            <p style="color: #15803d; margin: 0;">تم إرسال البريد التجريبي بنجاح</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hey ${name || "there"}! 👋
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            This is a test email to verify everything is working correctly.
          </p>

          <p style="color: #555; font-size: 16px; line-height: 1.6; direction: rtl; text-align: right;">
            هذا بريد تجريبي للتحقق من أن كل شيء يعمل بشكل صحيح.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #aaa; font-size: 12px; text-align: center;">
            Sakanak - Find Your Perfect Room in Egypt<br/>
            سكنك - لاقي سكنك المثالي في مصر
          </p>
        </div>
      `,
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
