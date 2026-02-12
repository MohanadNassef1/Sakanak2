import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  noindex?: boolean;
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
}) => {
  useEffect(() => {
    // Title
    document.title = title;

    // Helper to set or create a meta tag
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

    // Robots meta tag
    if (noindex) {
      setMeta('name', 'robots', 'noindex, follow');
    } else {
      setMeta('name', 'robots', 'index, follow');
    }

    // Open Graph
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', ogImage || DEFAULT_OG_IMAGE);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'Sakanak - سكنك');

    // Always set canonical URL
    const canonicalUrl = canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL;
    setMeta('property', 'og:url', canonicalUrl);

    // Twitter
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage || DEFAULT_OG_IMAGE);
    setMeta('name', 'twitter:card', 'summary_large_image');

    // Canonical link - always set
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);

    return () => {
      // Cleanup canonical on unmount
      const linkEl = document.querySelector('link[rel="canonical"]');
      if (linkEl) linkEl.remove();
      // Cleanup robots on unmount
      const robotsEl = document.querySelector('meta[name="robots"]');
      if (robotsEl) robotsEl.remove();
    };
  }, [title, description, keywords, canonicalPath, ogImage, noindex]);

  return null;
};

export default SEOHead;
