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
    // Authenticate: accept either a valid user JWT or the service role key
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Reject if only the anon key is provided (no real auth)
    if (token === anonKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Allow service role key (used internally) or validate user JWT
    if (token !== serviceRoleKey) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        anonKey,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { userId, email, name } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userName = name || "there";

    const html = buildEmailHtml({
      subject: "Welcome to Sakanak 🎉",
      preheader: "Your room search in Egypt starts now!",
      heading: `Welcome to Sakanak, ${userName}!`,
      headingEmoji: "🎉",
      body: `
        <p style="margin: 0 0 16px 0;">
          We're excited to have you on board! Sakanak helps you find rooms and trusted roommates across Egypt — safely and easily.
        </p>
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #1a1a1a;">Here's what you can do:</p>
        <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #555;">
          <li style="margin-bottom: 8px;">🏠 Browse available rooms in Cairo, Alexandria & more</li>
          <li style="margin-bottom: 8px;">🤝 Find compatible, verified roommates</li>
          <li style="margin-bottom: 8px;">📋 Post your own room listing</li>
          <li style="margin-bottom: 8px;">📅 Book viewings directly through the platform</li>
        </ul>
        <p style="margin: 0 0 16px 0; direction: rtl; text-align: right; color: #555;">
          مرحبًا بك في سكنك! ابدأ في تصفح الغرف المتاحة أو انشر إعلانك الخاص.
        </p>
      `,
      ctaText: "Start Exploring →",
      ctaUrl: "https://sakanakeg.com/rooms",
      footerNote: "Complete your profile and verify your ID to unlock all features.",
    });

    const { data, error } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [email],
      subject: "Welcome to Sakanak 🎉",
      html,
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Welcome email sent to ${email}:`, data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
