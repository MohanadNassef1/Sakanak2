import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Send, Loader2, Users, User, Search, History, CheckCircle2, XCircle, Clock, RefreshCw, FileText, Sparkles } from 'lucide-react';
import DOMPurify from 'dompurify';
import { format } from 'date-fns';

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
}

interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  email_type: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

export default function AdminEmails() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  // Compose state
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'selected'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailType, setEmailType] = useState('broadcast');

  // History state
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'sent' | 'failed'>('all');

  const emailTemplates = [
    {
      id: 'welcome',
      name: isRTL ? 'ترحيب بمستخدم جديد' : 'Welcome New User',
      icon: '👋',
      subject: isRTL ? 'مرحبًا بك في سكنك!' : 'Welcome to Sakanak!',
      content: isRTL
        ? `<h2 style="color:#FF7A00;">مرحبًا {{name}}! 👋</h2>
<p>أهلاً بيك في <strong>سكنك</strong> – المنصة الأسهل لإيجاد سكن مشترك في مصر.</p>
<p>ابدأ دلوقتي:</p>
<ul>
<li>🔍 تصفح الغرف المتاحة</li>
<li>📝 أكمل ملفك الشخصي</li>
<li>✅ وثّق حسابك للحصول على مميزات أكتر</li>
</ul>
<p>لو عندك أي سؤال، فريق الدعم موجود دايمًا.</p>
<p>فريق سكنك 🧡</p>`
        : `<h2 style="color:#FF7A00;">Welcome {{name}}! 👋</h2>
<p>Welcome to <strong>Sakanak</strong> – the easiest way to find shared housing in Egypt.</p>
<p>Get started now:</p>
<ul>
<li>🔍 Browse available rooms</li>
<li>📝 Complete your profile</li>
<li>✅ Verify your account for more features</li>
</ul>
<p>If you have any questions, our support team is always here to help.</p>
<p>The Sakanak Team 🧡</p>`,
    },
    {
      id: 'complete-profile',
      name: isRTL ? 'أكمل ملفك الشخصي' : 'Complete Your Profile',
      icon: '📝',
      subject: isRTL ? 'أكمل ملفك الشخصي على سكنك' : 'Complete your Sakanak profile',
      content: isRTL
        ? `<h2 style="color:#FF7A00;">يا {{name}}، ملفك ناقص! 📝</h2>
<p>لاحظنا إن ملفك الشخصي مش مكتمل. أكمله دلوقتي عشان:</p>
<ul>
<li>🏠 تقدر تحجز معاينات</li>
<li>💬 تتواصل مع أصحاب الغرف</li>
<li>⭐ تظهر في نتائج البحث</li>
</ul>
<p><a href="https://sakanakeg.com/complete-profile" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">أكمل ملفك الآن</a></p>
<p>فريق سكنك 🧡</p>`
        : `<h2 style="color:#FF7A00;">Hey {{name}}, your profile is incomplete! 📝</h2>
<p>We noticed your profile isn't complete yet. Complete it now to:</p>
<ul>
<li>🏠 Book room viewings</li>
<li>💬 Chat with room owners</li>
<li>⭐ Appear in search results</li>
</ul>
<p><a href="https://sakanakeg.com/complete-profile" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Complete Profile Now</a></p>
<p>The Sakanak Team 🧡</p>`,
    },
    {
      id: 'new-rooms',
      name: isRTL ? 'غرف جديدة متاحة' : 'New Rooms Available',
      icon: '🏠',
      subject: isRTL ? 'غرف جديدة على سكنك!' : 'New rooms on Sakanak!',
      content: isRTL
        ? `<h2 style="color:#FF7A00;">غرف جديدة متاحة! 🏠</h2>
<p>يا {{name}}، في غرف جديدة اتضافت على سكنك تناسبك.</p>
<p>تصفح الغرف الجديدة دلوقتي وابدأ احجز معاينة.</p>
<p><a href="https://sakanakeg.com/rooms" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">تصفح الغرف</a></p>
<p>فريق سكنك 🧡</p>`
        : `<h2 style="color:#FF7A00;">New Rooms Available! 🏠</h2>
<p>Hey {{name}}, new rooms have been added to Sakanak that might be perfect for you.</p>
<p>Browse the latest rooms and book a viewing today.</p>
<p><a href="https://sakanakeg.com/rooms" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Browse Rooms</a></p>
<p>The Sakanak Team 🧡</p>`,
    },
    {
      id: 'verify-account',
      name: isRTL ? 'وثّق حسابك' : 'Verify Your Account',
      icon: '✅',
      subject: isRTL ? 'وثّق حسابك على سكنك' : 'Verify your Sakanak account',
      content: isRTL
        ? `<h2 style="color:#FF7A00;">وثّق حسابك يا {{name}}! ✅</h2>
<p>التوثيق بيديك مميزات كتير:</p>
<ul>
<li>🛡️ علامة التوثيق الزرقاء على ملفك</li>
<li>🏠 حجز معاينات للغرف</li>
<li>💬 التواصل مع أصحاب الغرف</li>
<li>⭐ أولوية في الظهور في نتائج البحث</li>
</ul>
<p><a href="https://sakanakeg.com/verify" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">وثّق حسابك الآن</a></p>
<p>فريق سكنك 🧡</p>`
        : `<h2 style="color:#FF7A00;">Verify your account {{name}}! ✅</h2>
<p>Verification gives you access to more features:</p>
<ul>
<li>🛡️ Verified badge on your profile</li>
<li>🏠 Book room viewings</li>
<li>💬 Chat with room owners</li>
<li>⭐ Priority in search results</li>
</ul>
<p><a href="https://sakanakeg.com/verify" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Verify Now</a></p>
<p>The Sakanak Team 🧡</p>`,
    },
    {
      id: 'special-offer',
      name: isRTL ? 'عرض خاص' : 'Special Offer',
      icon: '🎉',
      subject: isRTL ? 'عرض خاص من سكنك!' : 'Special offer from Sakanak!',
      content: isRTL
        ? `<h2 style="color:#FF7A00;">عرض خاص ليك يا {{name}}! 🎉</h2>
<p>[اكتب تفاصيل العرض هنا]</p>
<p>العرض ده متاح لفترة محدودة، استغله دلوقتي!</p>
<p><a href="https://sakanakeg.com" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">استفد من العرض</a></p>
<p>فريق سكنك 🧡</p>`
        : `<h2 style="color:#FF7A00;">Special offer for you {{name}}! 🎉</h2>
<p>[Write your offer details here]</p>
<p>This offer is available for a limited time only!</p>
<p><a href="https://sakanakeg.com" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Claim Offer</a></p>
<p>The Sakanak Team 🧡</p>`,
    },
    {
      id: 'custom',
      name: isRTL ? 'رسالة مخصصة' : 'Custom Message',
      icon: '✏️',
      subject: '',
      content: '',
    },
  ];

  const applyTemplate = (templateId: string) => {
    const tpl = emailTemplates.find(t => t.id === templateId);
    if (!tpl) return;
    setSubject(tpl.subject);
    setHtmlContent(tpl.content);
  };



  useEffect(() => {
    if (!authLoading && !roleLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, roleLoading, authLoading, navigate]);

  useEffect(() => {
    if (recipientType === 'selected') {
      fetchUsers();
    }
  }, [recipientType]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .order('full_name');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('id, recipient_email, recipient_name, subject, email_type, status, error_message, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching email logs:', error);
      toast.error('Failed to load email history');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !logSearch ||
      log.recipient_email.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.recipient_name?.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.subject.toLowerCase().includes(logSearch.toLowerCase());
    const matchesFilter = logFilter === 'all' || log.status === logFilter;
    return matchesSearch && matchesFilter;
  });

  const logStats = {
    total: logs.length,
    sent: logs.filter(l => l.status === 'sent').length,
    failed: logs.filter(l => l.status === 'failed').length,
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.user_id));
    }
  };

  const handleSendEmail = async () => {
    if (!subject.trim()) {
      toast.error(isRTL ? 'الموضوع مطلوب' : 'Subject is required');
      return;
    }
    if (!htmlContent.trim()) {
      toast.error(isRTL ? 'المحتوى مطلوب' : 'Content is required');
      return;
    }
    if (recipientType === 'selected' && selectedUsers.length === 0) {
      toast.error(isRTL ? 'اختر مستلمًا واحدًا على الأقل' : 'Select at least one recipient');
      return;
    }

    setIsSending(true);
    try {
      const response = await supabase.functions.invoke('send-broadcast-email', {
        body: {
          subject,
          htmlContent,
          recipientType,
          selectedUserIds: recipientType === 'selected' ? selectedUsers : undefined,
          emailType,
        },
      });

      if (response.error) throw new Error(response.error.message);
      const result = response.data;

      if (result.success) {
        toast.success(
          isRTL ? `تم إرسال ${result.sent} رسالة بنجاح` : `Successfully sent ${result.sent} emails`
        );
        if (result.failed > 0) {
          toast.warning(
            isRTL ? `فشل إرسال ${result.failed} رسالة` : `Failed to send ${result.failed} emails`
          );
        }
        setSubject('');
        setHtmlContent('');
        setSelectedUsers([]);
        // Refresh logs
        fetchLogs();
      } else {
        throw new Error(result.error || 'Failed to send emails');
      }
    } catch (error: any) {
      console.error('Error sending broadcast:', error);
      toast.error(error.message || 'Failed to send emails');
    } finally {
      setIsSending(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container max-w-5xl py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mb-6">
        <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
        {isRTL ? 'العودة للمستخدمين' : 'Back to Users'}
      </Button>

      <Tabs defaultValue="compose" onValueChange={(v) => { if (v === 'history') fetchLogs(); }}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            {isRTL ? 'إرسال بريد' : 'Compose'}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {isRTL ? 'سجل الرسائل' : 'Email History'}
          </TabsTrigger>
        </TabsList>

        {/* ── Compose Tab ── */}
        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{isRTL ? 'إرسال إشعارات بالبريد' : 'Send Email Updates'}</CardTitle>
                  <CardDescription>
                    {isRTL
                      ? 'أرسل رسائل بريد إلكتروني لجميع المستخدمين أو لمستخدمين محددين'
                      : 'Send email updates, offers, or notifications to users'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Type */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">{isRTL ? 'نوع البريد' : 'Email Type'}</Label>
                <RadioGroup value={emailType} onValueChange={setEmailType} className="flex flex-wrap gap-4">
                  {[
                    { value: 'broadcast', label: isRTL ? 'إعلان عام' : 'Broadcast', icon: Users },
                    { value: 'offer', label: isRTL ? 'عرض خاص' : 'Offer', icon: Mail },
                    { value: 'notification', label: isRTL ? 'إشعار' : 'Notification', icon: Send },
                  ].map(t => (
                    <div key={t.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={t.value} id={`type-${t.value}`} />
                      <Label htmlFor={`type-${t.value}`} className="flex items-center gap-2 cursor-pointer">
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Recipients Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">{isRTL ? 'المستلمون' : 'Recipients'}</Label>
                <RadioGroup
                  value={recipientType}
                  onValueChange={(v) => setRecipientType(v as 'all' | 'selected')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer">
                      <Users className="h-4 w-4" />
                      {isRTL ? 'جميع المستخدمين' : 'All Users'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selected" id="selected" />
                    <Label htmlFor="selected" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      {isRTL ? 'مستخدمين محددين' : 'Selected Users'}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* User Selection List */}
              {recipientType === 'selected' && (
                <div className="space-y-3 border rounded-lg p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={isRTL ? 'البحث عن مستخدمين...' : 'Search users...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">
                          {selectedUsers.length} {isRTL ? 'مختار' : 'selected'}
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                          {selectedUsers.length === filteredUsers.length
                            ? (isRTL ? 'إلغاء تحديد الكل' : 'Deselect All')
                            : (isRTL ? 'تحديد الكل' : 'Select All')}
                        </Button>
                      </div>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {filteredUsers.map((u) => (
                            <div
                              key={u.user_id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                              onClick={() => handleUserToggle(u.user_id)}
                            >
                              <Checkbox
                                checked={selectedUsers.includes(u.user_id)}
                                onCheckedChange={() => handleUserToggle(u.user_id)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{u.full_name}</p>
                                <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </div>
              )}

              {/* Email Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">{isRTL ? 'الموضوع' : 'Subject'}</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={isRTL ? 'أدخل موضوع البريد الإلكتروني' : 'Enter email subject'}
                />
              </div>

              {/* Email Content */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  {isRTL ? 'المحتوى (HTML مدعوم)' : 'Content (HTML supported)'}
                </Label>
                <Textarea
                  id="content"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder={isRTL
                    ? 'أدخل محتوى البريد الإلكتروني... استخدم {{name}} لإدراج اسم المستلم'
                    : 'Enter email content... Use {{name}} to insert recipient name'}
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {isRTL
                    ? 'نصيحة: استخدم {{name}} لإدراج اسم المستلم تلقائيًا'
                    : 'Tip: Use {{name}} to automatically insert recipient name'}
                </p>
              </div>

              {/* Preview */}
              {htmlContent && (
                <div className="space-y-2">
                  <Label>{isRTL ? 'معاينة' : 'Preview'}</Label>
                  <div
                    className="border rounded-lg p-4 bg-muted/20 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        htmlContent.replace(/\{\{name\}\}/g, 'Ahmed Mohamed'),
                        {
                          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'a', 'ul', 'ol', 'li', 'div', 'span', 'hr', 'img'],
                          ALLOWED_ATTR: ['href', 'target', 'style', 'class', 'src', 'alt']
                        }
                      )
                    }}
                  />
                </div>
              )}

              <Button onClick={handleSendEmail} disabled={isSending} className="w-full" size="lg">
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isRTL ? 'جاري الإرسال...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {isRTL ? 'إرسال البريد الإلكتروني' : 'Send Email'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── History Tab ── */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <History className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{isRTL ? 'سجل البريد الإلكتروني' : 'Email History'}</CardTitle>
                    <CardDescription>
                      {isRTL ? 'عرض حالة تسليم الرسائل المرسلة' : 'View delivery status of sent emails'}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoadingLogs}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                  {isRTL ? 'تحديث' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{logStats.total}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? 'إجمالي' : 'Total'}</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{logStats.sent}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? 'تم الإرسال' : 'Sent'}</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-destructive">{logStats.failed}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? 'فشل' : 'Failed'}</div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={isRTL ? 'بحث بالبريد أو الموضوع...' : 'Search by email or subject...'}
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'sent', 'failed'] as const).map(f => (
                    <Button
                      key={f}
                      variant={logFilter === f ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLogFilter(f)}
                    >
                      {f === 'all' ? (isRTL ? 'الكل' : 'All') :
                       f === 'sent' ? (isRTL ? 'ناجح' : 'Sent') :
                       (isRTL ? 'فشل' : 'Failed')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Log List */}
              {isLoadingLogs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{isRTL ? 'لا توجد رسائل مسجلة بعد' : 'No email logs yet'}</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        {log.status === 'sent' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium truncate text-sm">
                              {log.recipient_name || log.recipient_email}
                            </p>
                            <Badge variant={
                              log.email_type === 'offer' ? 'default' :
                              log.email_type === 'notification' ? 'secondary' : 'outline'
                            } className="text-xs">
                              {log.email_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{log.subject}</p>
                          <p className="text-xs text-muted-foreground truncate">{log.recipient_email}</p>
                          {log.error_message && (
                            <p className="text-xs text-destructive mt-1 truncate">{log.error_message}</p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(log.created_at), 'MMM d, HH:mm')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
