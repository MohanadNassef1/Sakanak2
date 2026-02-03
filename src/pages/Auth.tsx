import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import { Globe, Shield, Home } from 'lucide-react';

const AuthPageContent: React.FC = () => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <span className="text-background/80">{t('auth.feature2')}</span>
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
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
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
                {mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccountTitle')}
              </h2>
              <p className="text-muted-foreground">
                {mode === 'login' ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border">
              <AuthForm 
                mode={mode} 
                onToggleMode={() => setMode(mode === 'login' ? 'signup' : 'login')} 
              />
            </div>

            {/* Terms */}
            {mode === 'signup' && (
              <p className="text-center text-sm text-muted-foreground mt-6">
                {t('auth.termsText')}{' '}
                <a href="/terms" className="text-primary hover:underline">{t('auth.termsLink')}</a>
                {' '}{t('auth.and')}{' '}
                <a href="/privacy" className="text-primary hover:underline">{t('auth.privacyLink')}</a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Auth: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthPageContent />
    </LanguageProvider>
  );
};

export default Auth;
