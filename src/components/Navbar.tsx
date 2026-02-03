import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe } from 'lucide-react';

const Navbar: React.FC = () => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-foreground">
              Sakan<span className="text-primary">ak</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              {t('nav.findRoom')}
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              {t('nav.findRoommate')}
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              {t('nav.howItWorks')}
            </a>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
            <Button variant="ghost" className="text-foreground font-medium">
              {t('nav.login')}
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6">
              {t('nav.signup')}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#" className="text-foreground font-medium py-2">
                {t('nav.findRoom')}
              </a>
              <a href="#" className="text-foreground font-medium py-2">
                {t('nav.findRoommate')}
              </a>
              <a href="#" className="text-foreground font-medium py-2">
                {t('nav.howItWorks')}
              </a>
              <hr className="border-border" />
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 py-2 text-muted-foreground"
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'en' ? 'العربية' : 'English'}</span>
              </button>
              <Button variant="outline" className="w-full">
                {t('nav.login')}
              </Button>
              <Button className="w-full bg-primary text-primary-foreground">
                {t('nav.signup')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
