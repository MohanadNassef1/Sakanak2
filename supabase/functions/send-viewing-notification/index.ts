import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface NotificationRequest {
  type: "new_viewing_request" | "counter_proposal" | "viewing_confirmed" | "viewing_cancelled" | "viewing_declined" | "viewing_completed" | "rental_confirmed";
  viewing_id: string;
  recipient_id: string;
  sender_name: string;
  room_title: string;
  proposed_date?: string;
  proposed_time?: string;
  counter_date?: string;
  counter_time?: string;
  decline_reason?: string;
}

const getEmailContent = (data: NotificationRequest, recipientName: string) => {
  const appUrl = "https://sakanakeg.com";
  const safeSenderName = escapeHtml(data.sender_name || '');
  const safeRoomTitle = escapeHtml(data.room_title || '');
  const safeRecipientName = escapeHtml(recipientName || '');
  const safeProposedDate = escapeHtml(data.proposed_date || '');
  const safeProposedTime = escapeHtml(data.proposed_time || '');
  const safeCounterDate = escapeHtml(data.counter_date || '');
  const safeCounterTime = escapeHtml(data.counter_time || '');
  const safeDeclineReason = escapeHtml(data.decline_reason || '');

  switch (data.type) {
    case "new_viewing_request":
      return {
        subject: `New Viewing Request for "${safeRoomTitle}"`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://lmjivfayjyskriikcyzg.supabase.co/storage/v1/object/public/email-assets/sakanak-logo.png" alt="Sakanak" style="width: 60px; height: 60px; border-radius: 12px; margin-bottom: 8px;" />
              <h1 style="color: #f97316; margin: 0; font-size: 24px;">Sakanak</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${safeRecipientName}! 👋</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              <strong>${safeSenderName}</strong> has requested a viewing for your listing:
            </p>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">🏠 ${safeRoomTitle}</h3>
              <p style="color: #555; margin: 10px 0;">
                <strong>📅 Proposed Date:</strong> ${safeProposedDate}<br>
                <strong>⏰ Proposed Time:</strong> ${safeProposedTime}
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
        subject: `New Time Proposed for "${safeRoomTitle}"`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://lmjivfayjyskriikcyzg.supabase.co/storage/v1/object/public/email-assets/sakanak-logo.png" alt="Sakanak" style="width: 60px; height: 60px; border-radius: 12px; margin-bottom: 8px;" />
              <h1 style="color: #f97316; margin: 0; font-size: 24px;">Sakanak</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${safeRecipientName}! 📅</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              <strong>${safeSenderName}</strong> has proposed a new time for your viewing:
            </p>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">🏠 ${safeRoomTitle}</h3>
              <p style="color: #555; margin: 10px 0;">
                <strong>📅 New Date:</strong> ${safeCounterDate}<br>
                <strong>⏰ New Time:</strong> ${safeCounterTime}
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
        subject: `Viewing Confirmed for "${safeRoomTitle}"! ✅`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://lmjivfayjyskriikcyzg.supabase.co/storage/v1/object/public/email-assets/sakanak-logo.png" alt="Sakanak" style="width: 60px; height: 60px; border-radius: 12px; margin-bottom: 8px;" />
              <h1 style="color: #f97316; margin: 0; font-size: 24px;">Sakanak</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Great News, ${safeRecipientName}! 🎉</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Your viewing has been confirmed by <strong>${safeSenderName}</strong>!
            </p>
            
            <div style="background: #dcfce7; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #86efac;">
              <h3 style="color: #166534; margin-top: 0;">✅ Viewing Confirmed</h3>
              <p style="color: #166534; margin: 10px 0;">
                <strong>🏠 Property:</strong> ${safeRoomTitle}<br>
                <strong>📅 Date:</strong> ${safeProposedDate}<br>
                <strong>⏰ Time:</strong> ${safeProposedTime}
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

    case "viewing_cancelled":
      return {
        subject: `Viewing Cancelled for "${safeRoomTitle}"`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://lmjivfayjyskriikcyzg.supabase.co/storage/v1/object/public/email-assets/sakanak-logo.png" alt="Sakanak" style="width: 60px; height: 60px; border-radius: 12px; margin-bottom: 8px;" />
              <h1 style="color: #f97316; margin: 0; font-size: 24px;">Sakanak</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${safeRecipientName},</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Unfortunately, <strong>${safeSenderName}</strong> has cancelled the viewing for:
            </p>
            
            <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #fecaca;">
              <h3 style="color: #991b1b; margin-top: 0;">❌ Viewing Cancelled</h3>
              <p style="color: #991b1b; margin: 10px 0;">
                <strong>🏠 Property:</strong> ${safeRoomTitle}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/rooms" 
                 style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Browse Other Rooms
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; text-align: center;">
              Don't worry! There are plenty of other great rooms waiting for you on Sakanak.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              This email was sent by Sakanak. If you didn't expect this, you can ignore it.
            </p>
          </div>
        `,
      };

    case "viewing_declined":
      return {
        subject: `Viewing Declined for "${safeRoomTitle}"`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://lmjivfayjyskriikcyzg.supabase.co/storage/v1/object/public/email-assets/sakanak-logo.png" alt="Sakanak" style="width: 60px; height: 60px; border-radius: 12px; margin-bottom: 8px;" />
              <h1 style="color: #f97316; margin: 0; font-size: 24px;">Sakanak</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${safeRecipientName},</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              <strong>${safeSenderName}</strong> has declined the rental after viewing your property:
            </p>
            
            <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #fecaca;">
              <h3 style="color: #991b1b; margin-top: 0;">📋 Feedback Received</h3>
              <p style="color: #991b1b; margin: 10px 0;">
                <strong>🏠 Property:</strong> ${safeRoomTitle}<br>
                ${safeDeclineReason ? `<strong>📝 Reason:</strong> ${safeDeclineReason}` : ''}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/my-viewings" 
                 style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                View My Listings
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; text-align: center;">
              This feedback helps improve your listing. Keep your profile updated for better matches!
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              This email was sent by Sakanak. If you didn't expect this, you can ignore it.
            </p>
          </div>
        `,
      };

    case "viewing_completed":
      return {
        subject: `Viewing Completed for "${safeRoomTitle}" ✅`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://lmjivfayjyskriikcyzg.supabase.co/storage/v1/object/public/email-assets/sakanak-logo.png" alt="Sakanak" style="width: 60px; height: 60px; border-radius: 12px; margin-bottom: 8px;" />
              <h1 style="color: #f97316; margin: 0; font-size: 24px;">Sakanak</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${safeRecipientName}! 🏠</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              <strong>${safeSenderName}</strong> has marked your viewing as completed:
            </p>
            
            <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #bbf7d0;">
              <h3 style="color: #166534; margin-top: 0;">✅ Viewing Completed</h3>
              <p style="color: #166534; margin: 10px 0;">
                <strong>🏠 Property:</strong> ${safeRoomTitle}
              </p>
            </div>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              If you'd like to proceed with renting, you can confirm the rental from your viewings dashboard. Otherwise, you can decline with feedback.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/my-viewings" 
                 style="background: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Go to My Viewings
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              This email was sent by Sakanak. If you didn't expect this, you can ignore it.
            </p>
          </div>
        `,
      };

    case "rental_confirmed":
      return {
        subject: `Rental Confirmed for "${safeRoomTitle}"! 🎉`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f97316; margin: 0;">Sakanak</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${safeRecipientName}! 🎉</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              <strong>${safeSenderName}</strong> has confirmed the rental for:
            </p>
            
            <div style="background: #fefce8; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #fde68a;">
              <h3 style="color: #854d0e; margin-top: 0;">🤝 Rental Confirmed</h3>
              <p style="color: #854d0e; margin: 10px 0;">
                <strong>🏠 Property:</strong> ${safeRoomTitle}
              </p>
              <p style="color: #854d0e; margin: 5px 0; font-size: 14px;">
                Please confirm from your side as well to finalize the agreement.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/my-viewings" 
                 style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Confirm Rental
              </a>
            </div>
            
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

    // Create Supabase admin client for fetching profiles
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user with the auth header
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !authUser) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data: NotificationRequest = await req.json();
    console.log("Processing notification:", data);

    // Fetch recipient email from profiles using admin client (bypasses RLS)
    const { data: recipientProfile, error: profileError } = await supabaseAdmin
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
      from: "Sakanak <noreply@sakanakeg.com>",
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