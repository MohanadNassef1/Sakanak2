import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://sakanakeg.com";

// Static pages with SEO priorities
const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/rooms", priority: "0.9", changefreq: "daily" },
  { path: "/list-room", priority: "0.8", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/refund", priority: "0.3", changefreq: "yearly" },
  { path: "/faq", priority: "0.5", changefreq: "monthly" },
  { path: "/safety-tips", priority: "0.5", changefreq: "monthly" },
  { path: "/install", priority: "0.4", changefreq: "monthly" },
  { path: "/auth", priority: "0.5", changefreq: "monthly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/blog/best-areas-rent-cairo-2026", priority: "0.7", changefreq: "monthly" },
  { path: "/blog/how-to-find-roommate-egypt", priority: "0.7", changefreq: "monthly" },
  { path: "/blog/student-housing-guide-egypt", priority: "0.7", changefreq: "monthly" },
  { path: "/blog/renting-without-broker-egypt", priority: "0.7", changefreq: "monthly" },
  { path: "/blog/alexandria-rooms-guide", priority: "0.7", changefreq: "monthly" },
  { path: "/blog/rooms-for-rent-giza-2026", priority: "0.7", changefreq: "monthly" },
  { path: "/blog/shared-apartment-living-tips-egypt", priority: "0.7", changefreq: "monthly" },
  { path: "/blog/tenant-rights-renting-egypt", priority: "0.7", changefreq: "monthly" },
  { path: "/blog/cost-of-living-comparison-egyptian-cities", priority: "0.7", changefreq: "monthly" },
  { path: "/blog/new-cairo-fifth-settlement-rooms-guide", priority: "0.7", changefreq: "monthly" },
  { path: "/blog/rooms-for-rent-giza-2026", priority: "0.7", changefreq: "monthly" },
  { path: "/blog/shared-apartment-living-tips-egypt", priority: "0.7", changefreq: "monthly" },
  { path: "/blog/tenant-rights-renting-egypt", priority: "0.7", changefreq: "monthly" },
  { path: "/blog/cost-of-living-comparison-egyptian-cities", priority: "0.7", changefreq: "monthly" },
  { path: "/blog/new-cairo-fifth-settlement-rooms-guide", priority: "0.7", changefreq: "monthly" },
  // Location landing pages
  { path: "/rooms-cairo", priority: "0.8", changefreq: "weekly" },
  { path: "/rooms-giza", priority: "0.8", changefreq: "weekly" },
  { path: "/rooms-alexandria", priority: "0.8", changefreq: "weekly" },
  { path: "/rooms-mansoura", priority: "0.7", changefreq: "weekly" },
  { path: "/rooms-tanta", priority: "0.6", changefreq: "weekly" },
  { path: "/rooms-zagazig", priority: "0.6", changefreq: "weekly" },
  { path: "/rooms-assiut", priority: "0.6", changefreq: "weekly" },
  { path: "/roommates-cairo", priority: "0.7", changefreq: "weekly" },
  { path: "/roommates-giza", priority: "0.7", changefreq: "weekly" },
  { path: "/roommates-alexandria", priority: "0.7", changefreq: "weekly" },
  { path: "/student-housing-cairo", priority: "0.7", changefreq: "weekly" },
  { path: "/student-housing-alexandria", priority: "0.7", changefreq: "weekly" },
  { path: "/student-housing-mansoura", priority: "0.6", changefreq: "weekly" },
  // Topical SEO landing pages
  { path: "/female-roommates-egypt", priority: "0.9", changefreq: "weekly" },
  { path: "/male-roommates-egypt", priority: "0.9", changefreq: "weekly" },
  { path: "/student-housing-egypt", priority: "0.9", changefreq: "weekly" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active rooms
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("id, updated_at")
      .eq("status", "active")
      .order("updated_at", { ascending: false });

    if (roomsError) {
      console.error("Error fetching rooms:", roomsError);
    }

    // Fetch public profiles for roommate pages
    const { data: profiles, error: profilesError } = await supabase
      .from("public_profiles")
      .select("user_id")
      .not("user_id", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    const now = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    for (const page of STATIC_PAGES) {
      xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add dynamic room pages
    if (rooms && rooms.length > 0) {
      for (const room of rooms) {
        const lastmod = room.updated_at
          ? room.updated_at.split("T")[0]
          : now;
        xml += `  <url>
    <loc>${SITE_URL}/rooms/${room.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
