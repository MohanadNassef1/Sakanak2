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
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading || !user || checked) return;
    // Don't redirect if already on complete-profile or auth pages
    if (location.pathname === '/complete-profile' || location.pathname === '/auth' || location.pathname === '/reset-password') {
      setChecked(true);
      return;
    }

    const checkProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, gender, phone')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile || !profile.gender || !profile.phone) {
        navigate('/complete-profile', { replace: true });
      }
      setChecked(true);
    };

    checkProfile();
  }, [user, loading, checked, location.pathname, navigate]);
};
