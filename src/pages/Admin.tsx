import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Shield, Users, CreditCard, AlertTriangle, Home,
  CheckCircle, Clock, Eye, ArrowRight,
  FileWarning, DollarSign, UserCheck, Star, Gift, Headphones, Mail, BarChart3, MessageSquare,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Admin = () => {
  const { isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();

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

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [
        { count: pendingVerifications },
        { count: pendingPayouts },
        { count: unreviewedReports },
        { count: activeRooms },
        { count: totalUsers },
        { count: brokerReports },
        { count: unreadSupportMessages },
        { count: totalViewings },
        { count: activeViewings },
      ] = await Promise.all([
        supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('payouts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('decline_reports').select('*', { count: 'exact', head: true }).eq('admin_reviewed', false),
        supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('decline_reports').select('*', { count: 'exact', head: true }).eq('broker_illegal_fees', true).eq('admin_reviewed', false),
        supabase.from('support_messages').select('*', { count: 'exact', head: true }).eq('is_admin', false).is('read_at', null),
        supabase.from('viewing_requests').select('*', { count: 'exact', head: true }),
        supabase.from('viewing_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'counter_proposed', 'confirmed', 'completed']),
      ]);

      return {
        pendingVerifications: pendingVerifications || 0,
        pendingPayouts: pendingPayouts || 0,
        unreviewedReports: unreviewedReports || 0,
        activeRooms: activeRooms || 0,
        totalUsers: totalUsers || 0,
        brokerReports: brokerReports || 0,
        unreadSupportMessages: unreadSupportMessages || 0,
        totalViewings: totalViewings || 0,
        activeViewings: activeViewings || 0,
      };
    },
    enabled: isAdmin === true,
  });

  const { data: brokerReports, isLoading: loadingBrokerReports } = useQuery({
    queryKey: ['brokerReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decline_reports')
        .select(`
          *,
          tenant:profiles!decline_reports_tenant_id_fkey(full_name, avatar_url, phone),
          landlord:profiles!decline_reports_landlord_id_fkey(full_name, avatar_url, phone),
          room:rooms(title, city, area)
        `)
        .eq('broker_illegal_fees', true)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  const { data: recentConfirmedViewings } = useQuery({
    queryKey: ['recentConfirmedViewings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viewing_requests')
        .select(`
          *,
          tenant:profiles!viewing_requests_tenant_id_fkey(full_name, avatar_url),
          landlord:profiles!viewing_requests_landlord_id_fkey(full_name, avatar_url),
          room:rooms(title, city)
        `)
        .in('status', ['confirmed', 'completed', 'rental_confirmed'])
        .order('confirmed_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
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
    try { return format(parseISO(dateStr), 'MMM d, yyyy HH:mm'); } catch { return dateStr; }
  };

  const statCards = [
    { code: '01', title: isRTL ? 'طلبات التحقق' : 'Pending Verifications', value: stats?.pendingVerifications || 0, link: '/admin/verification', accent: stats?.pendingVerifications ? 'warn' : 'idle' },
    { code: '02', title: isRTL ? 'المدفوعات المعلقة' : 'Pending Payouts', value: stats?.pendingPayouts || 0, link: '/admin/payouts', accent: stats?.pendingPayouts ? 'warn' : 'idle' },
    { code: '03', title: isRTL ? 'بلاغات السماسرة' : 'Broker Reports', value: stats?.brokerReports || 0, link: '/admin/safety', accent: stats?.brokerReports ? 'alert' : 'idle' },
    { code: '04', title: isRTL ? 'بلاغات غير مراجعة' : 'Unreviewed Reports', value: stats?.unreviewedReports || 0, link: '/admin/safety', accent: stats?.unreviewedReports ? 'warn' : 'idle' },
    { code: '05', title: isRTL ? 'الغرف النشطة' : 'Active Rooms', value: stats?.activeRooms || 0, link: '/rooms', accent: 'ok' },
    { code: '06', title: isRTL ? 'إجمالي المستخدمين' : 'Total Users', value: stats?.totalUsers || 0, link: '/admin/users', accent: 'idle' },
    { code: '07', title: isRTL ? 'المعاينات النشطة' : 'Active Viewings', value: stats?.activeViewings || 0, link: '/admin/viewings', accent: 'idle' },
  ] as const;

  const accentClass = (a: string) =>
    a === 'alert' ? 'text-red-500' : a === 'warn' ? 'text-amber-500' : a === 'ok' ? 'text-emerald-500' : 'text-foreground';

  const actions = [
    { code: 'CMD-01', icon: UserCheck, label: isRTL ? 'التحقق من الهوية' : 'ID Verification', desc: isRTL ? 'مراجعة طلبات التحقق' : 'Review verification requests', link: '/admin/verification' },
    { code: 'CMD-02', icon: CreditCard, label: isRTL ? 'المدفوعات' : 'Payouts', desc: isRTL ? 'معالجة المدفوعات للملاك' : 'Process owner payouts', link: '/admin/payouts' },
    { code: 'CMD-03', icon: Shield, label: isRTL ? 'مركز الأمان' : 'Safety Center', desc: isRTL ? 'إدارة البلاغات والحظر' : 'Manage reports & bans', link: '/admin/safety' },
    { code: 'CMD-04', icon: Star, label: isRTL ? 'الإعلانات المميزة' : 'Featured Rooms', desc: isRTL ? 'اختر إعلانات الصفحة الرئيسية' : 'Select homepage listings', link: '/admin/featured-rooms' },
    { code: 'CMD-05', icon: Home, label: isRTL ? 'حالة الإعلانات' : 'Room Status', desc: isRTL ? 'تغيير حالة كل إعلان' : 'Available, rented, or waiting', link: '/admin/room-status' },
    { code: 'CMD-06', icon: Gift, label: isRTL ? 'برنامج الإحالة' : 'Referrals', desc: isRTL ? 'تتبع أداء السفراء' : 'Track ambassador performance', link: '/admin/referrals' },
    { code: 'CMD-07', icon: Users, label: isRTL ? 'إدارة المستخدمين' : 'Users Management', desc: isRTL ? 'عرض وإدارة جميع المستخدمين' : 'View & manage all users', link: '/admin/users' },
    { code: 'CMD-08', icon: Mail, label: isRTL ? 'إدارة الإيميلات' : 'Email Management', desc: isRTL ? 'إرسال وتتبع الإيميلات' : 'Send & track emails', link: '/admin/emails' },
    { code: 'CMD-09', icon: Eye, label: isRTL ? 'مراقبة البريد' : 'Email Monitor', desc: isRTL ? 'تتبع حالة كل بريد' : 'Track delivery & failures', link: '/admin/email-monitor' },
    { code: 'CMD-10', icon: Mail, label: isRTL ? 'الردود الواردة' : 'Inbound Replies', desc: isRTL ? 'البريد المُرسل إليك' : 'Emails sent to your inbox', link: '/admin/inbound-emails' },
    { code: 'CMD-11', icon: Star, label: isRTL ? 'تقييمات المستخدمين' : 'User Ratings', desc: isRTL ? 'تقييمات سكنك من 1 إلى 10' : 'Sakanak ratings (1–10)', link: '/admin/ratings' },
    { code: 'CMD-12', icon: Headphones, label: isRTL ? 'دعم العملاء' : 'Customer Support', desc: isRTL ? 'الرد على رسائل الدعم' : 'Reply to support messages', link: '/admin/support', badge: stats?.unreadSupportMessages },
    { code: 'CMD-13', icon: Eye, label: isRTL ? 'إدارة المعاينات' : 'Viewings Management', desc: isRTL ? 'تتبع جميع المعاينات' : 'Track all viewings & analytics', link: '/admin/viewings', badge: stats?.activeViewings },
    { code: 'CMD-14', icon: BarChart3, label: isRTL ? 'التحليلات' : 'Analytics', desc: isRTL ? 'رسوم بيانية وإحصائيات' : 'Charts & platform insights', link: '/admin/analytics' },
    { code: 'CMD-15', icon: MessageSquare, label: isRTL ? 'محادثات الذكاء' : 'AI Chat Analytics', desc: isRTL ? 'كل محادثات المستخدمين' : 'User conversations with assistant', link: '/admin/ai-chats' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="section-container">
          <div className="border border-border bg-card/40">
            {/* Header */}
            <header className="border-b border-border p-6 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-border bg-background flex items-center justify-center">
                  <Shield className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                    {isRTL ? 'وحدة التحكم / Sakanak' : 'Sakanak / Operations'}
                  </p>
                  <h1 className="text-xl font-bold tracking-tight">
                    {isRTL ? 'مركز قيادة المشرف' : 'Admin Command Center'}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right rtl:text-left">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {isRTL ? 'حالة النظام' : 'System Status'}
                  </p>
                  <div className="flex items-center gap-2 justify-end rtl:justify-start">
                    <span className="text-sm font-bold text-emerald-500 uppercase tracking-wider">
                      {isRTL ? 'تشغيل' : 'Operational'}
                    </span>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-none bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 bg-emerald-500" />
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 border-b border-border">
              {statCards.map((s, i) => (
                <Link
                  key={i}
                  to={s.link}
                  className={`group p-5 border-border hover:bg-muted/40 transition-colors
                    ${i < statCards.length - 1 ? 'border-b md:border-b-0 ltr:md:border-r rtl:md:border-l' : ''}
                    ${i < 2 ? 'border-b md:border-b-0' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{s.code}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 rtl:rotate-180 transition-all" />
                  </div>
                  <p className={`text-3xl font-bold font-mono tracking-tighter tabular-nums ${accentClass(s.accent)}`}>
                    {String(s.value).padStart(2, '0')}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1 line-clamp-1">{s.title}</p>
                </Link>
              ))}
            </div>

            {/* Section title */}
            <div className="px-6 pt-6 pb-3 flex items-center gap-3">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                {isRTL ? 'الإجراءات السريعة' : 'Quick Execution'}
              </h2>
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-mono text-muted-foreground">{actions.length} {isRTL ? 'وحدة' : 'modules'}</span>
            </div>

            {/* Quick Actions grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 bg-border gap-px border-b border-border">
              {actions.map((a, i) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={i}
                    to={a.link}
                    className="group bg-card hover:bg-foreground hover:text-background transition-colors p-4 flex items-start gap-3 relative"
                  >
                    <Icon className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground group-hover:text-background transition-colors" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground group-hover:text-background/60">{a.code}</span>
                        {a.badge ? (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-red-500 text-white">
                            {a.badge}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm font-bold leading-tight truncate">{a.label}</p>
                      <p className="text-[11px] text-muted-foreground group-hover:text-background/60 line-clamp-1 mt-0.5">{a.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-background opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 rtl:rotate-180 transition-all self-center" />
                  </Link>
                );
              })}
            </div>

            {/* Bottom Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Broker reports */}
              <section className="p-6 ltr:lg:border-r rtl:lg:border-l border-border border-b lg:border-b-0">
                <div className="flex items-center gap-3 mb-5">
                  <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-foreground">
                    {isRTL ? 'بلاغات السماسرة' : 'Broker Intelligence Feed'}
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                  <Link to="/admin/safety" className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
                    {isRTL ? 'الكل' : 'View all'}
                  </Link>
                </div>

                {loadingBrokerReports ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-none" />)}
                  </div>
                ) : brokerReports && brokerReports.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {brokerReports.map((report: any) => (
                      <li key={report.id} className="py-3 first:pt-0">
                        <div className="flex items-start gap-3">
                          <span className="text-[10px] font-mono text-muted-foreground mt-1.5 shrink-0 w-20">
                            {format(parseISO(report.created_at), 'MM/dd HH:mm')}
                          </span>
                          <Avatar className="h-8 w-8 rounded-none shrink-0">
                            <AvatarImage src={report.tenant?.avatar_url} />
                            <AvatarFallback className="rounded-none bg-muted text-foreground text-xs">
                              {report.tenant?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs leading-relaxed">
                              <span className="font-bold">{report.tenant?.full_name || 'Unknown'}</span>
                              <span className="text-muted-foreground"> {isRTL ? 'أبلغ عن' : 'reported'} </span>
                              <span className="font-bold">{report.landlord?.full_name || 'Unknown'}</span>
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono truncate">
                              {report.room?.title} · {report.room?.city}
                            </p>
                            {report.broker_fee_details && (
                              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 ltr:border-l-2 rtl:border-r-2 border-red-500/60 ltr:pl-2 rtl:pr-2 mt-1">
                                {report.broker_fee_details}
                              </p>
                            )}
                          </div>
                          <span className={`text-[9px] font-mono uppercase tracking-widest shrink-0 px-1.5 py-0.5 border ${
                            report.admin_reviewed
                              ? 'border-border text-muted-foreground'
                              : 'border-red-500/60 text-red-500'
                          }`}>
                            {report.admin_reviewed ? (isRTL ? 'تم' : 'OK') : (isRTL ? 'انتظار' : 'OPEN')}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10 text-muted-foreground border border-dashed border-border">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" strokeWidth={1.5} />
                    <p className="text-xs font-mono uppercase tracking-widest">{isRTL ? 'لا توجد بلاغات' : 'No active reports'}</p>
                  </div>
                )}
              </section>

              {/* Recent confirmed viewings */}
              <section className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Eye className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-foreground">
                    {isRTL ? 'المعاينات الأخيرة' : 'Confirmed Viewings Log'}
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {isRTL ? 'مباشر' : 'Live'}
                  </span>
                </div>

                {recentConfirmedViewings && recentConfirmedViewings.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {recentConfirmedViewings.map((viewing: any) => {
                      const tone =
                        viewing.status === 'rental_confirmed' ? 'text-emerald-500 border-emerald-500/60' :
                        viewing.status === 'completed' ? 'text-foreground border-border' :
                        'text-muted-foreground border-border';
                      const label =
                        viewing.status === 'rental_confirmed' ? (isRTL ? 'تم التأجير' : 'RENTED') :
                        viewing.status === 'completed' ? (isRTL ? 'تمت المعاينة' : 'DONE') :
                        (isRTL ? 'مؤكد' : 'CONFIRMED');
                      return (
                        <li key={viewing.id} className="py-3 first:pt-0 flex items-center gap-3">
                          <div className="flex -space-x-2 rtl:space-x-reverse shrink-0">
                            <Avatar className="h-7 w-7 rounded-none border-2 border-background">
                              <AvatarImage src={viewing.tenant?.avatar_url} />
                              <AvatarFallback className="rounded-none text-[10px] bg-muted">
                                {viewing.tenant?.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <Avatar className="h-7 w-7 rounded-none border-2 border-background">
                              <AvatarImage src={viewing.landlord?.avatar_url} />
                              <AvatarFallback className="rounded-none text-[10px] bg-muted">
                                {viewing.landlord?.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{viewing.room?.title}</p>
                            <p className="text-[11px] text-muted-foreground font-mono truncate">
                              {viewing.tenant?.full_name} → {viewing.landlord?.full_name}
                            </p>
                          </div>
                          <span className={`text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border ${tone}`}>
                            {label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-center py-10 text-muted-foreground border border-dashed border-border">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" strokeWidth={1.5} />
                    <p className="text-xs font-mono uppercase tracking-widest">{isRTL ? 'لا توجد معاينات' : 'No confirmed viewings yet'}</p>
                  </div>
                )}
              </section>
            </div>

            {/* Footer strip */}
            <div className="border-t border-border px-6 py-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              <div className="flex gap-4">
                <span>Sakanak · Ops v1</span>
                <span className="hidden sm:inline">Build stable</span>
              </div>
              <span>{format(new Date(), 'yyyy.MM.dd · HH:mm')}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
