import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, gender: 'male' | 'female', nationality: string, referralCode?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    gender: 'male' | 'female',
    nationality: string,
    referralCode?: string
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

    // Notify admin of new user signup (fire-and-forget)
    if (!error && data.user) {
      supabase.functions.invoke('notify-admin', {
        body: {
          type: 'new_user',
          user_name: fullName,
          user_email: email,
        },
      }).catch(err => console.error('Admin notification failed:', err));
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
    await supabase.auth.signOut();
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
