import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.94.0";

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
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate: accept either a valid user JWT or the service role key
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Reject if only the anon key is provided (no real auth)
    if (token === anonKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Allow service role key (used internally) or validate user JWT
    if (token !== serviceRoleKey) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        anonKey,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const rawBody = await req.json();
    const user_name = escapeHtml(rawBody.user_name || '');
    const user_email = escapeHtml(rawBody.user_email || '');
    const room_title = escapeHtml(rawBody.room_title || '');
    const room_city = escapeHtml(rawBody.room_city || '');
    const type = rawBody.type;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not set');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminEmail = 'mohanadnassef11@gmail.com';
    let subject = '';
    let htmlBody = '';

    if (type === 'new_user') {
      subject = `🆕 New User Joined Sakanak: ${user_name}`;
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f97316;">🎉 New User Registration</h2>
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 16px 0;">
            <p><strong>Name:</strong> ${user_name}</p>
            <p><strong>Email:</strong> ${user_email}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">— Sakanak Admin Notifications</p>
        </div>
      `;
    } else if (type === 'new_room') {
      subject = `🏠 New Room Listed on Sakanak: ${room_title}`;
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f97316;">🏠 New Room Listed</h2>
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 16px 0;">
            <p><strong>Title:</strong> ${room_title}</p>
            <p><strong>City:</strong> ${room_city || 'N/A'}</p>
            <p><strong>Listed by:</strong> ${user_name} (${user_email})</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">— Sakanak Admin Notifications</p>
        </div>
      `;
    } else {
      return new Response(JSON.stringify({ error: 'Unknown notification type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'noreply@sakanakeg.com',
        to: [adminEmail],
        subject,
        html: htmlBody,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('Resend error:', result);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: result }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
