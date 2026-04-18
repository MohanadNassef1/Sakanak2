import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Instagram, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const Footer: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-footer text-footer-foreground">
      {/* Hidden SEO keyword block — invisible to users, fully crawlable by Google */}
      <p className="sr-only">
        Sakanak سكنك Sakanak Egypt سكنك مصر — Roommate Egypt روميت, Rooms for rent Egypt غرف للإيجار,
        Student housing Cairo سكن طلاب, Female roommate Egypt روميت بنات فقط, Girls only housing Egypt سكن بنات,
        Male roommate Cairo سكن شباب, Boys only housing روميت شباب فقط, Shared apartments Egypt شقق شيرنج,
        Safe student accommodation سكن آمن للمغتربات, No mixed gender housing Egypt سكن غير مختلط,
        Find a roommate in Egypt تطبيق للبحث عن روميت في مصر, Roommate finder Egypt مطلوب روميت للسكن,
        Furnished rooms for rent غرف مفروشة للإيجار, Cheap shared housing Egypt سكن مشترك رخيص,
        Expat housing Egypt سكن مغتربين.
      </p>

      <div className="section-container py-12 md:py-14">
        {/* Top: Brand + 3 link columns */}
        <div className={`grid gap-10 md:gap-12 md:grid-cols-2 lg:grid-cols-12 ${isRTL ? 'text-right' : ''}`}>
          {/* Brand block — wider */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">Sakanak</span>
              <Badge variant="outline" className="text-[10px] tracking-wide bg-primary/15 text-primary border-primary/30">
                {isRTL ? 'بيتا' : 'BETA'}
              </Badge>
            </Link>
            <p className="text-footer-muted text-sm leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>
            <p className="text-sm text-primary font-medium">
              {isRTL ? '🎉 مجاني الآن في نسخة البيتا' : '🎉 Free now during Beta'}
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://www.facebook.com/profile.php?id=61587526106496"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-footer-foreground/5 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/sakanakeg/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-footer-foreground/5 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@sakanakeg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-full bg-footer-foreground/5 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="lg:col-span-3">
            <h4 className="font-semibold text-footer-foreground mb-4 text-sm uppercase tracking-wider">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-sm text-footer-muted">
              <li><Link to="/rooms" className="hover:text-primary transition-colors">{t('nav.findRoom')}</Link></li>
              <li><Link to="/list-room" className="hover:text-primary transition-colors">{t('nav.listRoom')}</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary transition-colors">{t('nav.howItWorks')}</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">{isRTL ? 'مدونة سكنك' : 'Blog'}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-footer-foreground mb-4 text-sm uppercase tracking-wider">
              {t('footer.support')}
            </h4>
            <ul className="space-y-2.5 text-sm text-footer-muted">
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t('footer.contact')}</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">{t('footer.faq')}</Link></li>
              <li><Link to="/safety-tips" className="hover:text-primary transition-colors">{t('footer.safety')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-footer-foreground mb-4 text-sm uppercase tracking-wider">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2.5 text-sm text-footer-muted">
              <li><Link to="/terms" className="hover:text-primary transition-colors">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/refund" className="hover:text-primary transition-colors">{t('footer.refund')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Hidden but crawlable city links — keeps internal linking SEO without visual noise */}
        <nav aria-label="Locations" className="sr-only">
          <Link to="/rooms-cairo">Rooms in Cairo - غرف للإيجار في القاهرة</Link>
          <Link to="/rooms-giza">Rooms in Giza - غرف للإيجار في الجيزة</Link>
          <Link to="/rooms-alexandria">Rooms in Alexandria - غرف للإيجار في الإسكندرية</Link>
          <Link to="/rooms-mansoura">Rooms in Mansoura</Link>
          <Link to="/rooms-tanta">Rooms in Tanta</Link>
          <Link to="/rooms-zagazig">Rooms in Zagazig</Link>
          <Link to="/rooms-assiut">Rooms in Assiut</Link>
          <Link to="/roommates-cairo">Roommate Cairo - روميت</Link>
          <Link to="/roommates-alexandria">Roommate Alexandria</Link>
          <Link to="/student-housing-cairo">Student Housing Cairo - سكن طلاب</Link>
          <Link to="/student-housing-alexandria">Student Housing Alexandria</Link>
          <Link to="/student-housing-mansoura">Student Housing Mansoura</Link>
        </nav>

        {/* Bottom bar */}
        <div
          data-nosnippet=""
          className={`border-t border-footer-foreground/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-footer-muted ${isRTL ? 'sm:flex-row-reverse' : ''}`}
        >
          <p>© {new Date().getFullYear()} Sakanak — {isRTL ? 'سكنك' : 'سكنك'}. {t('footer.rights')}</p>
          <a
            href="mailto:support@sakanakeg.com"
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            support@sakanakeg.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
