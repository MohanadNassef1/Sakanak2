import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  type: "new_viewing_request" | "counter_proposal" | "viewing_confirmed";
  viewing_id: string;
  recipient_id: string;
  sender_name: string;
  room_title: string;
  proposed_date?: string;
  proposed_time?: string;
  counter_date?: string;
  counter_time?: string;
}

const getEmailContent = (data: NotificationRequest, recipientName: string) => {
  const appUrl = "https://sakanak.lovable.app";

  switch (data.type) {
    case "new_viewing_request":
      return {
        subject: `New Viewing Request for "${data.room_title}"`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f97316; margin: 0;">Sakanak</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${recipientName}! 👋</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              <strong>${data.sender_name}</strong> has requested a viewing for your listing:
            </p>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">🏠 ${data.room_title}</h3>
              <p style="color: #555; margin: 10px 0;">
                <strong>📅 Proposed Date:</strong> ${data.proposed_date}<br>
                <strong>⏰ Proposed Time:</strong> ${data.proposed_time}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/my-viewings" 
                 style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Review Request
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; text-align: center;">
              You can confirm, counter-propose, or decline this request from your viewings dashboard.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              This email was sent by Sakanak. If you didn't expect this, you can ignore it.
            </p>
          </div>
        `,
      };

    case "counter_proposal":
      return {
        subject: `New Time Proposed for "${data.room_title}"`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f97316; margin: 0;">Sakanak</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${recipientName}! 📅</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              <strong>${data.sender_name}</strong> has proposed a new time for your viewing:
            </p>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">🏠 ${data.room_title}</h3>
              <p style="color: #555; margin: 10px 0;">
                <strong>📅 New Date:</strong> ${data.counter_date}<br>
                <strong>⏰ New Time:</strong> ${data.counter_time}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/my-viewings" 
                 style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                View Proposal
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; text-align: center;">
              Accept or propose a different time from your viewings dashboard.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              This email was sent by Sakanak. If you didn't expect this, you can ignore it.
            </p>
          </div>
        `,
      };

    case "viewing_confirmed":
      return {
        subject: `Viewing Confirmed for "${data.room_title}"! ✅`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f97316; margin: 0;">Sakanak</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Great News, ${recipientName}! 🎉</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Your viewing has been confirmed by <strong>${data.sender_name}</strong>!
            </p>
            
            <div style="background: #dcfce7; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #86efac;">
              <h3 style="color: #166534; margin-top: 0;">✅ Viewing Confirmed</h3>
              <p style="color: #166534; margin: 10px 0;">
                <strong>🏠 Property:</strong> ${data.room_title}<br>
                <strong>📅 Date:</strong> ${data.proposed_date}<br>
                <strong>⏰ Time:</strong> ${data.proposed_time}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/my-viewings" 
                 style="background: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                View Details & Contact Info
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; text-align: center;">
              Check your viewings dashboard for contact details and location information.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              This email was sent by Sakanak. If you didn't expect this, you can ignore it.
            </p>
          </div>
        `,
      };

    default:
      throw new Error("Unknown notification type");
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data: NotificationRequest = await req.json();
    console.log("Processing notification:", data);

    // Fetch recipient email from profiles
    const { data: recipientProfile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", data.recipient_id)
      .single();

    if (profileError || !recipientProfile) {
      console.error("Failed to fetch recipient profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Recipient not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emailContent = getEmailContent(data, recipientProfile.full_name);

    // Send email using Resend (using test sender until domain is verified)
    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: "Sakanak <onboarding@resend.dev>",
      to: [recipientProfile.email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (emailError) {
      console.error("Failed to send email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailError }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-viewing-notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
