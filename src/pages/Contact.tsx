import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, MapPin, Send, Star, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Contact: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [searchParams] = useSearchParams();
  const isFeedbackMode = searchParams.get('type') === 'feedback';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: isFeedbackMode ? 'Beta Feedback' : '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: formData,
      });

      if (error) throw error;

      toast.success(isArabic ? 'تم إرسال ملاحظاتك بنجاح! شكرًا لمساعدتنا في تطوير سكنك.' : 'Your feedback has been sent! Thanks for helping us improve Sakanak.');
      setFormData({ name: '', email: '', subject: isFeedbackMode ? 'Beta Feedback' : '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
       <SEOHead
         title="Contact Sakanak | تواصل معنا - سكنك"
         description="Contact Sakanak for help finding rooms or roommates in Egypt. Get support for student housing, shared apartments & more. تواصل معنا لإيجار غرف وسكن مشترك."
         keywords="contact Sakanak, room rental support Egypt, تواصل معنا, سكنك دعم"
         canonicalPath="/contact"
       />
       <div className="min-h-screen bg-background pt-8 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
           <div className="text-center mb-12">
             <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {isFeedbackMode ? (isArabic ? 'شاركنا رأيك' : 'Share Beta Feedback') : (isArabic ? 'تواصل معنا' : 'Contact Us')}
             </h1>
             <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {isFeedbackMode
                  ? (isArabic ? 'سكنك ما زال في النسخة التجريبية. ملاحظاتك تساعدنا نطوّر التجربة بسرعة.' : 'Sakanak is still in beta. Your feedback helps us improve the experience quickly.')
                  : (isArabic 
                    ? 'نحن هنا لمساعدتك! تواصل معنا لأي استفسارات أو مشاكل أو اقتراحات.'
                    : "We're here to help! Reach out to us for any questions, issues, or suggestions.")}
             </p>
             <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
               <Send className="w-4 h-4" />
                {isFeedbackMode
                  ? (isArabic ? '💡 ملاحظاتك ستظهر في لوحة تحكم فريق سكنك' : '💡 Your feedback will appear in the Sakanak team dashboard')
                  : (isArabic 
                    ? '💡 استخدم النموذج أدناه للحصول على أسرع رد'
                    : '💡 Use the form below for the fastest response')}
             </div>
           </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="space-y-6">

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{isArabic ? 'البريد الإلكتروني' : 'Email'}</h3>
                    <a href="mailto:support@sakanakeg.com" className="text-muted-foreground hover:text-primary">
                      support@sakanakeg.com
                    </a>
                  </div>
                </CardContent>
              </Card>


              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{isArabic ? 'العنوان' : 'Address'}</h3>
                    <p className="text-muted-foreground">
                      {isArabic ? 'القاهرة، مصر' : 'Cairo, Egypt'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  {isFeedbackMode ? (isArabic ? 'أرسل ملاحظاتك' : 'Send Feedback') : (isArabic ? 'أرسل لنا رسالة' : 'Send us a Message')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{isArabic ? 'الاسم' : 'Name'}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isArabic ? 'اسمك الكامل' : 'Your full name'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{isArabic ? 'البريد الإلكتروني' : 'Email'}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={isArabic ? 'بريدك الإلكتروني' : 'Your email address'}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">{isArabic ? 'الموضوع' : 'Subject'}</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder={isFeedbackMode ? (isArabic ? 'ملاحظات النسخة التجريبية' : 'Beta Feedback') : (isArabic ? 'موضوع رسالتك' : 'What is this about?')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{isArabic ? 'الرسالة' : 'Message'}</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={isFeedbackMode ? (isArabic ? 'اكتب رأيك أو أي مشكلة قابلتك في سكنك...' : 'Tell us what worked, what was confusing, or what should improve...') : (isArabic ? 'اكتب رسالتك هنا...' : 'Write your message here...')}
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting 
                      ? (isArabic ? 'جاري الإرسال...' : 'Sending...') 
                      : (isFeedbackMode ? (isArabic ? 'إرسال الملاحظات' : 'Send Feedback') : (isArabic ? 'إرسال الرسالة' : 'Send Message'))}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;
