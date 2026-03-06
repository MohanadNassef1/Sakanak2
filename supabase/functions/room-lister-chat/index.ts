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
    const { messages, language, action } = await req.json();

    // Verify user auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // If action is "create_room", use tool calling to extract structured data
    if (action === "extract") {
      const extractResponse = await fetch(
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
              {
                role: "system",
                content: `You are a data extraction assistant. Extract room listing details from the conversation. Call the create_room_listing tool with the extracted data. Use reasonable defaults for missing optional fields. The city must be one of: Cairo, Giza, Alexandria, Mansoura, Tanta, Zagazig, Assiut, Ismailia, Port Said, Suez, Luxor, Aswan, Fayoum, Beni Suef, Minya, Sohag, Qena, Damietta, Kafr El Sheikh, Beheira, Sharqia, Qalyubia, Monufia, Gharbia, Dakahlia, Matrouh, Red Sea, North Sinai, South Sinai, New Valley. Room types: private_room, shared_room, studio, apartment. Payout methods: instapay, vodafone_cash, fawry.`,
              },
              ...messages,
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "create_room_listing",
                  description:
                    "Create a room listing with the extracted details from the conversation.",
                  parameters: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Listing title, e.g. 'Cozy Private Room in Maadi'" },
                      description: { type: "string", description: "Room description" },
                      room_type: { type: "string", enum: ["private_room", "shared_room", "studio", "apartment"] },
                      price_per_month: { type: "number", description: "Monthly rent in EGP" },
                      city: { type: "string", description: "City/Governorate name" },
                      area: { type: "string", description: "Area within the city" },
                      address: { type: "string", description: "Street address" },
                      available_from: { type: "string", description: "Available date in YYYY-MM-DD format" },
                      min_stay_months: { type: "number", description: "Minimum stay in months" },
                      max_roommates: { type: "number", description: "Max number of roommates" },
                      current_roommates: { type: "number", description: "Current number of roommates" },
                      allows_smoking: { type: "boolean" },
                      allows_pets: { type: "boolean" },
                      has_wifi: { type: "boolean" },
                      has_ac: { type: "boolean" },
                      has_elevator: { type: "boolean" },
                      has_balcony: { type: "boolean" },
                      has_doorman: { type: "boolean" },
                      has_natural_gas: { type: "boolean" },
                      has_water_heater: { type: "boolean" },
                      has_private_bathroom: { type: "boolean" },
                      allows_visits: { type: "boolean" },
                      total_bedrooms: { type: "number" },
                      deposit: { type: "number", description: "Deposit amount in EGP" },
                      insurance_amount: { type: "number", description: "Insurance/key money in EGP" },
                      bills_included: {
                        type: "array",
                        items: { type: "string", enum: ["electricity", "water", "gas", "internet", "maintenance"] },
                      },
                      owner_payout_method: { type: "string", enum: ["instapay", "vodafone_cash", "fawry"] },
                      payout_details: { type: "string", description: "Payout account details" },
                      location_link: { type: "string", description: "Google Maps link" },
                      lister_type: { type: "string", enum: ["landlord", "current_tenant"] },
                    },
                    required: ["title", "price_per_month", "city", "room_type"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "create_room_listing" } },
          }),
        }
      );

      if (!extractResponse.ok) {
        const errText = await extractResponse.text();
        console.error("Extract error:", extractResponse.status, errText);
        return new Response(
          JSON.stringify({ error: "Failed to extract room details" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const extractData = await extractResponse.json();
      const toolCall = extractData.choices?.[0]?.message?.tool_calls?.[0];

      if (!toolCall?.function?.arguments) {
        return new Response(
          JSON.stringify({ error: "Could not extract room details" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const roomData = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ room_data: roomData }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Regular chat - streaming conversation
    const isArabic = language === "ar";

    const systemPrompt = `You are Sakanak's friendly room listing assistant for Egypt. You help users create room listings through natural conversation.

${isArabic ? "IMPORTANT: Always respond in Arabic." : "Respond in the same language the user writes in."}

YOUR JOB:
1. Conversationally collect room details from the user. Ask follow-up questions to fill in missing info.
2. You need AT MINIMUM: title (or enough to generate one), price, city, room type, detailed location/address, and location link (Google Maps).
3. Also try to collect: area, description, amenities (wifi, AC, elevator, balcony, doorman, gas, water heater, private bathroom), number of bedrooms, roommates, smoking/pets policy, available date, deposit, bills included, and whether they're the landlord or current tenant.
4. Be warm and conversational - don't ask everything at once. Group related questions (2-3 at a time).
5. IMPORTANT: Before marking as ready, you MUST ask for:
   - The detailed address/location (street name, building number, area)
   - A Google Maps location link
   - Remind the user to upload room photos using the photo uploader below the chat (the app handles photos separately)
6. When you have collected ALL required info including location details, summarize everything and ask the user to confirm. Tell them to also upload their room photos if they haven't yet. Include the tag [READY] in your response (hidden from user) to signal the UI to show a "Create Listing" button.
7. Never ask for contact info, payout details beyond method choice, or personal data.
8. Keep responses concise - this is a chat, not a form.
9. If user provides info in a natural way like "I have a room in Maadi for 5000", extract all details from that.
10. For room type, explain options if needed: private_room (own room), shared_room (shared with others), studio, apartment (whole unit).
11. Do NOT include [READY] until you have: price, city, room type, detailed address, and location link.

AVAILABLE CITIES: Cairo, Giza, Alexandria, Mansoura, Tanta, Zagazig, Assiut, Ismailia, Port Said, Suez, Luxor, Aswan, and more Egyptian cities.

START by greeting the user and asking them to describe their room in their own words.`;

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
            ...messages.slice(-20),
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
          JSON.stringify({ error: "AI service temporarily unavailable." }),
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
    console.error("room-lister-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
