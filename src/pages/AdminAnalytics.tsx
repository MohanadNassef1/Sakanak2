import React, { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  BarChart3, Users, ArrowLeft, Search, Home, Eye,
  TrendingUp, Globe, UserCheck, Calendar, Clock, MapPin
} from 'lucide-react';
import { format, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { getGovernorateForArea, getGovernorateLabel, getAreaLabel } from '@/lib/locationData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line
} from 'recharts';

const COLORS = ['#F96300', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const AdminAnalytics = () => {
  const { isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');

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

  // Fetch all profiles for analytics
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['adminAnalyticsProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, gender, nationality, avatar_url, created_at, verification_status')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!isAdmin,
  });

  // Fetch rooms with views_count for each user
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['adminAnalyticsRooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('owner_id, views_count, id, city, area');
      if (error) throw error;
      return data || [];
    },
    enabled: !!isAdmin,
  });

  // Gender chart data
  const genderData = useMemo(() => {
    if (!profiles) return [];
    const males = profiles.filter(p => p.gender === 'male').length;
    const females = profiles.filter(p => p.gender === 'female').length;
    return [
      { name: isRTL ? 'ذكور' : 'Males', value: males, fill: '#3b82f6' },
      { name: isRTL ? 'إناث' : 'Females', value: females, fill: '#ec4899' },
    ];
  }, [profiles, isRTL]);

  // Nationality chart data (top 10)
  const nationalityData = useMemo(() => {
    if (!profiles) return [];
    const counts: Record<string, number> = {};
    profiles.forEach(p => {
      const nat = p.nationality?.trim() || (isRTL ? 'غير محدد' : 'Not specified');
      counts[nat] = (counts[nat] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [profiles, isRTL]);

  // Signup timeline (by month)
  const signupTimelineData = useMemo(() => {
    if (!profiles) return [];
    const months: Record<string, number> = {};
    profiles.forEach(p => {
      const month = format(parseISO(p.created_at), 'yyyy-MM');
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({
        month: format(parseISO(month + '-01'), 'MMM yyyy'),
        users: count,
      }));
  }, [profiles]);

  // Signup by day of week
  const signupByDayData = useMemo(() => {
    if (!profiles) return [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const counts = new Array(7).fill(0);
    profiles.forEach(p => {
      const day = new Date(p.created_at).getDay();
      counts[day]++;
    });
    return counts.map((count, i) => ({
      day: isRTL ? daysAr[i] : days[i],
      users: count,
    }));
  }, [profiles, isRTL]);

  // Verification status breakdown
  const verificationData = useMemo(() => {
    if (!profiles) return [];
    const counts: Record<string, number> = {};
    profiles.forEach(p => {
      const status = p.verification_status || 'unverified';
      counts[status] = (counts[status] || 0) + 1;
    });
    const labels: Record<string, string> = isRTL
      ? { verified: 'موثق', pending: 'قيد المراجعة', unverified: 'غير موثق', rejected: 'مرفوض' }
      : { verified: 'Verified', pending: 'Pending', unverified: 'Unverified', rejected: 'Rejected' };
    const colors: Record<string, string> = {
      verified: '#10b981', pending: '#f59e0b', unverified: '#6b7280', rejected: '#ef4444',
    };
    return Object.entries(counts).map(([status, value]) => ({
      name: labels[status] || status,
      value,
      fill: colors[status] || '#6b7280',
    }));
  }, [profiles, isRTL]);

  // Room listings by city distribution
  const cityDistributionData = useMemo(() => {
    if (!rooms) return [];
    const counts: Record<string, number> = {};
    rooms.forEach(r => {
      const city = r.city?.trim() || (isRTL ? 'غير محدد' : 'Unknown');
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [rooms, isRTL]);

  // Room listings by area distribution (top 15)
  const areaDistributionData = useMemo(() => {
    if (!rooms) return [];
    const counts: Record<string, number> = {};
    rooms.forEach(r => {
      const area = r.area?.trim() || (isRTL ? 'غير محدد' : 'Unknown');
      counts[area] = (counts[area] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, value]) => ({ name, value }));
  }, [rooms, isRTL]);

  // Signup by hour of day
  const signupByHourData = useMemo(() => {
    if (!profiles) return [];
    const counts = new Array(24).fill(0);
    profiles.forEach(p => {
      const hour = new Date(p.created_at).getHours();
      counts[hour]++;
    });
    return counts.map((count, hour) => {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return {
        hour: `${h12} ${ampm}`,
        users: count,
      };
    });
  }, [profiles]);

  // Map rooms to users for the table
  const userRoomViews = useMemo(() => {
    if (!rooms) return {};
    const map: Record<string, { roomCount: number; totalViews: number }> = {};
    rooms.forEach(r => {
      if (!map[r.owner_id]) map[r.owner_id] = { roomCount: 0, totalViews: 0 };
      map[r.owner_id].roomCount++;
      map[r.owner_id].totalViews += r.views_count || 0;
    });
    return map;
  }, [rooms]);

  // Filtered users for table
  const filteredUsers = useMemo(() => {
    if (!profiles) return [];
    if (!searchQuery) return profiles;
    const q = searchQuery.toLowerCase();
    return profiles.filter(p =>
      p.full_name?.toLowerCase().includes(q) ||
      p.nationality?.toLowerCase().includes(q) ||
      p.gender?.toLowerCase().includes(q)
    );
  }, [profiles, searchQuery]);

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <Navbar />
        <main className="pt-20 pb-12">
          <div className="section-container space-y-4">
            <Skeleton className="h-10 w-64" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  const totalUsers = profiles?.length || 0;
  const verifiedUsers = profiles?.filter(p => p.verification_status === 'verified').length || 0;
  const totalRooms = rooms?.length || 0;
  const totalRoomViews = rooms?.reduce((sum, r) => sum + (r.views_count || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="section-container">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link to="/admin" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
            <div className="p-3 rounded-xl bg-primary/10">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {isRTL ? 'التحليلات والإحصائيات' : 'Analytics & Statistics'}
              </h1>
              <p className="text-muted-foreground">
                {isRTL ? 'نظرة عامة على أداء المنصة' : 'Platform performance overview'}
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalUsers}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي المستخدمين' : 'Total Users'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-green-500/10">
                    <UserCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{verifiedUsers}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'مستخدمون موثقون' : 'Verified Users'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-500/10">
                    <Home className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalRooms}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي الإعلانات' : 'Total Rooms'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-orange-500/10">
                    <Eye className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalRoomViews.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'مشاهدات الإعلانات' : 'Room Views'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Gender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {isRTL ? 'توزيع الجنس' : 'Gender Distribution'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profilesLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={true}
                      >
                        {genderData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  {isRTL ? 'حالة التحقق' : 'Verification Status'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profilesLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={verificationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={true}
                      >
                        {verificationData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Signup Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {isRTL ? 'تسجيلات المستخدمين بالشهر' : 'User Signups by Month'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profilesLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={signupTimelineData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#F96300"
                        fill="#F96300"
                        fillOpacity={0.2}
                        strokeWidth={2}
                        name={isRTL ? 'مستخدمين' : 'Users'}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Signup by Day of Week */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {isRTL ? 'أيام التسجيل المفضلة' : 'Popular Signup Days'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profilesLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={signupByDayData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} name={isRTL ? 'مستخدمين' : 'Users'} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Nationality Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                {isRTL ? 'أكثر 10 جنسيات' : 'Top 10 Nationalities'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profilesLoading ? (
                <Skeleton className="h-72" />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={nationalityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} name={isRTL ? 'مستخدمين' : 'Users'}>
                      {nationalityData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Charts Row 3: City & Area Distribution */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* City Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {isRTL ? 'الإعلانات حسب المحافظة' : 'Rooms by City'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {roomsLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={cityDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={true}
                      >
                        {cityDistributionData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Area Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {isRTL ? 'أكثر 15 منطقة بالإعلانات' : 'Top 15 Areas by Rooms'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {roomsLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(280, areaDistributionData.length * 28)}>
                    <BarChart data={areaDistributionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} name={isRTL ? 'إعلانات' : 'Rooms'}>
                        {areaDistributionData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Signup by Hour of Day */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {isRTL ? 'أوقات تسجيل المستخدمين (بالساعة)' : 'User Signup Times (by Hour)'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'أكثر الأوقات التي يسجل فيها المستخدمون' : 'Most popular hours when users sign up'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profilesLoading ? (
                <Skeleton className="h-72" />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={signupByHourData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} className="fill-muted-foreground" interval={0} angle={-45} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} name={isRTL ? 'مستخدمين' : 'Users'} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {isRTL ? 'جميع المستخدمين' : 'All Users'}
                  <Badge variant="secondary" className="text-xs">{totalUsers}</Badge>
                </CardTitle>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={isRTL ? 'بحث بالاسم أو الجنسية...' : 'Search by name or nationality...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {profilesLoading ? (
                <div className="space-y-3">
                  {Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-start p-3 font-medium text-muted-foreground">{isRTL ? 'المستخدم' : 'User'}</th>
                        <th className="text-start p-3 font-medium text-muted-foreground">{isRTL ? 'الجنس' : 'Gender'}</th>
                        <th className="text-start p-3 font-medium text-muted-foreground">{isRTL ? 'الجنسية' : 'Nationality'}</th>
                        <th className="text-start p-3 font-medium text-muted-foreground">{isRTL ? 'التحقق' : 'Status'}</th>
                        <th className="text-start p-3 font-medium text-muted-foreground">{isRTL ? 'تاريخ التسجيل' : 'Signed Up'}</th>
                        <th className="text-start p-3 font-medium text-muted-foreground">{isRTL ? 'الإعلانات' : 'Rooms'}</th>
                        <th className="text-start p-3 font-medium text-muted-foreground">{isRTL ? 'المشاهدات' : 'Views'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const rv = userRoomViews[user.user_id];
                        return (
                          <tr key={user.user_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="p-3">
                              <Link to={`/admin/user/${user.user_id}`} className="flex items-center gap-2.5 hover:underline">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar_url || ''} />
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {user.full_name?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium truncate max-w-[160px]">{user.full_name}</span>
                              </Link>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className={user.gender === 'male' ? 'border-blue-500/50 text-blue-500' : 'border-pink-500/50 text-pink-500'}>
                                {user.gender === 'male' ? (isRTL ? 'ذكر' : 'Male') : (isRTL ? 'أنثى' : 'Female')}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground">{user.nationality || '—'}</td>
                            <td className="p-3">
                              <Badge
                                variant="outline"
                                className={
                                  user.verification_status === 'verified' ? 'border-green-500/50 text-green-500' :
                                  user.verification_status === 'pending' ? 'border-yellow-500/50 text-yellow-500' :
                                  user.verification_status === 'rejected' ? 'border-red-500/50 text-red-500' :
                                  'border-muted-foreground/50 text-muted-foreground'
                                }
                              >
                                {user.verification_status || 'unverified'}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground text-xs">
                              <div>{format(parseISO(user.created_at), 'dd MMM yyyy')}</div>
                              <div className="text-muted-foreground/60">{format(parseISO(user.created_at), 'hh:mm a')}</div>
                            </td>
                            <td className="p-3 text-center">
                              <Badge variant="secondary">{rv?.roomCount || 0}</Badge>
                            </td>
                            <td className="p-3 text-center">
                              <span className="text-muted-foreground">{rv?.totalViews?.toLocaleString() || 0}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      {isRTL ? 'لا توجد نتائج' : 'No results found'}
                    </div>
                  )}
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

export default AdminAnalytics;
