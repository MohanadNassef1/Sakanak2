import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import { BLOG_ARTICLES } from '@/lib/blogData';
import { getOrganizationSchema, SITE_URL } from '@/lib/seoData';
import { Clock, ArrowRight, ArrowLeft, BookOpen, GraduationCap, MapPin, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const categoryIcons = {
  guides: BookOpen,
  tips: Lightbulb,
  city: MapPin,
  students: GraduationCap,
};

const categoryLabels = {
  guides: { en: 'Guides', ar: 'أدلة' },
  tips: { en: 'Tips', ar: 'نصائح' },
  city: { en: 'City Guide', ar: 'دليل المدينة' },
  students: { en: 'Students', ar: 'طلاب' },
};

const BlogContent: React.FC = () => {
  const { isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: isRTL ? 'مدونة سكنك' : 'Sakanak Blog',
    description: isRTL
      ? 'نصائح وأدلة للإيجار والبحث عن شريك سكن في مصر'
      : 'Tips and guides for renting and finding roommates in Egypt',
    url: `${SITE_URL}/blog`,
    publisher: getOrganizationSchema(),
  };

  return (
    <MainLayout>
      <SEOHead
        title={isRTL ? 'مدونة سكنك | نصائح الإيجار والسكن في مصر' : 'Sakanak Blog | Renting & Housing Tips in Egypt'}
        description={isRTL
          ? 'نصائح وأدلة شاملة للإيجار، البحث عن شريك سكن، وسكن الطلاب في القاهرة، الاسكندرية، المنصورة ومصر.'
          : 'Tips and guides for renting rooms, finding roommates, and student housing in Cairo, Alexandria, Mansoura and Egypt.'}
        keywords="rent Egypt blog, نصائح إيجار مصر, roommate guide, دليل شريك سكن, student housing tips, سكن طلاب نصائح, renting Cairo, إيجار القاهرة"
        canonicalPath="/blog"
        jsonLd={jsonLd}
      />

      <section className="pt-24 pb-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {isRTL ? 'مدونة سكنك' : 'Sakanak Blog'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isRTL
                ? 'نصائح وأدلة للإيجار والبحث عن شريك سكن في مصر'
                : 'Tips and guides for renting and finding roommates in Egypt'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {BLOG_ARTICLES.map(article => {
              const Icon = categoryIcons[article.category];
              const catLabel = categoryLabels[article.category];
              return (
                <Link
                  key={article.slug}
                  to={`/blog/${article.slug}`}
                  className="group rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Icon className="w-3 h-3 mr-1" />
                        {isRTL ? catLabel.ar : catLabel.en}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTimeMin} {isRTL ? 'دقائق' : 'min'}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {isRTL ? article.titleAr : article.titleEn}
                    </h2>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {isRTL ? article.excerptAr : article.excerptEn}
                    </p>

                    <div className="flex items-center gap-1 text-primary text-sm font-medium">
                      {isRTL ? 'اقرأ المزيد' : 'Read more'}
                      <Arrow className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

const Blog: React.FC = () => (
  <LanguageProvider>
    <BlogContent />
  </LanguageProvider>
);

export default Blog;
