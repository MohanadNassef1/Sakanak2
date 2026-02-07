import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Home, Star, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

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
  const { data: premiumRooms, isLoading } = useQuery({
    queryKey: ["premium-rooms", featuredRoomIds],
    queryFn: async () => {
      // If admin has selected rooms, fetch those
      if (featuredRoomIds && featuredRoomIds.length > 0) {
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .in("id", featuredRoomIds)
          .eq("status", "active");
        
        if (error) throw error;
        
        // Sort by the order in featuredRoomIds
        return featuredRoomIds
          .map(id => data?.find(r => r.id === id))
          .filter(Boolean);
      }
      
      // Fallback: fetch 3 most recent active rooms
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: featuredRoomIds !== undefined,
  });

  // بيانات احتياطية (لو مفيش نت أو الداتابيز فاضية)
  const fallbackRooms = [
    {
      id: "1",
      title: isRTL ? "شقة فندقية بفيو عالنيل" : "Luxury Nile View Apartment",
      city: isRTL ? "الزمالك" : "Zamalek",
      price_per_month: 8500,
      photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60"],
      room_type: "apartment",
    },
    {
      id: "2",
      title: isRTL ? "غرفة ماستر في المعادي" : "Master Room in Maadi",
      city: isRTL ? "المعادي" : "Maadi",
      price_per_month: 4000,
      photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60"],
      room_type: "private_room",
    },
    {
      id: "3",
      title: isRTL ? "ستوديو مودرن بجوار الجامعة" : "Modern Studio near AUC",
      city: isRTL ? "التجمع الخامس" : "New Cairo",
      price_per_month: 6000,
      photos: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=60"],
      room_type: "studio",
    },
  ];

  // استخدم البيانات الحقيقية لو موجودة، وإلا استخدم الاحتياطي
  const displayRooms = premiumRooms && premiumRooms.length > 0 ? premiumRooms : fallbackRooms;

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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mx-auto animate-fade-in">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {isRTL ? "منصة موثقة وآمنة 100%" : "100% Verified & Secure Platform"}
            </span>
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

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("hero.subtitle") ||
              (isRTL
                ? "سكنك بيربطك بشركاء سكن موثقين وشقق مفروشة عالية الجودة. بدون سماسرة، بدون احتيال."
                : "Sakanak connects you with verified roommates and high-quality furnished apartments. No brokers, no scams.")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate("/rooms")}
            >
              <Search className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("hero.cta.findRoom") || (isRTL ? "ابحث عن غرفة" : "Find a Room")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-full bg-white/50 backdrop-blur-sm border-2 hover:bg-white"
              onClick={() => navigate("/list-room")}
            >
              <Home className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("hero.cta.listRoom") || (isRTL ? "اعرض غرفتك" : "List Your Room")}
            </Button>
          </div>
        </div>

        {/* Featured Listings Section */}
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
            /* Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayRooms.map((room, index) => (
                <div
                  key={room.id}
                  onClick={() => navigate(`/rooms/${room.id}`)}
                  className="group relative bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-border/30 hover:border-primary/30"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Premium Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={
                        room.photos?.[0] ||
                        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop"
                      }
                      alt={room.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Featured Badge */}
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-primary to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {isRTL ? "مميز" : "Featured"}
                    </div>
                    
                    {/* Room Type Badge */}
                    <div className="absolute top-4 right-4 bg-white/95 dark:bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-foreground capitalize shadow-md">
                      {room.room_type?.replace("_", " ")}
                    </div>
                    
                    {/* Price Tag - Bottom of Image */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/95 dark:bg-card/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground block mb-0.5">
                            {isRTL ? "شهرياً" : "Monthly"}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-2xl text-primary">
                              {room.price_per_month?.toLocaleString()}
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">
                              {isRTL ? "ج.م" : "EGP"}
                            </span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 relative">
                    <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-3">
                      {room.title}
                    </h3>

                    <div className="flex items-center text-muted-foreground text-sm">
                      <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">{room.city}</span>
                      </div>
                    </div>
                  </div>
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
      </div>
    </div>
  );
};

export default Hero;
