import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import { BLOG_ARTICLES } from '@/lib/blogData';
import { SITE_URL, getOrganizationSchema } from '@/lib/seoData';
import { ArrowLeft, ArrowRight, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

const BlogArticleContent: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();

  const article = useMemo(() => BLOG_ARTICLES.find(a => a.slug === slug), [slug]);

  if (!article) {
    navigate('/blog', { replace: true });
    return null;
  }

  const title = isRTL ? article.titleAr : article.titleEn;
  const content = isRTL ? article.contentAr : article.contentEn;
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.titleEn,
    alternativeHeadline: article.titleAr,
    description: article.excerptEn,
    url: `${SITE_URL}/blog/${article.slug}`,
    datePublished: article.publishedAt,
    author: getOrganizationSchema(),
    publisher: getOrganizationSchema(),
    inLanguage: ['en', 'ar'],
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${article.slug}` },
  };

  return (
    <MainLayout>
      <SEOHead
        title={`${title} - Sakanak`}
        description={isRTL ? article.excerptAr : article.excerptEn}
        keywords={article.keywords}
        canonicalPath={`/blog/${article.slug}`}
        jsonLd={jsonLd}
      />

      <article className="pt-24 pb-16">
        <div className="container mx-auto px-3 sm:px-4 max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <BackArrow className="w-4 h-4" />
            {isRTL ? 'العودة للمدونة' : 'Back to Blog'}
          </Link>

          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
              {title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.publishedAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.readTimeMin} {isRTL ? 'دقائق قراءة' : 'min read'}
              </span>
            </div>
          </header>

          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
            <h2 className="text-xl font-bold text-foreground mb-3">
              {isRTL ? 'ابدأ دلوقتي على سكنك' : 'Get Started on Sakanak'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isRTL
                ? 'سجل مجاناً وابدأ تصفح الغرف وشركاء السكن الموثقين.'
                : 'Sign up for free and start browsing verified rooms and roommates.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="rounded-full" onClick={() => navigate('/rooms')}>
                {isRTL ? 'تصفح الغرف' : 'Browse Rooms'}
              </Button>
              <Button size="lg" variant="outline" className="rounded-full" onClick={() => navigate('/auth')}>
                {isRTL ? 'سجل مجاناً' : 'Sign Up Free'}
              </Button>
            </div>
          </div>

          {/* Related articles */}
          <div className="mt-12">
            <h3 className="text-lg font-bold text-foreground mb-4">
              {isRTL ? 'مقالات مشابهة' : 'Related Articles'}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {BLOG_ARTICLES.filter(a => a.slug !== article.slug).slice(0, 2).map(related => (
                <Link
                  key={related.slug}
                  to={`/blog/${related.slug}`}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
                >
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                    {isRTL ? related.titleAr : related.titleEn}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {isRTL ? related.excerptAr : related.excerptEn}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </MainLayout>
  );
};

const BlogArticle: React.FC = () => <BlogArticleContent />;

export default BlogArticle;
