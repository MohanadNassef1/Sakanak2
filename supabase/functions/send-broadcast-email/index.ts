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

// Server-side HTML sanitization - strict allowlist approach
function decodeHtmlEntities(html: string): string {
  // Decode numeric HTML entities (&#xNN; &#NNN;) to catch encoded attacks
  let decoded = html.replace(/&#x([0-9a-fA-F]+);/g, (_m, code) => String.fromCharCode(parseInt(code, 16)));
  decoded = decoded.replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(parseInt(code, 10)));
  // Decode named entities commonly used in attacks
  decoded = decoded.replace(/&lt;/gi, '<');
  decoded = decoded.replace(/&gt;/gi, '>');
  decoded = decoded.replace(/&quot;/gi, '"');
  decoded = decoded.replace(/&apos;/gi, "'");
  decoded = decoded.replace(/&amp;/gi, '&');
  return decoded;
}

function sanitizeHtml(html: string): string {
  const ALLOWED_TAGS = new Set([
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3',
    'a', 'ul', 'ol', 'li', 'div', 'span', 'hr', 'img',
    'table', 'tr', 'td', 'th', 'thead', 'tbody',
  ]);
  const ALLOWED_ATTRS = new Set(['href', 'target', 'style', 'class', 'src', 'alt', 'width', 'height']);

  // Step 1: Decode HTML entities to neutralize encoded attack payloads
  let sanitized = decodeHtmlEntities(html);

  // Step 2: Remove script tags and their content
  sanitized = sanitized.replace(/<script[\s\S]*?<\/script>/gi, '');
  // Remove event handlers (onclick, onerror, onload, etc.) - multiple passes for nested encoding
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');
  // Remove javascript: URLs (case-insensitive, handle whitespace/encoding tricks)
  sanitized = sanitized.replace(/href\s*=\s*["']\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:[^"']*["']/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:[^"']*["']/gi, 'src=""');
  // Remove data: URLs from src (potential XSS vector)
  sanitized = sanitized.replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""');
  // Remove style expressions (IE CSS expressions) and other CSS attack vectors
  sanitized = sanitized.replace(/expression\s*\(/gi, '');
  sanitized = sanitized.replace(/behavior\s*:/gi, '');
  sanitized = sanitized.replace(/-moz-binding\s*:/gi, '');
  sanitized = sanitized.replace(/url\s*\(\s*["']?\s*javascript:/gi, 'url(');
  // Remove iframe, object, embed, form tags and other dangerous elements
  sanitized = sanitized.replace(/<(iframe|object|embed|form|meta|link|base|svg|math)[\s\S]*?(?:\/>|<\/\1>)/gi, '');
  sanitized = sanitized.replace(/<(iframe|object|embed|form|meta|link|base|svg|math)[^>]*>/gi, '');

  // Step 3: Remove disallowed tags but keep content
  sanitized = sanitized.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tagName) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      return ''; // Remove disallowed tags
    }
    // For allowed tags, strip disallowed attributes
    if (match.startsWith('</')) return match; // closing tags are fine
    return match.replace(/\s+([a-zA-Z-]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/g, (attrMatch, attrName) => {
      if (ALLOWED_ATTRS.has(attrName.toLowerCase())) {
        return attrMatch;
      }
      return '';
    });
  });

  // Step 4: Final pass - decode again and re-check for smuggled scripts
  const finalCheck = decodeHtmlEntities(sanitized);
  if (/<script/i.test(finalCheck) || /on\w+\s*=/i.test(finalCheck) || /javascript\s*:/i.test(finalCheck)) {
    // If attacks were smuggled through encoding, strip all tags as fallback
    return finalCheck.replace(/<[^>]*>/g, '');
  }

  return sanitized;
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
    console.log("Token prefix:", token.substring(0, 20));
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError) {
      console.error("Auth error details:", JSON.stringify(authError));
    }
    
    if (authError || !user) {
      throw new Error("Invalid authorization");
    }
    
    console.log("Authenticated user:", user.id);

    const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: user.id });
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const { subject, htmlContent, recipientType, selectedUserIds, emailType }: BroadcastEmailRequest = await req.json();

    if (!subject || !htmlContent) {
      throw new Error("Subject and content are required");
    }

    // Validate input lengths
    if (subject.length > 500) {
      throw new Error("Subject is too long");
    }
    if (htmlContent.length > 500000) {
      throw new Error("Content is too large");
    }

    // Server-side HTML sanitization
    const sanitizedHtml = sanitizeHtml(htmlContent);

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
            from: "Sakanak <noreply@sakanakeg.com>",
            to: [recipient.email],
            subject: subject,
            html: sanitizedHtml.replace(/\{\{name\}\}/g, recipient.full_name || 'User'),
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
