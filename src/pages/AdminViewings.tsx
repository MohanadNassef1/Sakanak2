import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Shield, Eye, Clock, Check, X, RefreshCw, Home,
  ArrowLeft, Search, Calendar, TrendingUp, Users,
  CheckCircle, XCircle, ArrowRight, AlertTriangle,
  BarChart3
} from 'lucide-react';
import { format, parseISO, subDays, startOfDay, isAfter } from 'date-fns';

const STATUS_CONFIG: Record<string, { label: string; labelAr: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', labelAr: 'معلق', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock },
  counter_proposed: { label: 'Counter Proposed', labelAr: 'وقت مقترح', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: RefreshCw },
  confirmed: { label: 'Confirmed', labelAr: 'مؤكد', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: Check },
  completed: { label: 'Completed', labelAr: 'مكتمل', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: CheckCircle },
  rental_confirmed: { label: 'Rented', labelAr: 'تم التأجير', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', icon: Home },
  declined: { label: 'Declined', labelAr: 'مرفوض', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
  cancelled: { label: 'Cancelled', labelAr: 'ملغي', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300', icon: X },
  expired: { label: 'Expired', labelAr: 'منتهي', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400', icon: Clock },
};

const AdminViewings = () => {
  const { isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Fetch all viewing requests with profiles and room data
  const { data: viewings, isLoading: loadingViewings } = useQuery({
    queryKey: ['admin-viewings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viewing_requests')
        .select(`
          *,
          tenant:profiles!viewing_requests_tenant_id_fkey(full_name, avatar_url, email, phone),
          landlord:profiles!viewing_requests_landlord_id_fkey(full_name, avatar_url, email, phone),
          room:rooms!viewing_requests_room_id_fkey(title, city, area, price_per_month, photos, lister_type)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin === true,
  });

  // Analytics computations
  const analytics = React.useMemo(() => {
    if (!viewings) return null;

    const today = startOfDay(new Date());
    const last7Days = subDays(today, 7);
    const last30Days = subDays(today, 30);

    const statusCounts: Record<string, number> = {};
    let totalViewings = viewings.length;
    let viewingsLast7 = 0;
    let viewingsLast30 = 0;
    let confirmedCount = 0;
    let rentalConfirmedCount = 0;
    let cancelledCount = 0;
    let declinedCount = 0;

    const roomViewingCounts = new Map<string, { count: number; title: string; city: string }>();

    viewings.forEach((v: any) => {
      statusCounts[v.status] = (statusCounts[v.status] || 0) + 1;

      const createdAt = parseISO(v.created_at);
      if (isAfter(createdAt, last7Days)) viewingsLast7++;
      if (isAfter(createdAt, last30Days)) viewingsLast30++;

      if (['confirmed', 'completed', 'rental_confirmed'].includes(v.status)) confirmedCount++;
      if (v.status === 'rental_confirmed') rentalConfirmedCount++;
      if (v.status === 'cancelled') cancelledCount++;
      if (v.status === 'declined') declinedCount++;

      const existing = roomViewingCounts.get(v.room_id) || { count: 0, title: v.room?.title || '?', city: v.room?.city || '' };
      existing.count++;
      roomViewingCounts.set(v.room_id, existing);
    });

    const conversionRate = totalViewings > 0 ? ((rentalConfirmedCount / totalViewings) * 100).toFixed(1) : '0';
    const confirmRate = totalViewings > 0 ? ((confirmedCount / totalViewings) * 100).toFixed(1) : '0';
    const cancelRate = totalViewings > 0 ? (((cancelledCount + declinedCount) / totalViewings) * 100).toFixed(1) : '0';

    const topRooms = [...roomViewingCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    return {
      totalViewings,
      viewingsLast7,
      viewingsLast30,
      statusCounts,
      confirmedCount,
      rentalConfirmedCount,
      cancelledCount,
      declinedCount,
      conversionRate,
      confirmRate,
      cancelRate,
      topRooms,
    };
  }, [viewings]);

  // Filtered viewings
  const filteredViewings = React.useMemo(() => {
    if (!viewings) return [];
    return viewings.filter((v: any) => {
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchesSearch = !searchQuery || 
        v.tenant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.landlord?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.room?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.tenant?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.landlord?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [viewings, statusFilter, searchQuery]);

  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, extra }: { id: string; status: string; extra?: Record<string, any> }) => {
      const updateData: Record<string, any> = { status, updated_at: new Date().toISOString(), ...extra };
      const { error } = await supabase
        .from('viewing_requests')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-viewings'] });
      toast.success(
        isRTL
          ? `تم تحديث الحالة إلى ${STATUS_CONFIG[variables.status]?.labelAr || variables.status}`
          : `Status updated to ${STATUS_CONFIG[variables.status]?.label || variables.status}`
      );
    },
    onError: (err: any) => {
      toast.error(isRTL ? 'فشل التحديث' : `Update failed: ${err.message}`);
    },
  });


  if (authLoading || checkingAdmin || isAdmin === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || isAdmin === false) {
    return <Navigate to="/" replace />;
  }

  const formatDate = (dateStr: string) => {
    try { return format(parseISO(dateStr), 'MMM d, yyyy HH:mm'); }
    catch { return dateStr; }
  };

  const formatShortDate = (dateStr: string) => {
    try { return format(parseISO(dateStr), 'MMM d'); }
    catch { return dateStr; }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="section-container">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="p-3 rounded-xl bg-primary/10">
              <Eye className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {isRTL ? 'إدارة المعاينات' : 'Viewings Management'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'تتبع جميع المعاينات والتحليلات' : 'Track all viewings & analytics'}
              </p>
            </div>
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <BarChart3 className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{analytics.totalViewings}</p>
                  <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي المعاينات' : 'Total Viewings'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                    <TrendingUp className="w-4.5 h-4.5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{analytics.viewingsLast7}</p>
                  <p className="text-xs text-muted-foreground">{isRTL ? 'آخر ٧ أيام' : 'Last 7 Days'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center mb-2">
                    <CheckCircle className="w-4.5 h-4.5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{analytics.confirmRate}%</p>
                  <p className="text-xs text-muted-foreground">{isRTL ? 'نسبة التأكيد' : 'Confirm Rate'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-2">
                    <Home className="w-4.5 h-4.5 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold">{analytics.conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">{isRTL ? 'نسبة التأجير' : 'Rental Rate'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center mb-2">
                    <XCircle className="w-4.5 h-4.5 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold">{analytics.cancelRate}%</p>
                  <p className="text-xs text-muted-foreground">{isRTL ? 'نسبة الإلغاء' : 'Cancel Rate'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
                    <Calendar className="w-4.5 h-4.5 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold">{analytics.viewingsLast30}</p>
                  <p className="text-xs text-muted-foreground">{isRTL ? 'آخر ٣٠ يوم' : 'Last 30 Days'}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Status Breakdown */}
            {analytics && (
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{isRTL ? 'توزيع الحالات' : 'Status Breakdown'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(analytics.statusCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, count]) => {
                      const config = STATUS_CONFIG[status];
                      const percentage = analytics.totalViewings > 0 ? ((count / analytics.totalViewings) * 100).toFixed(0) : 0;
                      return (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors ${statusFilter === status ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-secondary/50'}`}
                        >
                          <div className="flex items-center gap-2">
                            <Badge className={config?.color || ''}>
                              {isRTL ? config?.labelAr : config?.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{count}</span>
                            <span className="text-xs text-muted-foreground w-8 text-right">{percentage}%</span>
                          </div>
                        </button>
                      );
                    })}
                </CardContent>
              </Card>
            )}

            {/* Top Rooms by Viewings */}
            {analytics && (
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{isRTL ? 'أكثر الغرف طلباً' : 'Most Requested Rooms'}</CardTitle>
                  <CardDescription>{isRTL ? 'الغرف التي حصلت على أكثر طلبات معاينة' : 'Rooms with the most viewing requests'}</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.topRooms.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.topRooms.map(([roomId, data], idx) => (
                        <div key={roomId} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{data.title}</p>
                            <p className="text-xs text-muted-foreground">{data.city}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm font-semibold">{data.count}</span>
                          </div>
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${(data.count / analytics.topRooms[0][1].count) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">{isRTL ? 'لا توجد بيانات' : 'No data'}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Viewing Activity Feed */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    {isRTL ? 'سجل المعاينات' : 'Viewing Activity'}
                    <Badge variant="secondary" className="ml-1">{filteredViewings.length}</Badge>
                  </CardTitle>
                  <CardDescription>{isRTL ? 'جميع طلبات المعاينات بين المستخدمين' : 'All viewing requests between users'}</CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={isRTL ? 'بحث بالاسم أو الغرفة...' : 'Search by name or room...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              {/* Status filter pills */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setStatusFilter('all')}
                >
                  {isRTL ? 'الكل' : 'All'}
                </Button>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={statusFilter === key ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setStatusFilter(key)}
                  >
                    {isRTL ? config.labelAr : config.label}
                    {analytics?.statusCounts[key] ? ` (${analytics.statusCounts[key]})` : ''}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {loadingViewings ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
                </div>
              ) : filteredViewings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{isRTL ? 'لا توجد معاينات' : 'No viewings found'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredViewings.map((viewing: any) => {
                    const statusConf = STATUS_CONFIG[viewing.status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConf.icon;
                    const roomPhoto = viewing.room?.photos?.[0];

                    return (
                      <div key={viewing.id}>
                        <button
                          onClick={() => setExpandedId(expandedId === viewing.id ? null : viewing.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors cursor-pointer text-left"
                        >
                          {/* Room thumbnail */}
                          {roomPhoto ? (
                            <img src={roomPhoto} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Home className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}

                          {/* Tenant → Landlord */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-sm">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={viewing.tenant?.avatar_url} />
                                <AvatarFallback className="text-[10px]">{viewing.tenant?.full_name?.charAt(0) || '?'}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium truncate max-w-[100px]">{viewing.tenant?.full_name || 'Unknown'}</span>
                              <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={viewing.landlord?.avatar_url} />
                                <AvatarFallback className="text-[10px]">{viewing.landlord?.full_name?.charAt(0) || '?'}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium truncate max-w-[100px]">{viewing.landlord?.full_name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-muted-foreground truncate">{viewing.room?.title} • {viewing.room?.city}{viewing.room?.area ? `, ${viewing.room.area}` : ''}</p>
                              {viewing.tenant_message && <MessageSquare className="w-3 h-3 text-primary shrink-0" />}
                            </div>
                          </div>

                          {/* Date & Status */}
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <Badge className={statusConf.color + ' text-[10px] gap-1'}>
                              <StatusIcon className="w-3 h-3" />
                              {isRTL ? statusConf.labelAr : statusConf.label}
                            </Badge>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {formatShortDate(viewing.proposed_date)}
                            </div>
                          </div>
                          {expandedId === viewing.id ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                        </button>

                        {/* Expanded Details */}
                        {expandedId === viewing.id && (
                          <div className="mx-3 mt-1 mb-2 p-4 rounded-lg bg-muted/50 border border-border space-y-3 animate-in slide-in-from-top-2 duration-200">
                            {/* Scheduling Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1">{isRTL ? 'الوقت المقترح' : 'Proposed Time'}</p>
                                <p className="text-sm font-medium">
                                  {formatShortDate(viewing.proposed_date)} • {viewing.proposed_time_start} – {viewing.proposed_time_end}
                                </p>
                              </div>
                              {viewing.counter_proposed_date && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-1">{isRTL ? 'الوقت المقترح البديل' : 'Counter Proposed'}</p>
                                  <p className="text-sm font-medium">
                                    {formatShortDate(viewing.counter_proposed_date)} • {viewing.counter_proposed_time_start} – {viewing.counter_proposed_time_end}
                                  </p>
                                </div>
                              )}
                              {viewing.confirmed_date && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-1">{isRTL ? 'تاريخ التأكيد' : 'Confirmed Date'}</p>
                                  <p className="text-sm font-medium">
                                    {formatShortDate(viewing.confirmed_date)} {viewing.confirmed_time && `• ${viewing.confirmed_time}`}
                                  </p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1">{isRTL ? 'تاريخ الإنشاء' : 'Created'}</p>
                                <p className="text-sm">{formatDate(viewing.created_at)}</p>
                              </div>
                            </div>

                            {/* Tenant Message */}
                            {viewing.tenant_message && (
                              <div className="p-3 rounded-lg bg-background border border-border">
                                <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                                  <MessageSquare className="w-3 h-3" />
                                  {isRTL ? 'رسالة المستأجر' : 'Tenant Note'}
                                </p>
                                <p className="text-sm">{viewing.tenant_message}</p>
                              </div>
                            )}

                            {/* Landlord Response */}
                            {viewing.landlord_response && (
                              <div className="p-3 rounded-lg bg-background border border-border">
                                <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                                  <MessageSquare className="w-3 h-3" />
                                  {isRTL ? 'رد المؤجر' : 'Landlord Response'}
                                </p>
                                <p className="text-sm">{viewing.landlord_response}</p>
                              </div>
                            )}

                            {/* Rental Confirmation Status */}
                            {(viewing.tenant_rental_confirmed || viewing.landlord_rental_confirmed) && (
                              <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 text-xs">
                                  {viewing.tenant_rental_confirmed ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                                  {isRTL ? 'تأكيد المستأجر' : 'Tenant Confirmed'}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs">
                                  {viewing.landlord_rental_confirmed ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                                  {isRTL ? 'تأكيد المؤجر' : 'Landlord Confirmed'}
                                </div>
                              </div>
                            )}

                            {/* Contact Info */}
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-0.5">{isRTL ? 'المستأجر' : 'Tenant'}</p>
                                <p className="text-sm">{viewing.tenant?.full_name}</p>
                                {viewing.tenant?.email && <p className="text-xs text-muted-foreground">{viewing.tenant.email}</p>}
                                {viewing.tenant?.phone && <p className="text-xs text-muted-foreground">{viewing.tenant.phone}</p>}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-0.5">{isRTL ? 'المؤجر' : 'Landlord'}</p>
                                <p className="text-sm">{viewing.landlord?.full_name}</p>
                                {viewing.landlord?.email && <p className="text-xs text-muted-foreground">{viewing.landlord.email}</p>}
                                {viewing.landlord?.phone && <p className="text-xs text-muted-foreground">{viewing.landlord.phone}</p>}
                              </div>
                            </div>

                            {/* Room & Price */}
                            <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                              <span>{viewing.room?.title} • {viewing.room?.lister_type === 'broker' ? (isRTL ? 'سمسار' : 'Broker') : (isRTL ? 'مالك' : 'Owner')}</span>
                              <span className="font-semibold text-foreground">{viewing.room?.price_per_month?.toLocaleString()} EGP/mo</span>
                            </div>

                            {/* Admin Actions */}
                            {!['cancelled', 'expired', 'rental_confirmed'].includes(viewing.status) && (
                              <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                                {viewing.status !== 'confirmed' && (
                                  <Button
                                    size="sm"
                                    className="h-8 text-xs gap-1.5"
                                    disabled={updateStatusMutation.isPending}
                                    onClick={() => updateStatusMutation.mutate({
                                      id: viewing.id,
                                      status: 'confirmed',
                                      extra: {
                                        confirmed_date: viewing.counter_proposed_date || viewing.proposed_date,
                                        confirmed_time: viewing.counter_proposed_time_start || viewing.proposed_time_start,
                                        confirmed_at: new Date().toISOString(),
                                      },
                                    })}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    {isRTL ? 'تأكيد إجباري' : 'Force Confirm'}
                                  </Button>
                                )}
                                {viewing.status === 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                                    disabled={updateStatusMutation.isPending}
                                    onClick={() => updateStatusMutation.mutate({
                                      id: viewing.id,
                                      status: 'rental_confirmed',
                                      extra: {
                                        tenant_rental_confirmed: true,
                                        landlord_rental_confirmed: true,
                                        tenant_rental_confirmed_at: new Date().toISOString(),
                                        landlord_rental_confirmed_at: new Date().toISOString(),
                                      },
                                    })}
                                  >
                                    <Home className="w-3.5 h-3.5" />
                                    {isRTL ? 'تأكيد الإيجار' : 'Force Rental'}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8 text-xs gap-1.5"
                                  disabled={updateStatusMutation.isPending}
                                  onClick={() => updateStatusMutation.mutate({ id: viewing.id, status: 'cancelled' })}
                                >
                                  <X className="w-3.5 h-3.5" />
                                  {isRTL ? 'إلغاء' : 'Cancel'}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminViewings;
