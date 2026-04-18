// Cookie consent management
// Loads tracking scripts (Meta Pixel, Google Analytics, Microsoft Clarity)
// only AFTER the user has granted consent. Required by Meta ad policies,
// GDPR, and Egyptian Personal Data Protection Law (No. 151 of 2020).

const CONSENT_KEY = 'sakanak_cookie_consent_v1';

export type ConsentCategories = {
  necessary: true; // always true
  analytics: boolean; // Google Analytics, Microsoft Clarity
  marketing: boolean; // Meta Pixel
};

export type ConsentState = {
  decided: boolean;
  categories: ConsentCategories;
  decidedAt: string | null;
};

const FB_PIXEL_ID = '780749774620169';
const GA_MEASUREMENT_ID = 'G-BRDN2DJD98';
const CLARITY_ID = 'vcf8804c5s';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export const getConsent = (): ConsentState => {
  if (typeof window === 'undefined') {
    return { decided: false, categories: { necessary: true, analytics: false, marketing: false }, decidedAt: null };
  }
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return { decided: false, categories: { necessary: true, analytics: false, marketing: false }, decidedAt: null };
    const parsed = JSON.parse(raw) as ConsentState;
    return parsed;
  } catch {
    return { decided: false, categories: { necessary: true, analytics: false, marketing: false }, decidedAt: null };
  }
};

export const setConsent = (categories: Omit<ConsentCategories, 'necessary'>) => {
  const state: ConsentState = {
    decided: true,
    categories: { necessary: true, ...categories },
    decidedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  applyConsent(state);
  window.dispatchEvent(new CustomEvent('sakanak:consent-changed', { detail: state }));
};

export const acceptAll = () => setConsent({ analytics: true, marketing: true });
export const rejectAll = () => setConsent({ analytics: false, marketing: false });

let pixelLoaded = false;
let gaLoaded = false;
let clarityLoaded = false;

const loadMetaPixel = () => {
  if (pixelLoaded || typeof window === 'undefined') return;
  pixelLoaded = true;
  /* eslint-disable */
  // @ts-ignore
  !function(f: any,b: any,e: any,v: any,n: any,t: any,s: any){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js', undefined, undefined, undefined);
  /* eslint-enable */
  window.fbq?.('init', FB_PIXEL_ID);
  window.fbq?.('track', 'PageView');
};

const loadGoogleAnalytics = () => {
  if (gaLoaded || typeof window === 'undefined') return;
  gaLoaded = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.gtag = function gtag(...args: any[]) { window.dataLayer!.push(args); };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
};

const loadClarity = () => {
  if (clarityLoaded || typeof window === 'undefined') return;
  clarityLoaded = true;
  /* eslint-disable */
  // @ts-ignore
  (function(c: any,l: any,a: any,r: any,i: any,t: any,y: any){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", CLARITY_ID, undefined, undefined);
  /* eslint-enable */
};

export const applyConsent = (state?: ConsentState) => {
  const s = state ?? getConsent();
  if (!s.decided) return;
  if (s.categories.marketing) loadMetaPixel();
  if (s.categories.analytics) {
    loadGoogleAnalytics();
    loadClarity();
  }
};

// Call on app boot — applies any previously-saved consent
export const initConsent = () => {
  const s = getConsent();
  if (s.decided) applyConsent(s);
};
