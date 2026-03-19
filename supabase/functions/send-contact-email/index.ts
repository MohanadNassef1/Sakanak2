import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildEmailHtml, infoBox } from "../_shared/email-template.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SENDER_DOMAIN = 'notify.sakanakeg.com';
const FROM_ADDRESS = `Sakanak <noreply@${SENDER_DOMAIN}>`;

// Rate limit: max 5 submissions per email per hour
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message } = await req.json();

    // --- Input validation ---
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedName = String(name).trim().slice(0, 100);
    const trimmedEmail = String(email).trim().toLowerCase().slice(0, 255);
    const trimmedSubject = String(subject).trim().slice(0, 200);
    const trimmedMessage = String(message).trim().slice(0, 5000);

    if (!trimmedName || !trimmedSubject || !trimmedMessage) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- Rate limiting (per email, per hour) ---
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { data: recentSubmissions } = await supabaseAdmin
      .from('rate_limits')
      .select('id')
      .eq('endpoint', 'send-contact-email')
      .eq('identifier', trimmedEmail)
      .gte('created_at', windowStart);

    if (recentSubmissions && recentSubmissions.length >= RATE_LIMIT_MAX) {
      // Silently succeed to avoid leaking rate limit info to attackers
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record rate limit entry
    await supabaseAdmin.from('rate_limits').insert({
      endpoint: 'send-contact-email',
      identifier: trimmedEmail,
    });

    // Store the contact submission in the database
    const { error: insertError } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        name: trimmedName,
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMessage,
      });

    if (insertError) {
      console.error("Failed to store contact submission:", insertError);
    }

    const safeName = escapeHtml(trimmedName);
    const safeEmail = escapeHtml(trimmedEmail);
    const safeSubject = escapeHtml(trimmedSubject);
    const safeMessage = escapeHtml(trimmedMessage).replace(/\n/g, '<br>');

    // 1. Send confirmation email to the user
    const confirmationHtml = buildEmailHtml({
      subject: "We received your message!",
      preheader: "Thanks for reaching out to Sakanak",
      heading: "Thanks for reaching out!",
      headingEmoji: "📩",
      body: `
        <p style="margin: 0 0 16px 0;">Hey ${safeName}! We've received your message and our team will get back to you as soon as possible.</p>
        ${infoBox(`<p style="margin: 0; color: #333;"><strong>📝 Subject:</strong> ${safeSubject}</p>`)}
        <p style="margin: 0 0 16px 0; direction: rtl; text-align: right; color: #555;">
          شكرًا لتواصلك معنا! سنرد عليك في أقرب وقت ممكن.
        </p>
      `,
      ctaText: "Browse Rooms →",
      ctaUrl: "https://sakanakeg.com/rooms",
      footerNote: "You'll receive a reply at this email address within 24-48 hours.",
    });

    const runId = crypto.randomUUID();
    const messageId1 = `contact-confirm-${Date.now()}`;
    const { error: enqueueError1 } = await supabaseAdmin.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: JSON.parse(JSON.stringify({
        run_id: runId,
        to: trimmedEmail,
        from: FROM_ADDRESS,
        sender_domain: SENDER_DOMAIN,
        subject: "We received your message! | Sakanak",
        html: confirmationHtml,
        text: `Hey ${trimmedName}! We received your message about "${trimmedSubject}". Our team will get back to you within 24-48 hours.`,
        purpose: 'transactional',
        label: 'contact-confirmation',
        message_id: messageId1,
        queued_at: new Date().toISOString(),
      })),
    });

    if (enqueueError1) {
      console.error("Failed to enqueue confirmation email:", enqueueError1);
    } else {
      await supabaseAdmin.from('email_send_log').insert({
        message_id: messageId1,
        template_name: 'contact-confirmation',
        recipient_email: trimmedEmail,
        status: 'pending',
      });
    }

    // 2. Forward the message to support inbox
    const supportHtml = buildEmailHtml({
      subject: `New Contact Form: ${safeSubject}`,
      preheader: `Message from ${safeName}`,
      heading: "New Contact Form Submission",
      headingEmoji: "📬",
      body: `
        ${infoBox(`
          <p style="margin: 0 0 8px 0; color: #333;"><strong>👤 Name:</strong> ${safeName}</p>
          <p style="margin: 0 0 8px 0; color: #333;"><strong>📧 Email:</strong> <a href="mailto:${safeEmail}" style="color: #FF7A00;">${safeEmail}</a></p>
          <p style="margin: 0; color: #333;"><strong>📝 Subject:</strong> ${safeSubject}</p>
        `)}
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 0 0 16px 0;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #1a1a1a;">Message:</p>
          <p style="margin: 0; color: #555; line-height: 1.6;">${safeMessage}</p>
        </div>
        <p style="margin: 0; font-size: 13px; color: #888;">Reply directly to this email or contact <a href="mailto:${safeEmail}" style="color: #FF7A00;">${safeEmail}</a></p>
      `,
    });

    const messageId2 = `contact-forward-${Date.now()}`;
    const { error: enqueueError2 } = await supabaseAdmin.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: JSON.parse(JSON.stringify({
        run_id: runId,
        to: 'support@sakanakeg.com',
        from: FROM_ADDRESS,
        sender_domain: SENDER_DOMAIN,
        subject: `[Contact Form] ${trimmedSubject} — from ${trimmedName}`,
        html: supportHtml,
        text: `New contact form submission from ${trimmedName} (${trimmedEmail}). Subject: ${trimmedSubject}. Message: ${trimmedMessage}`,
        purpose: 'transactional',
        label: 'contact-forward',
        message_id: messageId2,
        queued_at: new Date().toISOString(),
      })),
    });

    if (enqueueError2) {
      console.error("Failed to enqueue support email:", enqueueError2);
    } else {
      await supabaseAdmin.from('email_send_log').insert({
        message_id: messageId2,
        template_name: 'contact-forward',
        recipient_email: 'support@sakanakeg.com',
        status: 'pending',
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
