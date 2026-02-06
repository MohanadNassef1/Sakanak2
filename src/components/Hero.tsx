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

  // 1. سحب بيانات الشقق الحقيقية من Supabase
  const { data: premiumRooms, isLoading } = useQuery({
    queryKey: ["premium-rooms"],
    queryFn: async () => {
      // هنجيب أحدث 3 شقق (ممكن تزود .eq('is_featured', true) لو عايز المميزين بس)
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
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

        {/* القسم الجديد: 3 كروت حقيقية من الداتابيز */}
        <div className="mt-12">
          {/* عنوان القسم المميز */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-default">
              <Star className="w-4 h-4 fill-current animate-pulse" />
              <span className="font-bold text-sm tracking-wide uppercase">
                {isRTL ? "أحدث الإعلانات المميزة" : "Featured Listings"}
              </span>
            </div>
          </div>

          {/* حالة التحميل */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            /* شبكة الكروت */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => navigate(`/rooms/${room.id}`)} // يوديك لصفحة الشقة الحقيقية
                  className="group bg-white dark:bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  {/* صورة الشقة */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={
                        room.photos?.[0] ||
                        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop"
                      }
                      alt={room.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 text-primary shadow-sm">
                      <Star className="w-3 h-3 fill-primary" />
                      <span>4.9</span> {/* تقييم وهمي مؤقتاً لحد ما نعمل نظام تقييم */}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-md text-xs backdrop-blur-sm capitalize">
                      {room.room_type?.replace("_", " ")}
                    </div>
                  </div>

                  {/* تفاصيل الشقة */}
                  <div className="p-5">
                    <div className="mb-3 h-14 overflow-hidden">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {room.title}
                      </h3>
                    </div>

                    <div className="flex items-center text-muted-foreground text-sm mb-4">
                      <MapPin className="w-3.5 h-3.5 mx-1 text-primary" />
                      {room.city}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-0.5">
                          {isRTL ? "السعر الشهري" : "Monthly Price"}
                        </span>
                        <span className="font-bold text-primary text-xl">
                          {room.price_per_month?.toLocaleString()}{" "}
                          <span className="text-sm font-normal text-muted-foreground">{isRTL ? "ج.م" : "EGP"}</span>
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-primary/10 hover:text-primary"
                      >
                        {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
