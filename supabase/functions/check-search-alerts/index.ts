import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active saved searches
    const { data: searches, error: searchError } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("is_active", true);

    if (searchError) throw searchError;
    if (!searches || searches.length === 0) {
      return new Response(JSON.stringify({ matched: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get rooms created in last 30 minutes (cron runs every 30 min)
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: newRooms, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .gte("created_at", thirtyMinAgo)
      .in("status", ["active"]);

    if (roomError) throw roomError;
    if (!newRooms || newRooms.length === 0) {
      return new Response(JSON.stringify({ matched: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalNotifications = 0;

    for (const search of searches) {
      const filters = search.filters as any;

      for (const room of newRooms) {
        // Don't notify user about their own rooms
        if (room.owner_id === search.user_id) continue;

        // Match filters
        if (filters.city && room.city !== filters.city) continue;
        if (filters.area && room.area !== filters.area) continue;
        if (filters.roomType && room.room_type !== filters.roomType) continue;
        if (filters.minPrice && room.price_per_month < filters.minPrice) continue;
        if (filters.maxPrice && room.price_per_month > filters.maxPrice) continue;
        if (filters.allowsSmoking && !room.allows_smoking) continue;
        if (filters.allowsPets && !room.allows_pets) continue;
        if (filters.studentsOnly && !room.is_student_listing) continue;
        if (filters.hasVideo && (!room.videos || room.videos.length === 0)) continue;

        // Insert notification (ignore duplicates via unique constraint)
        const { error: notifError } = await supabase
          .from("search_notifications")
          .insert({
            user_id: search.user_id,
            saved_search_id: search.id,
            room_id: room.id,
          });

        if (!notifError) {
          totalNotifications++;

          // Send email notification if enabled
          if (search.notify_email) {
            // Get user email
            const { data: profile } = await supabase
              .from("profiles")
              .select("email, full_name")
              .eq("user_id", search.user_id)
              .single();

            if (profile?.email) {
              try {
                await supabase.functions.invoke("send-transactional-email", {
                  body: {
                    templateName: "search-alert",
                    recipientEmail: profile.email,
                    idempotencyKey: `search-alert-${search.id}-${room.id}`,
                    templateData: {
                      name: profile.full_name,
                      roomTitle: room.title,
                      roomCity: room.city,
                      roomPrice: room.price_per_month,
                      roomId: room.id,
                    },
                  },
                });
              } catch (e) {
                // Email send failure shouldn't stop processing
                console.error("Failed to send alert email:", e);
              }
            }
          }
        }
      }

      // Update last_notified_at
      await supabase
        .from("saved_searches")
        .update({ last_notified_at: new Date().toISOString() })
        .eq("id", search.id);
    }

    return new Response(
      JSON.stringify({ matched: totalNotifications, rooms: newRooms.length, searches: searches.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
