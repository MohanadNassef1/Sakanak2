import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Routes where the guard does NOT redirect (so users can still finish the form, log out, etc.)
const ALLOWED_PATHS = [
  '/complete-profile',
  '/auth',
  '/reset-password',
  '/terms',
  '/privacy',
  '/refund',
  '/contact',
];

export const useProfileCompletionGuard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user) return;
    if (ALLOWED_PATHS.some((p) => location.pathname.startsWith(p))) return;

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
