import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.94.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation_id, message_content, sender_name } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const ADMIN_EMAIL = "mohanadnassef11@gmail.com";

    const truncatedMessage = (message_content || "").length > 200
      ? message_content.slice(0, 200) + "..."
      : message_content;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Sakanak Support <noreply@sakanakeg.com>",
        to: [ADMIN_EMAIL],
        subject: `🆘 New Support Message from ${sender_name || "a user"}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
            <div style="background: #16a34a; padding: 20px 24px;">
              <h1 style="color: white; margin: 0; font-size: 20px;">🎧 New Support Message</h1>
            </div>
            <div style="padding: 24px;">
              <p style="color: #333; font-size: 15px; margin-bottom: 8px;">
                <strong>${sender_name || "A user"}</strong> sent a new support message:
              </p>
              <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #16a34a;">
                <p style="color: #333; font-size: 14px; margin: 0; white-space: pre-wrap;">${truncatedMessage}</p>
              </div>
              <a href="https://sakanakeg.com/admin/support" 
                 style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 8px;">
                Reply Now →
              </a>
              <p style="color: #888; font-size: 12px; margin-top: 20px;">
                This is an automated notification from Sakanak Support System.
              </p>
            </div>
          </div>
        `,
      }),
    });

    const resBody = await res.text();
    if (!res.ok) {
      console.error(`Failed to send to ${ADMIN_EMAIL}:`, res.status, resBody);
    }

    return new Response(
      JSON.stringify({ success: true, email: ADMIN_EMAIL, status: res.status }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("notify-support error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
