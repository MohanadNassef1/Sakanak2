import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );

    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminId = claimsData.claims.sub as string;

    const { data: roleData } = await supabaseAdmin
      .from("user_roles").select("role")
      .eq("user_id", adminId).eq("role", "admin").single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden - Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userId, action, reason } = await req.json();

    if (!userId || !action) {
      return new Response(JSON.stringify({ error: "userId and action are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles").select("full_name, email")
      .eq("user_id", userId).single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userName = profile.full_name || "there";
    const userEmail = profile.email;
    const messageId = `verification-${action}-${userId}-${Date.now()}`;
    let subject: string;
    let html: string;

    if (action === "approved") {
      subject = "Your identity has been verified ✅ — Sakanak";
      html = buildEmailHtml({
        subject,
        preheader: "Your Sakanak account is now fully verified!",
        heading: `You're verified, ${userName}!`,
        headingEmoji: "🎉",
        body: `
          ${statusCard({ emoji: '✅', title: 'Identity Verified!', titleAr: 'تم التحقق من هويتك بنجاح', bgColor: '#f0fdf4', borderColor: '#bbf7d0', textColor: '#166534' })}
          <p style="margin: 0 0 16px 0;">
            Great news! Your identity has been verified. You now have full access to Sakanak — browse rooms, request viewings, and connect with roommates.
          </p>
          <p style="margin: 0 0 16px 0;">
            This helps create a safer environment for everyone on the platform.
          </p>
          <p style="margin: 0 0 16px 0; direction: rtl; text-align: right;">
            تم التحقق من هويتك بنجاح. يمكنك الآن تصفح الغرف وطلب المعاينات والتواصل مع زملاء السكن.
          </p>
        `,
        ctaText: "Browse Rooms Now →",
        ctaUrl: "https://sakanakeg.com/rooms",
      });
    } else if (action === "rejected") {
      const escapeHtml = (s: string) => s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
      const rejectionReason = escapeHtml(reason || "Your documents did not meet our verification requirements.");
      subject = "ID Verification Update — Sakanak";
      html = buildEmailHtml({
        subject,
        preheader: "Your ID verification needs attention",
        heading: "Verification not approved",
        headingEmoji: "📋",
        body: `
          ${statusCard({ emoji: '📋', title: 'Verification Not Approved', titleAr: 'لم يتم قبول التحقق من هويتك', bgColor: '#fef2f2', borderColor: '#fecaca', textColor: '#991b1b' })}
          <p style="margin: 0 0 12px 0;">
            Hey ${userName}, unfortunately your ID verification was not approved.
          </p>
          <div style="background: #f9fafb; border-left: 4px solid #FF7A00; padding: 16px; border-radius: 4px; margin: 0 0 16px 0;">
            <p style="color: #333; margin: 0; font-size: 14px;"><strong>Reason:</strong> ${rejectionReason}</p>
          </div>
          <p style="margin: 0 0 16px 0;">
            Don't worry — you can re-submit your documents anytime. Make sure the photos are clear and the document is valid.
          </p>
          <p style="margin: 0 0 16px 0; direction: rtl; text-align: right;">
            لا تقلق — يمكنك إعادة تقديم مستنداتك في أي وقت. تأكد من أن الصور واضحة والمستند صالح.
          </p>
        `,
        ctaText: "Re-submit Documents →",
        ctaUrl: "https://sakanakeg.com/verify-identity",
      });
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: emailError } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [userEmail],
      subject,
      html,
    });

    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: `verification-${action}`,
      recipient_email: userEmail,
      status: emailError ? 'failed' : 'sent',
      error_message: emailError ? JSON.stringify(emailError) : null,
      metadata: { user_id: userId, action },
    });

    if (emailError) {
      console.error("Failed to send email:", emailError);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Verification ${action} email sent to ${userEmail}`);

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