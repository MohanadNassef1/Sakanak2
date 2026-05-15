import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook that redirects OAuth users to /complete-profile if their profile is missing or incomplete.
 * For OAuth users (Google, Apple), this enforces profile completion on ALL routes.
 * For email users, it only enforces on protected routes.
 */
export const useProfileCompletionGuard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    // Don't redirect if already on allowed pages
    if (location.pathname === '/complete-profile' || location.pathname === '/auth' || location.pathname === '/reset-password') {
      return;
    }

    // Detect if user signed in via OAuth (Google, Apple, etc.)
    const provider = user.app_metadata?.provider;
    const isOAuthUser = provider && provider !== 'email';

    // For non-OAuth users, only enforce on protected routes
    if (!isOAuthUser) {
      const publicPaths = [
        '/', '/rooms', '/faq', '/contact', '/safety-tips', '/terms', '/privacy',
        '/refund', '/install', '/blog',
      ];
      const isPublicPath = publicPaths.includes(location.pathname)
        || location.pathname.startsWith('/rooms/')
        || location.pathname.startsWith('/rooms-')
        || location.pathname.startsWith('/roommates-')
        || location.pathname.startsWith('/student-housing-')
        || location.pathname.startsWith('/blog/');
      if (isPublicPath) return;
    }

    // Skip if we already checked this specific user
    if (checkedUserId === user.id) return;

    const checkProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, gender, phone, occupation_status, university, faculty, job_title')
          .eq('user_id', user.id)
          .maybeSingle();

        const incomplete =
          !profile ||
          !profile.gender ||
          !profile.phone ||
          !profile.occupation_status ||
          (profile.occupation_status === 'student' && (!profile.university || !profile.faculty)) ||
          (profile.occupation_status === 'working' && !profile.job_title);

        if (incomplete) {
          navigate('/complete-profile', { replace: true });
        }
      } catch (err) {
        console.error('Profile completion guard error:', err);
      }
      setCheckedUserId(user.id);
    };

    checkProfile();
  }, [user, loading, checkedUserId, location.pathname, navigate]);
};
