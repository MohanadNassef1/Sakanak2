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

    const userId = claimsData.claims.sub as string;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles").select("full_name, email")
      .eq("user_id", userId).single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userName = profile.full_name || "there";
    const userEmail = profile.email;
    const messageId = `verification-submitted-${userId}-${Date.now()}`;

    const html = buildEmailHtml({
      subject: "We received your ID — verification in progress!",
      preheader: "Your documents are being reviewed by our team",
      heading: "Documents received!",
      headingEmoji: "📋",
      body: `
        ${statusCard({ emoji: '📋', title: 'Documents Received!', titleAr: 'تم استلام مستنداتك بنجاح', bgColor: '#fffbeb', borderColor: '#fde68a', textColor: '#92400e' })}
        <p style="margin: 0 0 16px 0;">
          Hey ${userName}! We've received your ID documents and they're now being reviewed by our team. This usually takes <strong>24–48 hours</strong>.
        </p>
        <p style="margin: 0 0 16px 0;">
          We'll send you an email as soon as the review is complete. In the meantime, feel free to browse available rooms!
        </p>
        <p style="margin: 0 0 16px 0; direction: rtl; text-align: right;">
          تم استلام مستنداتك وهي الآن قيد المراجعة. عادة ما يستغرق ذلك ٢٤-٤٨ ساعة.
        </p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 14px; margin: 0 0 8px 0;">
          <p style="color: #555; font-size: 13px; margin: 0;">
            💡 <strong>Tip:</strong> Complete your profile with a photo and bio — it helps build trust with room owners!
          </p>
        </div>
      `,
      ctaText: "Browse Rooms →",
      ctaUrl: "https://sakanakeg.com/rooms",
    });

    const { error: emailError } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [userEmail],
      subject: "📋 We received your ID — verification in progress!",
      html,
    });

    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'verification-submitted',
      recipient_email: userEmail,
      status: emailError ? 'failed' : 'sent',
      error_message: emailError ? JSON.stringify(emailError) : null,
      metadata: { user_id: userId },
    });

    if (emailError) {
      console.error("Failed to send email:", emailError);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Verification submission confirmation sent to ${userEmail}`);

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