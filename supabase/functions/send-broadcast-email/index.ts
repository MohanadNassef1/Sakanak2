import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface BroadcastEmailRequest {
  subject: string;
  htmlContent: string;
  recipientType: 'all' | 'selected';
  selectedUserIds?: string[];
  emailType?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authorization");
    }

    const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: user.id });
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const { subject, htmlContent, recipientType, selectedUserIds, emailType }: BroadcastEmailRequest = await req.json();

    if (!subject || !htmlContent) {
      throw new Error("Subject and content are required");
    }

    let query = supabase.from('profiles').select('user_id, email, full_name');
    
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

    const batchSize = 50;
    const results = { success: 0, failed: 0, errors: [] as string[] };
    const logEntries: Array<{
      sent_by: string;
      recipient_email: string;
      recipient_name: string | null;
      recipient_user_id: string | null;
      subject: string;
      email_type: string;
      status: string;
      error_message: string | null;
    }> = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (recipient) => {
        try {
          await resend.emails.send({
            from: "Sakanak <onboarding@resend.dev>",
            to: [recipient.email],
            subject: subject,
            html: htmlContent.replace(/\{\{name\}\}/g, recipient.full_name || 'User'),
          });
          results.success++;
          logEntries.push({
            sent_by: user.id,
            recipient_email: recipient.email,
            recipient_name: recipient.full_name,
            recipient_user_id: recipient.user_id,
            subject,
            email_type: emailType || 'broadcast',
            status: 'sent',
            error_message: null,
          });
        } catch (error: any) {
          results.failed++;
          results.errors.push(`${recipient.email}: ${error.message}`);
          logEntries.push({
            sent_by: user.id,
            recipient_email: recipient.email,
            recipient_name: recipient.full_name,
            recipient_user_id: recipient.user_id,
            subject,
            email_type: emailType || 'broadcast',
            status: 'failed',
            error_message: error.message,
          });
        }
      });

      await Promise.all(emailPromises);
      
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Log all email results to the database
    if (logEntries.length > 0) {
      const { error: logError } = await supabase.from('email_logs').insert(logEntries);
      if (logError) {
        console.error('Failed to log emails:', logError);
      }
    }

    console.log(`Email broadcast complete: ${results.success} sent, ${results.failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        totalRecipients: recipients.length,
        sent: results.success,
        failed: results.failed,
        errors: results.errors.slice(0, 10),
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-broadcast-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: error.message.includes("Unauthorized") ? 403 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
