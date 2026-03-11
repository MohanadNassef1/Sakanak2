import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Footer: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="section-container py-12 md:py-16">
        <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 ${isRTL ? 'text-right' : ''}`}>
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                Sakanak
              </span>
              <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30">
                {isRTL ? 'بيتا' : 'BETA'}
              </Badge>
            </Link>
            <p className="text-footer-muted max-w-xs">
              {t('footer.description')}
            </p>
            <p className="text-sm text-primary font-medium">
              {isRTL ? '🎉 مجاني الآن! في نسخة البيتا' : '🎉 Free now in Beta version!'}
            </p>
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/profile.php?id=61587526106496" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-footer-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/sakanakeg/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-footer-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@sakanakeg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-footer-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-footer-foreground mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3 text-footer-muted">
              <li>
                <Link to="/rooms" className="hover:text-primary transition-colors">{t('nav.findRoom')}</Link>
              </li>
              <li>
                <Link to="/list-room" className="hover:text-primary transition-colors">{t('nav.listRoom')}</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-primary transition-colors">{t('nav.howItWorks')}</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primary transition-colors">{isRTL ? 'المدونة' : 'Blog'}</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-footer-foreground mb-4">{t('footer.support')}</h4>
            <ul className="space-y-3 text-footer-muted">
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">{t('footer.contact')}</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">{t('footer.faq')}</Link>
              </li>
              <li>
                <Link to="/safety-tips" className="hover:text-primary transition-colors">{t('footer.safety')}</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-footer-foreground mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-3 text-footer-muted">
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">{t('footer.terms')}</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-primary transition-colors">{t('footer.refund')}</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* SEO Location Links */}
        <div data-nosnippet="" className="border-t border-footer-foreground/10 mt-8 pt-8">
          <h4 className="font-bold text-footer-foreground mb-4 text-sm">
            {isRTL ? 'غرف وشقق للايجار في مصر' : 'Rooms & Apartments for Rent in Egypt'}
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-footer-muted">
            <Link to="/rooms-cairo" className="hover:text-primary transition-colors">
              {isRTL ? 'غرف للايجار في القاهرة' : 'Rooms in Cairo'}
            </Link>
            <Link to="/rooms-giza" className="hover:text-primary transition-colors">
              {isRTL ? 'غرف للايجار في الجيزة' : 'Rooms in Giza'}
            </Link>
            <Link to="/rooms-alexandria" className="hover:text-primary transition-colors">
              {isRTL ? 'غرف للايجار في الاسكندرية' : 'Rooms in Alexandria'}
            </Link>
            <Link to="/rooms-mansoura" className="hover:text-primary transition-colors">
              {isRTL ? 'غرف للايجار في المنصورة' : 'Rooms in Mansoura'}
            </Link>
            <Link to="/rooms-tanta" className="hover:text-primary transition-colors">
              {isRTL ? 'غرف للايجار في طنطا' : 'Rooms in Tanta'}
            </Link>
            <Link to="/rooms-zagazig" className="hover:text-primary transition-colors">
              {isRTL ? 'غرف للايجار في الزقازيق' : 'Rooms in Zagazig'}
            </Link>
            <Link to="/rooms-assiut" className="hover:text-primary transition-colors">
              {isRTL ? 'غرف للايجار في أسيوط' : 'Rooms in Assiut'}
            </Link>
            <Link to="/roommates-cairo" className="hover:text-primary transition-colors">
              {isRTL ? 'شريك سكن في القاهرة' : 'Roommates in Cairo'}
            </Link>
            <Link to="/roommates-alexandria" className="hover:text-primary transition-colors">
              {isRTL ? 'شريك سكن في الاسكندرية' : 'Roommates in Alexandria'}
            </Link>
            <Link to="/student-housing-cairo" className="hover:text-primary transition-colors">
              {isRTL ? 'سكن طلاب في القاهرة' : 'Student Housing Cairo'}
            </Link>
            <Link to="/student-housing-alexandria" className="hover:text-primary transition-colors">
              {isRTL ? 'سكن طلاب في الاسكندرية' : 'Student Housing Alexandria'}
            </Link>
            <Link to="/student-housing-mansoura" className="hover:text-primary transition-colors">
              {isRTL ? 'سكن طلاب في المنصورة' : 'Student Housing Mansoura'}
            </Link>
          </div>
        </div>

        {/* SEO Blog Links */}
        <div className="border-t border-footer-foreground/10 mt-6 pt-6">
          <h4 className="font-bold text-footer-foreground mb-4 text-sm">
            {isRTL ? 'مقالات ونصائح' : 'Guides & Tips'}
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-footer-muted">
            <Link to="/blog/best-areas-rent-cairo-2026" className="hover:text-primary transition-colors">
              {isRTL ? 'أفضل مناطق إيجار القاهرة' : 'Best Areas to Rent in Cairo'}
            </Link>
            <Link to="/blog/rooms-for-rent-giza-2026" className="hover:text-primary transition-colors">
              {isRTL ? 'غرف للإيجار في الجيزة' : 'Rooms for Rent in Giza'}
            </Link>
            <Link to="/blog/how-to-find-roommate-egypt" className="hover:text-primary transition-colors">
              {isRTL ? 'إزاي تلاقي شريك سكن' : 'How to Find a Roommate'}
            </Link>
            <Link to="/blog/student-housing-guide-egypt" className="hover:text-primary transition-colors">
              {isRTL ? 'دليل سكن الطلاب' : 'Student Housing Guide'}
            </Link>
            <Link to="/blog/renting-without-broker-egypt" className="hover:text-primary transition-colors">
              {isRTL ? 'إيجار بدون سمسار' : 'Rent Without a Broker'}
            </Link>
            <Link to="/blog/tenant-rights-renting-egypt" className="hover:text-primary transition-colors">
              {isRTL ? 'حقوق المستأجر' : 'Tenant Rights Egypt'}
            </Link>
            <Link to="/blog/cost-of-living-comparison-egyptian-cities" className="hover:text-primary transition-colors">
              {isRTL ? 'مقارنة تكاليف المعيشة' : 'Cost of Living Comparison'}
            </Link>
            <Link to="/blog/new-cairo-fifth-settlement-rooms-guide" className="hover:text-primary transition-colors">
              {isRTL ? 'غرف التجمع الخامس' : 'New Cairo Rooms Guide'}
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div data-nosnippet="" className="border-t border-footer-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-footer-muted text-sm">
            © {new Date().getFullYear()} Sakanak. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-6 text-sm text-footer-muted">
            <a href="mailto:support@sakanak.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
support@sakanakeg.com
            </a>
            <a href="tel:+201017282645" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              01017282645
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
