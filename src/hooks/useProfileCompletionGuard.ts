import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook that redirects OAuth users to /complete-profile if their profile is missing or incomplete.
 * Should be used once at the app root level inside BrowserRouter.
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
    // Skip if we already checked this specific user
    if (checkedUserId === user.id) return;

    const checkProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, gender, phone')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!profile || !profile.gender || !profile.phone) {
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
