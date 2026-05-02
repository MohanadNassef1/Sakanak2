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

    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    if (token === anonKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (token !== serviceRoleKey) {
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, serviceRoleKey);

    const { userId: bodyUserId, email: bodyEmail, name } = await req.json();

    // Resolve recipient: only service-role callers may send to an arbitrary address.
    // For end-user callers, ignore the supplied email and use the verified email from auth.users.
    let email: string | undefined;
    let userId: string | undefined;

    if (token === serviceRoleKey) {
      email = bodyEmail;
      userId = bodyUserId;
    } else {
      const supabaseAnon = createClient(Deno.env.get("SUPABASE_URL")!, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: claimsData } = await supabaseAnon.auth.getClaims(token);
      const callerId = claimsData?.claims?.sub as string | undefined;
      if (!callerId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(callerId);
      if (userErr || !userData?.user?.email) {
        return new Response(JSON.stringify({ error: "Could not resolve caller email" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      email = userData.user.email;
      userId = callerId;
    }

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userName = name || "there";
    const messageId = `welcome-${userId || email}-${Date.now()}`;

    const html = buildEmailHtml({
      subject: "Welcome to Sakanak 🎉",
      preheader: "Welcome to Sakanak — we are still in beta and improving fast.",
      heading: `Welcome to Sakanak, ${userName}!`,
      headingEmoji: "🎉",
      body: `
        <p style="margin: 0 0 16px 0;">
          Welcome to Sakanak! We're excited to have you on board. Sakanak helps you find rooms and trusted roommates across Egypt — safely and easily.
        </p>
        <p style="margin: 0 0 16px 0;">
          <strong>We are still in beta.</strong> That means we are improving quickly, listening to your feedback, and keeping Sakanak free for a limited time while we make the experience better.
        </p>
        <p style="margin: 0 0 16px 0;">
          <strong>Help shape Sakanak — rate us out of 10.</strong> It takes 10 seconds. Tell us what you love or what we should fix. Adding a reason is optional, but it helps us a lot.
        </p>
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #1a1a1a;">Here's what you can do:</p>
        <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #555;">
          <li style="margin-bottom: 8px;">🏠 Browse available rooms in Cairo, Alexandria & more</li>
          <li style="margin-bottom: 8px;">🤝 Find compatible, verified roommates</li>
          <li style="margin-bottom: 8px;">📋 Post your own room listing</li>
          <li style="margin-bottom: 8px;">📅 Book viewings directly through the platform</li>
        </ul>
        <p style="margin: 0 0 16px 0; direction: rtl; text-align: right; color: #555;">
          مرحبًا بك في Sakanak! نحن ما زلنا في النسخة التجريبية. <strong>Rate Sakanak من 10</strong> وساعدنا نحسّن المنصة — السبب اختياري لكن لو شاركتنا رأيك ده يساعدنا أكتر. ملاحظاتك تظهر مباشرة في لوحة تحكم الفريق.
        </p>
      `,
      ctaText: "Rate Sakanak (1–10) →",
      ctaUrl: "https://sakanakeg.com/feedback",
      footerNote: "Your rating and feedback help us improve Sakanak during beta.",
    });

    const { data, error } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [email],
      subject: "Welcome to Sakanak 🎉",
      html,
    });

    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'welcome',
      recipient_email: email,
      status: error ? 'failed' : 'sent',
      error_message: error ? JSON.stringify(error) : null,
      metadata: { user_id: userId, resend_id: data?.id },
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Welcome email sent to ${email}:`, data);

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