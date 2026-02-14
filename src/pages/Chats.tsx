import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Home, Calendar, ChevronRight, Lock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ViewingChat from '@/components/viewings/ViewingChat';

interface ChatPreview {
  viewingId: string;
  roomId: string;
  roomTitle: string;
  roomPhoto: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  status: string;
  lastMessageAt?: string;
  unreadCount: number;
  isLocked: boolean;
}

const Chats: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<ChatPreview | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchChats = async () => {
      setLoading(true);
      try {
        // Fetch all viewing requests where user is involved
        const { data: viewings, error } = await supabase
          .from('viewing_requests')
          .select(`
            id,
            room_id,
            tenant_id,
            landlord_id,
            status,
            updated_at
          `)
          .or(`tenant_id.eq.${user.id},landlord_id.eq.${user.id}`)
          .in('status', ['confirmed', 'completed', 'rental_confirmed'])
          .order('updated_at', { ascending: false });

        if (error) throw error;

        if (!viewings || viewings.length === 0) {
          setChats([]);
          setLoading(false);
          return;
        }

        // Get room details
        const roomIds = [...new Set(viewings.map(v => v.room_id))];
        const { data: rooms } = await supabase
          .from('rooms')
          .select('id, title, photos')
          .in('id', roomIds);

        // Get other user profiles
        const otherUserIds = viewings.map(v => 
          v.tenant_id === user.id ? v.landlord_id : v.tenant_id
        );
        // Use public_profiles view to avoid exposing sensitive contact info
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', otherUserIds);

        // Get last messages and unread counts
        const chatPreviews: ChatPreview[] = await Promise.all(
          viewings.map(async (viewing) => {
            const otherUserId = viewing.tenant_id === user.id ? viewing.landlord_id : viewing.tenant_id;
            const room = rooms?.find(r => r.id === viewing.room_id);
            const profile = profiles?.find(p => p.user_id === otherUserId);

            // Get last message
            const { data: messages } = await (supabase
              .from('viewing_messages' as any)
              .select('created_at')
              .eq('viewing_id', viewing.id)
              .order('created_at', { ascending: false })
              .limit(1) as any);

            // Get unread count
            const { count } = await (supabase
              .from('viewing_messages' as any)
              .select('*', { count: 'exact', head: true })
              .eq('viewing_id', viewing.id)
              .neq('sender_id', user.id)
              .is('read_at', null) as any);

            const isLocked = !['confirmed', 'completed', 'rental_confirmed'].includes(viewing.status);

            return {
              viewingId: viewing.id,
              roomId: viewing.room_id,
              roomTitle: room?.title || (isRTL ? 'غرفة' : 'Room'),
              roomPhoto: room?.photos?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
              otherUserId,
              otherUserName: profile?.full_name || (isRTL ? 'مستخدم' : 'User'),
              otherUserAvatar: profile?.avatar_url,
              status: viewing.status,
              lastMessageAt: messages?.[0]?.created_at,
              unreadCount: count || 0,
              isLocked,
            };
          })
        );

        // Sort by last message or updated_at
        chatPreviews.sort((a, b) => {
          const dateA = a.lastMessageAt || '';
          const dateB = b.lastMessageAt || '';
          return dateB.localeCompare(dateA);
        });

        setChats(chatPreviews);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user, navigate, isRTL]);

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(parseISO(dateStr), 'MMM d, HH:mm');
    } catch {
      return '';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      rental_confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    };
    const labels: Record<string, string> = {
      confirmed: isRTL ? 'مؤكد' : 'Confirmed',
      completed: isRTL ? 'مكتمل' : 'Completed',
      rental_confirmed: isRTL ? 'تم الإيجار' : 'Rented',
    };
    return (
      <Badge className={colors[status] || 'bg-muted'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="flex-1 pt-20 pb-8">
        <div className="section-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {isRTL ? 'المحادثات' : 'Chats'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isRTL ? 'محادثات المعاينات المؤكدة' : 'Chat with confirmed viewings'}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/my-viewings">
                <Calendar className="w-4 h-4 mr-2" />
                {isRTL ? 'المعاينات' : 'Viewings'}
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : chats.length === 0 ? (
            <Card className="py-16">
              <CardContent className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-primary/40" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {isRTL ? 'لا توجد محادثات بعد' : 'No chats yet'}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {isRTL 
                    ? 'ستظهر المحادثات هنا بعد تأكيد موعد المعاينة'
                    : 'Chats will appear here after a viewing is confirmed'
                  }
                </p>
                <Button asChild>
                  <Link to="/rooms">
                    <Home className="w-4 h-4 mr-2" />
                    {isRTL ? 'تصفح الغرف' : 'Browse Rooms'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Chat List */}
              <div className="lg:col-span-1">
                <Card className="overflow-hidden">
                  <ScrollArea className="h-[calc(100vh-280px)] min-h-[400px]">
                    <div className="divide-y divide-border">
                      {chats.map((chat) => (
                        <button
                          key={chat.viewingId}
                          onClick={() => setSelectedChat(chat)}
                          className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors ${
                            selectedChat?.viewingId === chat.viewingId ? 'bg-secondary' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={chat.otherUserAvatar} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {chat.otherUserName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {chat.unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium truncate">
                                  {chat.otherUserName}
                                </span>
                                {chat.lastMessageAt && (
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatTime(chat.lastMessageAt)}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {chat.roomTitle}
                              </p>
                              <div className="mt-1">
                                {getStatusBadge(chat.status)}
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-2">
                {selectedChat ? (
                  <div className="space-y-4">
                    {/* Room Info Header */}
                    <Card className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedChat.roomPhoto}
                          alt={selectedChat.roomTitle}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{selectedChat.roomTitle}</h3>
                          <p className="text-sm text-muted-foreground">
                            {isRTL ? 'محادثة مع' : 'Chat with'} {selectedChat.otherUserName}
                          </p>
                        </div>
                        {getStatusBadge(selectedChat.status)}
                      </div>
                    </Card>

                    {/* Chat Component */}
                    <ViewingChat
                      viewingId={selectedChat.viewingId}
                      otherUserId={selectedChat.otherUserId}
                      otherUserName={selectedChat.otherUserName}
                      otherUserAvatar={selectedChat.otherUserAvatar}
                      isLocked={selectedChat.isLocked}
                      lockReason={isRTL 
                        ? 'المحادثة ستفتح بعد تأكيد الموعد'
                        : 'Chat unlocks after viewing confirmation'
                      }
                    />
                  </div>
                ) : (
                  <Card className="h-[calc(100vh-280px)] min-h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="font-medium">
                        {isRTL ? 'اختر محادثة للبدء' : 'Select a chat to start'}
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chats;
