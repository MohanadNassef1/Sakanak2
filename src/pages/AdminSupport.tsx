import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Headphones, Send, MessageCircle, User, ShieldCheck, ArrowLeft, Phone, Mail, MapPin, GraduationCap, Briefcase, Eye, CheckCircle, XCircle, Globe, Paperclip, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SupportConvo {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
  last_message_at: string | null;
}

interface SupportMsg {
  id: string;
  conversation_id: string;
  sender_id: string;
  is_admin: boolean;
  content: string;
  attachment_url: string | null;
  read_at: string | null;
  created_at: string;
}

const AdminSupport = () => {
  const { language, isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedConvo, setSelectedConvo] = useState<SupportConvo | null>(null);
  const [messages, setMessages] = useState<SupportMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check admin
  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Fetch conversations
  const { data: conversations = [], isLoading: loadingConvos } = useQuery({
    queryKey: ['admin-support-conversations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('support_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });
      return (data || []) as SupportConvo[];
    },
    enabled: !!isAdmin,
    refetchInterval: 10000,
  });

  // Fetch full user profiles for conversation list
  const { data: userProfiles = {} } = useQuery({
    queryKey: ['support-user-profiles', conversations.map(c => c.user_id)],
    queryFn: async () => {
      const userIds = [...new Set(conversations.map(c => c.user_id))];
      if (userIds.length === 0) return {};
      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, email, phone, whatsapp, gender, age, nationality, occupation, university, job_title, about, looking_for, verification_status, is_smoker, has_pets, pet_type, personality_tags, created_at')
        .in('user_id', userIds);
      const map: Record<string, any> = {};
      data?.forEach(p => { map[p.user_id] = p; });
      return map;
    },
    enabled: conversations.length > 0,
  });

  // Fetch messages when conversation selected
  const fetchMessages = useCallback(async (convoId: string) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: true });
    setMessages((data || []) as SupportMsg[]);
  }, []);

  useEffect(() => {
    if (selectedConvo) fetchMessages(selectedConvo.id);
  }, [selectedConvo, fetchMessages]);

  // Realtime for messages
  useEffect(() => {
    if (!selectedConvo) return;
    const channel = supabase
      .channel(`admin-support-${selectedConvo.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `conversation_id=eq.${selectedConvo.id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as SupportMsg]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConvo?.id]);

  // Realtime for new conversations
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel('admin-support-convos')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_conversations',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-support-conversations'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, queryClient]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && !pendingFile) || !selectedConvo || !user?.id || sending) return;
    setSending(true);
    let attachmentUrl: string | null = null;
    const fileToSend = pendingFile;
    const text = input.trim();

    if (fileToSend) {
      const ext = fileToSend.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `admin/${selectedConvo.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('support-attachments')
        .upload(path, fileToSend, { contentType: fileToSend.type, upsert: false });
      if (upErr) {
        console.error('Upload error', upErr);
        setSending(false);
        return;
      }
      attachmentUrl = supabase.storage.from('support-attachments').getPublicUrl(path).data.publicUrl;
    }

    await supabase
      .from('support_messages')
      .insert({
        conversation_id: selectedConvo.id,
        sender_id: user.id,
        is_admin: true,
        content: text || (attachmentUrl ? '📷 Photo' : ''),
        attachment_url: attachmentUrl,
      });
    setInput('');
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    setSending(false);
  };

  const handleAdminFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) return;
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const clearAdminPending = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
  };

  const handleCloseConvo = async (convoId: string) => {
    await supabase
      .from('support_conversations')
      .update({ status: 'closed' })
      .eq('id', convoId);
    queryClient.invalidateQueries({ queryKey: ['admin-support-conversations'] });
    if (selectedConvo?.id === convoId) setSelectedConvo(null);
  };

  if (authLoading || checkingAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><Skeleton className="h-10 w-40" /></div>;
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Headphones className="w-7 h-7 text-green-600" />
          <h1 className="text-2xl font-bold">
            {language === 'ar' ? 'دعم العملاء' : 'Customer Support'}
          </h1>
          <Badge variant="secondary">{conversations.filter(c => c.status === 'open').length} open</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-250px)]">
          {/* Conversation List */}
          <Card className="md:col-span-1 overflow-hidden flex flex-col">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm font-medium">
                {language === 'ar' ? 'المحادثات' : 'Conversations'}
              </CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-y-auto">
              {loadingConvos ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  {language === 'ar' ? 'لا توجد محادثات' : 'No conversations yet'}
                </div>
              ) : (
                conversations.map(convo => {
                  const profile = userProfiles[convo.user_id];
                  return (
                    <button
                      key={convo.id}
                      onClick={() => setSelectedConvo(convo)}
                      className={cn(
                        'w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors',
                        selectedConvo?.id === convo.id && 'bg-muted'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {profile?.full_name || 'User'}
                        </p>
                        <Badge variant={convo.status === 'open' ? 'default' : 'secondary'} className="text-[10px]">
                          {convo.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {profile?.email || convo.user_id.slice(0, 8)}
                      </p>
                      {convo.last_message_at && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {format(new Date(convo.last_message_at), 'MMM d, HH:mm')}
                        </p>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 overflow-hidden flex flex-col">
            {!selectedConvo ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">{language === 'ar' ? 'اختر محادثة' : 'Select a conversation'}</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 md:hidden"
                      onClick={() => setSelectedConvo(null)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Sheet open={showProfile} onOpenChange={setShowProfile}>
                      <SheetTrigger asChild>
                        <button className="flex items-center gap-2 hover:bg-muted/50 rounded-lg px-2 py-1 -mx-2 transition-colors cursor-pointer text-left">
                          {userProfiles[selectedConvo.user_id]?.avatar_url ? (
                            <img 
                              src={userProfiles[selectedConvo.user_id].avatar_url} 
                              alt="" 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm flex items-center gap-1.5">
                              {userProfiles[selectedConvo.user_id]?.full_name || 'User'}
                              {userProfiles[selectedConvo.user_id]?.verification_status === 'verified' && (
                                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {language === 'ar' ? 'اضغط لعرض الملف الشخصي' : 'Click to view profile'}
                            </p>
                          </div>
                          <Eye className="w-4 h-4 text-muted-foreground ml-1" />
                        </button>
                      </SheetTrigger>
                      <SheetContent side={isRTL ? 'left' : 'right'} className="w-[380px] sm:w-[420px] overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>{language === 'ar' ? 'ملف المستخدم' : 'User Profile'}</SheetTitle>
                        </SheetHeader>
                        {(() => {
                          const p = userProfiles[selectedConvo.user_id];
                          if (!p) return <p className="text-sm text-muted-foreground mt-4">No profile data</p>;
                          return (
                            <div className="mt-4 space-y-5">
                              {/* Avatar & Name */}
                              <div className="flex items-center gap-3">
                                {p.avatar_url ? (
                                  <img src={p.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                                ) : (
                                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                                    <User className="w-7 h-7 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-lg">{p.full_name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <Badge variant={p.verification_status === 'verified' ? 'default' : 'secondary'} className="text-[10px]">
                                      {p.verification_status || 'unverified'}
                                    </Badge>
                                    {p.gender && (
                                      <span className="text-xs text-muted-foreground capitalize">{p.gender}</span>
                                    )}
                                    {p.age && (
                                      <span className="text-xs text-muted-foreground">{p.age} yrs</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Contact Info */}
                              <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                  {language === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
                                </p>
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <span className="truncate">{p.email}</span>
                                </div>
                                {p.phone && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <a href={`tel:${p.phone}`} className="text-primary hover:underline">{p.phone}</a>
                                  </div>
                                )}
                                {p.whatsapp && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <MessageCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <a href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                      {p.whatsapp}
                                    </a>
                                  </div>
                                )}
                              </div>

                              {/* Personal Info */}
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                  {language === 'ar' ? 'معلومات شخصية' : 'Personal Info'}
                                </p>
                                {p.nationality && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Globe className="w-4 h-4 text-muted-foreground" />
                                    <span>{p.nationality}</span>
                                  </div>
                                )}
                                {p.occupation && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                                    <span>{p.occupation}{p.job_title ? ` — ${p.job_title}` : ''}</span>
                                  </div>
                                )}
                                {p.university && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                                    <span>{p.university}</span>
                                  </div>
                                )}
                                {p.is_smoker !== null && (
                                  <div className="flex items-center gap-2 text-sm">
                                    {p.is_smoker ? '🚬' : '🚭'}
                                    <span>{p.is_smoker ? 'Smoker' : 'Non-smoker'}</span>
                                  </div>
                                )}
                                {p.has_pets && (
                                  <div className="flex items-center gap-2 text-sm">
                                    🐾 <span>{p.pet_type || 'Has pets'}</span>
                                  </div>
                                )}
                              </div>

                              {/* About */}
                              {p.about && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                    {language === 'ar' ? 'نبذة' : 'About'}
                                  </p>
                                  <p className="text-sm text-foreground">{p.about}</p>
                                </div>
                              )}

                              {/* Looking For */}
                              {p.looking_for && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                    {language === 'ar' ? 'يبحث عن' : 'Looking for'}
                                  </p>
                                  <p className="text-sm text-foreground">{p.looking_for}</p>
                                </div>
                              )}

                              {/* Personality Tags */}
                              {p.personality_tags?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                    {language === 'ar' ? 'الاهتمامات' : 'Vibes'}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {p.personality_tags.map((tag: string) => (
                                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Joined Date */}
                              <p className="text-xs text-muted-foreground pt-2 border-t">
                                {language === 'ar' ? 'انضم في' : 'Joined'}{' '}
                                {format(new Date(p.created_at), 'MMM d, yyyy')}
                              </p>

                              {/* View Full Profile Button */}
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                  setShowProfile(false);
                                  navigate(`/admin/user/${selectedConvo.user_id}`);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                {language === 'ar' ? 'عرض الملف الكامل' : 'View Full Admin Profile'}
                              </Button>
                            </div>
                          );
                        })()}
                      </SheetContent>
                    </Sheet>
                  </div>
                  {selectedConvo.status === 'open' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCloseConvo(selectedConvo.id)}
                    >
                      {language === 'ar' ? 'إغلاق' : 'Close'}
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => {
                    const fromAdmin = msg.is_admin;
                    const isAiContext = msg.content.startsWith('--- AI Chat History ---');
                    
                    if (isAiContext) {
                      // Parse and render AI chat history as a styled block
                      const lines = msg.content
                        .replace('--- AI Chat History ---', '')
                        .replace('--- End of AI Chat ---', '')
                        .trim()
                        .split('\n\n')
                        .filter(l => l.trim());
                      
                      return (
                        <div key={msg.id} className="mx-2 my-3">
                          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                              🤖 {language === 'ar' ? 'محادثة المستخدم مع المساعد الذكي' : 'User\'s AI Chat History'}
                            </p>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {lines.map((line, i) => {
                                const isUserLine = line.startsWith('👤 User:');
                                const content = line.replace(/^(👤 User:|🤖 AI):?\s*/, '');
                                return (
                                  <div key={i} className={cn('flex gap-2', isUserLine ? 'justify-end' : 'justify-start')}>
                                    <div className={cn(
                                      'max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs',
                                      isUserLine 
                                        ? 'bg-primary/10 text-foreground' 
                                        : 'bg-background text-foreground border border-border'
                                    )}>
                                      <span className="font-medium text-[10px] text-muted-foreground block mb-0.5">
                                        {isUserLine ? '👤 User' : '🤖 AI'}
                                      </span>
                                      {content}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={msg.id} className={cn('flex gap-2', fromAdmin ? 'justify-end' : 'justify-start')}>
                        {!fromAdmin && (
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className={cn(
                            'max-w-sm rounded-2xl px-3.5 py-2.5 text-sm',
                            fromAdmin
                              ? 'bg-green-600 text-white rounded-br-md'
                              : 'bg-muted text-foreground rounded-bl-md'
                          )}>
                            {msg.content}
                          </div>
                          <p className={cn('text-[10px] text-muted-foreground mt-0.5', fromAdmin ? 'text-right' : 'text-left')}>
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </p>
                        </div>
                        {fromAdmin && (
                          <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                            <ShieldCheck className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Input */}
                {selectedConvo.status === 'open' && (
                  <div className="border-t p-3">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder={language === 'ar' ? 'اكتب ردك...' : 'Type your reply...'}
                        disabled={sending}
                        className="flex-1 text-sm"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                      <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        className="h-10 w-10 bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminSupport;
