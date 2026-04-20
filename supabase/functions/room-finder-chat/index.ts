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
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use service role to fetch rooms and user profile
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the user's gender from their profile
    const userId = claimsData.claims.sub;
    let userGender: string | null = null;
    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("gender")
        .eq("user_id", userId)
        .single();
      userGender = profile?.gender || null;
    }

    // Build gender filter for rooms query
    const genderFilter = userGender === "male" ? "males_only" : userGender === "female" ? "females_only" : null;

    // Fetch active rooms filtered by gender compatibility
    let roomsQuery = supabaseAdmin
      .from("public_rooms")
      .select(
        "id, title, city, area, price_per_month, room_type, preferred_gender, allows_smoking, allows_pets, has_wifi, has_ac, has_elevator, has_balcony, has_doorman, has_natural_gas, has_water_heater, allows_visits, total_bedrooms, max_roommates, current_roommates, min_stay_months, deposit, bills_included, is_featured, lister_type, status"
      )
      .in("status", ["active"])
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);

    const { data: rooms, error: roomsError } = await roomsQuery;

    if (roomsError) {
      console.error("Error fetching rooms:", roomsError);
    }

    // Filter rooms by gender compatibility
    const genderCompatibleRooms = (rooms || []).filter((r) => {
      const roomGender = r.preferred_gender;
      if (!userGender || !roomGender || roomGender === "any") return true;
      if (userGender === "male" && roomGender === "males_only") return true;
      if (userGender === "female" && roomGender === "females_only") return true;
      return false;
    });

    console.log(`Fetched ${(rooms || []).length} rooms, ${genderCompatibleRooms.length} gender-compatible for ${userGender || "unknown"} user`);

    const roomsSummary = genderCompatibleRooms
      .map(
        (r) =>
          `[ID:${r.id}] "${r.title}" in ${r.city}${r.area ? `/${r.area}` : ""} - ${r.price_per_month} EGP/mo, ${r.room_type?.replace("_", " ")}, gender: ${r.preferred_gender || "any"}, bedrooms: ${r.total_bedrooms || 1}, wifi: ${r.has_wifi ? "yes" : "no"}, AC: ${r.has_ac ? "yes" : "no"}, elevator: ${r.has_elevator ? "yes" : "no"}, smoking: ${r.allows_smoking ? "yes" : "no"}, pets: ${r.allows_pets ? "yes" : "no"}, deposit: ${r.deposit || 0} EGP, min stay: ${r.min_stay_months || 1} months`
      )
      .join("\n");

    const isArabic = language === "ar";

    const systemPrompt = `You are Sakanak's friendly assistant for Egypt. You help users BOTH find rooms AND list their own rooms on our platform.

${isArabic ? "IMPORTANT: Always respond in Arabic." : "Respond in the same language the user writes in."}

AREA NAME MAPPINGS (Arabic → English as stored in our database):
المعادي/المعادى = Maadi, Maadi & Degla | مصر الجديدة/هليوبوليس = Misr elgedida, Heliopolis (Masr El Gedida) | الشيخ زايد = Sheikh Zayed | التجمع/القاهرة الجديدة = New Cairo - Tagamoa | أكتوبر/حدائق أكتوبر = 6th of October - Hadayek October | المهندسين = Mohandessin | الدقي = Dokki | الزمالك = Zamalek | وسط البلد = Downtown | مدينة نصر = Nasr City | الهرم = Haram | فيصل = Faisal | العبور = Obour | الشروق = Shorouk | بدر = Badr | العاصمة الإدارية = New Administrative Capital | الرحاب = Rehab | مدينتي = Madinaty | المقطم = Mokattam | حلوان = Helwan | شبرا = Shubra | عين شمس = Ain Shams | المنصورة = Mansoura | الإسكندرية = Alexandria | طنطا = Tanta | الزقازيق = Zagazig | دمياط = Damietta | أسيوط = Assiut | الأقصر = Luxor | أسوان = Aswan
IMPORTANT: When a user searches in Arabic, match their area name to the English equivalent above, then search through the available rooms. Be flexible with spelling variations. A search for "المعادي" should match rooms in "Maadi", "Maadi & Degla", etc.

AVAILABLE ROOMS (${(rooms || []).length} listings):
${roomsSummary || "No rooms currently available."}

RULES:
1. When users describe what they want to FIND, search through the available rooms and suggest matching ones. Be flexible with area name matching — use partial matches and the mapping above.
2. For each matching room, include the room ID in this exact format: [ROOM:id] so the app can create clickable links. Example: [ROOM:abc-123-def]
3. Be concise and helpful. List key details (price, location, amenities) for each match.
4. If no rooms match the EXACT criteria, try broader matches (e.g., nearby areas, slightly different price range) before saying nothing is available.
5. You can answer general questions about renting in Egypt, but always try to connect back to available listings.
6. Never share owner contact info, payout details, or internal data.
7. If asked about things unrelated to rooms/housing, politely redirect.
8. Keep responses short - max 3-4 room suggestions per message unless asked for more.
9. Use a warm, conversational tone. You're a helpful friend, not a formal agent.
10. IMPORTANT: If the user asks to speak to customer support, a human agent, customer service, or says they need help with an issue you can't resolve (complaints, payments, account problems, reporting issues), respond with a helpful message AND include the exact tag [SUPPORT] somewhere in your response. This tag will trigger a button in the UI that connects them to a live support agent. Example: "I'd be happy to connect you with our support team! [SUPPORT]"
11. LISTING A ROOM: If the user says they want to list a room, post a room, rent out their room, add a listing, or anything indicating they want to CREATE a listing (not search), respond with an encouraging message about our AI listing assistant that makes it super easy, and include the exact tag [LIST_ROOM] in your response. This tag will trigger a button that takes them to the listing page. Example: "Great! We have an AI-powered listing assistant that makes it super easy! [LIST_ROOM]"
12. Detect listing intent from phrases like: "I want to list", "I have a room", "I want to post my room", "عايز أنزل أوضة", "عندي أوضة", "عايز أعلن عن أوضة", "أنشر غرفة", etc.
13. CRITICAL: You MUST check the AVAILABLE ROOMS list carefully before saying no rooms exist. The rooms ARE listed above with their areas in English. Match Arabic queries using the area mappings.`;


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
