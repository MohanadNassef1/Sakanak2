import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { photoUrls } = await req.json();
    if (!photoUrls || !Array.isArray(photoUrls) || photoUrls.length === 0) {
      return new Response(JSON.stringify({ error: "No photos provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build image content parts (max 6 photos)
    const imageContents = photoUrls.slice(0, 6).map((url: string) => ({
      type: "image_url" as const,
      image_url: { url },
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are a room/apartment photo analyzer for an Egyptian housing platform. Analyze the photos and detect amenities and features visible in the images. Return ONLY the structured data via the tool call, nothing else.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze these room/apartment photos and detect all visible amenities and features. Look carefully for: air conditioning units, WiFi routers, balconies, elevators (in hallway shots), water heaters, gas stoves/natural gas, private bathrooms, doorman/security areas, furniture, and general room condition. Also estimate the room type and number of bedrooms if possible.",
              },
              ...imageContents,
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_detected_amenities",
              description: "Report all amenities and features detected in the room photos",
              parameters: {
                type: "object",
                properties: {
                  has_ac: { type: "boolean", description: "Air conditioning unit visible" },
                  has_wifi: { type: "boolean", description: "WiFi router or network equipment visible" },
                  has_balcony: { type: "boolean", description: "Balcony visible in photos" },
                  has_elevator: { type: "boolean", description: "Elevator visible or implied by building type" },
                  has_water_heater: { type: "boolean", description: "Water heater visible" },
                  has_natural_gas: { type: "boolean", description: "Gas stove or natural gas connection visible" },
                  has_private_bathroom: { type: "boolean", description: "Private/en-suite bathroom visible" },
                  has_doorman: { type: "boolean", description: "Doorman area or security booth visible" },
                  suggested_room_type: {
                    type: "string",
                    enum: ["private_room", "shared_room", "studio", "apartment"],
                    description: "Best guess for room type based on photos",
                  },
                  estimated_bedrooms: { type: "number", description: "Estimated number of bedrooms visible" },
                  confidence_notes: {
                    type: "array",
                    items: { type: "string" },
                    description: "Brief notes about what was detected and confidence level, in English",
                  },
                },
                required: ["has_ac", "has_wifi", "has_balcony", "has_elevator", "has_water_heater", "has_natural_gas", "has_private_bathroom", "has_doorman", "confidence_notes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_detected_amenities" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No analysis result from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-room-photos error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
