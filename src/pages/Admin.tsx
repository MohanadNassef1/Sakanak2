import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, Users, CreditCard, AlertTriangle, Home, 
  CheckCircle, Clock, XCircle, Eye, ArrowRight,
  FileWarning, DollarSign, UserCheck, Star, Gift, Headphones, Mail, BarChart3, MessageSquare
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Admin = () => {
  const { t, isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  // Check if user is admin
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

  // Fetch dashboard stats
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

  // Fetch broker reports (where seeker reported broker illegal fees)
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

  // Fetch recent viewing requests that were confirmed (potential broker reports source)
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

  // Show loading while checking auth or admin status
  if (authLoading || checkingAdmin || isAdmin === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Redirect non-admin users to home
  if (!user || isAdmin === false) {
    return <Navigate to="/" replace />;
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy HH:mm');
    } catch {
      return dateStr;
    }
  };

  const statCards = [
    {
      title: isRTL ? 'طلبات التحقق المعلقة' : 'Pending Verifications',
      value: stats?.pendingVerifications || 0,
      icon: UserCheck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      link: '/admin/verification',
    },
    {
      title: isRTL ? 'المدفوعات المعلقة' : 'Pending Payouts',
      value: stats?.pendingPayouts || 0,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      link: '/admin/payouts',
    },
    {
      title: isRTL ? 'بلاغات السماسرة' : 'Broker Reports',
      value: stats?.brokerReports || 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      link: '/admin/safety',
    },
    {
      title: isRTL ? 'البلاغات غير المراجعة' : 'Unreviewed Reports',
      value: stats?.unreviewedReports || 0,
      icon: FileWarning,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      link: '/admin/safety',
    },
    {
      title: isRTL ? 'الغرف النشطة' : 'Active Rooms',
      value: stats?.activeRooms || 0,
      icon: Home,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      link: '/rooms',
    },
    {
      title: isRTL ? 'إجمالي المستخدمين' : 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      link: '/admin/users',
    },
    {
      title: isRTL ? 'المعاينات النشطة' : 'Active Viewings',
      value: stats?.activeViewings || 0,
      icon: Eye,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      link: '/admin/viewings',
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="section-container">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {isRTL ? 'لوحة تحكم المشرف' : 'Admin Dashboard'}
              </h1>
              <p className="text-muted-foreground">
                {isRTL ? 'إدارة المنصة ومراقبة النشاط' : 'Manage platform and monitor activity'}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <Link key={index} to={stat.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{stat.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Link to="/admin/verification">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <UserCheck className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'التحقق من الهوية' : 'ID Verification'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'مراجعة طلبات التحقق' : 'Review verification requests'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/payouts">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <CreditCard className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'المدفوعات' : 'Payouts'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'معالجة المدفوعات للملاك' : 'Process owner payouts'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/safety">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-500/10">
                    <Shield className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'مركز الأمان' : 'Safety Center'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'إدارة البلاغات والحظر' : 'Manage reports & bans'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/featured-rooms">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'الإعلانات المميزة' : 'Featured Rooms'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'اختر إعلانات الصفحة الرئيسية' : 'Select homepage listings'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/room-status">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/10">
                    <Home className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'حالة الإعلانات' : 'Room Status'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'تغيير حالة كل إعلان' : 'Set available, rented, or waiting'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/referrals">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-pink-500/10">
                    <Gift className="w-6 h-6 text-pink-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'برنامج الإحالة' : 'Referrals'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'تتبع أداء السفراء' : 'Track ambassador performance'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/users">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10">
                    <Users className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'إدارة المستخدمين' : 'Users Management'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'عرض وإدارة جميع المستخدمين' : 'View & manage all users'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/emails">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-orange-500/10">
                    <Mail className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'إدارة الإيميلات' : 'Email Management'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'إرسال وتتبع الإيميلات' : 'Send & track emails'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/email-monitor">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-teal-500/10">
                    <Eye className="w-6 h-6 text-teal-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'مراقبة البريد' : 'Email Monitor'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'تتبع حالة كل بريد' : 'Track delivery & failures'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/inbound-emails">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10">
                    <Mail className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'الردود الواردة' : 'Inbound Replies'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'البريد المُرسل إليك' : 'Emails sent to your inbox'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/ratings">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'تقييمات المستخدمين' : 'User Ratings'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'تقييمات سكنك من 1 إلى 10' : 'Sakanak ratings from users (1-10)'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/support">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/10 relative">
                    <Headphones className="w-6 h-6 text-green-500" />
                    {stats?.unreadSupportMessages ? (
                      <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                        {stats.unreadSupportMessages}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'دعم العملاء' : 'Customer Support'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'الرد على رسائل الدعم' : 'Reply to support messages'}
                    </p>
                  </div>
                  {stats?.unreadSupportMessages ? (
                    <Badge variant="destructive">{stats.unreadSupportMessages} {isRTL ? 'جديد' : 'new'}</Badge>
                  ) : null}
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/viewings">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10">
                    <Eye className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'إدارة المعاينات' : 'Viewings Management'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'تتبع جميع المعاينات والتحليلات' : 'Track all viewings & analytics'}
                    </p>
                  </div>
                  {stats?.activeViewings ? (
                    <Badge variant="secondary">{stats.activeViewings} {isRTL ? 'نشط' : 'active'}</Badge>
                  ) : null}
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/analytics">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/10">
                    <BarChart3 className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'التحليلات والإحصائيات' : 'Analytics & Statistics'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'رسوم بيانية وإحصائيات المنصة' : 'Charts & platform insights'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/ai-chats">
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-fuchsia-500/10">
                    <MessageSquare className="w-6 h-6 text-fuchsia-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{isRTL ? 'محادثات الذكاء الاصطناعي' : 'AI Chat Analytics'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'كل محادثات المستخدمين مع المساعد' : 'All user conversations with the assistant'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Broker Reports Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-5 h-5" />
                      {isRTL ? 'بلاغات السماسرة' : 'Broker Reports'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'بلاغات عن رسوم غير قانونية من السماسرة' : 'Reports of illegal broker fees'}
                    </CardDescription>
                  </div>
                  <Link to="/admin/safety">
                    <Button variant="outline" size="sm">
                      {isRTL ? 'عرض الكل' : 'View All'}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingBrokerReports ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-20 rounded-lg" />
                    ))}
                  </div>
                ) : brokerReports && brokerReports.length > 0 ? (
                  <div className="space-y-4">
                    {brokerReports.map((report: any) => (
                      <div 
                        key={report.id} 
                        className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={report.tenant?.avatar_url} />
                              <AvatarFallback className="bg-red-100 text-red-600">
                                {report.tenant?.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {report.tenant?.full_name || 'Unknown'}
                                <span className="text-muted-foreground"> {isRTL ? 'أبلغ عن' : 'reported'} </span>
                                {report.landlord?.full_name || 'Unknown'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {report.room?.title} • {report.room?.city}
                              </p>
                            </div>
                          </div>
                          <Badge variant={report.admin_reviewed ? 'secondary' : 'destructive'}>
                            {report.admin_reviewed 
                              ? (isRTL ? 'تمت المراجعة' : 'Reviewed')
                              : (isRTL ? 'في الانتظار' : 'Pending')
                            }
                          </Badge>
                        </div>
                        
                        {report.broker_fee_details && (
                          <div className="mt-3 p-2 bg-background rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {isRTL ? 'التفاصيل:' : 'Details:'}
                              </span>{' '}
                              {report.broker_fee_details}
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDate(report.created_at)}</span>
                          {report.tenant?.phone && (
                            <span>📱 {report.tenant.phone}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p>{isRTL ? 'لا توجد بلاغات عن سماسرة' : 'No broker reports'}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Confirmed Viewings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  {isRTL ? 'المعاينات المؤكدة الأخيرة' : 'Recent Confirmed Viewings'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'معاينات تم تأكيدها مؤخراً' : 'Recently confirmed viewing appointments'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentConfirmedViewings && recentConfirmedViewings.length > 0 ? (
                  <div className="space-y-3">
                    {recentConfirmedViewings.map((viewing: any) => (
                      <div 
                        key={viewing.id}
                        className="p-3 bg-secondary/50 rounded-lg flex items-center gap-3"
                      >
                        <div className="flex -space-x-2">
                          <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={viewing.tenant?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {viewing.tenant?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={viewing.landlord?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {viewing.landlord?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {viewing.room?.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {viewing.tenant?.full_name} → {viewing.landlord?.full_name}
                          </p>
                        </div>
                        <Badge 
                          variant="secondary"
                          className={
                            viewing.status === 'rental_confirmed' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : viewing.status === 'completed'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                : ''
                          }
                        >
                          {viewing.status === 'rental_confirmed' 
                            ? (isRTL ? 'تم التأجير' : 'Rented')
                            : viewing.status === 'completed'
                              ? (isRTL ? 'تمت المعاينة' : 'Completed')
                              : (isRTL ? 'مؤكد' : 'Confirmed')
                          }
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{isRTL ? 'لا توجد معاينات مؤكدة' : 'No confirmed viewings yet'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
