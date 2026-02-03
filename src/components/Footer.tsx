import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-sakanak-dark text-background/80">
      <div className="section-container py-12 md:py-16">
        <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 ${isRTL ? 'text-right' : ''}`}>
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-background">
                Sakan<span className="text-primary">ak</span>
              </span>
            </div>
            <p className="text-background/60 max-w-xs">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-background mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('nav.findRoom')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('nav.listRoom')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('nav.findRoommate')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('nav.howItWorks')}</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-background mb-4">{t('footer.support')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('footer.contact')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('footer.faq')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('footer.safety')}</a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-background mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('footer.terms')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('footer.privacy')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('footer.refund')}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} Sakanak. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-6 text-sm text-background/50">
            <a href="mailto:support@sakanak.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
              support@sakanak.com
            </a>
            <a href="tel:+201234567890" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              +20 123 456 7890
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
