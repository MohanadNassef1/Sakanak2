import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Fires fbq('track', 'PageView') on every SPA route change
 * so the Meta Pixel registers navigation within the React app.
 */
export const usePageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname]);
};
