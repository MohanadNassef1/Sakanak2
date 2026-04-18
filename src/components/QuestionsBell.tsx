import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bell, MessageCircleQuestion, BadgeCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface UnansweredQuestion {
  id: string;
  question: string;
  created_at: string;
  room_id: string;
  asker_id: string;
  asker: { full_name: string | null; avatar_url: string | null; verification_status: string | null } | null;
  room: { title: string | null } | null;
}

interface QuestionsBellProps {
  unreadCount: number;
}

export const QuestionsBell: React.FC<QuestionsBellProps> = ({ unreadCount }) => {
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const [open, setOpen] = React.useState(false);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['unanswered-listing-questions', user?.id],
    enabled: !!user?.id && open,
    queryFn: async (): Promise<UnansweredQuestion[]> => {
      const { data: rooms } = await supabase
        .from('rooms')
        .select('id')
        .eq('owner_id', user!.id);

      if (!rooms || rooms.length === 0) return [];
      const roomIds = rooms.map((r) => r.id);

      const { data, error } = await supabase
        .from('listing_questions')
        .select(`
          id, question, created_at, room_id, asker_id,
          asker:profiles!listing_questions_asker_id_fkey(full_name, avatar_url, verification_status),
          room:rooms!listing_questions_room_id_fkey(title)
        `)
        .in('room_id', roomIds)
        .is('answer', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data || []) as unknown as UnansweredQuestion[];
    },
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          aria-label={isRTL ? 'أسئلة جديدة على إعلاناتك' : 'New questions on your listings'}
          title={isRTL ? 'أسئلة جديدة على إعلاناتك' : 'New questions on your listings'}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRTL ? 'start' : 'end'}
        className="w-80 max-h-[420px] overflow-y-auto p-0"
      >
        <div className="px-4 py-3 border-b border-border sticky top-0 bg-popover z-10">
          <h3 className="font-semibold text-sm text-foreground">
            {isRTL ? 'أسئلة بدون إجابة' : 'Unanswered questions'}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {unreadCount > 0
              ? isRTL
                ? `لديك ${unreadCount} سؤال بحاجة للرد`
                : `${unreadCount} question${unreadCount === 1 ? '' : 's'} need your reply`
              : isRTL
                ? 'لا توجد أسئلة جديدة'
                : 'No new questions'}
          </p>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {isRTL ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : questions.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <MessageCircleQuestion className="w-8 h-8 opacity-40" />
            {isRTL ? 'لا توجد أسئلة بدون إجابة' : 'No unanswered questions'}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {questions.map((q) => {
              const askerName = q.asker?.full_name || (isRTL ? 'مستخدم' : 'Someone');
              const initial = (askerName.charAt(0) || '?').toUpperCase();
              return (
                <li key={q.id} className="hover:bg-secondary transition-colors">
                  <div className="flex items-start gap-3 px-4 py-3">
                    <Link
                      to={`/user/${q.asker_id}`}
                      onClick={() => setOpen(false)}
                      className="shrink-0"
                      aria-label={askerName}
                    >
                      <Avatar className="w-8 h-8">
                        {q.asker?.avatar_url && (
                          <AvatarImage src={q.asker.avatar_url} alt={askerName} />
                        )}
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          to={`/user/${q.asker_id}`}
                          onClick={() => setOpen(false)}
                          className="text-sm font-medium text-foreground truncate hover:text-primary hover:underline"
                        >
                          {askerName}
                        </Link>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(q.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <Link
                        to={`/rooms/${q.room_id}#qa`}
                        onClick={() => setOpen(false)}
                        className="block"
                      >
                        {q.room?.title && (
                          <p className="text-xs text-primary truncate hover:underline">{q.room.title}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {q.question}
                        </p>
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuestionsBell;
