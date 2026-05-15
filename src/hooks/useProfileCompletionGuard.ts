import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Routes where the guard does NOT redirect
const ALLOWED_PATHS = [
  '/complete-profile',
  '/auth',
  '/reset-password',
  '/terms',
  '/privacy',
  '/refund',
  '/contact',
];

const isGoogleUser = (user: any): boolean => {
  if (!user) return false;
  if (user.app_metadata?.provider === 'google') return true;
  const providers: string[] = user.app_metadata?.providers || [];
  if (providers.includes('google')) return true;
  const identities: any[] = user.identities || [];
  return identities.some((i) => i?.provider === 'google');
};

export const useProfileCompletionGuard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user) return;
    if (ALLOWED_PATHS.some((p) => location.pathname.startsWith(p))) return;

    // Enforce for ALL Google signups with incomplete profiles (no date cutoff).
    // Email signups collect this data on the signup form, so they're never affected.
    if (!isGoogleUser(user)) return;

    let cancelled = false;
    (async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('gender, phone, date_of_birth, nationality, occupation_status, university, faculty, job_title, interested_area_1')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cancelled) return;

      const incomplete =
        !profile ||
        !profile.gender ||
        !profile.phone ||
        !profile.date_of_birth ||
        !profile.nationality ||
        !profile.occupation_status ||
        !profile.interested_area_1 ||
        (profile.occupation_status === 'student' && (!profile.university || !profile.faculty)) ||
        (profile.occupation_status === 'working' && !profile.job_title);

      if (incomplete) {
        navigate('/complete-profile', { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading, location.pathname, navigate]);
};
