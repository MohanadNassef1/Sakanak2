import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) throw new Error('Invalid authorization');
    const userId = claimsData.claims.sub as string;

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await admin.rpc('is_admin', { _user_id: userId });
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const { data: profileRows, error: profErr } = await admin.from('profiles').select('user_id');
    if (profErr) throw new Error(profErr.message);
    const profileIds = new Set((profileRows || []).map((r: any) => r.user_id));

    const out: Array<{
      user_id: string;
      email: string;
      full_name: string | null;
      created_at: string;
      provider: string | null;
      email_confirmed: boolean;
    }> = [];

    let page = 1;
    const perPage = 200;
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw new Error(error.message);
      const users = data?.users || [];
      for (const u of users) {
        if (!profileIds.has(u.id) && u.email) {
          out.push({
            user_id: u.id,
            email: u.email,
            full_name: (u.user_metadata?.full_name as string) || null,
            created_at: u.created_at,
            provider: (u.app_metadata?.provider as string) || null,
            email_confirmed: !!u.email_confirmed_at,
          });
        }
      }
      if (users.length < perPage) break;
      page++;
      if (page > 50) break;
    }

    out.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

    return new Response(JSON.stringify({ users: out }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.message?.includes('Unauthorized') ? 403 : 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
