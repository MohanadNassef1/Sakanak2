import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import IntentSelectionDialog from '@/components/auth/IntentSelectionDialog';
import { Globe, Shield } from 'lucide-react';

const AuthPageContent: React.FC = () => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'student-signup'>('login');
  const [showIntentDialog, setShowIntentDialog] = useState(false);
  const wasLoggedOut = useRef(true);

  // Get referral code from URL if present
  const referralCodeFromUrl = searchParams.get('ref') || '';

  // If referral code in URL, default to signup mode
  useEffect(() => {
    if (referralCodeFromUrl) {
      setMode('signup');
    }
  }, [referralCodeFromUrl]);

  // Track if user just logged in (was logged out, now logged in)
  useEffect(() => {
    if (!loading) {
      if (user && wasLoggedOut.current) {
        // User just logged in - show intent dialog
        // Check if there's a redirect path from room details
        const redirectPath = (location.state as any)?.from;
        if (redirectPath && redirectPath.startsWith('/rooms/')) {
          // User was trying to view room details - redirect there
          navigate(redirectPath);
        } else {
          // Show intent selection dialog
          setShowIntentDialog(true);
        }
      }
      wasLoggedOut.current = !user;
    }
  }, [user, loading, navigate, location.state]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleToggleMode = (newMode?: 'login' | 'signup' | 'forgot' | 'student-signup') => {
    if (newMode) {
      setMode(newMode);
    } else {
      setMode(mode === 'login' ? 'signup' : 'login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>);

  }

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Left Side - Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-background">
          {/* Logo */}
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl font-bold text-primary">Sakanak</span>
          </a>

          {/* Content */}
          <div className="space-y-8 max-w-md">
            <h1 className="text-4xl font-bold leading-tight">
              {t('auth.brandTitle')}
            </h1>
            <p className="text-xl text-background/70">
              {t('auth.brandSubtitle')}
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="text-background/80">{t('auth.feature1')}</span>
              </div>
              





            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} Sakanak. {t('footer.rights')}
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 lg:p-6">
          <a href="/" className="flex items-center gap-2 lg:hidden">
            <span className="text-2xl font-bold text-primary">Sakanak</span>
          </a>
          <div className="lg:ml-auto">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">

              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {mode === 'forgot' ?
                t('auth.resetPassword') :
                mode === 'login' ?
                t('auth.welcomeBack') :
                mode === 'student-signup' ?
                t('auth.studentSignupTitle') :
                t('auth.createAccountTitle')}
              </h2>
              <p className="text-muted-foreground">
                {mode === 'forgot' ?
                t('auth.resetPasswordSubtitle') :
                mode === 'login' ?
                t('auth.loginSubtitle') :
                mode === 'student-signup' ?
                t('auth.studentSignupSubtitle') :
                t('auth.signupSubtitle')}
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border">
              <AuthForm
                mode={mode}
                onToggleMode={handleToggleMode}
                initialReferralCode={referralCodeFromUrl} />

            </div>

            {/* Terms */}
            {(mode === 'signup' || mode === 'student-signup') &&
            <p className="text-center text-sm text-muted-foreground mt-6">
                {t('auth.termsText')}{' '}
                <a href="/terms" className="text-primary hover:underline">{t('auth.termsLink')}</a>
                {' '}{t('auth.and')}{' '}
                <a href="/privacy" className="text-primary hover:underline">{t('auth.privacyLink')}</a>
              </p>
            }
          </div>
        </div>
      </div>

      {/* Intent Selection Dialog - shown after successful login/signup */}
      <IntentSelectionDialog
        open={showIntentDialog}
        onClose={() => {
          setShowIntentDialog(false);
          navigate('/');
        }} />

    </div>);

};

const Auth: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthPageContent />
    </LanguageProvider>);

};

export default Auth;