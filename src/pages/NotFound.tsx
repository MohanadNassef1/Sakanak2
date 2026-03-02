import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { isRTL } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="text-center relative z-10 px-4">
        <div className="text-[10rem] md:text-[14rem] font-black text-primary/10 leading-none select-none">
          404
        </div>
        <div className="-mt-16 md:-mt-20">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {isRTL ? 'الصفحة غير موجودة' : 'Page Not Found'}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            {isRTL 
              ? 'الصفحة اللي بتدور عليها مش موجودة أو تم نقلها.'
              : "The page you're looking for doesn't exist or has been moved."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                {isRTL ? 'الصفحة الرئيسية' : 'Go Home'}
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link to="/rooms">
                {isRTL ? 'تصفح الغرف' : 'Browse Rooms'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
