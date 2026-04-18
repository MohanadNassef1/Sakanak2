import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { getConsent, acceptAll, rejectAll, setConsent } from '@/lib/consent';

const CookieConsentBanner: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    const state = getConsent();
    if (!state.decided) {
      // small delay so it doesn't flash before the page renders
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    setVisible(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setVisible(false);
  };

  const handleSavePreferences = () => {
    setConsent({ analytics, marketing });
    setVisible(false);
  };

  if (!visible) return null;

  const t = (en: string, ar: string) => (isArabic ? ar : en);

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('Cookie consent', 'موافقة ملفات تعريف الارتباط')}
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                {t('We value your privacy', 'نحترم خصوصيتك')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {t(
                  'We use cookies and similar technologies to keep the site secure, measure performance (Google Analytics, Microsoft Clarity), and personalize ads (Meta Pixel). You can accept all, reject non-essential, or customize your choices. Read our ',
                  'نستخدم ملفات تعريف الارتباط وتقنيات مشابهة للحفاظ على أمان الموقع وقياس الأداء (Google Analytics وMicrosoft Clarity) وتخصيص الإعلانات (Meta Pixel). يمكنك القبول أو الرفض أو التخصيص. اقرأ '
                )}
                <Link to="/privacy" className="text-primary underline underline-offset-2 hover:no-underline">
                  {t('Privacy Policy', 'سياسة الخصوصية')}
                </Link>
                .
              </p>

              {showDetails && (
                <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{t('Strictly necessary', 'ضرورية')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('Login, security, language. Always on.', 'تسجيل الدخول والأمان واللغة. دائماً مفعّلة.')}
                      </p>
                    </div>
                    <Switch checked disabled />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{t('Analytics', 'التحليلات')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('Google Analytics, Microsoft Clarity', 'Google Analytics وMicrosoft Clarity')}
                      </p>
                    </div>
                    <Switch checked={analytics} onCheckedChange={setAnalytics} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{t('Marketing', 'التسويق')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('Meta Pixel for ad measurement & retargeting', 'Meta Pixel لقياس الإعلانات وإعادة الاستهداف')}
                      </p>
                    </div>
                    <Switch checked={marketing} onCheckedChange={setMarketing} />
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={handleAcceptAll} className="flex-1 sm:flex-none min-w-[120px]">
                  {t('Accept all', 'قبول الكل')}
                </Button>
                <Button onClick={handleRejectAll} variant="outline" className="flex-1 sm:flex-none min-w-[120px]">
                  {t('Reject non-essential', 'رفض غير الضروري')}
                </Button>
                {showDetails ? (
                  <Button onClick={handleSavePreferences} variant="secondary" className="flex-1 sm:flex-none min-w-[120px]">
                    {t('Save preferences', 'حفظ التفضيلات')}
                  </Button>
                ) : (
                  <Button onClick={() => setShowDetails(true)} variant="ghost" className="flex-1 sm:flex-none min-w-[120px]">
                    {t('Customize', 'تخصيص')}
                  </Button>
                )}
              </div>
            </div>
            <button
              onClick={handleRejectAll}
              aria-label={t('Close', 'إغلاق')}
              className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
