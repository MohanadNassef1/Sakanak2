import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MessageSquare, Users, Bot, User as UserIcon, Search, Sparkles, Home } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

type LogRow = {
  id: string;
  user_id: string | null;
  chat_type: 'finder' | 'lister';
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  language: string | null;
  created_at: string;
};

type ProfileLite = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

const AdminAIChats: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isRTL } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'finder' | 'lister'>('all');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Admin check
  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      return Boolean(data);
    },
    enabled: !!user,
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ['ai-chat-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_chat_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000);
      if (error) throw error;
      return (data || []) as LogRow[];
    },
    enabled: !!isAdmin,
  });

  const userIds = useMemo(
    () => Array.from(new Set((logs || []).map(l => l.user_id).filter(Boolean))) as string[],
    [logs]
  );

  const { data: profiles } = useQuery({
    queryKey: ['ai-chat-profiles', userIds.join(',')],
    queryFn: async () => {
      if (userIds.length === 0) return {};
      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, email')
        .in('user_id', userIds);
      const map: Record<string, ProfileLite> = {};
      (data || []).forEach((p: any) => { map[p.user_id] = p; });
      return map;
    },
    enabled: userIds.length > 0,
  });

  // Group by session
  const sessions = useMemo(() => {
    const map = new Map<string, { sessionId: string; userId: string | null; chatType: 'finder' | 'lister'; messages: LogRow[]; lastAt: string; firstAt: string }>();
    (logs || []).forEach(l => {
      const existing = map.get(l.session_id);
      if (existing) {
        existing.messages.push(l);
        if (l.created_at > existing.lastAt) existing.lastAt = l.created_at;
        if (l.created_at < existing.firstAt) existing.firstAt = l.created_at;
      } else {
        map.set(l.session_id, {
          sessionId: l.session_id,
          userId: l.user_id,
          chatType: l.chat_type,
          messages: [l],
          lastAt: l.created_at,
          firstAt: l.created_at,
        });
      }
    });
    const arr = Array.from(map.values());
    arr.forEach(s => s.messages.sort((a, b) => a.created_at.localeCompare(b.created_at)));
    arr.sort((a, b) => b.lastAt.localeCompare(a.lastAt));
    return arr;
  }, [logs]);

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sessions.filter(s => {
      if (filterType !== 'all' && s.chatType !== filterType) return false;
      if (!q) return true;
      const profile = s.userId ? profiles?.[s.userId] : null;
      const name = (profile?.full_name || '').toLowerCase();
      const email = (profile?.email || '').toLowerCase();
      const content = s.messages.map(m => m.content).join(' ').toLowerCase();
      return name.includes(q) || email.includes(q) || content.includes(q) || s.sessionId.includes(q);
    });
  }, [sessions, search, filterType, profiles]);

  const stats = useMemo(() => {
    const uniqueUsers = new Set((logs || []).map(l => l.user_id).filter(Boolean)).size;
    const totalMessages = (logs || []).length;
    const finderSessions = sessions.filter(s => s.chatType === 'finder').length;
    const listerSessions = sessions.filter(s => s.chatType === 'lister').length;
    return { uniqueUsers, totalMessages, totalSessions: sessions.length, finderSessions, listerSessions };
  }, [logs, sessions]);

  const activeSession = selectedSession ? sessions.find(s => s.sessionId === selectedSession) : null;
  const activeProfile = activeSession?.userId ? profiles?.[activeSession.userId] : null;

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-8 pt-24">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              AI Chat Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              View every conversation between users and the AI assistants.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <StatCard icon={<Users className="w-4 h-4" />} label="Unique users" value={stats.uniqueUsers} />
          <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Sessions" value={stats.totalSessions} />
          <StatCard icon={<Bot className="w-4 h-4" />} label="Messages" value={stats.totalMessages} />
          <StatCard icon={<Home className="w-4 h-4" />} label="Finder chats" value={stats.finderSessions} />
          <StatCard icon={<Sparkles className="w-4 h-4" />} label="Lister chats" value={stats.listerSessions} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-22rem)] min-h-[500px]">
          {/* Sessions list */}
          <Card className="lg:col-span-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search user, content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="finder">Finder</TabsTrigger>
                  <TabsTrigger value="lister">Lister</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <ScrollArea className="flex-1">
              <CardContent className="space-y-2 pt-0">
                {isLoading && <p className="text-sm text-muted-foreground p-4">Loading...</p>}
                {!isLoading && filteredSessions.length === 0 && (
                  <p className="text-sm text-muted-foreground p-4 text-center">No chats yet.</p>
                )}
                {filteredSessions.map((s) => {
                  const p = s.userId ? profiles?.[s.userId] : null;
                  const preview = s.messages.find(m => m.role === 'user')?.content || '';
                  const isActive = selectedSession === s.sessionId;
                  return (
                    <button
                      key={s.sessionId}
                      onClick={() => setSelectedSession(s.sessionId)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-colors',
                        isActive ? 'bg-primary/10 border-primary' : 'hover:bg-muted border-border'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={p?.avatar_url || undefined} />
                          <AvatarFallback>{(p?.full_name || '?').charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {p?.full_name || 'Unknown user'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{p?.email || s.userId?.slice(0, 8)}</p>
                        </div>
                        <Badge variant={s.chatType === 'finder' ? 'default' : 'secondary'} className="text-[10px]">
                          {s.chatType}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{preview}</p>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                        <span>{s.messages.length} msgs</span>
                        <span>{format(new Date(s.lastAt), 'MMM d, HH:mm')}</span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </ScrollArea>
          </Card>

          {/* Chat view */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden">
            {activeSession ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={activeProfile?.avatar_url || undefined} />
                        <AvatarFallback>{(activeProfile?.full_name || '?').charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {activeProfile?.full_name || 'Unknown user'}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {activeProfile?.email || activeSession.userId} · {format(new Date(activeSession.firstAt), 'PPp')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={activeSession.chatType === 'finder' ? 'default' : 'secondary'}>
                        {activeSession.chatType} chat
                      </Badge>
                      {activeSession.userId && (
                        <Link to={`/admin/user/${activeSession.userId}`} className="text-xs text-primary hover:underline">
                          View profile →
                        </Link>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {activeSession.messages.map((m) => (
                      <div key={m.id} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                        {m.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            'max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm',
                            m.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted text-foreground rounded-bl-md'
                          )}
                        >
                          <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                          <div className="text-[10px] opacity-70 mt-1">
                            {format(new Date(m.created_at), 'HH:mm:ss')}
                          </div>
                        </div>
                        {m.role === 'user' && (
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                            <UserIcon className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">Select a conversation to view the full chat.</p>
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </CardContent>
  </Card>
);

export default AdminAIChats;
