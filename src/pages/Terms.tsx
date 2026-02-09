import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import { FileText } from 'lucide-react';

const Terms: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <MainLayout>
       <div className="min-h-screen bg-background pt-8 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {isArabic ? 'الشروط والأحكام' : 'Terms & Conditions'}
            </h1>
            <p className="text-muted-foreground">
              {isArabic ? 'آخر تحديث: يناير 2024' : 'Last updated: January 2024'}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            {isArabic ? (
              <div className="space-y-8 text-right">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. القبول بالشروط</h2>
                  <p className="text-muted-foreground">
                    باستخدامك لمنصة ساكنك، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام خدماتنا.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. الأهلية</h2>
                  <p className="text-muted-foreground">
                    يجب أن يكون عمرك 18 عاماً أو أكثر لاستخدام خدماتنا. باستخدامك للمنصة، فإنك تؤكد أنك تستوفي هذا الشرط.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. حسابات المستخدمين</h2>
                  <p className="text-muted-foreground">
                    أنت مسؤول عن الحفاظ على سرية بيانات حسابك وكلمة المرور. يجب إخطارنا فوراً بأي استخدام غير مصرح به لحسابك.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. الإعلانات والمحتوى</h2>
                  <p className="text-muted-foreground">
                    المستخدمون مسؤولون عن دقة المعلومات في إعلاناتهم. نحتفظ بالحق في إزالة أي محتوى ينتهك سياساتنا أو القانون المصري.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. الرسوم والدفع (البيتا)</h2>
                  <p className="text-muted-foreground">
                    ساكنك حالياً في مرحلة البيتا وجميع الخدمات مجانية. بعد انتهاء البيتا، ستفرض ساكنك رسوم منصة بنسبة 5% على إيجار شهر واحد فقط (وليس كامل مدة الإقامة). تخضع جميع الرسوم للتغيير مع إشعار مسبق.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. نظام المعاينات</h2>
                  <p className="text-muted-foreground">
                    يتم التواصل بين الباحثين والملاك حصرياً من خلال نظام حجز المعاينات. لا يُسمح بمشاركة أرقام الهواتف أو وسائل التواصل الخارجية قبل الموافقة على طلب المعاينة. يُشارك موقع الغرفة فقط بعد تأكيد المعاينة.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. إنهاء الخدمة</h2>
                  <p className="text-muted-foreground">
                    نحتفظ بالحق في تعليق أو إنهاء حسابك في حالة انتهاك هذه الشروط أو الاشتباه في نشاط احتيالي.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. القانون الحاكم</h2>
                  <p className="text-muted-foreground">
                    تخضع هذه الشروط للقانون المصري. أي نزاع ينشأ سيتم تسويته في المحاكم المصرية المختصة.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. التواصل</h2>
                  <p className="text-muted-foreground">
                    لأي استفسارات حول هذه الشروط، يرجى التواصل معنا على support@sakanak.com
                  </p>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground">
                    By using the Sakanak platform, you agree to be bound by these Terms and Conditions. If you do not agree to any part of these terms, please do not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
                  <p className="text-muted-foreground">
                    You must be 18 years or older to use our services. By using the platform, you confirm that you meet this requirement.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                  <p className="text-muted-foreground">
                    You are responsible for maintaining the confidentiality of your account information and password. You must notify us immediately of any unauthorized use of your account.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Listings and Content</h2>
                  <p className="text-muted-foreground">
                    Users are responsible for the accuracy of information in their listings. We reserve the right to remove any content that violates our policies or Egyptian law.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Fees and Payment (Beta)</h2>
                  <p className="text-muted-foreground">
                    Sakanak is currently in Beta and all services are free. After Beta ends, Sakanak will charge a 5% platform fee on ONE month's rent only (not the entire stay duration). All fees are subject to change with prior notice.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Viewing System</h2>
                  <p className="text-muted-foreground">
                    Communication between seekers and owners is exclusively through the viewing booking system. Sharing phone numbers or external contact methods is not allowed before viewing approval. Room location is only shared after viewing confirmation.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
                  <p className="text-muted-foreground">
                    We reserve the right to suspend or terminate your account in case of violation of these terms or suspicion of fraudulent activity.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
                  <p className="text-muted-foreground">
                    These terms are governed by Egyptian law. Any dispute that arises will be settled in the competent Egyptian courts.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
                  <p className="text-muted-foreground">
                    For any inquiries about these terms, please contact us at support@sakanak.com
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

export default Terms;
