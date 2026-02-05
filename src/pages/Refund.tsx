import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCcw, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const Refund: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const refundCases = isArabic ? [
    {
      icon: CheckCircle,
      title: 'استرداد كامل',
      description: 'إلغاء قبل 48 ساعة من موعد الوصول',
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: AlertTriangle,
      title: 'استرداد 50%',
      description: 'إلغاء قبل 24 ساعة من موعد الوصول',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: XCircle,
      title: 'بدون استرداد',
      description: 'إلغاء أقل من 24 ساعة من موعد الوصول',
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
    },
  ] : [
    {
      icon: CheckCircle,
      title: 'Full Refund',
      description: 'Cancellation 48+ hours before check-in',
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: AlertTriangle,
      title: '50% Refund',
      description: 'Cancellation 24-48 hours before check-in',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: XCircle,
      title: 'No Refund',
      description: 'Cancellation less than 24 hours before check-in',
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <MainLayout>
       <div className="min-h-screen bg-background pt-8 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <RefreshCcw className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {isArabic ? 'سياسة الاسترداد' : 'Refund Policy'}
            </h1>
            <p className="text-muted-foreground">
              {isArabic ? 'آخر تحديث: يناير 2024' : 'Last updated: January 2024'}
            </p>
          </div>

          {/* Refund Cases */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {refundCases.map((item, index) => (
              <Card key={index} className={item.bgColor}>
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-full ${item.bgColor} flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${item.color}`}>{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            {isArabic ? (
              <div className="space-y-8 text-right">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. سياسة الإلغاء</h2>
                  <p className="text-muted-foreground">
                    يمكنك إلغاء حجزك في أي وقت قبل موعد تسجيل الوصول. تعتمد نسبة الاسترداد على توقيت الإلغاء كما هو موضح أعلاه.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. الاسترداد في حالات خاصة</h2>
                  <p className="text-muted-foreground mb-4">يحق لك استرداد كامل المبلغ في الحالات التالية:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>الغرفة تختلف بشكل كبير عن الوصف أو الصور</li>
                    <li>المالك لم يلتزم بموعد التسليم</li>
                    <li>وجود مشاكل صحية أو أمنية خطيرة في الغرفة</li>
                    <li>إلغاء المالك للحجز</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. مبلغ التأمين</h2>
                  <p className="text-muted-foreground">
                    يتم استرداد مبلغ التأمين بالكامل عند انتهاء فترة الإيجار، بشرط عدم وجود أضرار في الغرفة. في حالة وجود أضرار، سيتم خصم تكلفة الإصلاح من مبلغ التأمين.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. رسوم المنصة</h2>
                  <p className="text-muted-foreground">
                    رسوم المنصة (5%) غير قابلة للاسترداد في معظم الحالات، إلا في حالة الإلغاء بسبب خطأ من المنصة أو المالك.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. كيفية طلب الاسترداد</h2>
                  <p className="text-muted-foreground mb-4">لطلب استرداد:</p>
                  <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                    <li>انتقل إلى صفحة حجوزاتك</li>
                    <li>اختر الحجز المراد إلغاؤه</li>
                    <li>اضغط على "إلغاء الحجز"</li>
                    <li>اتبع التعليمات لإتمام عملية الإلغاء</li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. مدة معالجة الاسترداد</h2>
                  <div className="flex items-start gap-4 bg-muted/50 p-4 rounded-lg">
                    <Clock className="w-6 h-6 text-primary shrink-0" />
                    <p className="text-muted-foreground">
                      تتم معالجة طلبات الاسترداد خلال 5-7 أيام عمل. سيتم إرسال المبلغ إلى نفس طريقة الدفع المستخدمة في الحجز.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. التواصل</h2>
                  <p className="text-muted-foreground">
                    لأي استفسارات حول الاسترداد، يرجى التواصل معنا على support@sakanak.com أو الاتصال على 01017282645
                  </p>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Cancellation Policy</h2>
                  <p className="text-muted-foreground">
                    You can cancel your booking at any time before check-in. The refund percentage depends on the timing of cancellation as shown above.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Special Circumstances Refund</h2>
                  <p className="text-muted-foreground mb-4">You are entitled to a full refund in the following cases:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>The room differs significantly from the description or photos</li>
                    <li>The owner did not meet the delivery time</li>
                    <li>Serious health or safety issues in the room</li>
                    <li>Owner cancels the booking</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Insurance Deposit</h2>
                  <p className="text-muted-foreground">
                    The insurance deposit is fully refunded at the end of the rental period, provided there is no damage to the room. In case of damage, the repair cost will be deducted from the deposit.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Platform Fees</h2>
                  <p className="text-muted-foreground">
                    Platform fees (5%) are non-refundable in most cases, except when cancellation is due to platform or owner error.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. How to Request a Refund</h2>
                  <p className="text-muted-foreground mb-4">To request a refund:</p>
                  <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                    <li>Go to your bookings page</li>
                    <li>Select the booking you want to cancel</li>
                    <li>Click "Cancel Booking"</li>
                    <li>Follow the instructions to complete the cancellation</li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Refund Processing Time</h2>
                  <div className="flex items-start gap-4 bg-muted/50 p-4 rounded-lg">
                    <Clock className="w-6 h-6 text-primary shrink-0" />
                    <p className="text-muted-foreground">
                      Refund requests are processed within 5-7 business days. The amount will be sent to the same payment method used for booking.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
                  <p className="text-muted-foreground">
                    For any refund inquiries, please contact us at support@sakanak.com or call 01017282645
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

export default Refund;
