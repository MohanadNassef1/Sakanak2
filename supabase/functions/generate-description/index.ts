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

    const { roomDetails, language, photos } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isArabic = language === "ar";
    const hasPhotos = photos && photos.length > 0;

    const prompt = isArabic
      ? `أنت كاتب إعلانات سكنية محترف في مصر. اكتب وصف قصير وجذاب (3-5 جمل) للغرفة. صِف المساحة والأثاث والإضاءة والحالة العامة. استخدم كلمات بحث مناسبة. اكتب الوصف فقط بدون أي مقدمة أو ملاحظات. ممنوع تماماً كتابة أي أرقام أو أرقام هواتف أو إيميلات أو روابط. اكتب الأسعار والأرقام بالكلمات فقط.`
      : `You are a professional real estate copywriter in Egypt. Write a short, compelling description (3-5 sentences) for this room listing. Describe the space, furniture, lighting, and overall condition. Use relevant search-friendly keywords. Write only the description text, nothing else. CRITICAL: Do NOT include ANY digits/numbers, phone numbers, emails, URLs, or social media handles. Write all numbers as words (e.g. "two bedrooms" not "2 bedrooms").`;

    const details = [
      roomDetails?.title && `Title: ${roomDetails.title}`,
      roomDetails?.room_type && `Type: ${roomDetails.room_type.replace("_", " ")}`,
      roomDetails?.city && `City: ${roomDetails.city}`,
      roomDetails?.area && `Area: ${roomDetails.area}`,
      roomDetails?.price && `Monthly rent: ${roomDetails.price} EGP`,
      roomDetails?.has_wifi && "WiFi available",
      roomDetails?.has_ac && "AC available",
      roomDetails?.has_elevator && "Elevator available",
      roomDetails?.has_balcony && "Balcony available",
      roomDetails?.has_doorman && "Doorman available",
      roomDetails?.has_natural_gas && "Natural gas available",
      roomDetails?.has_water_heater && "Water heater available",
      roomDetails?.has_private_bathroom && "Private bathroom",
      roomDetails?.allows_pets && "Pets welcome",
      roomDetails?.allows_smoking && "Smoking permitted",
      roomDetails?.allows_visits === false && "No guests visits",
      roomDetails?.total_bedrooms && `Bedrooms: ${roomDetails.total_bedrooms}`,
      roomDetails?.current_roommates !== undefined && `Current occupants: ${roomDetails.current_roommates}`,
      roomDetails?.bills_included?.length && `Bills included: ${roomDetails.bills_included.join(", ")}`,
      roomDetails?.gender && `For: ${roomDetails.gender === 'males_only' ? 'males' : 'females'}`,
      roomDetails?.lister_type && `Listed by: ${roomDetails.lister_type.replace("_", " ")}`,
    ]
      .filter(Boolean)
      .join("\n");

    // Build message content
    const userContent: any[] = [];
    
    if (details) {
      userContent.push({ type: "text", text: details });
    }

    if (hasPhotos) {
      const allowedPrefix = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/room-photos/`;
      const safePhotos = (photos as unknown[])
        .filter((u): u is string => typeof u === "string" && u.startsWith(allowedPrefix))
        .slice(0, 4);
      for (const photoUrl of safePhotos) {
        userContent.push({
          type: "image_url",
          image_url: { url: photoUrl },
        });
      }
    }

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
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
