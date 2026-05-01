import React, { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsAdmin } from '@/hooks/useAdminActions';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Loader2, Trash2, Mail, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SiteRating {
  id: string;
  rating: number;
  reason: string | null;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  created_at: string;
}

const AdminRatings: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isRTL } = useLanguage();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: ratings, isLoading, refetch } = useQuery({
    queryKey: ['admin-site-ratings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_ratings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SiteRating[];
    },
    enabled: !!isAdmin,
  });

  const stats = useMemo(() => {
    if (!ratings || ratings.length === 0) return null;
    const total = ratings.length;
    const sum = ratings.reduce((a, r) => a + r.rating, 0);
    const avg = sum / total;
    const promoters = ratings.filter((r) => r.rating >= 9).length;
    const detractors = ratings.filter((r) => r.rating <= 6).length;
    const nps = Math.round(((promoters - detractors) / total) * 100);
    return { total, avg, promoters, detractors, nps };
  }, [ratings]);

  const filtered = useMemo(() => {
    if (!ratings) return [];
    const q = search.trim().toLowerCase();
    if (!q) return ratings;
    return ratings.filter(
      (r) =>
        r.reason?.toLowerCase().includes(q) ||
        r.user_email?.toLowerCase().includes(q) ||
        r.user_name?.toLowerCase().includes(q) ||
        String(r.rating).includes(q)
    );
  }, [ratings, search]);

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل تريد حذف هذا التقييم؟' : 'Delete this rating?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('site_ratings').delete().eq('id', id);
    setDeletingId(null);
    if (error) {
      toast.error(isRTL ? 'فشل الحذف' : 'Failed to delete');
      return;
    }
    toast.success(isRTL ? 'تم الحذف' : 'Deleted');
    refetch();
  };

  if (authLoading || roleLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const ratingColor = (n: number) => {
    if (n >= 9) return 'text-green-500';
    if (n >= 7) return 'text-yellow-500';
    return 'text-destructive';
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <header className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            {isRTL ? 'تقييمات سكنك' : 'Sakanak User Ratings'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isRTL
              ? 'تقييمات المستخدمين لسكنك من 1 إلى 10'
              : 'User feedback ratings (1-10) and reasons'}
          </p>
        </header>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'متوسط التقييم' : 'Average score'}
                </p>
                <p className={cn('text-3xl font-bold', ratingColor(Math.round(stats.avg)))}>
                  {stats.avg.toFixed(1)}
                  <span className="text-base text-muted-foreground font-normal">/10</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'عدد التقييمات' : 'Total ratings'}
                </p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'مؤيدون (9-10)' : 'Promoters (9-10)'}
                </p>
                <p className="text-3xl font-bold text-green-500">{stats.promoters}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'معارضون (1-6)' : 'Detractors (1-6)'}
                </p>
                <p className="text-3xl font-bold text-destructive">{stats.detractors}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder={isRTL ? 'ابحث في الأسباب أو البريد...' : 'Search reasons, email, name...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {isRTL ? 'لا توجد تقييمات بعد' : 'No ratings yet'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <div className={cn('flex items-center gap-1 font-bold text-lg', ratingColor(r.rating))}>
                          <Star className="w-5 h-5 fill-current" />
                          {r.rating}/10
                        </div>
                        {r.user_name && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <UserIcon className="w-3.5 h-3.5" />
                            {r.user_name}
                          </span>
                        )}
                        {r.user_email && (
                          <a
                            href={`mailto:${r.user_email}`}
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            {r.user_email}
                          </a>
                        )}
                        {!r.user_id && (
                          <Badge variant="outline" className="text-xs">
                            {isRTL ? 'مجهول' : 'Anonymous'}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {format(new Date(r.created_at), 'PPp')}
                        </span>
                      </div>
                      {r.reason && (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed bg-muted/40 rounded-md p-3">
                          {r.reason}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      {deletingId === r.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminRatings;
