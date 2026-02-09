import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Restrict CORS to known frontend origins
const ALLOWED_ORIGINS = [
  'https://sakanak.lovable.app',
  'https://id-preview--075b3489-daa0-4b32-ba8c-8ea0a6df1c8c.lovable.app',
  'https://lmjivfayjyskriikcyzg.supabase.co',
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

interface BroadcastEmailRequest {
  subject: string;
  htmlContent: string;
  recipientType: 'all' | 'selected';
  selectedUserIds?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authorization");
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: user.id });
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const { subject, htmlContent, recipientType, selectedUserIds }: BroadcastEmailRequest = await req.json();

    // Validate required fields
    if (!subject || !htmlContent) {
      throw new Error("Subject and content are required");
    }

    // Get recipient emails
    let query = supabase.from('profiles').select('email, full_name');
    
    if (recipientType === 'selected' && selectedUserIds && selectedUserIds.length > 0) {
      query = query.in('user_id', selectedUserIds);
    }

    const { data: recipients, error: recipientsError } = await query;

    if (recipientsError) {
      throw new Error(`Failed to fetch recipients: ${recipientsError.message}`);
    }

    if (!recipients || recipients.length === 0) {
      throw new Error("No recipients found");
    }

    console.log(`Sending email to ${recipients.length} recipients`);

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    const results: { success: number; failed: number; errors: string[] } = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (recipient) => {
        try {
          await resend.emails.send({
            from: "Sakanak <onboarding@resend.dev>",
            to: [recipient.email],
            subject: subject,
            html: htmlContent.replace('{{name}}', recipient.full_name || 'User'),
          });
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`${recipient.email}: ${error.message}`);
          console.error(`Failed to send to ${recipient.email}:`, error);
        }
      });

      await Promise.all(emailPromises);
      
      // Small delay between batches to avoid rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Email broadcast complete: ${results.success} sent, ${results.failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        totalRecipients: recipients.length,
        sent: results.success,
        failed: results.failed,
        errors: results.errors.slice(0, 10), // Limit error details
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-broadcast-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: error.message.includes("Unauthorized") ? 403 : 500,
        headers: { "Content-Type": "application/json", ...getCorsHeaders(req) },
      }
    );
  }
};

serve(handler);