import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import { buildEmailHtml } from "../_shared/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const ALLOWED_ORIGINS = [
  'https://sakanakeg.com',
  'https://id-preview--075b3489-daa0-4b32-ba8c-8ea0a6df1c8c.lovable.app',
  'https://lmjivfayjyskriikcyzg.supabase.co',
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

interface VerificationEmailRequest {
  email: string;
  type: "signup" | "resend";
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No token provided" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email as string;

    if (!userId || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token claims" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, type }: VerificationEmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (userEmail.toLowerCase() !== email.toLowerCase()) {
      console.error(`User ${userEmail} attempted to send verification to ${email}`);
      return new Response(
        JSON.stringify({ error: "Forbidden - Can only send verification to your own email" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${type} verification email for: ${email}`);
    const messageId = `verification-${type}-${userId}-${Date.now()}`;

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      options: { redirectTo: "https://sakanakeg.com/" },
    });

    if (linkError) {
      console.error("Failed to generate verification link:", linkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate verification link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const verificationLink = linkData.properties?.action_link;
    if (!verificationLink) {
      return new Response(
        JSON.stringify({ error: "Failed to get verification link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = buildEmailHtml({
      subject: "Verify your email — Sakanak",
      preheader: "Please verify your email to activate your Sakanak account",
      heading: "Verify your email",
      headingEmoji: "📧",
      body: `
        <p style="margin: 0 0 16px 0;">
          Please verify your email address to activate your Sakanak account and start browsing rooms.
        </p>
        <p style="margin: 0 0 16px 0; direction: rtl; text-align: right;">
          يرجى تأكيد بريدك الإلكتروني لتفعيل حسابك على سكنك.
        </p>
      `,
      ctaText: "Verify Email Address →",
      ctaUrl: verificationLink,
      footerNote: `If the button doesn't work, copy this link: <a href="${verificationLink}" style="color: #FF7A00; word-break: break-all;">${verificationLink}</a><br><br>If you didn't create an account on Sakanak, you can safely ignore this email.`,
    });

    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [email],
      subject: "Verify your email — Sakanak",
      html,
    });

    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'email-verification',
      recipient_email: email,
      status: emailError ? 'failed' : 'sent',
      error_message: emailError ? JSON.stringify(emailError) : null,
      metadata: { user_id: userId, type, resend_id: emailResponse?.id },
    });

    if (emailError) {
      console.error("Failed to send email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verification email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
};

serve(handler);