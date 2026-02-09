import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ResetEmailRequest {
  email: string;
}

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

    const { email }: ResetEmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing password reset for: ${email}`);

    // Generate a recovery link via Admin SDK
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: "https://sakanak.lovable.app/reset-password",
      },
    });

    if (linkError) {
      console.error("Failed to generate reset link:", linkError);
      // Don't reveal if user exists or not
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resetLink = linkData.properties?.action_link;
    if (!resetLink) {
      console.error("No action link in response");
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's name for personalization
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('email', email)
      .single();

    const userName = profile?.full_name || 'there';

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [email],
      subject: "Reset your Sakanak password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0;">Sakanak</h1>
            <p style="color: #666; margin-top: 5px;">Find Your Perfect Room in Egypt</p>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}! 🔐</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            You requested to reset your password. Click the button below to set a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #666; font-size: 12px; word-break: break-all; text-align: center;">
            ${resetLink}
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #aaa; font-size: 12px; text-align: center;">
            If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Failed to send reset email via Resend:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Password reset email sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-reset-email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
