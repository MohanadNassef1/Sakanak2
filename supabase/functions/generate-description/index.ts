import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

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
    const { roomDetails, language, photos } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isArabic = language === "ar";
    const hasPhotos = photos && photos.length > 0;

    const prompt = isArabic
      ? `أنت مساعد كتابة إعلانات غرف سكنية في مصر. اكتب وصف جذاب ومختصر (3-5 جمل) للغرفة${hasPhotos ? ' بناءً على الصور والتفاصيل المتاحة' : ' بناءً على التفاصيل التالية'}. صِف ما تراه في الصور (الأثاث، الإضاءة، المساحة، النظافة). استخدم كلمات مفتاحية مناسبة للبحث. لا تضف أرقام هواتف أو إيميلات. اكتب الوصف مباشرة بدون مقدمة.`
      : `You are a room listing copywriter for a housing platform in Egypt. Write a compelling, concise description (3-5 sentences) based on ${hasPhotos ? 'the photos and room details provided' : 'the room details below'}. ${hasPhotos ? 'Describe what you see in the photos (furniture, lighting, space, cleanliness, condition).' : ''} Include relevant search keywords naturally. Do NOT include phone numbers, emails, or links. Write the description directly without any introduction.`;

    const details = [
      roomDetails?.title && `Title: ${roomDetails.title}`,
      roomDetails?.room_type && `Type: ${roomDetails.room_type.replace("_", " ")}`,
      roomDetails?.city && `City: ${roomDetails.city}`,
      roomDetails?.area && `Area: ${roomDetails.area}`,
      roomDetails?.price && `Price: EGP ${roomDetails.price}/month`,
      roomDetails?.has_wifi && "Has WiFi",
      roomDetails?.has_ac && "Has AC",
      roomDetails?.has_elevator && "Has Elevator",
      roomDetails?.has_balcony && "Has Balcony",
      roomDetails?.has_doorman && "Has Doorman",
      roomDetails?.has_natural_gas && "Has Natural Gas",
      roomDetails?.has_water_heater && "Has Water Heater",
      roomDetails?.has_private_bathroom && "Has Private Bathroom",
      roomDetails?.allows_pets && "Pets Allowed",
      roomDetails?.allows_smoking && "Smoking Allowed",
      roomDetails?.allows_visits === false && "No Visits",
      roomDetails?.total_bedrooms && `Total Bedrooms: ${roomDetails.total_bedrooms}`,
      roomDetails?.current_roommates !== undefined && `Current Roommates: ${roomDetails.current_roommates}`,
      roomDetails?.bills_included?.length && `Bills Included: ${roomDetails.bills_included.join(", ")}`,
      roomDetails?.gender && `Gender: ${roomDetails.gender}`,
      roomDetails?.lister_type && `Listed by: ${roomDetails.lister_type.replace("_", " ")}`,
    ]
      .filter(Boolean)
      .join("\n");

    // Build message content - use multimodal if photos provided
    const userContent: any[] = [];
    
    if (details) {
      userContent.push({ type: "text", text: details || "Room listing" });
    }

    // Add photo URLs for vision model
    if (hasPhotos) {
      for (const photoUrl of photos.slice(0, 4)) {
        userContent.push({
          type: "image_url",
          image_url: { url: photoUrl },
        });
      }
    }

    // Use vision-capable model when photos are present
    const model = hasPhotos ? "google/gemini-2.5-flash" : "google/gemini-2.5-flash-lite";

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: userContent.length > 0 ? userContent : details },
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI API error: ${err}`);
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating description:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate description" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
