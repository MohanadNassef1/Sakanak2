import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LAST_UPDATED_EN = 'April 2026';
const LAST_UPDATED_AR = 'أبريل 2026';

const Privacy: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const reopenCookieBanner = () => {
    try {
      localStorage.removeItem('sakanak_cookie_consent_v1');
      window.location.reload();
    } catch {
      /* ignore */
    }
  };

  return (
    <MainLayout>
      <SEOHead
        title="Privacy Policy | Sakanak Data Protection"
        description="Sakanak privacy policy: how we collect, use, share, and protect your data, including Meta Pixel, Google Analytics, cookies, and your rights under Egyptian Personal Data Protection Law No. 151 of 2020."
        canonicalPath="/privacy"
        noindex
      />
      <div className="min-h-screen bg-background pt-8 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </h1>
            <p className="text-muted-foreground">
              {isArabic ? `آخر تحديث: ${LAST_UPDATED_AR}` : `Last updated: ${LAST_UPDATED_EN}`}
            </p>
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            {isArabic ? (
              <div className="space-y-8 text-right" dir="rtl">
                <section>
                  <p className="text-muted-foreground">
                    تشرح هذه السياسة كيف تقوم منصة "ساكنك" (sakanakeg.com) بجمع بياناتك الشخصية واستخدامها ومشاركتها وحمايتها، وحقوقك بموجب قانون حماية البيانات الشخصية المصري رقم ١٥١ لسنة ٢٠٢٠ ولوائحه التنفيذية. باستخدامك للمنصة، فإنك توافق على ما يلي.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">١. المعلومات التي نجمعها</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li><strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، الجنس، تاريخ الميلاد، الجنسية، الصورة الشخصية.</li>
                    <li><strong>بيانات الملف الشخصي:</strong> المهنة، الجامعة، نمط الحياة (التدخين، الحيوانات الأليفة)، التفضيلات، السمات الشخصية.</li>
                    <li><strong>بيانات الإعلانات والمعاينات:</strong> العقارات المعروضة، الصور، الموقع، طلبات المعاينة، الرسائل.</li>
                    <li><strong>بيانات التحقق من الهوية:</strong> صور بطاقة الرقم القومي أو جواز السفر (تُخزَّن مشفرة).</li>
                    <li><strong>بيانات تقنية:</strong> عنوان IP، نوع المتصفح والجهاز، نظام التشغيل، صفحات الزيارة، الوقت المستغرق، المُحيل (referrer).</li>
                    <li><strong>ملفات تعريف الارتباط ومعرفات التتبع:</strong> راجع القسم رقم ٤.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">٢. كيف نستخدم بياناتك</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>تشغيل المنصة وتقديم خدمات مطابقة الغرف وشركاء السكن.</li>
                    <li>التحقق من الهوية ومنع الاحتيال وضمان السلامة.</li>
                    <li>التواصل معك بشأن حسابك وطلبات المعاينة.</li>
                    <li>قياس أداء المنصة وتحسين تجربة المستخدم.</li>
                    <li>قياس فعالية حملاتنا الإعلانية على Meta (Facebook/Instagram) وإعادة استهداف الزوار.</li>
                    <li>الالتزام بالقانون المصري والاستجابة للطلبات القانونية.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">٣. الأطراف الثالثة التي نشاركها معها بياناتك</h2>
                  <p className="text-muted-foreground mb-3">
                    نحن لا نبيع بياناتك. نشاركها فقط مع مزودي الخدمات التاليين بالقدر اللازم لتشغيل المنصة:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li><strong>Supabase</strong> — قاعدة البيانات والمصادقة وتخزين الملفات.</li>
                    <li><strong>Resend</strong> — إرسال رسائل البريد الإلكتروني.</li>
                    <li><strong>Meta Platforms (Facebook/Instagram)</strong> — Meta Pixel لقياس الإعلانات وإعادة الاستهداف.</li>
                    <li><strong>Google LLC</strong> — Google Analytics لقياس الزيارات (مع إخفاء IP)، وGoogle OAuth لتسجيل الدخول.</li>
                    <li><strong>Microsoft</strong> — Microsoft Clarity لتحليل تجربة المستخدم.</li>
                    <li><strong>Lovable AI / Google Gemini</strong> — مساعد الإعلانات الذكي (بدون مشاركة بيانات الهوية).</li>
                    <li><strong>السلطات الحكومية</strong> — عند الإلزام القانوني فقط.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">٤. ملفات تعريف الارتباط (Cookies) وتقنيات التتبع</h2>
                  <p className="text-muted-foreground mb-3">نستخدم ثلاث فئات من ملفات تعريف الارتباط:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li><strong>ضرورية:</strong> لتسجيل الدخول والأمان وحفظ تفضيلات اللغة. لا تتطلب موافقة.</li>
                    <li><strong>تحليلية:</strong> Google Analytics وMicrosoft Clarity لفهم كيفية استخدام الموقع.</li>
                    <li><strong>تسويقية:</strong> Meta Pixel لقياس فعالية إعلاناتنا على فيسبوك وإنستجرام وعرض إعلانات أكثر صلة.</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    لا يتم تشغيل ملفات التتبع التحليلية أو التسويقية إلا بعد موافقتك الصريحة عبر شريط الموافقة. يمكنك تغيير اختيارك في أي وقت:
                  </p>
                  <Button onClick={reopenCookieBanner} variant="outline" size="sm" className="mt-3">
                    إدارة تفضيلات ملفات تعريف الارتباط
                  </Button>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">٥. حقوقك بموجب القانون المصري رقم ١٥١ لسنة ٢٠٢٠</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>الحق في معرفة البيانات التي نحتفظ بها عنك والوصول إليها.</li>
                    <li>الحق في تصحيح البيانات غير الدقيقة أو تحديثها.</li>
                    <li>الحق في حذف بياناتك (حق النسيان).</li>
                    <li>الحق في الاعتراض على معالجة بياناتك أو سحب موافقتك.</li>
                    <li>الحق في نقل بياناتك إلى مزود خدمة آخر.</li>
                    <li>الحق في تقديم شكوى لدى مركز حماية البيانات الشخصية المصري.</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    لممارسة أي من هذه الحقوق، راسلنا على <strong>privacy@sakanakeg.com</strong>. نرد خلال ٣٠ يوماً كحد أقصى.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">٦. مدة الاحتفاظ بالبيانات</h2>
                  <p className="text-muted-foreground">
                    نحتفظ ببيانات حسابك طالما حسابك مفعّل. عند حذف الحساب، تُحذف بياناتك الشخصية خلال ٣٠ يوماً، باستثناء ما يلزم الاحتفاظ به لأغراض قانونية أو محاسبية أو لمنع الاحتيال (حتى ٧ سنوات كحد أقصى).
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">٧. أمان البيانات</h2>
                  <p className="text-muted-foreground">
                    نستخدم التشفير أثناء النقل (HTTPS/TLS)، وتشفير قواعد البيانات، وسياسات أمان الصفوف (RSL)، والمصادقة الثنائية لفريق الإدارة. ومع ذلك لا توجد طريقة نقل عبر الإنترنت آمنة بنسبة ١٠٠٪.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">٨. النقل الدولي للبيانات</h2>
                  <p className="text-muted-foreground">
                    قد تتم معالجة بياناتك على خوادم خارج مصر (مثل خوادم Supabase في الاتحاد الأوروبي وخوادم Meta وGoogle في الولايات المتحدة). نطبّق ضمانات تعاقدية مناسبة مع هؤلاء المزودين.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">٩. خصوصية الأطفال</h2>
                  <p className="text-muted-foreground">
                    خدماتنا مخصصة لمن هم في سن ١٨ عاماً فأكثر. نحن لا نجمع بيانات عن قصد من القاصرين. إذا علمنا بذلك، سنحذف الحساب فوراً.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">١٠. التغييرات على هذه السياسة</h2>
                  <p className="text-muted-foreground">
                    قد نحدّث هذه السياسة. سنخطرك بالتغييرات الجوهرية عبر البريد الإلكتروني أو إشعار بارز على المنصة قبل ١٤ يوماً على الأقل من سريانها.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">١١. تواصل معنا</h2>
                  <p className="text-muted-foreground">
                    أسئلة الخصوصية: <strong>privacy@sakanakeg.com</strong><br />
                    الدعم العام: <strong>support@sakanakeg.com</strong><br />
                    صفحة <Link to="/contact" className="text-primary underline">اتصل بنا</Link>.
                  </p>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                <section>
                  <p className="text-muted-foreground">
                    This Policy explains how Sakanak (sakanakeg.com) collects, uses, shares, and protects your personal data, and your rights under Egyptian Personal Data Protection Law No. 151 of 2020 and its executive regulations. By using the platform, you agree to the practices described below.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li><strong>Account data:</strong> name, email, phone, gender, date of birth, nationality, profile photo.</li>
                    <li><strong>Profile data:</strong> occupation, university, lifestyle (smoking, pets), preferences, personality tags.</li>
                    <li><strong>Listings & viewings:</strong> properties listed, photos, location, viewing requests, messages.</li>
                    <li><strong>Identity verification:</strong> ID card or passport scans (stored encrypted).</li>
                    <li><strong>Technical data:</strong> IP address, browser/device, OS, pages visited, referrer, time on page.</li>
                    <li><strong>Cookies & tracking identifiers:</strong> see Section 4.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Data</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Operate the platform and provide room/roommate matching services.</li>
                    <li>Verify identities, prevent fraud, and ensure user safety.</li>
                    <li>Communicate with you about your account and viewing requests.</li>
                    <li>Measure platform performance and improve user experience.</li>
                    <li>Measure the effectiveness of our advertising campaigns on Meta (Facebook/Instagram) and retarget visitors.</li>
                    <li>Comply with Egyptian law and respond to lawful requests.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Third Parties We Share Data With</h2>
                  <p className="text-muted-foreground mb-3">
                    We do <strong>not</strong> sell your data. We share it only with the following service providers, strictly as needed to operate the platform:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li><strong>Supabase</strong> — database, authentication, file storage.</li>
                    <li><strong>Resend</strong> — transactional email delivery.</li>
                    <li><strong>Meta Platforms (Facebook/Instagram)</strong> — Meta Pixel for ad measurement and retargeting.</li>
                    <li><strong>Google LLC</strong> — Google Analytics (with IP anonymization), Google OAuth sign-in.</li>
                    <li><strong>Microsoft</strong> — Microsoft Clarity for user-experience analytics.</li>
                    <li><strong>Lovable AI / Google Gemini</strong> — AI listing assistant (no identity data shared).</li>
                    <li><strong>Government authorities</strong> — only when legally required.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Cookies & Tracking Technologies</h2>
                  <p className="text-muted-foreground mb-3">We use three categories of cookies and similar technologies:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li><strong>Strictly necessary:</strong> login, security, language preference. No consent required.</li>
                    <li><strong>Analytics:</strong> Google Analytics and Microsoft Clarity to understand how the site is used.</li>
                    <li><strong>Marketing:</strong> Meta Pixel to measure ad effectiveness on Facebook/Instagram and serve more relevant ads.</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    Analytics and marketing trackers do <strong>not</strong> load until you give explicit consent via the cookie banner. You can change your choice at any time:
                  </p>
                  <Button onClick={reopenCookieBanner} variant="outline" size="sm" className="mt-3">
                    Manage cookie preferences
                  </Button>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Your Rights Under Egyptian Law No. 151 of 2020</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>The right to know what data we hold about you and to access it.</li>
                    <li>The right to correct inaccurate or outdated data.</li>
                    <li>The right to delete your data (right to be forgotten).</li>
                    <li>The right to object to processing or withdraw your consent.</li>
                    <li>The right to data portability to another service provider.</li>
                    <li>The right to file a complaint with the Egyptian Personal Data Protection Center.</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    To exercise any of these rights, email <strong>privacy@sakanakeg.com</strong>. We respond within 30 days.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
                  <p className="text-muted-foreground">
                    We keep your account data for as long as your account is active. When you delete your account, your personal data is removed within 30 days, except where we must retain it for legal, accounting, or fraud-prevention purposes (up to a maximum of 7 years).
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
                  <p className="text-muted-foreground">
                    We use encryption in transit (HTTPS/TLS), database encryption, Row-Level Security policies, and two-factor authentication for our admin team. However, no transmission method over the internet is 100% secure.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
                  <p className="text-muted-foreground">
                    Your data may be processed on servers located outside Egypt (e.g., Supabase servers in the EU, Meta and Google servers in the US). We apply appropriate contractual safeguards with these providers.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
                  <p className="text-muted-foreground">
                    Our services are intended for users aged 18 and older. We do not knowingly collect data from minors. If we become aware of such collection, we will delete the account immediately.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this Policy. Material changes will be communicated by email or a prominent notice on the platform at least 14 days before they take effect.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
                  <p className="text-muted-foreground">
                    Privacy inquiries: <strong>privacy@sakanakeg.com</strong><br />
                    General support: <strong>support@sakanakeg.com</strong><br />
                    Or visit our <Link to="/contact" className="text-primary underline">Contact page</Link>.
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
