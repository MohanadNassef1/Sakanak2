import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/fbPixel';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, gender: 'male' | 'female', nationality: string, referralCode?: string, dateOfBirth?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_REFRESH_LOCK_KEY = 'sakanak-auth-refresh-lock';
const AUTH_REFRESH_LOCK_TTL_MS = 15000;
const AUTH_REFRESH_BUFFER_SECONDS = 300;

const isRateLimitError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const message = 'message' in error ? String((error as { message?: unknown }).message ?? '') : '';
  const status = 'status' in error ? Number((error as { status?: unknown }).status) : 0;
  return status === 429 || message.includes('429') || message.toLowerCase().includes('rate limit');
};

const acquireRefreshLock = () => {
  const now = Date.now();
  const lockUntil = Number(localStorage.getItem(AUTH_REFRESH_LOCK_KEY) ?? '0');

  if (lockUntil > now) {
    return false;
  }

  localStorage.setItem(AUTH_REFRESH_LOCK_KEY, String(now + AUTH_REFRESH_LOCK_TTL_MS));
  return true;
};

const releaseRefreshLock = () => {
  localStorage.removeItem(AUTH_REFRESH_LOCK_KEY);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionRef = useRef<Session | null>(null);
  const explicitSignOutRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let hasInitialized = false;
    let refreshInFlight = false;
    let refreshTimer: number | undefined;

    const applySession = (nextSession: Session | null) => {
      if (!isMounted) return;
      sessionRef.current = nextSession;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    };

    const clearRefreshTimer = () => {
      if (refreshTimer) {
        window.clearTimeout(refreshTimer);
        refreshTimer = undefined;
      }
    };

    const scheduleRefresh = (nextSession: Session | null) => {
      clearRefreshTimer();

      if (!nextSession?.expires_at) return;

      const refreshAt = nextSession.expires_at * 1000 - AUTH_REFRESH_BUFFER_SECONDS * 1000;
      const delay = Math.max(refreshAt - Date.now(), 60000);

      refreshTimer = window.setTimeout(() => {
        void refreshSessionSafely();
      }, delay);
    };

    const refreshSessionSafely = async () => {
      if (!isMounted || refreshInFlight) return;

      if (!acquireRefreshLock()) {
        return;
      }

      refreshInFlight = true;

      try {
        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
          if (!isRateLimitError(error)) {
            console.warn('Session refresh error:', error.message);
          }
          return;
        }

        if (data.session) {
          applySession(data.session);
          scheduleRefresh(data.session);
        }
      } catch (err) {
        console.warn('Auth refresh error:', err);
      } finally {
        refreshInFlight = false;
        releaseRefreshLock();
      }
    };

    supabase.auth.stopAutoRefresh();

    // Subscribe first, but don't mark loading false until initial getSession completes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        // Handle explicit sign out
        if (event === 'SIGNED_OUT') {
          const currentSession = sessionRef.current;
          const sessionStillUsable = currentSession?.expires_at
            ? currentSession.expires_at * 1000 > Date.now()
            : Boolean(currentSession);

          if (!explicitSignOutRef.current && sessionStillUsable) {
            scheduleRefresh(currentSession);
            if (hasInitialized) setLoading(false);
            return;
          }

          explicitSignOutRef.current = false;
          clearRefreshTimer();
          applySession(null);
          if (hasInitialized) setLoading(false);
          return;
        }

        // For token refresh: only clear session if we get an explicit null
        // AND we don't already have a valid session (prevents spurious logouts)
        if (event === 'TOKEN_REFRESHED' && !nextSession) {
          return;
        }

        // Apply the session for all other events
        if (nextSession) {
          applySession(nextSession);
          scheduleRefresh(nextSession);
        }
        
        if (hasInitialized) {
          setLoading(false);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session retrieval error:', error.message);
          if (!isRateLimitError(error)) {
            applySession(null);
          }
        } else {
          applySession(data.session ?? null);
          scheduleRefresh(data.session ?? null);
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
        if (isMounted) applySession(null);
      } finally {
        if (isMounted) {
          hasInitialized = true;
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      clearRefreshTimer();
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    gender: 'male' | 'female',
    nationality: string,
    referralCode?: string,
    dateOfBirth?: string
  ): Promise<{ error: Error | null }> => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          gender: gender,
          nationality: nationality,
          date_of_birth: dateOfBirth || null,
        },
      },
    });

    // If the backend returns success but no user object, this is typically a "repeated signup".
    // In that case, try to resend the confirmation email (works for unconfirmed accounts).
    if (!error && !data.user) {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (resendError) {
        return { error: new Error('already registered') };
      }

      return { error: null };
    }

    // If signup successful and referral code provided, update the profile
    if (!error && data.user && referralCode) {
      const normalizedCode = referralCode.trim().toUpperCase();
      // Update the user's profile with the referral code
      await supabase
        .from('profiles')
        .update({ referred_by: normalizedCode })
        .eq('user_id', data.user.id);
    }

    // Send welcome email (fire-and-forget)
    if (!error && data.user) {

      // Send welcome email
      supabase.functions.invoke('send-welcome-email', {
        body: {
          userId: data.user.id,
          email: email,
          name: fullName,
        },
      }).catch(err => console.error('Welcome email failed:', err));
    }

    // Track successful sign-up with standard Meta Pixel event
    if (!error && typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'CompleteRegistration');
    }

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // If sign-in succeeded, verify the user's profile exists (deleted users won't have one)
    if (!error && data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', data.user.id)
        .single();
      
      // If no profile exists, this user was deleted - sign them out
      if (profileError || !profile) {
        await supabase.auth.signOut();
        return { error: new Error('This account has been deleted. Please sign up again.') };
      }
      
      // Check if user is disabled (soft deleted)
      const { data: isDisabled } = await supabase.rpc('is_user_disabled', { check_user_id: data.user.id });
      if (isDisabled) {
        await supabase.auth.signOut();
        return { error: new Error('Your account has been deactivated. Please contact support.') };
      }
      
      // Also check if user is banned
      const { data: isBanned } = await supabase.rpc('is_user_banned', { check_user_id: data.user.id });
      if (isBanned) {
        await supabase.auth.signOut();
        return { error: new Error('Your account has been suspended. Please contact support.') };
      }
    }
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Use 'local' scope to only sign out this tab/browser, not all devices
    await supabase.auth.signOut({ scope: 'local' });
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const { data, error } = await supabase.functions.invoke('send-reset-email', {
        body: { email },
      });
      
      if (error) {
        return { error: error as Error };
      }
      
      if (data?.error) {
        return { error: new Error(data.error) };
      }
      
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Failed to send reset email') };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
