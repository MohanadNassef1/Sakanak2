import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Lock } from 'lucide-react';

const Privacy: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <MainLayout>
       <SEOHead
         title="Privacy Policy | Sakanak Data Protection"
         description="Sakanak privacy policy. Learn how we protect your data while helping you find rooms and roommates in Egypt. سياسة خصوصية سكنك."
         canonicalPath="/privacy"
         noindex
       />
       <div className="min-h-screen bg-background pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-14 animate-fade-in">
            <div className="page-header-icon mx-auto">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </h1>
            <p className="text-muted-foreground">
              {isArabic ? 'آخر تحديث: يناير 2024' : 'Last updated: January 2024'}
            </p>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto mt-6" />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            {isArabic ? (
              <div className="space-y-8 text-right">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. المعلومات التي نجمعها</h2>
                  <p className="text-muted-foreground">
                    نجمع المعلومات التي تقدمها مباشرة عند التسجيل، بما في ذلك الاسم والبريد الإلكتروني ورقم الهاتف والجنس. كما نجمع بيانات التحقق من الهوية عند طلب التوثيق.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. كيف نستخدم معلوماتك</h2>
                  <p className="text-muted-foreground mb-4">نستخدم المعلومات التي نجمعها من أجل:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>تقديم وتحسين خدماتنا</li>
                    <li>التحقق من هوية المستخدمين</li>
                    <li>معالجة المعاملات والمدفوعات</li>
                    <li>التواصل معك بشأن حسابك</li>
                    <li>إرسال إشعارات مهمة عن الخدمة</li>
                    <li>منع الاحتيال وضمان أمان المنصة</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. مشاركة المعلومات</h2>
                  <p className="text-muted-foreground">
                    لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلومات محدودة مع مزودي خدمات الدفع لإتمام المعاملات.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. أمان البيانات</h2>
                  <p className="text-muted-foreground">
                    نستخدم تقنيات أمان متقدمة لحماية بياناتك، بما في ذلك التشفير وجدران الحماية. ومع ذلك، لا يمكن ضمان أمان الإنترنت بنسبة 100%.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. حقوقك</h2>
                  <p className="text-muted-foreground mb-4">لديك الحق في:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>الوصول إلى بياناتك الشخصية</li>
                    <li>تصحيح البيانات غير الدقيقة</li>
                    <li>طلب حذف حسابك</li>
                    <li>الاعتراض على معالجة بياناتك</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. ملفات تعريف الارتباط</h2>
                  <p className="text-muted-foreground">
                    نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة. يمكنك تعطيلها من إعدادات متصفحك، لكن قد يؤثر ذلك على بعض الوظائف.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. التغييرات على السياسة</h2>
                  <p className="text-muted-foreground">
                    قد نقوم بتحديث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على المنصة.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. التواصل</h2>
                  <p className="text-muted-foreground">
                    لأي استفسارات تتعلق بالخصوصية، يرجى التواصل معنا على privacy@sakanak.com
                  </p>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                  <p className="text-muted-foreground">
                    We collect information you provide directly when registering, including name, email, phone number, and gender. We also collect identity verification data when you request verification.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                  <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Provide and improve our services</li>
                    <li>Verify user identities</li>
                    <li>Process transactions and payments</li>
                    <li>Communicate with you about your account</li>
                    <li>Send important service notifications</li>
                    <li>Prevent fraud and ensure platform security</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                  <p className="text-muted-foreground">
                    We do not sell or rent your personal information to third parties. We may share limited information with payment service providers to complete transactions.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                  <p className="text-muted-foreground">
                    We use advanced security technologies to protect your data, including encryption and firewalls. However, no internet security can be guaranteed 100%.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                  <p className="text-muted-foreground mb-4">You have the right to:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your account</li>
                    <li>Object to processing of your data</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
                  <p className="text-muted-foreground">
                    We use cookies to improve your experience on the platform. You can disable them in your browser settings, but this may affect some functionality.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Policy Changes</h2>
                  <p className="text-muted-foreground">
                    We may update this policy from time to time. We will notify you of any material changes via email or a notice on the platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
                  <p className="text-muted-foreground">
                    For any privacy-related inquiries, please contact us at privacy@sakanak.com
                  </p>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Privacy;
