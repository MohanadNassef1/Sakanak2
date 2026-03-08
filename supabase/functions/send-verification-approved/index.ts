import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Validate admin JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminId = claimsData.claims.sub as string;

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", adminId)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden - Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userId, action, reason } = await req.json();

    if (!userId || !action) {
      return new Response(JSON.stringify({ error: "userId and action are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userName = profile.full_name || "there";
    const userEmail = profile.email;

    let subject: string;
    let htmlContent: string;

    if (action === "approved") {
      subject = "🎉 Your Sakanak ID is Verified!";
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0; font-size: 24px;">Sakanak</h1>
            <p style="color: #666; margin-top: 5px;">سكنك</p>
          </div>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
            <h2 style="color: #166534; margin: 0 0 8px 0;">Identity Verified!</h2>
            <p style="color: #15803d; margin: 0;">تم التحقق من هويتك بنجاح</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hey ${userName}! 👋
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Great news! Your ID has been verified. You now have full access to Sakanak — you can browse rooms, request viewings, and connect with roommates.
          </p>

          <p style="color: #555; font-size: 16px; line-height: 1.6; direction: rtl; text-align: right;">
            أخبار سارة! تم التحقق من هويتك. يمكنك الآن تصفح الغرف وطلب المعاينات والتواصل مع زملاء السكن.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://sakanakeg.com/rooms" 
               style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Browse Rooms Now 🏠
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #aaa; font-size: 12px; text-align: center;">
            Sakanak - Find Your Perfect Room in Egypt<br/>
            سكنك - لاقي سكنك المثالي في مصر
          </p>
        </div>
      `;
    } else if (action === "rejected") {
      const rejectionReason = reason || "Your documents did not meet our verification requirements.";
      
      subject = "⚠️ Sakanak ID Verification Update";
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://lmjivfayjyskriikcyzg.supabase.co/storage/v1/object/public/email-assets/sakanak-logo.png" alt="Sakanak" style="width: 60px; height: 60px; border-radius: 12px; margin-bottom: 8px;" />
            <h1 style="color: #f97316; margin: 0; font-size: 24px;">Sakanak</h1>
            <p style="color: #666; margin-top: 5px;">سكنك</p>
          </div>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
            <h2 style="color: #991b1b; margin: 0 0 8px 0;">Verification Not Approved</h2>
            <p style="color: #dc2626; margin: 0;">لم يتم قبول التحقق من هويتك</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hey ${userName},
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Unfortunately, your ID verification was not approved. Here's why:
          </p>
          
          <div style="background: #f9fafb; border-left: 4px solid #f97316; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <p style="color: #333; margin: 0; font-size: 14px;">${rejectionReason}</p>
          </div>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Don't worry — you can re-submit your documents anytime. Make sure the photos are clear and the document is valid.
          </p>

          <p style="color: #555; font-size: 16px; line-height: 1.6; direction: rtl; text-align: right;">
            لا تقلق — يمكنك إعادة تقديم مستنداتك في أي وقت. تأكد من أن الصور واضحة والمستند صالح.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://sakanakeg.com/verify-identity" 
               style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Re-submit Documents 📄
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #aaa; font-size: 12px; text-align: center;">
            Sakanak - Find Your Perfect Room in Egypt<br/>
            سكنك - لاقي سكنك المثالي في مصر
          </p>
        </div>
      `;
    } else {
      return new Response(JSON.stringify({ error: "Invalid action. Use 'approved' or 'rejected'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email
    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [userEmail],
      subject,
      html: htmlContent,
    });

    if (emailError) {
      console.error("Failed to send email:", emailError);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Verification ${action} email sent to ${userEmail}:`, emailResponse);

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
