import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildEmailHtml, infoBox } from "../_shared/email-template.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Store the contact submission in the database
    const { error: insertError } = await supabaseAdmin
      .from('contact_submissions')
      .insert({ name, email, subject, message });

    if (insertError) {
      console.error("Failed to store contact submission:", insertError);
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

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

    const { error: enqueueError1 } = await supabaseAdmin.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: JSON.parse(JSON.stringify({
        to: email,
        subject: "We received your message! | Sakanak",
        html: confirmationHtml,
        template_name: 'contact-confirmation',
        message_id: `contact-confirm-${Date.now()}`,
      })),
    });

    if (enqueueError1) {
      console.error("Failed to enqueue confirmation email:", enqueueError1);
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

    const { error: enqueueError2 } = await supabaseAdmin.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: JSON.parse(JSON.stringify({
        to: 'support@sakanakeg.com',
        subject: `[Contact Form] ${subject} — from ${name}`,
        html: supportHtml,
        template_name: 'contact-forward',
        message_id: `contact-forward-${Date.now()}`,
      })),
    });

    if (enqueueError2) {
      console.error("Failed to enqueue support email:", enqueueError2);
    }

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
