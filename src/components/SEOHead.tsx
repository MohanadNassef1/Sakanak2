import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
}

const SITE_URL = 'https://sakanakeg.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalPath,
  ogImage,
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

    // Open Graph
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', ogImage || DEFAULT_OG_IMAGE);
    setMeta('property', 'og:type', 'website');
    if (canonicalPath) {
      setMeta('property', 'og:url', `${SITE_URL}${canonicalPath}`);
    }

    // Twitter
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage || DEFAULT_OG_IMAGE);

    // Canonical link
    if (canonicalPath) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', `${SITE_URL}${canonicalPath}`);
    }

    return () => {
      // Cleanup canonical on unmount
      const link = document.querySelector('link[rel="canonical"]');
      if (link) link.remove();
    };
  }, [title, description, keywords, canonicalPath, ogImage]);

  return null;
};

export default SEOHead;
