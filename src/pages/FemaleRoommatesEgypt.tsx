import React from 'react';
import SEOLandingTemplate from '@/components/seo/SEOLandingTemplate';

const FemaleRoommatesEgypt: React.FC = () => (
  <SEOLandingTemplate
    slug="female-roommates-egypt"
    browseHref="/rooms?gender=females_only"
    title={{
      en: 'Female Roommate Egypt — Girls Only Housing in Cairo, Giza & Alexandria',
      ar: 'روميت بنات فقط في مصر — سكن بنات في القاهرة والجيزة والإسكندرية',
    }}
    h1={{
      en: 'Find a Female Roommate in Egypt — Girls Only Housing',
      ar: 'روميت بنات فقط في مصر — سكن آمن للبنات',
    }}
    description={{
      en: 'Find verified female roommates and girls-only housing in Cairo, Giza & Alexandria. Safe, no mixed-gender housing, no brokers — Sakanak Egypt.',
      ar: 'سكن بنات وروميت بنات فقط في القاهرة والجيزة والإسكندرية — موثق وآمن، بدون سكن مختلط، بدون سماسرة. سكنك مصر.',
    }}
    keywords="Female roommate Egypt, روميت بنات فقط, Girls only housing Egypt, سكن بنات, Safe student accommodation, سكن آمن للمغتربات, No mixed gender housing Egypt, سكن غير مختلط, Roommate Egypt, روميت, Sakanak, سكنك"
    intro={{
      en: 'Sakanak is the safest way for women in Egypt to find a verified female roommate or girls-only apartment. Strict gender filtering, ID-verified profiles, and zero broker fees.',
      ar: 'سكنك أأمن طريقة للبنات في مصر علشان يلاقوا روميت بنات فقط أو شقة سكن بنات. فلترة صارمة حسب النوع، ملفات موثقة بالهوية، وبدون أي رسوم سماسرة.',
    }}
    body={{
      en: [
        'Looking for a female roommate in Egypt? Sakanak (سكنك) is Egypt’s first dedicated roommate finder built with safety for women in mind. Every member completes ID verification before they can message anyone, and our gender-strict filter means you will only ever see girls-only listings — no mixed-gender housing surprises.',
        'Whether you’re a student moving to Cairo for university, a young professional starting a job in Zamalek or Maadi, or an expat looking for safe long-term accommodation in Egypt, you can browse furnished rooms for rent, shared apartments, and entire flats listed by other verified women.',
        'We cover all major cities: girls-only housing in Cairo (المعادي، مدينة نصر، الزمالك، التجمع الخامس), Giza (الدقي، المهندسين، الشيخ زايد، 6 أكتوبر) and Alexandria (سموحة، سيدي جابر، ميامي). You can filter by budget, neighbourhood, smoking and pet preferences, and even personality tags so your future roommate actually fits your lifestyle.',
        'There are no brokers and no commission on Sakanak. You message the host directly through our protected chat, book a viewing, visit the place in person, and only then exchange contact details. During our Beta period the entire platform is 100% free — list your room or find a roommate at zero cost.',
      ],
      ar: [
        'بتدوري على روميت بنات فقط في مصر؟ سكنك هو أول تطبيق مصري متخصص في البحث عن روميت ومصمم بحيث الأمان للبنات يكون أولوية. كل عضو لازم يوثق هويته قبل ما يقدر يبعت أي رسالة، وفلتر النوع الصارم بيخليكي تشوفي إعلانات سكن بنات بس — مفيش أي مفاجآت بسكن مختلط.',
        'سواء كنتي طالبة جاية القاهرة للجامعة، أو خريجة بتبدأي شغل في الزمالك أو المعادي، أو مغتربة بتدوري على سكن آمن للمغتربات لفترة طويلة، تقدري تتصفحي غرف مفروشة للإيجار وشقق شيرنج معروضة من بنات موثقات تانيين.',
        'بنغطي كل المدن الكبيرة: سكن بنات في القاهرة (المعادي، مدينة نصر، الزمالك، التجمع الخامس)، الجيزة (الدقي، المهندسين، الشيخ زايد، 6 أكتوبر) والإسكندرية (سموحة، سيدي جابر، ميامي). تقدري تفلتري بالميزانية، المنطقة، التدخين، الحيوانات الأليفة، وحتى التاجز الشخصية علشان تلاقي روميت بتشبه أسلوب حياتك فعلاً.',
        'مفيش سماسرة ومفيش عمولة على سكنك. بتكلمي صاحبة الإعلان مباشرة من خلال الشات المحمي، تحجزي معاينة، تشوفي المكان شخصياً، وبعدين بس بتتبادلوا أرقام التليفونات. خلال فترة البيتا، المنصة كلها مجانية 100% — اعرضي غرفتك أو دوري على روميت ببلاش.',
      ],
    }}
    faqs={{
      en: [
        { q: 'Is Sakanak only for women?', a: 'No, Sakanak is for both men and women, but we use strict gender filtering. When you mark a listing as “girls only”, it will never appear in male users’ searches and vice versa.' },
        { q: 'How do I know other women are real?', a: 'Every user must upload a government-issued ID, and our team reviews each verification within 24–48 hours before the user can message anyone or book a viewing.' },
        { q: 'Are there brokers or fees?', a: 'No brokers. During the Beta period Sakanak is 100% free. After Beta we charge a small one-time 5% on a single month’s rent — nothing else.' },
        { q: 'Can I find student housing for girls?', a: 'Yes — many of our listings are tagged as student housing in Cairo, Alexandria and Mansoura, near major universities like AUC, GUC, Cairo University, Alex University and Mansoura University.' },
        { q: 'How do I contact a host?', a: 'You can chat with any verified host directly inside Sakanak. Phone numbers and outside contact info stay hidden until you both confirm a viewing — this protects you from scams.' },
      ],
      ar: [
        { q: 'هل سكنك للبنات بس؟', a: 'لأ، سكنك للبنات والشباب، بس بنستخدم فلترة نوع صارمة. لما الإعلان يكون "بنات فقط"، مش هيظهر أبداً في بحث الشباب، والعكس صحيح.' },
        { q: 'إزاي أتأكد إن باقي البنات حقيقيات؟', a: 'كل مستخدم لازم يرفع صورة بطاقة الرقم القومي، وفريقنا بيراجع التوثيق خلال 24–48 ساعة قبل ما المستخدم يقدر يكلم أي حد أو يحجز معاينة.' },
        { q: 'في سماسرة أو رسوم؟', a: 'مفيش سماسرة. خلال البيتا سكنك مجاني 100%. بعد البيتا، 5% بس على إيجار شهر واحد — وخلاص.' },
        { q: 'أقدر ألاقي سكن طلاب للبنات؟', a: 'أيوه — عندنا إعلانات كتير مصنفة كـ سكن طلاب في القاهرة والإسكندرية والمنصورة، قريب من الجامعات الكبيرة زي AUC و GUC وجامعة القاهرة والإسكندرية والمنصورة.' },
        { q: 'إزاي أتواصل مع صاحب الإعلان؟', a: 'تقدري تكلمي أي صاحب إعلان موثق من جوة سكنك مباشرة. أرقام التليفونات والتواصل برّه التطبيق مخفي لحد ما الاتنين تأكدوا المعاينة — ده بيحميكي من النصب.' },
      ],
    }}
    roomFilter={(q) => q.in('preferred_gender', ['females_only', 'female'])}
  />
);

export default FemaleRoommatesEgypt;
