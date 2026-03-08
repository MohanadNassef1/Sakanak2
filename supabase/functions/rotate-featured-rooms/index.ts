import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all active room IDs
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("id")
      .eq("status", "active");

    if (roomsError) throw roomsError;
    if (!rooms || rooms.length === 0) {
      return new Response(JSON.stringify({ message: "No active rooms to feature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Shuffle and pick up to 3
    const shuffled = rooms.sort(() => Math.random() - 0.5);
    const featured = shuffled.slice(0, Math.min(3, shuffled.length)).map((r) => r.id);

    // Update site_settings
    const { error: updateError } = await supabase
      .from("site_settings")
      .update({ value: featured, updated_at: new Date().toISOString() })
      .eq("key", "homepage_featured_rooms");

    if (updateError) throw updateError;

    // Update is_featured flag on rooms table
    // First, unfeature all
    await supabase.from("rooms").update({ is_featured: false }).eq("is_featured", true);
    // Then feature the selected ones
    for (const id of featured) {
      await supabase.from("rooms").update({ is_featured: true }).eq("id", id);
    }

    console.log(`Rotated featured rooms: ${featured.join(", ")}`);

    return new Response(JSON.stringify({ success: true, featured }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error rotating featured rooms:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
