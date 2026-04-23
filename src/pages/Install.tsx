import React, { useState, useEffect } from 'react';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Smartphone, Monitor, Check, Share, Plus, MoreVertical } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallContent: React.FC = () => {
  const { isRTL } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-secondary/30 pt-8 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Smartphone className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isRTL ? 'حمّل تطبيق سكنك' : 'Install Sakanak App'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'احصل على تجربة أفضل مع التطبيق على جهازك'
                : 'Get a better experience with the app on your device'}
            </p>
          </div>

          {isInstalled ? (
            <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-6 text-center">
                <Check className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {isRTL ? 'التطبيق مثبت بالفعل!' : 'App Already Installed!'}
                </h2>
                <p className="text-muted-foreground">
                  {isRTL 
                    ? 'يمكنك فتح سكنك من الشاشة الرئيسية لجهازك'
                    : 'You can open Sakanak from your home screen'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Android/Desktop with install prompt */}
              {deferredPrompt && (
                <Card className="mb-6 border-primary/50">
                  <CardContent className="p-6 text-center">
                    <Button size="lg" onClick={handleInstall} className="gap-2">
                      <Download className="w-5 h-5" />
                      {isRTL ? 'تثبيت التطبيق الآن' : 'Install App Now'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* iOS Instructions */}
              {isIOS && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      {isRTL ? 'تثبيت على iPhone/iPad' : 'Install on iPhone/iPad'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'اتبع هذه الخطوات البسيطة' : 'Follow these simple steps'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {isRTL ? 'اضغط على زر المشاركة' : 'Tap the Share button'}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Share className="w-4 h-4" />
                          {isRTL ? 'في أسفل الشاشة (Safari)' : 'At the bottom of the screen (Safari)'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {isRTL ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Select "Add to Home Screen"'}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Plus className="w-4 h-4" />
                          {isRTL ? 'من قائمة الخيارات' : 'From the options menu'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {isRTL ? 'اضغط "إضافة"' : 'Tap "Add"'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'سيظهر التطبيق على شاشتك الرئيسية' : 'The app will appear on your home screen'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Android Instructions (if no prompt available) */}
              {isAndroid && !deferredPrompt && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      {isRTL ? 'تثبيت على Android' : 'Install on Android'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'اتبع هذه الخطوات البسيطة' : 'Follow these simple steps'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {isRTL ? 'اضغط على قائمة المتصفح' : 'Tap the browser menu'}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MoreVertical className="w-4 h-4" />
                          {isRTL ? 'النقاط الثلاث في الأعلى' : 'Three dots at the top'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {isRTL ? 'اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"' : 'Select "Install app" or "Add to Home Screen"'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {isRTL ? 'اضغط "تثبيت"' : 'Tap "Install"'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'سيظهر التطبيق على شاشتك الرئيسية' : 'The app will appear on your home screen'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Desktop Instructions */}
              {!isIOS && !isAndroid && !deferredPrompt && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      {isRTL ? 'تثبيت على الكمبيوتر' : 'Install on Desktop'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'اتبع هذه الخطوات البسيطة' : 'Follow these simple steps'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {isRTL ? 'ابحث عن أيقونة التثبيت' : 'Look for the install icon'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'في شريط العنوان بالمتصفح' : 'In the browser address bar'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {isRTL ? 'اضغط "تثبيت"' : 'Click "Install"'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'سيفتح التطبيق في نافذة خاصة' : 'The app will open in its own window'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isRTL ? 'لماذا تثبت التطبيق؟' : 'Why Install the App?'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      isRTL ? 'وصول سريع من الشاشة الرئيسية' : 'Quick access from home screen',
                      isRTL ? 'يعمل بدون اتصال (للصفحات المحملة)' : 'Works offline (for cached pages)',
                      isRTL ? 'تجربة ملء الشاشة' : 'Full-screen experience',
                      isRTL ? 'تحميل أسرع' : 'Faster loading times',
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

const Install: React.FC = () => {
  return <InstallContent />;
};

export default Install;
