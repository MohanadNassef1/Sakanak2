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
import { ArrowLeft, Mail, Send, Loader2, Users, User, Search, History, CheckCircle2, XCircle, Clock, RefreshCw, FileText, Sparkles, MessageCircle, Eye, Star, Copy, AtSign } from 'lucide-react';
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

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  rating: number | null;
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

  // Contact submissions state
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [contactFilter, setContactFilter] = useState<'all' | 'feedback' | 'unread' | 'read'>('all');
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const isFeedbackSubmission = (contact: ContactSubmission) => contact.subject.toLowerCase().includes('feedback');
  const unreadContacts = contacts.filter(c => !c.is_read).length;
  const feedbackContacts = contacts.filter(isFeedbackSubmission).length;


  const emailTemplates = [
    {
      id: 'welcome',
      name: isRTL ? 'ترحيب بمستخدم جديد' : 'Welcome New User',
      icon: '👋',
      subject: 'Welcome to Sakanak! | مرحبًا بك في Sakanak!',
      content: `<h2 style="color:#FF7A00;">Welcome to Sakanak, {{name}}! 👋</h2>
<p>Welcome to <strong>Sakanak</strong> – Egypt's first platform specialized in finding rooms and trusted roommates.</p>
<p><strong>We are still in beta.</strong> That means we are improving quickly, listening to your feedback, and keeping Sakanak free for a limited time while we make the experience better.</p>
<p>If you notice anything confusing, missing, or broken, please send us beta feedback. Your notes go directly to the Sakanak dashboard so our team can review them.</p>
<p>Get started now:</p>
<ul>
<li>🔍 Browse available rooms</li>
<li>📝 Complete your profile for better match scores</li>
<li>✅ Verify your identity to earn the trusted badge (+3 match points!)</li>
<li>🎯 Discover your compatibility score with every listing</li>
</ul>
<p>If you have any questions, our support team is always here to help.</p>
<p><a href="https://sakanakeg.com/feedback" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Rate Sakanak (1–10)</a></p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
<div dir="rtl" style="text-align:right;">
<h2 style="color:#FF7A00;">مرحبًا بك في Sakanak يا {{name}}! 👋</h2>
<p>مرحبًا بك في <strong>Sakanak</strong> – منصة متخصصة في إيجاد السكن وزملاء السكن الموثوقين في مصر.</p>
<p><strong>نحن ما زلنا في النسخة التجريبية.</strong> نطوّر المنصة بسرعة، ونستمع لملاحظاتكم، وSakanak مجاني لفترة محدودة أثناء تحسين التجربة.</p>
<p>لو لاحظت أي مشكلة أو عندك اقتراح، ابعتلنا رأيك وسيظهر مباشرة في لوحة التحكم لمراجعته.</p>
<p>ابدأ دلوقتي:</p>
<ul>
<li>🔍 تصفح الغرف المتاحة</li>
<li>📝 كمّل بروفايلك عشان تحصل على نسبة توافق أعلى</li>
<li>✅ وثّق هويتك واحصل على علامة التوثيق (+3 نقاط توافق!)</li>
<li>🎯 اكتشف نسبة توافقك مع كل إعلان</li>
</ul>
<p>لو عندك أي سؤال، فريق الدعم موجود دايمًا.</p>
<p><a href="https://sakanakeg.com/feedback" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Rate Sakanak من 10</a></p>
</div>
<p>The Sakanak Team | فريق Sakanak 🧡</p>`,
    },
    {
      id: 'complete-profile',
      name: isRTL ? 'أكمل ملفك الشخصي' : 'Complete Your Profile',
      icon: '📝',
      subject: 'Complete your profile | أكمل بروفايلك',
      content: `<h2 style="color:#FF7A00;">Hey {{name}}, your profile is incomplete! 📝</h2>
<p>A complete profile boosts your <strong>compatibility match score</strong> and helps you find the perfect roommate faster.</p>
<p>Make sure to add:</p>
<ul>
<li>📸 A clear profile photo (+2 match points)</li>
<li>✍️ A short bio about yourself</li>
<li>🎓 Your occupation & university (+3 match points)</li>
<li>🎭 Personality vibes & living preferences (+5 match points)</li>
</ul>
<p><a href="https://sakanakeg.com/profile" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Complete Profile Now</a></p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
<div dir="rtl" style="text-align:right;">
<h2 style="color:#FF7A00;">يا {{name}}، بروفايلك ناقص! 📝</h2>
<p>البروفايل الكامل بيرفع <strong>نسبة التوافق الذكي</strong> وبيساعدك تلاقي شريك السكن المثالي أسرع.</p>
<p>تأكد إنك ضفت:</p>
<ul>
<li>📸 صورة شخصية واضحة (+2 نقاط توافق)</li>
<li>✍️ نبذة قصيرة عنك</li>
<li>🎓 وظيفتك وجامعتك (+3 نقاط توافق)</li>
<li>🎭 أجواءك وتفضيلات السكن (+5 نقاط توافق)</li>
</ul>
<p><a href="https://sakanakeg.com/profile" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">كمّل بروفايلك الآن</a></p>
</div>
<p>The Sakanak Team | فريق سكنك 🧡</p>`,
    },
    {
      id: 'verify-account',
      name: isRTL ? 'وثّق حسابك' : 'Verify Your Account',
      icon: '✅',
      subject: 'Verify your identity | وثّق هويتك',
      content: `<h2 style="color:#FF7A00;">Verify your account {{name}}! ✅</h2>
<p><strong>Verification is the most important step on Sakanak!</strong> Here's why:</p>
<ul>
<li>🛡️ <strong>Verified badge</strong> — builds instant trust with other users</li>
<li>🎯 <strong>+3 match score points</strong> — boosts your compatibility ranking</li>
<li>⭐ <strong>Priority visibility</strong> — your profile appears higher in results</li>
<li>🔒 <strong>Fraud protection</strong> — protects you and the community from scams</li>
</ul>
<p>Simply upload your <strong>National ID</strong> (for Egyptians) or <strong>Passport</strong> (for foreigners). Review takes just a few hours!</p>
<p><a href="https://sakanakeg.com/verify-identity" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Verify Now</a></p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
<div dir="rtl" style="text-align:right;">
<h2 style="color:#FF7A00;">وثّق حسابك يا {{name}}! ✅</h2>
<p><strong>التوثيق هو أهم خطوة في سكنك!</strong> ليه؟</p>
<ul>
<li>🛡️ <strong>علامة التوثيق</strong> — بتبني ثقة فورية مع المستخدمين</li>
<li>🎯 <strong>+3 نقاط توافق</strong> — بترفع ترتيبك في نظام المطابقة الذكي</li>
<li>⭐ <strong>أولوية في الظهور</strong> — بروفايلك بيظهر أعلى في النتائج</li>
<li>🔒 <strong>حماية من الاحتيال</strong> — بيحميك وبيحمي المجتمع من النصب</li>
</ul>
<p>ارفع صورة <strong>بطاقتك الوطنية</strong> (للمصريين) أو <strong>جواز سفرك</strong> (للأجانب). المراجعة بتتم في ساعات!</p>
<p><a href="https://sakanakeg.com/verify-identity" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">وثّق حسابك الآن</a></p>
</div>
<p>The Sakanak Team | فريق سكنك 🧡</p>`,
    },
    {
      id: 'how-it-works',
      name: isRTL ? 'كيف يعمل سكنك' : 'How Sakanak Works',
      icon: '📖',
      subject: 'How Sakanak Works | كيف يعمل سكنك',
      content: `<h2 style="color:#FF7A00;">Learn How Sakanak Works! 📖</h2>
<p>Hey {{name}}, here's a quick guide to get the most out of Sakanak:</p>

<h3 style="color:#1F2937;">🔐 Step 1: Verify Your Identity</h3>
<p>Upload your National ID or Passport to earn the <strong style="color:#FF7A00;">Verified Badge ✓</strong>. Verified users get <strong>+3 compatibility points</strong> and are trusted by everyone on the platform.</p>

<h3 style="color:#1F2937;">📋 Step 2: Complete Your Profile</h3>
<p>Add your photo, occupation, university, and personality vibes. A complete profile means <strong>more accurate match scores</strong> and better roommate recommendations.</p>

<h3 style="color:#1F2937;">🎯 Step 3: Discover Your Match Score</h3>
<p>Sakanak calculates your compatibility with each listing based on nationality, age, university, personality, lifestyle, and verification status. Look for the <strong>colored match arc</strong> on each room card!</p>

<h3 style="color:#1F2937;">🏠 Step 4: Browse & Book Viewings</h3>
<p>Find rooms that match your preferences, book viewings directly, and meet hosts in person. The entire process is <strong>100% free</strong>!</p>

<p><a href="https://sakanakeg.com/how-it-works" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Read Full Guide</a></p>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">

<div dir="rtl" style="text-align:right;">
<h2 style="color:#FF7A00;">اعرف إزاي سكنك بيشتغل! 📖</h2>
<p>يا {{name}}، دليل سريع عشان تستفيد من سكنك بأقصى شكل:</p>

<h3 style="color:#1F2937;">🔐 الخطوة 1: وثّق هويتك</h3>
<p>ارفع بطاقتك الوطنية أو جواز سفرك واحصل على <strong style="color:#FF7A00;">علامة التوثيق ✓</strong>. الحسابات الموثقة بتحصل على <strong>+3 نقاط توافق</strong> وبتكسب ثقة كل المستخدمين.</p>

<h3 style="color:#1F2937;">📋 الخطوة 2: كمّل بروفايلك</h3>
<p>أضف صورتك، وظيفتك، جامعتك، وأجواءك. البروفايل الكامل معناه <strong>نسبة توافق أدق</strong> وتوصيات أفضل لزملاء السكن.</p>

<h3 style="color:#1F2937;">🎯 الخطوة 3: اكتشف نسبة التوافق</h3>
<p>سكنك بيحسب توافقك مع كل إعلان بناءً على الجنسية، العمر، الجامعة، الشخصية، أسلوب الحياة، والتوثيق. دوّر على <strong>دائرة التوافق الملونة</strong> على كل كارت غرفة!</p>

<h3 style="color:#1F2937;">🏠 الخطوة 4: تصفح واحجز معاينة</h3>
<p>لاقي غرف تناسب تفضيلاتك، احجز معاينات مباشرة، وقابل المؤجرين شخصيًا. كل ده <strong>مجاني 100%</strong>!</p>

<p><a href="https://sakanakeg.com/how-it-works" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">اقرأ الدليل الكامل</a></p>
</div>

<p>The Sakanak Team | فريق سكنك 🧡</p>`,
    },
    {
      id: 'new-rooms',
      name: isRTL ? 'غرف جديدة متاحة' : 'New Rooms Available',
      icon: '🏠',
      subject: 'New rooms on Sakanak! | غرف جديدة على سكنك!',
      content: `<h2 style="color:#FF7A00;">New Rooms Available! 🏠</h2>
<p>Hey {{name}}, new rooms have been added to Sakanak that might be perfect for you.</p>
<p>Browse the latest rooms and check your <strong>compatibility match score</strong> with each listing!</p>
<p><a href="https://sakanakeg.com/rooms" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Browse Rooms</a></p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
<div dir="rtl" style="text-align:right;">
<h2 style="color:#FF7A00;">غرف جديدة متاحة! 🏠</h2>
<p>يا {{name}}، في غرف جديدة اتضافت على سكنك ممكن تناسبك.</p>
<p>تصفح الغرف الجديدة وشوف <strong>نسبة توافقك</strong> مع كل إعلان!</p>
<p><a href="https://sakanakeg.com/rooms" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">تصفح الغرف</a></p>
</div>
<p>The Sakanak Team | فريق سكنك 🧡</p>`,
    },
    {
      id: 'special-offer',
      name: isRTL ? 'عرض خاص' : 'Special Offer',
      icon: '🎉',
      subject: 'Special offer from Sakanak! | عرض خاص من سكنك!',
      content: `<h2 style="color:#FF7A00;">Special offer for you {{name}}! 🎉</h2>
<p>[Write your offer details here]</p>
<p>This offer is available for a limited time only!</p>
<p><a href="https://sakanakeg.com" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Claim Offer</a></p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
<div dir="rtl" style="text-align:right;">
<h2 style="color:#FF7A00;">عرض خاص ليك يا {{name}}! 🎉</h2>
<p>[اكتب تفاصيل العرض هنا]</p>
<p>العرض ده متاح لفترة محدودة، استغله دلوقتي!</p>
<p><a href="https://sakanakeg.com" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">استفد من العرض</a></p>
</div>
<p>The Sakanak Team | فريق سكنك 🧡</p>`,
    },
    {
      id: 'maintenance',
      name: isRTL ? 'إشعار صيانة' : 'Maintenance Notice',
      icon: '🔧',
      subject: 'Scheduled maintenance | صيانة مجدولة',
      content: `<h2 style="color:#FF7A00;">Scheduled Maintenance Notice 🔧</h2>
<p>Hey {{name}},</p>
<p>We'd like to inform you about upcoming scheduled maintenance:</p>
<ul>
<li>📅 <strong>Date:</strong> [Enter date]</li>
<li>🕐 <strong>Time:</strong> [Enter time]</li>
<li>⏱️ <strong>Expected Duration:</strong> [Enter duration]</li>
</ul>
<p>During maintenance, some services may be temporarily unavailable. We'll be back better than ever! 💪</p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
<div dir="rtl" style="text-align:right;">
<h2 style="color:#FF7A00;">إشعار صيانة مجدولة 🔧</h2>
<p>يا {{name}}،</p>
<p>نحب نعلمك إن هيكون فيه صيانة مجدولة على المنصة:</p>
<ul>
<li>📅 <strong>التاريخ:</strong> [اكتب التاريخ]</li>
<li>🕐 <strong>الوقت:</strong> [اكتب الوقت]</li>
<li>⏱️ <strong>المدة المتوقعة:</strong> [اكتب المدة]</li>
</ul>
<p>خلال الصيانة، ممكن بعض الخدمات تكون مش متاحة مؤقتًا. هنرجع أحسن من الأول! 💪</p>
</div>
<p>The Sakanak Team | فريق سكنك 🧡</p>`,
    },
    {
      id: 'platform-update',
      name: isRTL ? 'تحديث المنصة' : 'Platform Update',
      icon: '🚀',
      subject: "What's new on Sakanak! | جديد على سكنك! 🚀",
      content: `<h2 style="color:#FF7A00;">What's New on Sakanak! 🚀</h2>
<p>Hey {{name}}, we've got exciting news!</p>
<p>We've added new features to the platform:</p>
<ul>
<li>✨ [New feature 1]</li>
<li>✨ [New feature 2]</li>
<li>✨ [New feature 3]</li>
</ul>
<p>Try them out now and let us know what you think!</p>
<p><a href="https://sakanakeg.com" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Explore Now</a></p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
<div dir="rtl" style="text-align:right;">
<h2 style="color:#FF7A00;">تحديثات جديدة على سكنك! 🚀</h2>
<p>يا {{name}}، عندنا أخبار حلوة!</p>
<p>أضفنا مميزات جديدة على المنصة:</p>
<ul>
<li>✨ [ميزة جديدة 1]</li>
<li>✨ [ميزة جديدة 2]</li>
<li>✨ [ميزة جديدة 3]</li>
</ul>
<p>جربها دلوقتي وقولنا رأيك!</p>
<p><a href="https://sakanakeg.com" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">اكتشف الجديد</a></p>
</div>
<p>The Sakanak Team | فريق سكنك 🧡</p>`,
    },
    {
      id: 'safety-reminder',
      name: isRTL ? 'تذكير بالسلامة' : 'Safety Reminder',
      icon: '🛡️',
      subject: 'Safety tips | نصائح أمان من سكنك',
      content: `<h2 style="color:#FF7A00;">Your Safety is Our Priority 🛡️</h2>
<p>Hey {{name}},</p>
<p>We'd like to remind you of some important safety tips:</p>
<ul>
<li>🔒 Don't share personal info before verification</li>
<li>🏠 Always meet in public places first for viewings</li>
<li>💳 Never transfer money before seeing the place yourself</li>
<li>📸 If something doesn't match the photos, report it immediately</li>
<li>✅ Only deal with <strong>verified users</strong> for maximum safety</li>
</ul>
<p><a href="https://sakanakeg.com/safety" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Read More Safety Tips</a></p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
<div dir="rtl" style="text-align:right;">
<h2 style="color:#FF7A00;">سلامتك أولويتنا 🛡️</h2>
<p>يا {{name}}،</p>
<p>حابين نفكرك ببعض نصائح الأمان المهمة:</p>
<ul>
<li>🔒 متشاركش بياناتك الشخصية قبل التوثيق</li>
<li>🏠 خلي المعاينات دايمًا في أماكن عامة الأول</li>
<li>💳 متحولش فلوس قبل ما تشوف المكان بنفسك</li>
<li>📸 لو لاقيت حاجة مش مطابقة للصور، بلّغنا فورًا</li>
<li>✅ تعامل مع <strong>المستخدمين الموثقين</strong> فقط لأقصى أمان</li>
</ul>
<p><a href="https://sakanakeg.com/safety" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">اقرأ المزيد عن السلامة</a></p>
</div>
<p>The Sakanak Team | فريق سكنك 🧡</p>`,
    },
    {
      id: 'feedback',
      name: isRTL ? 'طلب تقييم' : 'Feedback Request',
      icon: '💬',
      subject: 'We value your feedback | رأيك يهمنا!',
      content: `<h2 style="color:#FF7A00;">We Value Your Feedback! 💬</h2>
<p>Hey {{name}},</p>
<p>We'd love to hear about your experience on Sakanak. What did you enjoy and what can we improve?</p>
<p>Your feedback helps us build a better platform for everyone.</p>
<p><a href="https://sakanakeg.com/feedback" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Rate Sakanak (1&ndash;10)</a></p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
<div dir="rtl" style="text-align:right;">
<h2 style="color:#FF7A00;">رأيك يهمنا! 💬</h2>
<p>يا {{name}}،</p>
<p>نحب نسمع رأيك عن تجربتك على سكنك. إيه اللي عجبك وإيه اللي ممكن نحسنه؟</p>
<p>ردك بيساعدنا نطور المنصة ونخليها أحسن ليك ولكل المستخدمين.</p>
<p><a href="https://sakanakeg.com/feedback" style="display:inline-block;background:#FF7A00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">قيّم سكنك من 10</a></p>
</div>
<p>The Sakanak Team | فريق سكنك 🧡</p>`,
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

  const fetchContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setContacts((data as ContactSubmission[]) || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contact messages');
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const markContactRead = async (id: string) => {
    try {
      await supabase
        .from('contact_submissions')
        .update({ is_read: true } as any)
        .eq('id', id);
      setContacts(prev => prev.map(c => c.id === id ? { ...c, is_read: true } : c));
    } catch (error) {
      console.error('Error marking contact as read:', error);
    }
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = !contactSearch ||
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.subject.toLowerCase().includes(contactSearch.toLowerCase());
    const matchesFilter = contactFilter === 'all' ||
      (contactFilter === 'feedback' && isFeedbackSubmission(c)) ||
      (contactFilter === 'unread' && !c.is_read) ||
      (contactFilter === 'read' && c.is_read);
    return matchesSearch && matchesFilter;
  });


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

      <Tabs defaultValue="compose" onValueChange={(v) => { if (v === 'history') fetchLogs(); if (v === 'contacts') fetchContacts(); }}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            {isRTL ? 'إرسال بريد' : 'Compose'}
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {isRTL ? 'رسائل التواصل' : 'Contact Messages'}
            {unreadContacts > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-[20px]">{unreadContacts}</Badge>
            )}
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

              {/* Email Templates */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {isRTL ? 'اختر قالب' : 'Choose a Template'}
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {emailTemplates.map(tpl => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => applyTemplate(tpl.id)}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                    >
                      <span className="text-xl">{tpl.icon}</span>
                      <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {tpl.name}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'اضغط على قالب لتعبئة المحتوى، ثم عدّل عليه كما تريد' : 'Click a template to fill content, then edit as needed'}
                </p>
              </div>


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
                  <div className="border rounded-lg overflow-hidden bg-[#f4f4f5]">
                    <iframe
                      title="Email Preview"
                      sandbox=""
                      srcDoc={(() => {
                        const BRAND_COLOR = '#FF7A00';
                        const TEXT_PRIMARY = '#1a1a1a';
                        const TEXT_SECONDARY = '#555555';
                        const TEXT_MUTED = '#888888';
                        const TEXT_FOOTER = '#aaaaaa';
                        const BG_WHITE = '#ffffff';
                        const BG_LIGHT = '#f9fafb';
                        const BORDER_LIGHT = '#e5e7eb';
                        const LOGO_URL = 'https://lmjivfayjyskriikcyzg.supabase.co/storage/v1/object/public/email-assets/sakanak-logo-transparent.png';

                        const previewBody = DOMPurify.sanitize(
                          htmlContent.replace(/\{\{name\}\}/g, 'Ahmed Mohamed'),
                          {
                            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'a', 'ul', 'ol', 'li', 'div', 'span', 'hr', 'img'],
                            ALLOWED_ATTR: ['href', 'target', 'style', 'class', 'src', 'alt']
                          }
                        );

                        return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>* { box-sizing: border-box; } body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }</style>
</head><body>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f5;">
<tr><td align="center" style="padding: 24px 16px;">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BG_WHITE}; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); max-width: 100%;">
  <tr><td align="center" style="padding: 32px 40px 24px 40px; border-bottom: 1px solid ${BORDER_LIGHT};">
    <img src="${LOGO_URL}" alt="Sakanak" width="180" style="display: block; margin: 0 auto; max-width: 180px; height: auto;" />
    <p style="margin: 8px 0 0 0; font-size: 13px; color: ${TEXT_MUTED}; letter-spacing: 0.5px;">سكنك</p>
  </td></tr>
  <tr><td style="padding: 32px 40px;">
    <div style="font-size: 16px; line-height: 1.6; color: ${TEXT_SECONDARY};">${previewBody}</div>
  </td></tr>
  <tr><td style="padding: 24px 40px; background-color: ${BG_LIGHT}; border-top: 1px solid ${BORDER_LIGHT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center">
        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: ${TEXT_PRIMARY};">Sakanak</p>
        <p style="margin: 0 0 4px 0; font-size: 12px; color: ${TEXT_FOOTER};">Find Rooms & Roommates in Egypt</p>
        <p style="margin: 0 0 12px 0; font-size: 12px; color: ${TEXT_FOOTER};">لاقي سكنك المثالي في مصر</p>
        <p style="margin: 0 0 4px 0;"><a href="https://sakanakeg.com" style="font-size: 12px; color: ${BRAND_COLOR}; text-decoration: none;">sakanakeg.com</a></p>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: ${TEXT_FOOTER};">Need help? Contact us at <a href="mailto:support@sakanakeg.com" style="color: ${BRAND_COLOR}; text-decoration: none;">support@sakanakeg.com</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
                      })()}
                      style={{ width: '100%', height: '600px', border: 'none' }}
                    />
                  </div>
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

        {/* ── Contact Messages Tab ── */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{isRTL ? 'رسائل نموذج التواصل' : 'Contact Form Messages'}</CardTitle>
                    <CardDescription>
                      {isRTL ? 'الرسائل المرسلة من صفحة التواصل' : 'Messages submitted via the contact page'}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchContacts} disabled={isLoadingContacts}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingContacts ? 'animate-spin' : ''}`} />
                  {isRTL ? 'تحديث' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{contacts.length}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? 'إجمالي' : 'Total'}</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{feedbackContacts}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? 'ملاحظات' : 'Feedback'}</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{unreadContacts}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? 'غير مقروء' : 'Unread'}</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{contacts.length - unreadContacts}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? 'مقروء' : 'Read'}</div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={isRTL ? 'بحث بالاسم أو البريد أو الموضوع...' : 'Search by name, email, or subject...'}
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'feedback', 'unread', 'read'] as const).map(f => (
                    <Button
                      key={f}
                      variant={contactFilter === f ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setContactFilter(f)}
                    >
                      {f === 'all' ? (isRTL ? 'الكل' : 'All') :
                       f === 'feedback' ? (isRTL ? 'الملاحظات' : 'Feedback') :
                       f === 'unread' ? (isRTL ? 'غير مقروء' : 'Unread') :
                       (isRTL ? 'مقروء' : 'Read')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Contact List */}
              {isLoadingContacts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{isRTL ? 'لا توجد رسائل بعد' : 'No contact messages yet'}</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`border rounded-lg transition-colors ${!contact.is_read ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/30'}`}
                      >
                        <div
                          className="flex items-start gap-3 p-3 cursor-pointer"
                          onClick={() => {
                            setExpandedContact(expandedContact === contact.id ? null : contact.id);
                            if (!contact.is_read) markContactRead(contact.id);
                          }}
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!contact.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`font-medium truncate text-sm ${!contact.is_read ? 'font-semibold' : ''}`}>
                                {contact.name}
                              </p>
                              {!contact.is_read && (
                                <Badge variant="default" className="text-xs bg-primary">
                                  {isRTL ? 'جديد' : 'New'}
                                </Badge>
                              )}
                              {isFeedbackSubmission(contact) && (
                                <Badge variant="secondary" className="text-xs">
                                  {isRTL ? 'ملاحظات Beta' : 'Beta Feedback'}
                                </Badge>
                              )}
                              {contact.rating != null && (
                                <span
                                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    contact.rating >= 8
                                      ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                                      : contact.rating >= 5
                                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                      : 'bg-red-500/15 text-red-600 dark:text-red-400'
                                  }`}
                                >
                                  <Star className="w-3 h-3 fill-current" />
                                  {contact.rating}/10
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium truncate">{contact.subject}</p>
                            <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(contact.created_at), 'MMM d, HH:mm')}
                            </div>
                          </div>
                        </div>
                        {expandedContact === contact.id && (
                          <div className="px-3 pb-3 border-t mx-3 pt-3 space-y-3">
                            {/* From section — clear sender identity for moderators */}
                            <div className="rounded-lg border bg-card p-3">
                              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                {isRTL ? 'من' : 'From'}
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="font-medium text-sm break-all">
                                    {DOMPurify.sanitize(contact.name, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(contact.name);
                                      toast.success(isRTL ? 'تم النسخ' : 'Copied');
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <AtSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <a
                                    href={`mailto:${contact.email}`}
                                    className="text-sm text-primary hover:underline break-all"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {contact.email}
                                  </a>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(contact.email);
                                      toast.success(isRTL ? 'تم نسخ البريد' : 'Email copied');
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                {contact.rating != null && (
                                  <div className="pt-2">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-xs text-muted-foreground">
                                        {isRTL ? 'التقييم (من 10):' : 'Rating (out of 10):'}
                                      </span>
                                      <span
                                        className={`text-sm font-bold ${
                                          contact.rating >= 8
                                            ? 'text-green-600 dark:text-green-400'
                                            : contact.rating >= 5
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : 'text-red-600 dark:text-red-400'
                                        }`}
                                      >
                                        {contact.rating}/10
                                      </span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${
                                          contact.rating >= 8
                                            ? 'bg-green-500'
                                            : contact.rating >= 5
                                            ? 'bg-amber-500'
                                            : 'bg-red-500'
                                        }`}
                                        style={{ width: `${contact.rating * 10}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Full sanitized message */}
                            <div>
                              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                {isRTL ? 'الرسالة الكاملة' : 'Full message'}
                              </div>
                              <div className="bg-muted/50 rounded-lg p-4 border">
                                <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
                                  {DOMPurify.sanitize(contact.message, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              <Button size="sm" variant="default" asChild>
                                <a
                                  href={`mailto:${contact.email}?subject=${encodeURIComponent(
                                    `Re: ${contact.subject}`
                                  )}&body=${encodeURIComponent(
                                    `Hi ${contact.name},\n\nThank you for your feedback${
                                      contact.rating != null ? ` (${contact.rating}/10)` : ''
                                    } — it really helps us improve Sakanak.\n\n\n— The Sakanak Team`
                                  )}`}
                                >
                                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                                  {isRTL ? 'رد على المستخدم' : 'Reply to user'}
                                </a>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(contact.message);
                                  toast.success(isRTL ? 'تم نسخ الرسالة' : 'Message copied');
                                }}
                              >
                                <Copy className="h-3.5 w-3.5 mr-1.5" />
                                {isRTL ? 'نسخ الرسالة' : 'Copy message'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
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
