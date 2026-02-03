import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe, Home, Search, LogIn, UserPlus, LogOut, User, PlusCircle, MessageCircle } from 'lucide-react';

const Navbar: React.FC = () => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Text based as per reference */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl md:text-3xl font-bold">
              <span className="text-primary">Sakanak</span>
            </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center gap-1">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              {t('nav.home')}
            </Link>
            <Link 
              to="/rooms" 
              className="flex items-center gap-2 px-4 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-medium"
            >
              <Search className="w-4 h-4" />
              {t('nav.browseRooms')}
            </Link>
            <Link 
              to="/list-room" 
              className="flex items-center gap-2 px-4 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              {t('nav.listRoom')}
            </Link>
          </div>

          {/* Actions - Right */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>
            
            {user ? (
              <>
                <Link 
                  to="/messages"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="w-4 h-4" />
                </Link>
                <Link 
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </Link>
                <Button 
                  variant="ghost" 
                  className="text-foreground font-medium gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.signOut')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="text-foreground font-medium gap-2" asChild>
                  <Link to="/auth">
                    <LogIn className="w-4 h-4" />
                    {t('nav.signIn')}
                  </Link>
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-5 gap-2 rounded-full" asChild>
                  <Link to="/auth">
                    <UserPlus className="w-4 h-4" />
                    {t('nav.getStarted')}
                  </Link>
                </Button>
              </>
            )}
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
            <div className="flex flex-col gap-2">
              <Link 
                to="/" 
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                {t('nav.home')}
              </Link>
              <Link 
                to="/rooms" 
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-foreground font-medium hover:bg-secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="w-5 h-5" />
                {t('nav.browseRooms')}
              </Link>
              <Link 
                to="/list-room" 
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-foreground font-medium hover:bg-secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                <PlusCircle className="w-5 h-5" />
                {t('nav.listRoom')}
              </Link>
              <hr className="border-border my-2" />
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-3 text-muted-foreground"
              >
                <Globe className="w-5 h-5" />
                <span>{language === 'en' ? 'العربية' : 'English'}</span>
              </button>
              
              {user ? (
                <>
                  <Link 
                    to="/messages"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-foreground font-medium hover:bg-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Messages
                  </Link>
                  <Link 
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-3 bg-secondary rounded-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 justify-center"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.signOut')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full gap-2 justify-center" asChild>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <LogIn className="w-4 h-4" />
                      {t('nav.signIn')}
                    </Link>
                  </Button>
                  <Button className="w-full bg-primary text-primary-foreground gap-2 justify-center" asChild>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <UserPlus className="w-4 h-4" />
                      {t('nav.getStarted')}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
