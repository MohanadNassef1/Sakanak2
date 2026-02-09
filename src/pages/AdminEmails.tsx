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
import { toast } from 'sonner';
import { ArrowLeft, Mail, Send, Loader2, Users, User, Search } from 'lucide-react';

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
}

export default function AdminEmails() {
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'selected'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate]);

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

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
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
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('send-broadcast-email', {
        body: {
          subject,
          htmlContent,
          recipientType,
          selectedUserIds: recipientType === 'selected' ? selectedUsers : undefined,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      if (result.success) {
        toast.success(
          isRTL 
            ? `تم إرسال ${result.sent} رسالة بنجاح` 
            : `Successfully sent ${result.sent} emails`
        );
        
        if (result.failed > 0) {
          toast.warning(
            isRTL 
              ? `فشل إرسال ${result.failed} رسالة` 
              : `Failed to send ${result.failed} emails`
          );
        }

        // Reset form
        setSubject('');
        setHtmlContent('');
        setSelectedUsers([]);
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/users')}
        className="mb-6"
      >
        <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
        {isRTL ? 'العودة للمستخدمين' : 'Back to Users'}
      </Button>

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
                  : 'Send email updates to all users or selected users'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Recipients Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              {isRTL ? 'المستلمون' : 'Recipients'}
            </Label>
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
                dangerouslySetInnerHTML={{ __html: htmlContent.replace('{{name}}', 'Ahmed Mohamed') }}
              />
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={handleSendEmail}
            disabled={isSending}
            className="w-full"
            size="lg"
          >
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
    </div>
  );
}
