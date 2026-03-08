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

    const userId = claimsData.claims.sub as string;

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userName = profile.full_name || "there";
    const userEmail = profile.email;

    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: "Sakanak <noreply@sakanakeg.com>",
      to: [userEmail],
      subject: "📋 We received your ID — verification in progress!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0; font-size: 24px;">Sakanak</h1>
            <p style="color: #666; margin-top: 5px;">سكنك</p>
          </div>
          
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
            <h2 style="color: #92400e; margin: 0 0 8px 0;">Documents Received!</h2>
            <p style="color: #b45309; margin: 0;">تم استلام مستنداتك بنجاح</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hey ${userName}! 👋
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            We've received your ID documents and they're now being reviewed by our team. This usually takes <strong>24–48 hours</strong>.
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            We'll send you an email as soon as the review is complete. In the meantime, feel free to browse available rooms!
          </p>

          <p style="color: #555; font-size: 16px; line-height: 1.6; direction: rtl; text-align: right;">
            تم استلام مستنداتك وهي الآن قيد المراجعة من فريقنا. عادة ما يستغرق ذلك <strong>٢٤-٤٨ ساعة</strong>. سنرسل لك بريد إلكتروني بمجرد اكتمال المراجعة.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://sakanakeg.com/rooms" 
               style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Browse Rooms 🏠
            </a>
          </div>
          
          <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              <strong>💡 Tip:</strong> Make sure your profile is complete with a photo and bio — it helps build trust with room owners!
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #aaa; font-size: 12px; text-align: center;">
            Sakanak - Find Your Perfect Room in Egypt<br/>
            سكنك - لاقي سكنك المثالي في مصر
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Failed to send email:", emailError);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Verification submission confirmation sent to ${userEmail}:`, emailResponse);

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
