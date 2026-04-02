import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus, Search, CalendarCheck, Home, Eye, MessageCircle,
  ShieldCheck, Camera, MapPin, CheckCircle2, ArrowRight, ArrowLeft,
  Building, ClipboardList, Users, Handshake, Star, HelpCircle,
  Sparkles, Clock, Ban, FileText, BadgeCheck
} from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'tenant' | 'host'>('tenant');

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const tenantSteps = [
    {
      step: '01',
      icon: UserPlus,
      title: isRTL ? 'أنشئ حسابك' : 'Create Your Account',
      desc: isRTL
        ? 'سجّل مجانًا باستخدام بريدك الإلكتروني. أكمل ملفك الشخصي بإضافة صورتك ومعلوماتك الأساسية وتفضيلاتك في السكن. كلما كان ملفك أكمل، زادت فرصك في الحصول على قبول سريع.'
        : 'Sign up for free with your email. Complete your profile with a photo, basic info, and housing preferences. A complete profile increases your chances of getting accepted quickly.',
      tips: isRTL
        ? ['أضف صورة شخصية واضحة', 'اكتب نبذة عنك', 'حدد ميزانيتك المفضلة']
        : ['Add a clear profile photo', 'Write a short bio about yourself', 'Set your preferred budget range'],
    },
    {
      step: '02',
      icon: BadgeCheck,
      title: isRTL ? 'وثّق هويتك ✅' : 'Verify Your Identity ✅',
      desc: isRTL
        ? 'التوثيق هو أهم خطوة في سكنك! ارفع صورة بطاقتك الوطنية أو جواز سفرك للحصول على علامة التوثيق ✓. الحسابات الموثقة تحصل على نسبة توافق أعلى في نظام المطابقة الذكي، وتظهر بشكل أبرز في نتائج البحث. التوثيق يحمي الجميع ويجعل التجربة أكثر أمانًا وموثوقية.'
        : 'Verification is the most important step on Sakanak! Upload your national ID or passport to earn the verified badge ✓. Verified accounts get a higher compatibility matching score, appear more prominently in search results, and are trusted by other users. Verification protects everyone and makes the experience safer and more reliable.',
      tips: isRTL
        ? ['التوثيق يرفع نسبة التوافق في المطابقة الذكية 🎯', 'الحسابات الموثقة تحصل على ثقة أكبر وأولوية في الظهور', 'يحميك ويحمي المستخدمين الآخرين من الاحتيال 🛡️', 'المراجعة تتم خلال ساعات فقط']
        : ['Verification boosts your compatibility matching score 🎯', 'Verified accounts get more trust & priority visibility', 'Protects you and others from fraud & scams 🛡️', 'Review is completed within hours'],
    },
    {
      step: '03',
      icon: Search,
      title: isRTL ? 'تصفّح الغرف' : 'Browse Available Rooms',
      desc: isRTL
        ? 'استخدم الفلاتر للبحث حسب المحافظة، المنطقة، الميزانية، ونوع الغرفة. شاهد الصور، اقرأ التفاصيل، وتعرّف على شخصية المؤجر. يمكنك حفظ الغرف المفضلة للعودة إليها لاحقًا.'
        : 'Use filters to search by governorate, area, budget, and room type. View photos, read details, and learn about the host\'s personality. Save your favorite rooms to revisit later.',
      tips: isRTL
        ? ['فلتر حسب المحافظة والمنطقة', 'استخدم فلتر "الأجواء" لمطابقة الشخصية', 'احفظ الغرف المفضلة']
        : ['Filter by governorate & area', 'Use the "Vibes" filter for personality match', 'Save rooms to your favorites'],
    },
    {
      step: '04',
      icon: CalendarCheck,
      title: isRTL ? 'احجز معاينة' : 'Book a Viewing',
      desc: isRTL
        ? 'وجدت غرفة تعجبك؟ احجز موعد معاينة مباشرة. اختر التاريخ والوقت المناسب لك وأرسل رسالة للمؤجر. المؤجر يمكنه قبول الموعد أو اقتراح موعد بديل.'
        : 'Found a room you like? Book a viewing directly. Choose your preferred date and time, and send a message to the host. The host can accept or propose an alternative time.',
      tips: isRTL
        ? ['اختر وقتًا مناسبًا للطرفين', 'اكتب رسالة مهذبة للمؤجر', 'المؤجر قد يقترح موعدًا بديلاً']
        : ['Pick a time convenient for both', 'Write a polite message to the host', 'Host may counter-propose a different time'],
    },
    {
      step: '05',
      icon: Eye,
      title: isRTL ? 'قم بالمعاينة' : 'Visit the Room',
      desc: isRTL
        ? 'بعد تأكيد الموعد، اذهب لمعاينة الغرفة شخصيًا. تحقق من حالة الغرفة، الموقع، والجيران. بعد المعاينة، يمكنك ويمكن للمؤجر تأكيد الاتفاق أو رفضه.'
        : 'After the viewing is confirmed, visit the room in person. Check the room condition, location, and neighbors. After the viewing, both you and the host can confirm or decline the rental agreement.',
      tips: isRTL
        ? ['تفقد الغرفة جيدًا', 'اسأل عن الفواتير والإيجار', 'تأكد من الموقع والمواصلات']
        : ['Inspect the room thoroughly', 'Ask about bills & rent details', 'Check location & transportation access'],
    },
    {
      step: '06',
      icon: Handshake,
      title: isRTL ? 'أكّد الاتفاق وانتقل!' : 'Confirm & Move In!',
      desc: isRTL
        ? 'إذا أعجبتك الغرفة، أكّد الاتفاق من خلال المنصة. بمجرد تأكيد الطرفين، يتم إتمام الاتفاق. الخدمة حاليًا مجانية بالكامل! لا عمولات ولا رسوم خفية.'
        : 'If you like the room, confirm the agreement through the platform. Once both parties confirm, the deal is done. The service is currently 100% free! No commissions or hidden fees.',
      tips: isRTL
        ? ['الخدمة مجانية حاليًا 🎉', 'تأكيد الطرفين مطلوب', 'تواصل مع الدعم لأي مشكلة']
        : ['Service is currently free 🎉', 'Both parties must confirm', 'Contact support for any issues'],
    },
  ];

  const hostSteps = [
    {
      step: '01',
      icon: UserPlus,
      title: isRTL ? 'أنشئ حسابك' : 'Create Your Account',
      desc: isRTL
        ? 'سجّل مجانًا وأكمل ملفك الشخصي. أضف صورتك ومعلوماتك الأساسية. الملف الكامل يزيد ثقة الباحثين بك ويجذب طلبات أكثر.'
        : 'Sign up for free and complete your profile. Add your photo and basic info. A complete profile builds trust and attracts more inquiries.',
      tips: isRTL
        ? ['أضف صورة شخصية واضحة', 'اكتب نبذة عنك كمؤجر', 'وثّق هويتك للحصول على علامة ✓ وزيادة الثقة والأمان']
        : ['Add a clear profile photo', 'Write about yourself as a host', 'Verify your identity for the ✓ badge — builds trust & safety'],
    },
    {
      step: '02',
      icon: Camera,
      title: isRTL ? 'أضف إعلان غرفتك' : 'List Your Room',
      desc: isRTL
        ? 'أضف تفاصيل غرفتك: الصور، السعر، الموقع، المرافق، وقواعد السكن. كلما كانت التفاصيل أكثر وضوحًا، زادت فرصك في جذب مستأجرين مناسبين. حدد إذا كنت مالك العقار أو مستأجر حالي.'
        : 'Add your room details: photos, price, location, amenities, and house rules. The more detailed your listing, the better tenants you\'ll attract. Specify if you\'re the property owner or current tenant.',
      tips: isRTL
        ? ['ارفع 3-5 صور واضحة على الأقل', 'حدد السعر بدقة', 'اذكر جميع المرافق المتاحة', 'أضف قواعد السكن بوضوح']
        : ['Upload at least 3-5 clear photos', 'Set an accurate price', 'List all available amenities', 'Clearly state house rules'],
    },
    {
      step: '03',
      icon: ClipboardList,
      title: isRTL ? 'استقبل طلبات المعاينة' : 'Receive Viewing Requests',
      desc: isRTL
        ? 'عندما يعجب باحث بغرفتك، سيرسل طلب معاينة بتاريخ ووقت مقترح. يمكنك قبول الطلب، اقتراح موعد بديل، أو رفضه. ستصلك إشعارات لكل طلب جديد.'
        : 'When a tenant likes your room, they\'ll send a viewing request with a proposed date and time. You can accept, counter-propose a different time, or decline. You\'ll receive notifications for each new request.',
      tips: isRTL
        ? ['الرد السريع يزيد فرصك', 'يمكنك اقتراح موعد بديل', 'معاينة واحدة مؤكدة في المرة الواحدة']
        : ['Quick responses improve your chances', 'You can counter-propose times', 'One confirmed viewing at a time per room'],
    },
    {
      step: '04',
      icon: Eye,
      title: isRTL ? 'استقبل الزائر' : 'Host the Viewing',
      desc: isRTL
        ? 'استقبل الباحث في الموعد المتفق عليه. أره الغرفة وأجب على أسئلته. بعد المعاينة، يمكنك تأكيد إتمام المعاينة من خلال المنصة.'
        : 'Meet the tenant at the agreed time. Show them the room and answer their questions. After the viewing, confirm the viewing completion through the platform.',
      tips: isRTL
        ? ['جهّز الغرفة قبل الزيارة', 'كن صادقًا عن حالة الغرفة', 'أجب على جميع الأسئلة']
        : ['Prepare the room before the visit', 'Be honest about room conditions', 'Answer all questions openly'],
    },
    {
      step: '05',
      icon: Handshake,
      title: isRTL ? 'أكّد الاتفاق' : 'Confirm the Agreement',
      desc: isRTL
        ? 'إذا اتفقتم، أكّد الاتفاق من خلال المنصة. بمجرد تأكيد الطرفين، يتم إتمام العملية ويتغير حالة الغرفة إلى "مؤجرة". الخدمة حاليًا مجانية بالكامل!'
        : 'If you agree, confirm the rental through the platform. Once both parties confirm, the process is complete and the room status changes to "Rented". The service is currently 100% free!',
      tips: isRTL
        ? ['الخدمة مجانية حاليًا 🎉', 'حالة الغرفة تتحدث تلقائيًا', 'يمكنك إضافة إعلانات أخرى']
        : ['Service is currently free 🎉', 'Room status updates automatically', 'You can list more rooms anytime'],
    },
  ];

  const faqs = [
    {
      q: isRTL ? 'هل الخدمة مجانية؟' : 'Is the service free?',
      a: isRTL
        ? 'نعم! الخدمة حاليًا مجانية بالكامل لفترة محدودة. لا عمولات ولا رسوم خفية.'
        : 'Yes! The service is currently 100% free for a limited time. No commissions or hidden fees.',
    },
    {
      q: isRTL ? 'هل التوثيق إلزامي؟' : 'Is identity verification required?',
      a: isRTL
        ? 'التوثيق اختياري لكنه موصى به بشدة. الحسابات الموثقة تحصل على +3 نقاط في نظام التوافق الذكي، وتحظى بأولوية في الظهور وثقة أكبر. التوثيق يحمي الجميع من الاحتيال والسماسرة غير الشرعيين.'
        : 'Verification is optional but highly recommended. Verified accounts get +3 points in the smart matching system, priority visibility, and greater trust. Verification protects everyone from fraud and illegal brokers.',
    },
    {
      q: isRTL ? 'كيف يعمل نظام التوافق الذكي؟' : 'How does the smart matching score work?',
      a: isRTL
        ? 'سكنك يحسب نسبة توافقك مع كل إعلان بناءً على 23 نقطة تشمل: المنطقة المفضلة (+3)، الجامعة (+3)، التوثيق (+3)، الأجواء (+3)، الجنسية (+2)، الفئة العمرية (+2)، الصورة الشخصية (+2)، تفضيلات السكن (+2)، التدخين (+2)، والحيوانات الأليفة (+1). النتيجة تظهر كنسبة مئوية ملونة على كل إعلان.'
        : 'Sakanak calculates your compatibility on a 23-point scale: Interested Area (+3), University (+3), Verified Status (+3), Personality Tags (+3), Nationality (+2), Age Proximity (+2), Profile Photo (+2), Living Preferences (+2), Smoking Match (+2), and Pet Preference (+1). The score shows as a colored percentage on each listing.',
    },
    {
      q: isRTL ? 'لماذا يجب أن أكمل بروفايلي؟' : 'Why should I complete my profile?',
      a: isRTL
        ? 'البروفايل الكامل يرفع نسبة التوافق مع الإعلانات، يزيد ثقة المؤجرين بك، ويساعدك في العثور على سكن مناسب لشخصيتك. أضف صورتك، مهنتك، جامعتك، والأجواء المفضلة لديك.'
        : 'A complete profile boosts your match score with listings, builds trust with hosts, and helps find housing that fits your personality. Add your photo, occupation, university, and preferred vibes.',
    },
    {
      q: isRTL ? 'ماذا لو لم تعجبني الغرفة بعد المعاينة؟' : 'What if I don\'t like the room after viewing?',
      a: isRTL
        ? 'لا مشكلة! يمكنك ببساطة رفض الاتفاق بعد المعاينة. لا يوجد أي التزام حتى يتم تأكيد الطرفين.'
        : 'No problem! You can simply decline after the viewing. There\'s no obligation until both parties confirm.',
    },
    {
      q: isRTL ? 'كم عدد المعاينات المسموح بها؟' : 'How many viewings can I have?',
      a: isRTL
        ? 'يمكنك حجز معاينات متعددة لغرف مختلفة. لكن كل غرفة يمكن أن يكون لها معاينة مؤكدة واحدة فقط في نفس الوقت.'
        : 'You can book multiple viewings for different rooms. However, each room can only have one confirmed viewing at a time.',
    },
    {
      q: isRTL ? 'هل يمكنني التواصل مع المؤجر قبل المعاينة؟' : 'Can I message the host before booking?',
      a: isRTL
        ? 'نعم! يمكنك طرح أسئلة على صفحة الإعلان وسيجيب المؤجر عليها. كما يمكنك التواصل عبر المحادثات بعد حجز معاينة.'
        : 'Yes! You can ask questions on the listing page and the host will answer. You can also chat after booking a viewing.',
    },
  ];

  const steps = activeTab === 'tenant' ? tenantSteps : hostSteps;

  return (
    <MainLayout>
      <SEOHead
        title={isRTL
          ? 'كيف يعمل سكنك | دليل البحث عن سكن وتأجير الغرف في مصر - سكنك'
          : 'How Sakanak Works | Find Rooms & Roommates in Egypt - Step by Step Guide'}
        description={isRTL
          ? 'تعرف على كيفية استخدام سكنك للبحث عن غرف للايجار أو تأجيرها في مصر. سجّل، تحقق من هويتك، تصفح الغرف، واحجز معاينة - كل ذلك بدون سمسار.'
          : 'Learn how to use Sakanak to find or list rooms in Egypt. Create an account, verify your identity, browse rooms, and book viewings — all broker-free.'}
        keywords="how Sakanak works, كيف يعمل سكنك, find rooms Egypt, rent room without broker, إيجار بدون سمسار, roommate matching Egypt, شريك سكن, step by step rent Egypt"
        canonicalPath="/how-it-works"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sakanakeg.com/' },
              { '@type': 'ListItem', position: 2, name: 'How It Works', item: 'https://sakanakeg.com/how-it-works' },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: isRTL ? 'كيف تستخدم سكنك للبحث عن سكن في مصر' : 'How to Find Rooms & Roommates on Sakanak',
            description: isRTL
              ? 'دليل خطوة بخطوة لاستخدام سكنك'
              : 'Step-by-step guide to using Sakanak for finding rooms in Egypt',
            step: [
              { '@type': 'HowToStep', name: 'Create Account', text: 'Sign up for free with your email and complete your profile.' },
              { '@type': 'HowToStep', name: 'Verify Identity', text: 'Upload your national ID or passport to get the Verified badge.' },
              { '@type': 'HowToStep', name: 'Browse Rooms', text: 'Search verified rooms across Cairo, Giza, Alexandria, and more.' },
              { '@type': 'HowToStep', name: 'Book a Viewing', text: 'Schedule a viewing with the host and visit the room in person.' },
            ],
          },
        ]}
      />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
        <div className="section-container relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/10 px-4 py-1.5">
              {isRTL ? 'دليل المستخدم' : 'User Guide'}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
              {isRTL ? 'كيف يعمل ' : 'How '}
              <span className="text-primary">Sakanak</span>
              {isRTL ? '؟' : ' Works?'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {isRTL
                ? 'سكنك يربط بين الباحثين عن سكن والمؤجرين في مصر. من التسجيل إلى الانتقال، كل شيء يتم بسهولة وأمان.'
                : 'Sakanak connects room seekers with hosts across Egypt. From sign-up to move-in, everything is simple, safe, and transparent.'}
            </p>
          </div>
        </div>
      </section>

      {/* Tab Selector */}
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="section-container">
          <div className="flex justify-center gap-2 py-4">
            <Button
              variant={activeTab === 'tenant' ? 'default' : 'outline'}
              size="lg"
              className="gap-2 rounded-full px-6 md:px-8"
              onClick={() => setActiveTab('tenant')}
            >
              <Search className="w-5 h-5" />
              {isRTL ? 'أبحث عن غرفة' : "I'm Looking for a Room"}
            </Button>
            <Button
              variant={activeTab === 'host' ? 'default' : 'outline'}
              size="lg"
              className="gap-2 rounded-full px-6 md:px-8"
              onClick={() => setActiveTab('host')}
            >
              <Building className="w-5 h-5" />
              {isRTL ? 'أريد تأجير غرفتي' : 'I Want to List My Room'}
            </Button>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12 md:py-20">
        <div className="section-container max-w-4xl">
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute top-0 bottom-0 hidden md:block" style={{
              [isRTL ? 'right' : 'left']: '39px',
              width: '2px',
              background: 'linear-gradient(to bottom, hsl(var(--primary) / 0.3), hsl(var(--border)))'
            }} />

            <div className="space-y-8 md:space-y-12">
              {steps.map((step, index) => (
                <div
                  key={step.step}
                  className="relative flex gap-6 md:gap-8 animate-fade-in"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Step number circle */}
                  <div className="hidden md:flex flex-col items-center shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-card shadow-lg border border-border flex items-center justify-center relative z-10">
                      <step.icon className="w-8 h-8 text-primary" />
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                        {step.step}
                      </span>
                    </div>
                  </div>

                  {/* Content card */}
                  <Card className="flex-1 border-border hover:border-primary/30 transition-colors">
                    <CardContent className="p-6">
                      {/* Mobile icon */}
                      <div className="flex md:hidden items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center relative">
                          <step.icon className="w-6 h-6 text-primary" />
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                            {step.step}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                      </div>

                      <h3 className="hidden md:block text-xl font-bold text-foreground mb-3">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">{step.desc}</p>

                      {/* Tips */}
                      {step.tips && (
                        <div className="bg-secondary/50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {isRTL ? '💡 نصائح' : '💡 Tips'}
                          </p>
                          <ul className="space-y-1.5">
                            {step.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Verification Importance Section */}
      <section className="py-12 md:py-16 bg-primary/5 border-y border-primary/10">
        <div className="section-container max-w-4xl">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3 text-primary border-primary/30 bg-primary/10 px-4 py-1.5">
              {isRTL ? 'لماذا التوثيق مهم؟' : 'Why Verification Matters'}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {isRTL ? '🛡️ التوثيق = أمان + توافق أعلى' : '🛡️ Verification = Safety + Higher Match Score'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isRTL
                ? 'التوثيق هو أساس الثقة في سكنك. الحسابات الموثقة تحصل على نسبة توافق أعلى وتظهر بشكل أبرز في نتائج البحث.'
                : 'Verification is the foundation of trust on Sakanak. Verified accounts get a higher compatibility score and appear more prominently in search results.'}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BadgeCheck,
                title: isRTL ? '+3 نقاط توافق' : '+3 Match Score Points',
                desc: isRTL ? 'الحسابات الموثقة تحصل تلقائيًا على 3 نقاط إضافية في نظام التوافق الذكي، مما يجعلك أكثر جاذبية للمستأجرين والمؤجرين.' : 'Verified accounts automatically get +3 extra points in the smart matching system, making you more attractive to tenants and hosts.',
              },
              {
                icon: ShieldCheck,
                title: isRTL ? 'حماية من الاحتيال' : 'Fraud Protection',
                desc: isRTL ? 'التوثيق يمنع المحتالين والسماسرة غير الشرعيين. نتحقق من هوية كل مستخدم يدويًا لضمان أمان الجميع.' : 'Verification blocks scammers and illegal brokers. We manually verify every user\'s identity to ensure everyone\'s safety.',
              },
              {
                icon: Star,
                title: isRTL ? 'أولوية في الظهور' : 'Priority Visibility',
                desc: isRTL ? 'الإعلانات الموثقة تظهر بشكل أبرز وتحصل على ثقة أكبر من الباحثين. المعاينات أسرع والاتفاقات أسهل.' : 'Verified listings appear more prominently and earn greater trust from seekers. Viewings happen faster and agreements come easier.',
              },
            ].map((item, i) => (
              <Card key={i} className="border-primary/20 bg-card">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Matching Score Criteria Section */}
      <section className="py-12 md:py-16">
        <div className="section-container max-w-4xl">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3 text-primary border-primary/30 bg-primary/10 px-4 py-1.5">
              {isRTL ? 'نظام التوافق الذكي' : 'Smart Matching System'}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {isRTL ? '🎯 كيف يتم حساب نسبة التوافق؟' : '🎯 How Is Your Match Score Calculated?'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isRTL
                ? 'سكنك يحسب نسبة توافقك مع كل إعلان بناءً على عدة معايير. كلما كان ملفك أكمل، زادت دقة التوافق!'
                : 'Sakanak calculates your compatibility with each listing based on multiple criteria. The more complete your profile, the more accurate your matches!'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: isRTL ? 'المنطقة المفضلة' : 'Interested Area', points: '+3', emoji: '📍' },
              { label: isRTL ? 'الجامعة' : 'University', points: '+3', emoji: '🎓' },
              { label: isRTL ? 'التوثيق' : 'Verified Status', points: '+3', emoji: '✅' },
              { label: isRTL ? 'الأجواء والشخصية' : 'Personality Tags', points: '+3', emoji: '✨' },
              { label: isRTL ? 'الجنسية' : 'Nationality', points: '+2', emoji: '🌍' },
              { label: isRTL ? 'الفئة العمرية' : 'Age Proximity', points: '+2', emoji: '📅' },
              { label: isRTL ? 'صورة شخصية' : 'Profile Photo', points: '+2', emoji: '📸' },
              { label: isRTL ? 'تفضيلات السكن' : 'Living Preferences', points: '+2', emoji: '🏠' },
              { label: isRTL ? 'التدخين' : 'Smoking Match', points: '+2', emoji: '🚬' },
              { label: isRTL ? 'الحيوانات الأليفة' : 'Pet Preference', points: '+1', emoji: '🐾' },
            ].map((criteria, i) => (
              <Card key={i} className="border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl">{criteria.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{criteria.label}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
                    {criteria.points}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isRTL
              ? '💡 المجموع: 23 نقطة. النتيجة تظهر كنسبة مئوية ملونة: أخضر (≥70%) = توافق عالي، برتقالي (≥40%) = متوسط، أحمر (<40%) = منخفض'
              : '💡 Total: 23 points. Score displays as a colored percentage: Green (≥70%) = High match, Amber (≥40%) = Medium, Red (<40%) = Low'}
          </p>
        </div>
      </section>

      {/* Complete Your Profile Section */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="section-container max-w-4xl">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3 text-primary border-primary/30 bg-primary/10 px-4 py-1.5">
              {isRTL ? 'كمّل بروفايلك' : 'Complete Your Profile'}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {isRTL ? '📋 بروفايل كامل = نتائج أفضل' : '📋 Complete Profile = Better Results'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isRTL
                ? 'ملفك الشخصي هو بطاقة تعريفك على سكنك. كلما كان أكمل، زادت فرصك في العثور على السكن المثالي.'
                : 'Your profile is your identity card on Sakanak. The more complete it is, the better your chances of finding the perfect home.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Camera,
                title: isRTL ? 'صورة شخصية' : 'Profile Photo',
                desc: isRTL ? 'أضف صورة واضحة تزيد ثقة الآخرين بك' : 'Add a clear photo to build trust with others',
              },
              {
                icon: FileText,
                title: isRTL ? 'نبذة عنك' : 'About You',
                desc: isRTL ? 'اكتب نبذة قصيرة عن نفسك وأسلوب حياتك' : 'Write a short bio about yourself and lifestyle',
              },
              {
                icon: Users,
                title: isRTL ? 'المهنة والجامعة' : 'Occupation & University',
                desc: isRTL ? 'أضف وظيفتك وجامعتك لتوافق أفضل' : 'Add your job & university for better matching',
              },
              {
                icon: Sparkles,
                title: isRTL ? 'الأجواء والتفضيلات' : 'Vibes & Preferences',
                desc: isRTL ? 'حدد شخصيتك وتفضيلات السكن' : 'Set your personality tags & living preferences',
              },
            ].map((item, i) => (
              <Card key={i} className="border-border text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" className="rounded-full px-8 gap-2" asChild>
              <Link to="/profile">
                <UserPlus className="w-5 h-5" />
                {isRTL ? 'كمّل بروفايلك الآن' : 'Complete Your Profile Now'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16">
        <div className="section-container max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10">
            <HelpCircle className="w-7 h-7 inline-block text-primary mb-1" />{' '}
            {isRTL ? 'أسئلة شائعة' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-5">
                  <h3 className="font-bold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="section-container text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {isRTL ? 'جاهز تبدأ؟' : 'Ready to Get Started?'}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {isRTL
              ? 'انضم لآلاف المستخدمين الذين وجدوا سكنهم المثالي من خلال سكنك.'
              : 'Join thousands of users who found their perfect home through Sakanak.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full px-8 gap-2" asChild>
              <Link to="/rooms">
                <Search className="w-5 h-5" />
                {isRTL ? 'تصفح الغرف' : 'Browse Rooms'}
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 gap-2" asChild>
              <Link to="/list-room">
                <Building className="w-5 h-5" />
                {isRTL ? 'أضف غرفتك' : 'List Your Room'}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HowItWorksPage;
