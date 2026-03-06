import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.94.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch active rooms to provide context
    const { data: rooms, error: roomsError } = await supabase
      .from("public_rooms")
      .select(
        "id, title, city, area, price_per_month, room_type, preferred_gender, allows_smoking, allows_pets, has_wifi, has_ac, has_elevator, has_balcony, has_doorman, has_natural_gas, has_water_heater, allows_visits, total_bedrooms, max_roommates, current_roommates, min_stay_months, deposit, bills_included, is_featured, lister_type, status"
      )
      .in("status", ["active"])
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);

    if (roomsError) {
      console.error("Error fetching rooms:", roomsError);
    }

    const roomsSummary = (rooms || [])
      .map(
        (r) =>
          `[ID:${r.id}] "${r.title}" in ${r.city}${r.area ? `/${r.area}` : ""} - ${r.price_per_month} EGP/mo, ${r.room_type?.replace("_", " ")}, gender: ${r.preferred_gender || "any"}, bedrooms: ${r.total_bedrooms || 1}, wifi: ${r.has_wifi ? "yes" : "no"}, AC: ${r.has_ac ? "yes" : "no"}, elevator: ${r.has_elevator ? "yes" : "no"}, smoking: ${r.allows_smoking ? "yes" : "no"}, pets: ${r.allows_pets ? "yes" : "no"}, deposit: ${r.deposit || 0} EGP, min stay: ${r.min_stay_months || 1} months`
      )
      .join("\n");

    const isArabic = language === "ar";

    const systemPrompt = `You are Sakanak's friendly room-finding assistant for Egypt. You help users discover rooms on our platform.

${isArabic ? "IMPORTANT: Always respond in Arabic." : "Respond in the same language the user writes in."}

AVAILABLE ROOMS:
${roomsSummary || "No rooms currently available."}

RULES:
1. When users describe what they want, search through the available rooms and suggest matching ones.
2. For each matching room, include the room ID in this exact format: [ROOM:id] so the app can create clickable links. Example: [ROOM:abc-123-def]
3. Be concise and helpful. List key details (price, location, amenities) for each match.
4. If no rooms match, say so honestly and suggest broadening their criteria.
5. You can answer general questions about renting in Egypt, but always try to connect back to available listings.
6. Never share owner contact info, payout details, or internal data.
7. If asked about things unrelated to rooms/housing, politely redirect.
8. Keep responses short - max 3-4 room suggestions per message unless asked for more.
9. Use a warm, conversational tone. You're a helpful friend, not a formal agent.
10. IMPORTANT: If the user asks to speak to customer support, a human agent, customer service, or says they need help with an issue you can't resolve (complaints, payments, account problems, reporting issues), respond with a helpful message AND include the exact tag [SUPPORT] somewhere in your response. This tag will trigger a button in the UI that connects them to a live support agent. Example: "I'd be happy to connect you with our support team! [SUPPORT]"`;


    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.slice(-20), // Keep last 20 messages for context
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("room-finder-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
