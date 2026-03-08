import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import { buildEmailHtml } from "../_shared/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rate limiting
    const { data: recentRequests, error: rlError } = await supabaseAdmin
      .from('rate_limits')
      .select('id')
      .eq('endpoint', 'send-reset-email')
      .eq('identifier', normalizedEmail)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (!rlError && recentRequests && recentRequests.length >= 3) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabaseAdmin.from('rate_limits').insert({
      endpoint: 'send-reset-email',
      identifier: normalizedEmail,
    });

    console.log(`Processing password reset for: ${normalizedEmail}`);

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: normalizedEmail,
      options: { redirectTo: "https://sakanakeg.com/reset-password" },
    });

    if (linkError) {
      console.error("Failed to generate reset link:", linkError);
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resetLink = linkData.properties?.action_link;
    if (!resetLink) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('email', normalizedEmail)
      .single();

    const userName = profile?.full_name || 'there';

    const html = buildEmailHtml({
      subject: "Reset your password — Sakanak",
      preheader: "We received a request to reset your Sakanak password",
      heading: `Reset your password`,
      headingEmoji: "🔐",
      body: `
        <p style="margin: 0 0 16px 0;">
          Hey ${userName}! We received a request to reset your password. Click the button below to set a new one.
        </p>
        <p style="margin: 0 0 16px 0; direction: rtl; text-align: right;">
          تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك. اضغط على الزر أدناه لتعيين كلمة مرور جديدة.
        </p>
      `,
      ctaText: "Reset Password →",
      ctaUrl: resetLink,
      footerNote: `This link expires in 30 minutes.<br><br>If the button doesn't work, copy this link: <a href="${resetLink}" style="color: #FF7A00; word-break: break-all; font-size: 11px;">${resetLink}</a><br><br>If you didn't request a password reset, you can safely ignore this email.`,
    });

    const { error: emailError } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [normalizedEmail],
      subject: "Reset your password — Sakanak",
      html,
    });

    if (emailError) {
      console.error("Failed to send reset email:", emailError);
    } else {
      console.log("Password reset email sent successfully");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
