import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const FAQ: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const faqs = isArabic ? [
    {
      question: 'كيف يعمل ساكنك؟',
      answer: 'ساكنك هي منصة تربط أصحاب الغرف بالباحثين عن سكن في مصر. يمكنك تصفح الغرف المتاحة، والتواصل مع الملاك، وحجز غرفتك بأمان من خلال نظام الدفع الخاص بنا.',
    },
    {
      question: 'هل ساكنك مجاني للاستخدام؟',
      answer: 'التسجيل وتصفح الغرف مجاني تماماً. نحن نأخذ رسوم منصة 5% فقط عند إتمام الحجز بنجاح لتغطية تكاليف التشغيل وضمان أمان المعاملات.',
    },
    {
      question: 'كيف يمكنني التحقق من حسابي؟',
      answer: 'للتحقق من حسابك، انتقل إلى صفحة الملف الشخصي وارفع صورة من بطاقة الهوية الوطنية أو جواز السفر. سيقوم فريقنا بمراجعة طلبك خلال 24-48 ساعة.',
    },
    {
      question: 'هل يمكنني إدراج غرفتي على المنصة؟',
      answer: 'نعم! يمكن لأي مستخدم موثق إدراج غرفته. فقط انقر على "أضف غرفة" في الشريط العلوي واملأ تفاصيل غرفتك مع الصور.',
    },
    {
      question: 'كيف يعمل نظام الدفع؟',
      answer: 'عند حجز غرفة، يدفع الباحث إيجار الشهر الأول + مبلغ التأمين. نحتفظ بالمبلغ حتى يؤكد الباحث استلام الغرفة، ثم نحول المبلغ للمالك عبر طريقة الدفع المختارة.',
    },
    {
      question: 'ماذا يحدث إذا لم تكن الغرفة كما هو موضح؟',
      answer: 'إذا وجدت أن الغرفة تختلف بشكل كبير عما هو معلن، يمكنك التواصل مع فريق الدعم خلال 24 ساعة من الوصول وسنساعدك في حل المشكلة أو استرداد المبلغ.',
    },
    {
      question: 'كيف يمكنني التواصل مع صاحب الغرفة؟',
      answer: 'بعد تسجيل الدخول والتحقق من حسابك، يمكنك استخدام نظام الرسائل الداخلي للتواصل مع أصحاب الغرف. لا نسمح بمشاركة أرقام الهاتف مباشرة لحماية خصوصية المستخدمين.',
    },
    {
      question: 'هل يمكنني إلغاء حجزي؟',
      answer: 'نعم، يمكنك إلغاء حجزك قبل 48 ساعة من موعد تسجيل الوصول واسترداد المبلغ بالكامل. للإلغاء بعد ذلك، يرجى مراجعة سياسة الاسترداد الخاصة بنا.',
    },
  ] : [
    {
      question: 'How does Sakanak work?',
      answer: 'Sakanak is a platform that connects room owners with seekers looking for accommodation in Egypt. You can browse available rooms, message owners, and book your room securely through our payment system.',
    },
    {
      question: 'Is Sakanak free to use?',
      answer: 'Registration and browsing rooms is completely free. We only charge a 5% platform fee when a booking is successfully completed to cover operational costs and ensure transaction security.',
    },
    {
      question: 'How can I verify my account?',
      answer: 'To verify your account, go to your Profile page and upload a photo of your National ID or Passport. Our team will review your request within 24-48 hours.',
    },
    {
      question: 'Can I list my room on the platform?',
      answer: 'Yes! Any verified user can list their room. Just click on "List a Room" in the navigation bar and fill in your room details with photos.',
    },
    {
      question: 'How does the payment system work?',
      answer: "When booking a room, the seeker pays the first month's rent + insurance deposit. We hold the amount until the seeker confirms they received the room, then we transfer to the owner via their chosen payment method.",
    },
    {
      question: 'What if the room is not as described?',
      answer: 'If you find that the room differs significantly from what was advertised, you can contact our support team within 24 hours of arrival and we will help resolve the issue or process a refund.',
    },
    {
      question: 'How can I contact a room owner?',
      answer: 'After signing in and verifying your account, you can use the internal messaging system to contact room owners. We do not allow direct phone number sharing to protect user privacy.',
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking up to 48 hours before check-in and receive a full refund. For cancellations after that, please refer to our refund policy.',
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {isArabic ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {isArabic 
                ? 'إجابات على الأسئلة الأكثر شيوعاً حول استخدام منصة ساكنك'
                : 'Answers to the most common questions about using Sakanak platform'}
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border rounded-xl px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Contact CTA */}
          <div className="mt-12 text-center bg-primary/5 rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-2">
              {isArabic ? 'لم تجد إجابة لسؤالك؟' : "Didn't find your answer?"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isArabic 
                ? 'تواصل معنا وسنرد عليك في أقرب وقت ممكن'
                : "Contact us and we'll get back to you as soon as possible"}
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
            >
              {isArabic ? 'تواصل معنا' : 'Contact Us'}
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FAQ;
