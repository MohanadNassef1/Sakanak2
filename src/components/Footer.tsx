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
                <Link to="/#how-it-works" className="hover:text-primary transition-colors">{t('nav.howItWorks')}</Link>
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

        {/* Bottom Bar */}
        <div className="border-t border-footer-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-footer-muted text-sm">
            © {new Date().getFullYear()} Sakanak. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-6 text-sm text-footer-muted">
            <a href="mailto:support@sakanak.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
              support@sakanak.com
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
