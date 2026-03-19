import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.94.0";
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
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Verify the caller is an admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { to, subject, name } = await req.json();

    if (!to) {
      return new Response(JSON.stringify({ error: "Recipient email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Sending test email to:", to);

    const html = buildEmailHtml({
      subject: subject || "🧪 Test Email — Sakanak",
      preheader: "This is a test email from Sakanak",
      heading: "Test Email Successful!",
      headingEmoji: "🧪",
      body: `
        ${statusCard({ emoji: '✅', title: 'Email System Working!', titleAr: 'نظام البريد يعمل بنجاح', bgColor: '#f0fdf4', borderColor: '#bbf7d0', textColor: '#166534' })}
        <p style="margin: 0 0 16px 0;">
          Hey ${(name || "there").replace(/[<>&"']/g, '')}! 👋 This is a test email to verify everything is working correctly with the Sakanak email system.
        </p>
        <p style="margin: 0 0 16px 0; direction: rtl; text-align: right;">
          هذا بريد تجريبي للتحقق من أن نظام البريد الإلكتروني يعمل بشكل صحيح.
        </p>
      `,
      ctaText: "Visit Sakanak →",
      ctaUrl: "https://sakanakeg.com",
    });

    const { data, error } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [to],
      subject: subject || "🧪 Test Email — Sakanak",
      html,
    });

    console.log("Resend response - data:", JSON.stringify(data), "error:", JSON.stringify(error));

    if (error) {
      console.error("Resend error:", JSON.stringify(error));
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
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
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
