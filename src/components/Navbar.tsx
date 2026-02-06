import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { Menu, X, Globe, LogIn, UserPlus, LogOut, User, MessageCircle, Home, Search, Users, PlusCircle, Eye } from 'lucide-react';

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center tap-highlight-none touch-manipulation">
             <span className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
               Sakanak
             </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/rooms" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t('nav.browseRooms')}
            </Link>
            <Link 
              to="/roommates" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t('nav.findRoommates')}
            </Link>
            <Link 
              to="/list-room" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t('nav.listRoom')}
            </Link>
          </div>

          {/* Actions - Right */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Toggle language"
            >
              <Globe className="w-5 h-5" />
            </button>
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <Link 
                  to="/chats"
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Chats"
                  title={isRTL ? 'المحادثات' : 'Chats'}
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <Link 
                  to="/my-viewings"
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="My Viewings"
                  title={isRTL ? 'معايناتي' : 'My Viewings'}
                >
                  <Eye className="w-5 h-5" />
                </Link>
                {/* Messages Link - HIDDEN FOR BETA */}
                <Link 
                  to="/profile"
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Profile"
                >
                  <User className="w-5 h-5" />
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">
                    {t('nav.signIn')}
                  </Link>
                </Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4" asChild>
                  <Link to="/auth">
                    {t('nav.getStarted')}
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors tap-highlight-none touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide safe-area-bottom">
            <div className="flex flex-col gap-1">
              <Link 
                to="/" 
                className="flex items-center gap-3 px-4 py-4 rounded-xl bg-primary/10 text-primary font-medium tap-highlight-none touch-manipulation active:scale-[0.98] transition-transform"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                {t('nav.home')}
              </Link>
              <Link 
                to="/rooms" 
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-foreground font-medium hover:bg-secondary tap-highlight-none touch-manipulation active:scale-[0.98] transition-transform"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="w-5 h-5" />
                {t('nav.browseRooms')}
              </Link>
              <Link 
                to="/roommates" 
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-foreground font-medium hover:bg-secondary tap-highlight-none touch-manipulation active:scale-[0.98] transition-transform"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="w-5 h-5" />
                {t('nav.findRoommates')}
              </Link>
              <Link 
                to="/list-room" 
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-foreground font-medium hover:bg-secondary tap-highlight-none touch-manipulation active:scale-[0.98] transition-transform"
                onClick={() => setIsMenuOpen(false)}
              >
                <PlusCircle className="w-5 h-5" />
                {t('nav.listRoom')}
              </Link>
              <hr className="border-border my-3" />
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-muted-foreground tap-highlight-none touch-manipulation min-h-[44px]"
                >
                  <Globe className="w-5 h-5" />
                  <span>{language === 'en' ? 'العربية' : 'English'}</span>
                </button>
                <ThemeToggle />
              </div>
              
              {user ? (
                <>
                  <Link 
                    to="/chats"
                    className="flex items-center gap-3 px-4 py-4 rounded-xl text-foreground font-medium hover:bg-secondary tap-highlight-none touch-manipulation active:scale-[0.98] transition-transform"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageCircle className="w-5 h-5" />
                    {isRTL ? 'المحادثات' : 'Chats'}
                  </Link>
                  <Link 
                    to="/my-viewings"
                    className="flex items-center gap-3 px-4 py-4 rounded-xl text-foreground font-medium hover:bg-secondary tap-highlight-none touch-manipulation active:scale-[0.98] transition-transform"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Eye className="w-5 h-5" />
                    {isRTL ? 'معايناتي' : 'My Viewings'}
                  </Link>
                  <Link 
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-4 bg-secondary rounded-xl tap-highlight-none touch-manipulation active:scale-[0.98] transition-transform"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 justify-center min-h-[48px] tap-highlight-none touch-manipulation"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.signOut')}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-2">
                  <Button variant="outline" className="w-full gap-2 justify-center min-h-[48px] tap-highlight-none touch-manipulation" asChild>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <LogIn className="w-4 h-4" />
                      {t('nav.signIn')}
                    </Link>
                  </Button>
                  <Button className="w-full bg-primary text-primary-foreground gap-2 justify-center min-h-[48px] tap-highlight-none touch-manipulation" asChild>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <UserPlus className="w-4 h-4" />
                      {t('nav.getStarted')}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
