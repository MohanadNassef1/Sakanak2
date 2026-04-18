import React from 'react';
import SEOLandingTemplate from '@/components/seo/SEOLandingTemplate';

const StudentHousingEgypt: React.FC = () => (
  <SEOLandingTemplate
    slug="student-housing-egypt"
    browseHref="/rooms?student=true"
    title={{
      en: 'Student Housing Egypt — Safe Accommodation for Students in Cairo',
      ar: 'سكن طلاب في مصر — سكن آمن للطلاب في القاهرة والإسكندرية',
    }}
    h1={{
      en: 'Student Housing in Egypt — Safe Accommodation Near Universities',
      ar: 'سكن طلاب في مصر — سكن آمن قريب من الجامعات',
    }}
    description={{
      en: 'Find safe student accommodation in Egypt: rooms, shared apartments, and roommates near AUC, Cairo Uni, GUC, Alex Uni and more. Verified, no brokers — Sakanak.',
      ar: 'سكن طلاب في مصر — سكن آمن للمغتربات والطلاب قريب من AUC وجامعة القاهرة و GUC وجامعة الإسكندرية. موثق، بدون سماسرة. سكنك.',
    }}
    keywords="Student housing Cairo, سكن طلاب, Safe student accommodation, سكن آمن للمغتربات, Student housing Egypt, Female roommate Egypt, روميت بنات فقط, Shared apartments Egypt, شقق شيرنج, Cheap shared housing Egypt, سكن مشترك رخيص, Sakanak, سكنك"
    intro={{
      en: 'Sakanak helps Egyptian and international students find verified, safe student housing across Egypt — close to universities, with smart roommate matching and zero broker fees.',
      ar: 'سكنك بيساعد الطلاب المصريين والمغتربين علشان يلاقوا سكن طلاب موثق وآمن في مصر — قريب من الجامعات، مع نظام مطابقة ذكي للروميت ومفيش رسوم سماسرة.',
    }}
    body={{
      en: [
        'Moving to Egypt for university? Sakanak (سكنك) is the trusted student housing platform connecting students with verified hosts and roommates in Cairo, Giza, Alexandria, Mansoura and other university cities. Every host completes ID verification, and many of our listings are tagged specifically as student housing.',
        'Find safe student accommodation close to all major Egyptian universities: AUC (American University in Cairo), GUC (German University in Cairo), Cairo University, Ain Shams, Helwan, Alexandria University, Mansoura University, and more. Browse furnished rooms for rent, shared apartments (شقق شيرنج), and entire flats by neighbourhood, budget, and preferred gender — including girls-only housing and boys-only housing options.',
        'Looking for a study buddy or roommate who matches your lifestyle? Our smart matching algorithm scores every listing based on your personality, study schedule, smoking and pet preferences, and even nationality if you’re an expat or international student looking for safe student accommodation in Egypt.',
        'Sakanak is 100% free during Beta. No brokers, no commission, no scams. You browse, message a host directly through our protected chat, book a viewing, see the place in person, and only then share contact details. It’s the safest way to find student housing in Egypt.',
      ],
      ar: [
        'جاي مصر علشان الجامعة؟ سكنك هو منصة سكن الطلاب الموثوقة اللي بتربط الطلاب بأصحاب إعلانات وروميت موثقين في القاهرة والجيزة والإسكندرية والمنصورة وباقي مدن الجامعات. كل صاحب إعلان لازم يوثق هويته، وكتير من إعلاناتنا متصنفة كـ سكن طلاب.',
        'هتلاقي سكن آمن للمغتربات والطلاب قريب من كل الجامعات الكبيرة: AUC و GUC وجامعة القاهرة وعين شمس وحلوان وجامعة الإسكندرية والمنصورة. اتصفح غرف مفروشة للإيجار وشقق شيرنج وشقق كاملة بالمنطقة والميزانية والنوع — بما في ذلك سكن بنات وسكن شباب.',
        'بتدور على شريك ذاكرة أو روميت يشبه أسلوب حياتك؟ نظام المطابقة الذكي بتاعنا بيقيم كل إعلان حسب شخصيتك، جدول مذاكرتك، التدخين، الحيوانات، وحتى الجنسية لو إنت مغترب أو طالب دولي بيدور على سكن آمن في مصر.',
        'سكنك مجاني 100% في البيتا. مفيش سماسرة، مفيش عمولة، مفيش نصب. بتتصفح، تكلم صاحب الإعلان مباشرة من الشات المحمي، تحجز معاينة، تشوف المكان شخصياً، وبعدين بس تتبادلوا أرقام التليفونات. ده أأمن طريق علشان تلاقي سكن طلاب في مصر.',
      ],
    }}
    faqs={{
      en: [
        { q: 'Is student housing on Sakanak verified?', a: 'Yes. Every host uploads government ID and is reviewed by our team within 24–48 hours. Many students also verify with their university .edu email for an extra trusted badge.' },
        { q: 'Can international/expat students use Sakanak?', a: 'Absolutely. Sakanak supports both English and Arabic, and we have many listings near AUC, GUC, and other international universities specifically welcoming expat and exchange students.' },
        { q: 'How do I find girls-only student housing?', a: 'Use the gender filter on the browse page and select “Females only”. You can also visit our dedicated /female-roommates-egypt page for safe student accommodation just for women.' },
        { q: 'Is there cheap shared housing for students?', a: 'Yes. Use the budget filter to set your maximum monthly price. We have shared room options starting at very affordable price points across Cairo, Giza, Alexandria, and Mansoura.' },
        { q: 'Do I need to pay any fees?', a: 'No — Sakanak is 100% free during Beta. After Beta a small 5% one-time fee applies to a single month’s rent. There are never any broker fees on Sakanak.' },
      ],
      ar: [
        { q: 'هل سكن الطلاب على سكنك موثق؟', a: 'أيوه. كل صاحب إعلان برفع بطاقة الرقم القومي والفريق بيراجعها خلال 24–48 ساعة. كتير من الطلاب كمان بيوثقوا بإيميل الجامعة .edu علشان يحصلوا على شارة ثقة إضافية.' },
        { q: 'الطلاب الدوليين والمغتربين يقدروا يستخدموا سكنك؟', a: 'طبعاً. سكنك بيدعم العربي والإنجليزي، وعندنا إعلانات كتير قريبة من AUC و GUC والجامعات الدولية، ومرحبة بالطلاب المغتربين والتبادل.' },
        { q: 'إزاي ألاقي سكن طلاب بنات فقط؟', a: 'استخدمي فلتر النوع في صفحة البحث واختاري "إناث فقط". كمان تقدري تزوري صفحتنا المخصصة /female-roommates-egypt لسكن آمن للبنات.' },
        { q: 'في سكن مشترك رخيص للطلاب؟', a: 'أيوه. استخدم فلتر الميزانية وحدد السعر الأقصى الشهري. عندنا غرف مشتركة بأسعار قليلة جداً في القاهرة والجيزة والإسكندرية والمنصورة.' },
        { q: 'محتاج أدفع أي رسوم؟', a: 'لأ — سكنك مجاني 100% في البيتا. بعد البيتا، 5% بس على إيجار شهر واحد لمرة واحدة. مفيش رسوم سماسرة على سكنك أبداً.' },
      ],
    }}
    roomFilter={(q) => q.eq('is_student_listing', true)}
  />
);

export default StudentHousingEgypt;
