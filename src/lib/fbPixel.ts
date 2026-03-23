// Facebook Pixel helper – thin wrapper so we never crash if fbq isn't loaded
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
};

export const trackCustomEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
  }
};
