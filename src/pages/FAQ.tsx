import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
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
      question: '🎉 ما هو إصدار البيتا؟',
      answer: 'ساكنك حالياً في مرحلة البيتا - وهذا يعني أن جميع الخدمات مجانية تماماً! لا توجد رسوم على الحجوزات أو المعاينات. بعد انتهاء البيتا، سنفرض رسوم 5% فقط على إيجار شهر واحد (وليس كل المدة). استمتع بالخدمة المجانية الآن!',
    },
    {
      question: 'كيف يعمل ساكنك؟',
      answer: 'ساكنك هي منصة تربط أصحاب الغرف بالباحثين عن سكن في مصر. الخطوات بسيطة: 1) سجل حسابك وتحقق من هويتك، 2) تصفح الغرف المتاحة وفلتر حسب احتياجاتك، 3) احجز معاينة للغرفة التي تعجبك، 4) قابل المالك وشاهد الغرفة، 5) اتفق مباشرة مع المالك وانتقل!',
    },
    {
      question: 'كيف أحجز معاينة للغرفة؟',
      answer: 'بعد التسجيل والتحقق من حسابك: 1) افتح صفحة الغرفة التي تريدها، 2) اضغط على زر "احجز معاينة"، 3) اختر التاريخ والوقت المناسب لك، 4) اكتب رسالة قصيرة للمالك، 5) انتظر موافقة المالك. عند الموافقة، ستتمكن من التواصل مع المالك في الشات وستحصل على موقع الغرفة.',
    },
    {
      question: 'هل ساكنك مجاني للاستخدام؟',
      answer: 'نعم! في مرحلة البيتا الحالية، جميع الخدمات مجانية تماماً. بعد انتهاء البيتا، سنفرض رسوم منصة 5% فقط على إيجار شهر واحد - مهما كانت مدة الإقامة. يعني لو أجرت لسنة، الرسوم تُحسب على شهر واحد فقط!',
    },
    {
      question: 'كيف يمكنني التحقق من حسابي؟',
      answer: 'للتحقق من حسابك، انتقل إلى صفحة الملف الشخصي وارفع صورة من بطاقة الهوية الوطنية أو جواز السفر. سيقوم فريقنا بمراجعة طلبك خلال 24-48 ساعة. التحقق ضروري لحجز المعاينات والتواصل مع الملاك.',
    },
    {
      question: 'هل يمكنني إدراج غرفتي على المنصة؟',
      answer: 'نعم! يمكن لأي مستخدم موثق إدراج غرفته. فقط انقر على "أضف غرفة" في الشريط العلوي واملأ تفاصيل غرفتك مع الصور. الإعلان مجاني في البيتا!',
    },
    {
      question: 'كيف يتم التواصل مع المالك؟',
      answer: 'للحفاظ على أمان الجميع، التواصل يكون فقط من خلال نظام المعاينات. بعد أن يوافق المالك على طلب المعاينة، يُفتح شات خاص بينكم ويُشارك موقع الغرفة. لا نسمح بمشاركة أرقام الهاتف مباشرة قبل الموافقة.',
    },
    {
      question: 'ماذا يحدث بعد المعاينة؟',
      answer: 'بعد معاينة الغرفة والموافقة عليها، يتم الاتفاق مباشرة بينك وبين المالك على تفاصيل الإيجار والانتقال. في البيتا، الدفع يتم مباشرة للمالك خارج المنصة.',
    },
  ] : [
    {
      question: '🎉 What is the Beta version?',
      answer: 'Sakanak is currently in Beta - meaning all services are completely FREE! No fees on bookings or viewings. After Beta, we will charge only 5% on ONE month\'s rent (not the entire duration). Enjoy the free service now!',
    },
    {
      question: 'How does Sakanak work?',
      answer: 'Sakanak connects room owners with seekers in Egypt. Simple steps: 1) Register and verify your identity, 2) Browse rooms and filter by your needs, 3) Book a viewing for rooms you like, 4) Meet the owner and see the room, 5) Agree directly with the owner and move in!',
    },
    {
      question: 'How do I book a room viewing?',
      answer: 'After registering and verifying your account: 1) Open the room page you want, 2) Click "Book a Viewing", 3) Choose a date and time that works for you, 4) Write a short message to the owner, 5) Wait for owner approval. Once approved, you can chat with the owner and get the room location.',
    },
    {
      question: 'Is Sakanak free to use?',
      answer: 'Yes! During the current Beta phase, all services are completely free. After Beta, we will charge only 5% on ONE month\'s rent - regardless of stay duration. So if you rent for a year, the fee is calculated on just one month!',
    },
    {
      question: 'How can I verify my account?',
      answer: 'To verify your account, go to your Profile page and upload a photo of your National ID or Passport. Our team will review within 24-48 hours. Verification is required to book viewings and contact owners.',
    },
    {
      question: 'Can I list my room on the platform?',
      answer: 'Yes! Any verified user can list their room. Just click on "List a Room" in the navigation and fill in your room details with photos. Listing is free during Beta!',
    },
    {
      question: 'How do I contact the owner?',
      answer: 'For everyone\'s safety, communication is only through the viewing system. After the owner approves your viewing request, a private chat opens between you and the room location is shared. We don\'t allow direct phone sharing before approval.',
    },
    {
      question: 'What happens after the viewing?',
      answer: 'After viewing and liking the room, you agree directly with the owner on rental details and move-in. During Beta, payment is made directly to the owner outside the platform.',
    },
  ];

  return (
    <MainLayout>
       <SEOHead
         title="Frequently Asked Questions | Sakanak Help Center"
         description="Get answers about renting rooms and finding roommates in Egypt with Sakanak. أسئلة شائعة عن إيجار الغرف والسكن المشترك."
         keywords="Sakanak FAQ, room rental questions Egypt, أسئلة شائعة سكنك"
         canonicalPath="/faq"
         noindex
       />
       <div className="min-h-screen bg-background pt-8 pb-12">
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
