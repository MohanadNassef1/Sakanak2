import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(isArabic ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <MainLayout>
       <SEOHead
         title="Contact Sakanak | تواصل معنا - سكنك"
         description="Contact Sakanak for help finding rooms or roommates in Egypt. Get support for student housing, shared apartments & more. تواصل معنا لإيجار غرف وسكن مشترك."
         keywords="contact Sakanak, room rental support Egypt, تواصل معنا, سكنك دعم"
         canonicalPath="/contact"
       />
       <div className="min-h-screen bg-background pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-14 animate-fade-in">
            <div className="page-header-icon mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {isArabic ? 'تواصل معنا' : 'Contact Us'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {isArabic 
                ? 'نحن هنا لمساعدتك! تواصل معنا لأي استفسارات أو مشاكل أو اقتراحات.'
                : "We're here to help! Reach out to us for any questions, issues, or suggestions."}
            </p>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{isArabic ? 'الهاتف' : 'Phone'}</h3>
                    <a href="tel:+201017282645" className="text-muted-foreground hover:text-primary">
                      01017282645
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{isArabic ? 'البريد الإلكتروني' : 'Email'}</h3>
                    <a href="mailto:support@sakanak.com" className="text-muted-foreground hover:text-primary">
                      support@sakanak.com
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{isArabic ? 'واتساب' : 'WhatsApp'}</h3>
                    <a href="https://wa.me/201017282645" className="text-muted-foreground hover:text-primary" target="_blank" rel="noopener noreferrer">
                      01017282645
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
                  {isArabic ? 'أرسل لنا رسالة' : 'Send us a Message'}
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
                      placeholder={isArabic ? 'موضوع رسالتك' : 'What is this about?'}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{isArabic ? 'الرسالة' : 'Message'}</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting 
                      ? (isArabic ? 'جاري الإرسال...' : 'Sending...') 
                      : (isArabic ? 'إرسال الرسالة' : 'Send Message')}
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
