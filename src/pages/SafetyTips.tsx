import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  Eye, 
  MessageCircle, 
  CreditCard, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Phone
} from 'lucide-react';

const SafetyTips: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const tips = isArabic ? [
    {
      icon: Shield,
      title: 'تحقق من الملفات الشخصية',
      description: 'تعامل فقط مع المستخدمين الموثقين الذين لديهم شارة التحقق. هذا يعني أننا قمنا بالتحقق من هويتهم.',
    },
    {
      icon: Eye,
      title: 'زر الغرفة شخصياً',
      description: 'قبل إتمام أي حجز، تأكد من زيارة الغرفة شخصياً للتأكد من أنها تطابق الصور والوصف المعلن.',
    },
    {
      icon: MessageCircle,
      title: 'استخدم نظام الرسائل الداخلي',
      description: 'تواصل فقط من خلال منصة ساكنك. تجنب مشاركة رقم هاتفك أو بريدك الإلكتروني قبل التأكد من الطرف الآخر.',
    },
    {
      icon: CreditCard,
      title: 'ادفع عبر المنصة فقط',
      description: 'لا تقم بتحويل أموال مباشرة للمالك. استخدم نظام الدفع الآمن الخاص بنا لحماية أموالك.',
    },
    {
      icon: Users,
      title: 'اصطحب شخصاً معك',
      description: 'عند زيارة غرفة لأول مرة، يفضل اصطحاب صديق أو أحد أفراد العائلة معك.',
    },
    {
      icon: AlertTriangle,
      title: 'احذر من العروض المشبوهة',
      description: 'إذا كان السعر أقل بكثير من المعتاد أو طلب المالك دفعة كبيرة مقدماً، فقد يكون ذلك علامة تحذير.',
    },
  ] : [
    {
      icon: Shield,
      title: 'Verify Profiles',
      description: 'Only deal with verified users who have the verification badge. This means we have confirmed their identity.',
    },
    {
      icon: Eye,
      title: 'Visit the Room in Person',
      description: 'Before completing any booking, make sure to visit the room in person to confirm it matches the photos and description.',
    },
    {
      icon: MessageCircle,
      title: 'Use the Internal Messaging System',
      description: 'Communicate only through the Sakanak platform. Avoid sharing your phone number or email before verifying the other party.',
    },
    {
      icon: CreditCard,
      title: 'Pay Through the Platform Only',
      description: "Don't transfer money directly to the owner. Use our secure payment system to protect your funds.",
    },
    {
      icon: Users,
      title: 'Bring Someone With You',
      description: 'When visiting a room for the first time, it is recommended to bring a friend or family member with you.',
    },
    {
      icon: AlertTriangle,
      title: 'Beware of Suspicious Offers',
      description: 'If the price is much lower than usual or the owner asks for a large upfront payment, it could be a warning sign.',
    },
  ];

  const doList = isArabic ? [
    'تحقق من هوية المالك قبل الاجتماع',
    'التقط صوراً للغرفة عند الوصول',
    'اقرأ عقد الإيجار بعناية',
    'احتفظ بجميع إيصالات الدفع',
    'أبلغ عن أي سلوك مشبوه',
  ] : [
    'Verify the owner\'s identity before meeting',
    'Take photos of the room upon arrival',
    'Read the rental agreement carefully',
    'Keep all payment receipts',
    'Report any suspicious behavior',
  ];

  const dontList = isArabic ? [
    'لا تدفع نقداً خارج المنصة',
    'لا تشارك معلوماتك المصرفية',
    'لا توقع عقوداً دون قراءتها',
    'لا تتجاهل علامات التحذير',
    'لا تستعجل في اتخاذ القرار',
  ] : [
    "Don't pay cash outside the platform",
    "Don't share your banking information",
    "Don't sign contracts without reading them",
    "Don't ignore warning signs",
    "Don't rush into making a decision",
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {isArabic ? 'نصائح السلامة' : 'Safety Tips'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {isArabic 
                ? 'سلامتك أولويتنا. اتبع هذه النصائح لتجربة آمنة على منصتنا.'
                : 'Your safety is our priority. Follow these tips for a secure experience on our platform.'}
            </p>
          </div>

          {/* Tips Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {tips.map((tip, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <tip.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                  <p className="text-muted-foreground">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Do's and Don'ts */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  {isArabic ? 'افعل' : 'Do'}
                </h3>
                <ul className="space-y-3">
                  {doList.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                  {isArabic ? 'لا تفعل' : "Don't"}
                </h3>
                <ul className="space-y-3">
                  {dontList.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {isArabic ? 'هل تحتاج مساعدة؟' : 'Need Help?'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isArabic 
                  ? 'إذا شعرت بأي خطر أو واجهت مشكلة، تواصل معنا فوراً'
                  : 'If you feel any danger or encounter a problem, contact us immediately'}
              </p>
              <a 
                href="tel:+201017282645" 
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
              >
                <Phone className="w-4 h-4" />
                01017282645
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SafetyTips;
