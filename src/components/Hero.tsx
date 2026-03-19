import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useIsAdmin } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Search, Home, Star, ArrowRight, ArrowLeft, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RoomCard from "@/components/rooms/RoomCard";

const Hero = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { isAdmin } = useIsAdmin(user?.id);
  const userGender = isAdmin ? undefined : (profile?.gender as 'male' | 'female' | undefined);

  // 1. Fetch admin-selected featured rooms from site_settings
  const { data: featuredRoomIds } = useQuery({
    queryKey: ["homepage-featured-rooms-ids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "homepage_featured_rooms")
        .single();
      
      if (error) return [];
      return (data?.value as string[]) || [];
    },
  });

  // 2. Fetch room details for the selected IDs, or fallback to recent rooms
  // Apply gender filtering to ensure users only see their gender's rooms
  const addGenderFilter = (query: any) => {
    if (!userGender) return query;
    return query.or(
      userGender === 'male'
        ? 'preferred_gender.eq.male,preferred_gender.eq.males_only'
        : 'preferred_gender.eq.female,preferred_gender.eq.females_only'
    );
  };

  const { data: premiumRooms, isLoading } = useQuery({
    queryKey: ["premium-rooms", featuredRoomIds, userGender],
    queryFn: async () => {
      // If admin has selected rooms, fetch those
      if (featuredRoomIds && featuredRoomIds.length > 0) {
        let query = supabase
          .from("public_rooms")
          .select("*")
          .in("id", featuredRoomIds)
          .eq("status", "active");
        
        query = addGenderFilter(query);
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Sort by the order in featuredRoomIds
        return featuredRoomIds
          .map(id => data?.find(r => r.id === id))
          .filter(Boolean);
      }
      
      // Fallback: fetch 3 most recent active rooms
      let query = supabase
        .from("public_rooms")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

      query = addGenderFilter(query);
      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: featuredRoomIds !== undefined,
  });

  // Only show featured section if there are real rooms from the database
  const displayRooms = premiumRooms && premiumRooms.length > 0 ? premiumRooms : [];
  const showFeaturedSection = displayRooms.length > 0;

  return (
    <div className="relative bg-gradient-to-b from-primary/5 to-background pt-24 pb-16 overflow-hidden">
      {/* خلفية جمالية خفيفة */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute left-0 bottom-0 w-72 h-72 bg-secondary rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* القسم العلوي: النصوص وأزرار البحث */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          {/* شارة التوثيق */}
          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {isRTL ? "منصة موثوقة وآمنة" : "Trusted & Safe Platform"}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/10">
              <Gift className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {isRTL ? "مجاني 100%" : "100% Free"}
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            {isRTL ? (
              <>
                اعثر على <span className="text-primary">الغرفة</span> أو{" "}
                <span className="text-primary">شريك السكن</span> المثالي في مصر
              </>
            ) : (
              <>
                Find Your Perfect <span className="text-primary">Room</span> or{" "}
                <span className="text-primary">Roommate</span> in Egypt
              </>
            )}
          </h1>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/15 to-orange-500/15 border border-primary/25 backdrop-blur-sm">
            <span className="text-primary font-extrabold text-sm">#1</span>
            <span className="w-px h-4 bg-primary/30"></span>
            <span className="text-sm font-semibold text-foreground/80">
              {isRTL
                ? "أول وأوحد منصة مصرية متخصصة في البحث عن شريك سكن"
                : "The First & Only Egyptian Platform Specialized in Roommate Finding"}
            </span>
          </div>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("hero.subtitle") ||
              (isRTL
                ? "سكنك بيربطك بشركاء سكن موثقين وشقق مفروشة عالية الجودة. بدون سماسرة، بدون احتيال."
                : "Sakanak connects you with verified roommates and high-quality furnished apartments. No brokers, no scams.")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-orange-500 text-white border-0"
              onClick={() => navigate("/list-room")}
            >
              <Home className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("hero.cta.listRoom") || (isRTL ? "اعرض غرفتك" : "List Your Room")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-full border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white transition-all"
              onClick={() => navigate("/rooms")}
            >
              <Search className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("hero.cta.findRoom") || (isRTL ? "ابحث عن غرفة" : "Find a Room")}
            </Button>
          </div>
        </div>

        {/* Featured Listings Section - Only show if there are real rooms */}
        {showFeaturedSection && (
        <div className="mt-20">
          {/* Section Header */}
          <div className="flex items-center justify-center mb-12">
            <div className="relative group cursor-default">
              {/* Animated glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-orange-500 to-primary rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-primary to-orange-500 text-white px-8 py-3 rounded-full flex items-center gap-3 shadow-xl border border-white/20">
                <Star className="w-5 h-5 fill-current drop-shadow-md" />
                <span className="font-bold tracking-widest uppercase text-sm">
                  {isRTL ? "إعلانات مميزة" : "Featured Listings"}
                </span>
                <Star className="w-5 h-5 fill-current drop-shadow-md" />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                <Loader2 className="w-10 h-10 animate-spin text-primary relative" />
              </div>
            </div>
          ) : (
            /* Cards Grid - Same design as Browse Rooms featured */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {displayRooms.map((room) => (
                <div key={room.id} className="relative rounded-2xl bg-gradient-to-br from-primary/60 via-primary/30 to-orange-400/40 p-[2px] shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)] animate-pulse-slow">
                  <RoomCard room={room as any} isFeatured={true} />
                </div>
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="flex justify-center mt-10">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/rooms")}
              className="rounded-full px-8 border-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group"
            >
              {isRTL ? "عرض كل الإعلانات" : "View All Listings"}
              {isRTL ? (
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
