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
    const { currentUser, candidates } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!currentUser || !candidates || candidates.length === 0) {
      return new Response(
        JSON.stringify({ scores: {} }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a concise profile summary for the current user
    const userProfile = [
      currentUser.about && `About: ${currentUser.about.substring(0, 300)}`,
      currentUser.looking_for && `Looking for: ${currentUser.looking_for.substring(0, 200)}`,
      currentUser.occupation && `Occupation: ${currentUser.occupation}`,
      currentUser.personality_tags?.length && `Vibes: ${currentUser.personality_tags.join(", ")}`,
      `Smoker: ${currentUser.is_smoker ? "yes" : "no"}`,
      `Has pets: ${currentUser.has_pets ? "yes" : "no"}`,
    ].filter(Boolean).join(". ");

    // Build candidate summaries (limit to 20 to keep prompt manageable)
    const limitedCandidates = candidates.slice(0, 20);
    const candidateSummaries = limitedCandidates.map((c: any, i: number) => {
      const parts = [
        `ID: ${c.user_id}`,
        c.about && `About: ${c.about.substring(0, 300)}`,
        c.looking_for && `Looking for: ${c.looking_for.substring(0, 200)}`,
        c.occupation && `Occupation: ${c.occupation}`,
        c.personality_tags?.length && `Vibes: ${c.personality_tags.join(", ")}`,
        `Smoker: ${c.is_smoker ? "yes" : "no"}`,
        `Has pets: ${c.has_pets ? "yes" : "no"}`,
      ].filter(Boolean).join(". ");
      return `[${i + 1}] ${parts}`;
    }).join("\n\n");

    const systemPrompt = `You are a roommate compatibility analyzer. Given a user's profile and a list of candidates, assess semantic compatibility based on lifestyle, personality, interests, and living preferences described in their bios.

For each candidate, return a JSON object with:
- "score": 0-40 (semantic bonus score based on bio/personality alignment)
- "reason": a short 5-10 word reason explaining the semantic match

Focus on:
1. Lifestyle alignment (early bird vs night owl, social vs quiet, clean vs relaxed)
2. Shared interests and hobbies mentioned in bios
3. Compatible living expectations (what they're looking for)
4. Personality tag overlap and complementarity
5. Work/study schedule compatibility

Be generous but honest. Score 30-40 for strong semantic matches, 15-29 for moderate, 0-14 for weak/conflicting.`;

    const userPrompt = `CURRENT USER PROFILE:
${userProfile}

CANDIDATES:
${candidateSummaries}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{"scores": {"<user_id>": {"score": <number>, "reason": "<string>"}, ...}}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_scores",
                description: "Return compatibility scores for each candidate",
                parameters: {
                  type: "object",
                  properties: {
                    scores: {
                      type: "object",
                      additionalProperties: {
                        type: "object",
                        properties: {
                          score: { type: "number", minimum: 0, maximum: 40 },
                          reason: { type: "string" },
                        },
                        required: ["score", "reason"],
                      },
                    },
                  },
                  required: ["scores"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_scores" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited", scores: {} }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required", scores: {} }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", response.status, await response.text());
      return new Response(
        JSON.stringify({ scores: {} }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // Extract from tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify(parsed),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: try parsing content directly
    const content = data.choices?.[0]?.message?.content || "";
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return new Response(
          JSON.stringify(parsed),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      console.error("Failed to parse AI response:", content);
    }

    return new Response(
      JSON.stringify({ scores: {} }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-roommate-match error:", e);
    return new Response(
      JSON.stringify({ scores: {}, error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
