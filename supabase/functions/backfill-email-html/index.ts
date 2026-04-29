import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.94.0";
import { buildEmailHtml } from "../_shared/email-template.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify admin
    const { data: isAdminData } = await admin.rpc('is_admin', { _user_id: userId });
    if (!isAdminData) {
      return new Response(JSON.stringify({ error: "Forbidden — admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all logs missing html_content
    const { data: logs, error: fetchErr } = await admin
      .from('email_logs')
      .select('id, subject, recipient_name, email_type, status')
      .is('html_content', null)
      .limit(2000);

    if (fetchErr) throw fetchErr;
    if (!logs || logs.length === 0) {
      return new Response(JSON.stringify({ success: true, updated: 0, message: "Nothing to backfill" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const note = `
      <p style="margin: 0 0 16px 0;">
        This is a reconstructed preview. The original message body was not
        stored when this email was sent — only the subject and metadata were
        kept. Future emails will be archived in full.
      </p>
      <p style="margin: 0 0 16px 0; direction: rtl; text-align: right; color: #555;">
        هذه معاينة مُعاد إنشاؤها. لم يتم حفظ نص الرسالة الأصلي وقت الإرسال —
        فقط الموضوع والبيانات الوصفية. الرسائل الجديدة ستُحفظ كاملة.
      </p>
    `;

    let updated = 0;
    let failed = 0;
    const batchSize = 25;

    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      await Promise.all(batch.map(async (log) => {
        try {
          const html = buildEmailHtml({
            recipientName: log.recipient_name || undefined,
            subject: log.subject,
            heading: log.subject,
            body: note,
            hideRatingCta: log.email_type !== 'broadcast',
          });
          const { error: updErr } = await admin
            .from('email_logs')
            .update({ html_content: html })
            .eq('id', log.id);
          if (updErr) throw updErr;
          updated++;
        } catch (e) {
          console.error('Failed to backfill log', log.id, e);
          failed++;
        }
      }));
    }

    return new Response(
      JSON.stringify({ success: true, total: logs.length, updated, failed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Backfill error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
