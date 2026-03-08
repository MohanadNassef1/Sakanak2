import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
  alternateAr?: string;
  alternateEn?: string;
}

const SITE_URL = 'https://sakanakeg.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalPath,
  ogImage,
  noindex = false,
  jsonLd,
  alternateAr,
  alternateEn,
}) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    if (keywords) setMeta('name', 'keywords', keywords);

    if (noindex) {
      setMeta('name', 'robots', 'noindex, follow');
    } else {
      setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1');
    }

    // Open Graph
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', ogImage || DEFAULT_OG_IMAGE);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'Sakanak - سكنك');
    setMeta('property', 'og:locale', 'en_US');
    setMeta('property', 'og:locale:alternate', 'ar_EG');

    const canonicalUrl = canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL;
    setMeta('property', 'og:url', canonicalUrl);

    // Twitter
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage || DEFAULT_OG_IMAGE);
    setMeta('name', 'twitter:card', 'summary_large_image');

    // Canonical link
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);

    // Hreflang alternate links
    const setAlternateLink = (hreflang: string, href: string) => {
      const selector = `link[rel="alternate"][hreflang="${hreflang}"]`;
      let el = document.querySelector(selector) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'alternate');
        el.setAttribute('hreflang', hreflang);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    if (alternateAr) setAlternateLink('ar', `${SITE_URL}${alternateAr}`);
    if (alternateEn) setAlternateLink('en', `${SITE_URL}${alternateEn}`);
    // x-default points to canonical
    setAlternateLink('x-default', canonicalUrl);

    // JSON-LD structured data
    const existingJsonLd = document.querySelector('script[data-seo-jsonld]');
    if (existingJsonLd) existingJsonLd.remove();

    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      const ldArray = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      script.textContent = JSON.stringify(ldArray.length === 1 ? ldArray[0] : ldArray);
      document.head.appendChild(script);
    }

    return () => {
      const linkEl = document.querySelector('link[rel="canonical"]');
      if (linkEl) linkEl.remove();
      const robotsEl = document.querySelector('meta[name="robots"]');
      if (robotsEl) robotsEl.remove();
      const jsonLdEl = document.querySelector('script[data-seo-jsonld]');
      if (jsonLdEl) jsonLdEl.remove();
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    };
  }, [title, description, keywords, canonicalPath, ogImage, noindex, jsonLd, alternateAr, alternateEn]);

  return null;
};

export default SEOHead;
