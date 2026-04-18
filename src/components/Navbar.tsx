import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useUnreadViewings } from '@/hooks/useUnreadViewings';
import { useUnreadViewingMessages } from '@/hooks/useUnreadViewingMessages';
import { useUnreadListingQuestions } from '@/hooks/useUnreadListingQuestions';
import { useIsAdmin } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ThemeToggle from '@/components/ThemeToggle';
import { Menu, X, LogIn, UserPlus, LogOut, User, MessageCircle, Home, Search, Users, PlusCircle, Eye, HelpCircle, Shield, Bell } from 'lucide-react';
import { trackCustomEvent } from '@/lib/fbPixel';

const Navbar: React.FC = () => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const unreadCount = useUnreadMessages();
  const unreadViewingMsgs = useUnreadViewingMessages();
  const totalUnreadChats = unreadCount + unreadViewingMsgs;
  const actionableViewings = useUnreadViewings();
  const unreadQuestions = useUnreadListingQuestions();
  const { isAdmin } = useIsAdmin(user?.id);

  const userName = profile?.full_name || user?.user_metadata?.full_name || '';
  const userInitial = userName ? userName.charAt(0).toUpperCase() : '?';
  const avatarUrl = profile?.avatar_url || '';

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
              onClick={() => trackCustomEvent('ClickFindRoom', { source: 'navbar' })}
            >
              {t('nav.browseRooms')}
            </Link>
            <Link 
              to="/list-room" 
              className="text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => trackCustomEvent('ClickListRoom', { source: 'navbar' })}
            >
              {t('nav.listRoom')}
            </Link>
            <Link 
              to="/how-it-works" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t('nav.howItWorks')}
            </Link>
          </div>

          {/* Actions - Right */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground font-semibold text-sm"
              aria-label="Toggle language"
            >
              {language === 'en' ? 'AR' : 'EN'}
            </button>
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <Link 
                  to="/chats"
                  className="relative p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Chats"
                  title={isRTL ? 'المحادثات' : 'Chats'}
                >
                  <MessageCircle className="w-5 h-5" />
                  {totalUnreadChats > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
                      {totalUnreadChats > 99 ? '99+' : totalUnreadChats}
                    </span>
                  )}
                </Link>
                <Link 
                  to="/my-viewings"
                  className="relative p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="My Viewings"
                  title={isRTL ? 'معايناتي' : 'My Viewings'}
                >
                  <Eye className="w-5 h-5" />
                  {actionableViewings > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
                      {actionableViewings > 99 ? '99+' : actionableViewings}
                    </span>
                  )}
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Admin Dashboard"
                    title="Admin Dashboard"
                  >
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                {/* Messages Link - HIDDEN FOR BETA */}
                <Link 
                  to="/profile"
                  className="flex items-center"
                  aria-label="Profile"
                >
                  <Avatar className="w-8 h-8 ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
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
                to="/list-room" 
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-foreground font-medium hover:bg-secondary tap-highlight-none touch-manipulation active:scale-[0.98] transition-transform"
                onClick={() => setIsMenuOpen(false)}
              >
                <PlusCircle className="w-5 h-5" />
                {t('nav.listRoom')}
              </Link>
              <Link 
                to="/how-it-works" 
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-foreground font-medium hover:bg-secondary tap-highlight-none touch-manipulation active:scale-[0.98] transition-transform"
                onClick={() => setIsMenuOpen(false)}
              >
                <HelpCircle className="w-5 h-5" />
                {t('nav.howItWorks')}
              </Link>
              <hr className="border-border my-3" />
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-muted-foreground tap-highlight-none touch-manipulation min-h-[44px] font-semibold"
                >
                  <span className="text-sm">{language === 'en' ? 'AR' : 'EN'}</span>
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
                    <div className="relative">
                      <MessageCircle className="w-5 h-5" />
                      {totalUnreadChats > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
                          {totalUnreadChats > 99 ? '99+' : totalUnreadChats}
                        </span>
                      )}
                    </div>
                    {isRTL ? 'المحادثات' : 'Chats'}
                    {totalUnreadChats > 0 && (
                      <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-bold">
                        {totalUnreadChats}
                      </span>
                    )}
                  </Link>
                  <Link 
                    to="/my-viewings"
                    className="flex items-center gap-3 px-4 py-4 rounded-xl text-foreground font-medium hover:bg-secondary tap-highlight-none touch-manipulation active:scale-[0.98] transition-transform"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="relative">
                      <Eye className="w-5 h-5" />
                      {actionableViewings > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
                          {actionableViewings > 99 ? '99+' : actionableViewings}
                        </span>
                      )}
                    </div>
                    {isRTL ? 'معايناتي' : 'My Viewings'}
                    {actionableViewings > 0 && (
                      <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-bold">
                        {actionableViewings}
                      </span>
                    )}
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-4 rounded-xl text-foreground font-medium hover:bg-secondary tap-highlight-none touch-manipulation active:scale-[0.98] transition-transform"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="w-5 h-5" />
                      {isRTL ? 'لوحة التحكم' : 'Admin Dashboard'}
                    </Link>
                  )}
                  <Link 
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-4 bg-secondary rounded-xl tap-highlight-none touch-manipulation active:scale-[0.98] transition-transform"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">
                      {userName || user.email?.split('@')[0]}
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
