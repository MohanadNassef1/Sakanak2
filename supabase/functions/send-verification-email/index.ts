import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerificationEmailRequest {
  email: string;
  type: "signup" | "resend";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, type }: VerificationEmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${type} verification email for: ${email}`);

    // Create admin client to generate magic link
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Generate a magic link for email verification
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      options: {
        redirectTo: "https://sakanak.lovable.app/",
      },
    });

    if (linkError) {
      console.error("Failed to generate verification link:", linkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate verification link", details: linkError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const verificationLink = linkData.properties?.action_link;
    if (!verificationLink) {
      console.error("No action link in response");
      return new Response(
        JSON.stringify({ error: "Failed to get verification link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generated verification link successfully");

    // Send email via Resend
    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: "Sakanak <noreply@sakanak.com>",
      to: [email],
      subject: "Verify your Sakanak account",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0;">Sakanak</h1>
            <p style="color: #666; margin-top: 5px;">Find Your Perfect Room in Egypt</p>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Welcome! 👋</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Thank you for signing up for Sakanak. Please verify your email address to complete your registration.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #666; font-size: 12px; word-break: break-all; text-align: center;">
            ${verificationLink}
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #aaa; font-size: 12px; text-align: center;">
            If you didn't create an account on Sakanak, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Failed to send email via Resend:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-verification-email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
