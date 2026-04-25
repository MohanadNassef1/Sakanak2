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
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  BarChart3, Users, ArrowLeft, Search, Home, Eye,
  TrendingUp, Globe, UserCheck, Calendar, Clock, MapPin,
  Cake, Briefcase, GraduationCap, DollarSign, Sparkles, Activity, Target,
  CalendarRange, Download, FileText, FileSpreadsheet, Loader2
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { format, parseISO, startOfMonth, startOfWeek, differenceInDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { getGovernorateForArea, getGovernorateLabel, getAreaLabel, getGovernorates, getAreasForGovernorate, locationData } from '@/lib/locationData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line
} from 'recharts';

const COLORS = ['#F96300', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const AdminAnalytics = () => {
  const { isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');
  const dashboardRef = React.useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = React.useState<null | 'csv' | 'pdf'>(null);


  // Date range filter state
  type RangePreset = 'all' | '7d' | '30d' | '90d' | 'custom';
  const [rangePreset, setRangePreset] = React.useState<RangePreset>('all');
  const [customFrom, setCustomFrom] = React.useState<Date | undefined>(undefined);
  const [customTo, setCustomTo] = React.useState<Date | undefined>(undefined);

  // Segment filters (governorate / area / room type / gender)
  const [filterGovernorate, setFilterGovernorate] = React.useState<string>('all');
  const [filterArea, setFilterArea] = React.useState<string>('all');
  const [filterRoomType, setFilterRoomType] = React.useState<string>('all');
  const [filterGender, setFilterGender] = React.useState<string>('all');

  // Reset area when governorate changes
  React.useEffect(() => {
    setFilterArea('all');
  }, [filterGovernorate]);

  const governorateOptions = React.useMemo(() => getGovernorates(), []);
  const areaOptions = React.useMemo(() => {
    if (filterGovernorate === 'all') return [];
    return getAreasForGovernorate(filterGovernorate);
  }, [filterGovernorate]);

  const hasActiveFilter =
    filterGovernorate !== 'all' ||
    filterArea !== 'all' ||
    filterRoomType !== 'all' ||
    filterGender !== 'all';

  const resetSegmentFilters = () => {
    setFilterGovernorate('all');
    setFilterArea('all');
    setFilterRoomType('all');
    setFilterGender('all');
  };

  const { dateFrom, dateTo } = useMemo(() => {
    const now = new Date();
    if (rangePreset === '7d') return { dateFrom: startOfDay(subDays(now, 6)), dateTo: endOfDay(now) };
    if (rangePreset === '30d') return { dateFrom: startOfDay(subDays(now, 29)), dateTo: endOfDay(now) };
    if (rangePreset === '90d') return { dateFrom: startOfDay(subDays(now, 89)), dateTo: endOfDay(now) };
    if (rangePreset === 'custom' && customFrom) {
      return { dateFrom: startOfDay(customFrom), dateTo: customTo ? endOfDay(customTo) : endOfDay(now) };
    }
    return { dateFrom: undefined, dateTo: undefined };
  }, [rangePreset, customFrom, customTo]);

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
  const { data: allProfiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['adminAnalyticsProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, gender, nationality, avatar_url, created_at, verification_status, interested_area_1, interested_area_2, age, date_of_birth, occupation, occupation_status, university, is_smoker, has_pets, personality_tags')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!isAdmin,
  });

  // Fetch rooms with views_count for each user
  const { data: allRooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['adminAnalyticsRooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('owner_id, views_count, id, city, area, price_per_month, room_type, status, created_at, allowed_gender, is_student_listing');
      if (error) throw error;
      return data || [];
    },
    enabled: !!isAdmin,
  });

  // Apply date + segment filters — all charts/metrics use these filtered datasets
  const profiles = useMemo(() => {
    if (!allProfiles) return allProfiles;
    return allProfiles.filter(p => {
      // Date range
      if (dateFrom && dateTo) {
        const t = new Date(p.created_at).getTime();
        if (t < dateFrom.getTime() || t > dateTo.getTime()) return false;
      }
      // Gender
      if (filterGender !== 'all' && p.gender !== filterGender) return false;
      // Governorate / area — match against user's preferred areas
      if (filterGovernorate !== 'all' || filterArea !== 'all') {
        const a1 = p.interested_area_1?.trim() || null;
        const a2 = p.interested_area_2?.trim() || null;
        const areas = [a1, a2].filter(Boolean) as string[];
        if (areas.length === 0) return false;
        if (filterArea !== 'all') {
          if (!areas.includes(filterArea)) return false;
        } else if (filterGovernorate !== 'all') {
          const matchGov = areas.some(a => getGovernorateForArea(a) === filterGovernorate);
          if (!matchGov) return false;
        }
      }
      return true;
    });
  }, [allProfiles, dateFrom, dateTo, filterGender, filterGovernorate, filterArea]);

  const rooms = useMemo(() => {
    if (!allRooms) return allRooms;
    return allRooms.filter(r => {
      // Date range
      if (dateFrom && dateTo) {
        if (!r.created_at) return false;
        const t = new Date(r.created_at).getTime();
        if (t < dateFrom.getTime() || t > dateTo.getTime()) return false;
      }
      // Governorate (rooms.city stores the governorate)
      if (filterGovernorate !== 'all' && r.city !== filterGovernorate) return false;
      // Area
      if (filterArea !== 'all' && r.area !== filterArea) return false;
      // Room type
      if (filterRoomType !== 'all' && r.room_type !== filterRoomType) return false;
      // Gender — map room.allowed_gender (males_only/females_only) to male/female
      if (filterGender !== 'all') {
        const target = filterGender === 'male' ? 'males_only' : 'females_only';
        if (r.allowed_gender !== target) return false;
      }
      return true;
    });
  }, [allRooms, dateFrom, dateTo, filterGovernorate, filterArea, filterRoomType, filterGender]);


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

  // Preferred areas analytics (1st & 2nd choice)
  const preferredAreasData = useMemo(() => {
    if (!profiles) {
      return { combined: [], firstOnly: [], secondOnly: [], byGov: [], totalUsersWithPref: 0 };
    }

    type Stat = {
      key: string;
      area: string;
      governorate: string;
      areaLabel: string;
      governorateLabel: string;
      first: number;
      second: number;
      total: number;
    };

    const stats: Record<string, Stat> = {};
    const govStats: Record<string, { governorate: string; label: string; first: number; second: number; total: number }> = {};
    let usersWithPref = 0;

    profiles.forEach(p => {
      const a1 = p.interested_area_1?.trim() || null;
      const a2 = p.interested_area_2?.trim() || null;
      if (a1 || a2) usersWithPref++;

      const bump = (area: string | null, slot: 'first' | 'second') => {
        if (!area) return;
        const gov = getGovernorateForArea(area) || (isRTL ? 'غير محدد' : 'Unknown');
        const key = `${gov}__${area}`;
        if (!stats[key]) {
          stats[key] = {
            key,
            area,
            governorate: gov,
            areaLabel: getAreaLabel(area, isRTL),
            governorateLabel: getGovernorateLabel(gov, isRTL),
            first: 0,
            second: 0,
            total: 0,
          };
        }
        stats[key][slot]++;
        stats[key].total++;

        if (!govStats[gov]) {
          govStats[gov] = {
            governorate: gov,
            label: getGovernorateLabel(gov, isRTL),
            first: 0,
            second: 0,
            total: 0,
          };
        }
        govStats[gov][slot]++;
        govStats[gov].total++;
      };

      bump(a1, 'first');
      bump(a2, 'second');
    });

    const all = Object.values(stats);
    const combined = [...all].sort((a, b) => b.total - a.total).slice(0, 12);
    const firstOnly = [...all].sort((a, b) => b.first - a.first).slice(0, 10);
    const secondOnly = [...all].sort((a, b) => b.second - a.second).slice(0, 10);
    const byGov = Object.values(govStats).sort((a, b) => b.total - a.total);

    return { combined, firstOnly, secondOnly, byGov, totalUsersWithPref: usersWithPref };
  }, [profiles, isRTL]);

  // Age distribution (groups)
  const ageGroupsData = useMemo(() => {
    if (!profiles) return [];
    const buckets = [
      { label: '18-21', min: 18, max: 21 },
      { label: '22-25', min: 22, max: 25 },
      { label: '26-29', min: 26, max: 29 },
      { label: '30-34', min: 30, max: 34 },
      { label: '35-44', min: 35, max: 44 },
      { label: '45+', min: 45, max: 200 },
    ];
    const counts = buckets.map(b => ({ name: b.label, users: 0, males: 0, females: 0 }));
    let unknown = 0;
    profiles.forEach(p => {
      const age = p.age ?? null;
      if (age == null || age < 18) { unknown++; return; }
      const idx = buckets.findIndex(b => age >= b.min && age <= b.max);
      if (idx === -1) return;
      counts[idx].users++;
      if (p.gender === 'male') counts[idx].males++;
      else if (p.gender === 'female') counts[idx].females++;
    });
    return { groups: counts, unknown };
  }, [profiles]);

  // Occupation status breakdown
  const occupationStatusData = useMemo(() => {
    if (!profiles) return [];
    const counts: Record<string, number> = {};
    profiles.forEach(p => {
      const s = p.occupation_status || 'unknown';
      counts[s] = (counts[s] || 0) + 1;
    });
    const labels: Record<string, string> = isRTL
      ? { student: 'طالب', working: 'موظف', unemployed: 'بدون عمل', unknown: 'غير محدد' }
      : { student: 'Student', working: 'Working', unemployed: 'Unemployed', unknown: 'Not specified' };
    const colors: Record<string, string> = {
      student: '#3b82f6', working: '#10b981', unemployed: '#f59e0b', unknown: '#6b7280',
    };
    return Object.entries(counts).map(([k, value]) => ({
      name: labels[k] || k, value, fill: colors[k] || '#6b7280',
    }));
  }, [profiles, isRTL]);

  // Top universities (top 10)
  const topUniversitiesData = useMemo(() => {
    if (!profiles) return [];
    const counts: Record<string, number> = {};
    profiles.forEach(p => {
      const u = p.university?.trim();
      if (!u) return;
      counts[u] = (counts[u] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [profiles]);

  // Lifestyle (smoker / pets)
  const lifestyleData = useMemo(() => {
    if (!profiles) return { smokers: 0, nonSmokers: 0, withPets: 0, noPets: 0 };
    let smokers = 0, nonSmokers = 0, withPets = 0, noPets = 0;
    profiles.forEach(p => {
      if (p.is_smoker) smokers++; else nonSmokers++;
      if (p.has_pets) withPets++; else noPets++;
    });
    return { smokers, nonSmokers, withPets, noPets };
  }, [profiles]);

  // Room type distribution
  const roomTypeData = useMemo(() => {
    if (!rooms) return [];
    const counts: Record<string, number> = {};
    rooms.forEach(r => {
      const t = r.room_type || 'unknown';
      counts[t] = (counts[t] || 0) + 1;
    });
    const labels: Record<string, string> = isRTL
      ? { private_room: 'غرفة خاصة', shared_room: 'غرفة مشتركة', studio: 'استوديو', apartment: 'شقة' }
      : { private_room: 'Private Room', shared_room: 'Shared Room', studio: 'Studio', apartment: 'Apartment' };
    return Object.entries(counts).map(([k, value], i) => ({
      name: labels[k] || k, value, fill: COLORS[i % COLORS.length],
    }));
  }, [rooms, isRTL]);

  // Price distribution (EGP/month)
  const priceDistributionData = useMemo(() => {
    if (!rooms) return [];
    const buckets = [
      { label: '< 3K', min: 0, max: 2999 },
      { label: '3-5K', min: 3000, max: 4999 },
      { label: '5-8K', min: 5000, max: 7999 },
      { label: '8-12K', min: 8000, max: 11999 },
      { label: '12-18K', min: 12000, max: 17999 },
      { label: '18-25K', min: 18000, max: 24999 },
      { label: '25K+', min: 25000, max: Infinity },
    ];
    const counts = buckets.map(b => ({ name: b.label, rooms: 0 }));
    rooms.forEach(r => {
      const p = Number(r.price_per_month) || 0;
      const idx = buckets.findIndex(b => p >= b.min && p <= b.max);
      if (idx >= 0) counts[idx].rooms++;
    });
    return counts;
  }, [rooms]);

  // Growth: cumulative users + recent activity (7d / 30d)
  const growthMetrics = useMemo(() => {
    if (!profiles) return { last7d: 0, last30d: 0, last7dRooms: 0, last30dRooms: 0, avgPrice: 0, medianPrice: 0 };
    const now = Date.now();
    const ms7 = 7 * 24 * 3600 * 1000;
    const ms30 = 30 * 24 * 3600 * 1000;
    const last7d = profiles.filter(p => now - new Date(p.created_at).getTime() <= ms7).length;
    const last30d = profiles.filter(p => now - new Date(p.created_at).getTime() <= ms30).length;
    const last7dRooms = rooms?.filter((r: any) => r.created_at && now - new Date(r.created_at).getTime() <= ms7).length || 0;
    const last30dRooms = rooms?.filter((r: any) => r.created_at && now - new Date(r.created_at).getTime() <= ms30).length || 0;
    const prices = (rooms || []).map((r: any) => Number(r.price_per_month)).filter(n => n > 0).sort((a, b) => a - b);
    const avgPrice = prices.length ? Math.round(prices.reduce((s, n) => s + n, 0) / prices.length) : 0;
    const medianPrice = prices.length ? prices[Math.floor(prices.length / 2)] : 0;
    return { last7d, last30d, last7dRooms, last30dRooms, avgPrice, medianPrice };
  }, [profiles, rooms]);

  // Top viewed rooms (best marketing leads)
  const topViewedRoomsCount = useMemo(() => {
    if (!rooms) return 0;
    return rooms.filter((r: any) => (r.views_count || 0) > 0).length;
  }, [rooms]);


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

  // Summary totals (declared early so export handlers can reference them)
  const totalUsers = profiles?.length || 0;
  const verifiedUsers = profiles?.filter(p => p.verification_status === 'verified').length || 0;
  const totalRooms = rooms?.length || 0;
  const totalRoomViews = rooms?.reduce((sum, r) => sum + (r.views_count || 0), 0) || 0;


  const rangeLabel = React.useMemo(() => {
    if (rangePreset === 'all') return isRTL ? 'كل الوقت' : 'All time';
    if (rangePreset === '7d') return isRTL ? 'آخر 7 أيام' : 'Last 7 days';
    if (rangePreset === '30d') return isRTL ? 'آخر 30 يوم' : 'Last 30 days';
    if (rangePreset === '90d') return isRTL ? 'آخر 90 يوم' : 'Last 90 days';
    if (rangePreset === 'custom' && dateFrom && dateTo) {
      return `${format(dateFrom, 'yyyy-MM-dd')} → ${format(dateTo, 'yyyy-MM-dd')}`;
    }
    return isRTL ? 'مخصص' : 'Custom';
  }, [rangePreset, dateFrom, dateTo, isRTL]);

  const buildCsv = React.useCallback(() => {
    const rows: (string | number)[][] = [];
    const push = (...args: (string | number)[]) => rows.push(args);
    const section = (title: string) => { rows.push([]); rows.push([title]); };

    push('Sakanak Analytics Export');
    push('Generated', new Date().toISOString());
    push('Date range', rangeLabel);

    section('Summary');
    push('Metric', 'Value');
    push('Total Users', totalUsers);
    push('Verified Users', verifiedUsers);
    push('Verification Rate %', totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0);
    push('Total Rooms', totalRooms);
    push('Total Room Views', totalRoomViews);
    push('New Users (7d)', growthMetrics.last7d);
    push('New Users (30d)', growthMetrics.last30d);
    push('New Rooms (7d)', growthMetrics.last7dRooms);
    push('New Rooms (30d)', growthMetrics.last30dRooms);
    push('Avg Listing Price (EGP)', growthMetrics.avgPrice);
    push('Median Listing Price (EGP)', growthMetrics.medianPrice);

    section('Gender Distribution');
    push('Gender', 'Users');
    genderData.forEach((g: any) => push(g.name, g.value));

    section('Verification Status');
    push('Status', 'Users');
    verificationData.forEach((v: any) => push(v.name, v.value));

    section('Age Distribution');
    push('Age Group', 'Total', 'Males', 'Females');
    ((ageGroupsData as any).groups || []).forEach((b: any) => push(b.name, b.users, b.males, b.females));

    section('Occupation Status');
    push('Status', 'Users');
    occupationStatusData.forEach((o: any) => push(o.name, o.value));

    section('Top Universities');
    push('University', 'Users');
    topUniversitiesData.forEach((u: any) => push(u.name, u.value));

    section('Lifestyle');
    push('Metric', 'Count');
    push('Smokers', lifestyleData.smokers);
    push('Non-smokers', lifestyleData.nonSmokers);
    push('With pets', lifestyleData.withPets);
    push('No pets', lifestyleData.noPets);

    section('Room Types');
    push('Type', 'Listings');
    roomTypeData.forEach((r: any) => push(r.name, r.value));

    section('Price Distribution (EGP/month)');
    push('Bucket', 'Listings');
    priceDistributionData.forEach((p: any) => push(p.name, p.rooms));

    section('Listings by City');
    push('City', 'Listings');
    cityDistributionData.forEach((c: any) => push(c.name, c.value));

    section('Top Areas');
    push('Area', 'Listings');
    areaDistributionData.forEach((a: any) => push(a.name, a.value));

    section('Nationality');
    push('Nationality', 'Users');
    nationalityData.forEach((n: any) => push(n.name, n.value));

    section('Signups by Hour');
    push('Hour', 'Users');
    signupByHourData.forEach((h: any) => push(h.hour, h.users));

    const esc = (v: string | number) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return rows.map(r => r.map(esc).join(',')).join('\n');
  }, [
    rangeLabel, totalUsers, verifiedUsers, totalRooms, totalRoomViews, growthMetrics,
    genderData, verificationData, ageGroupsData, occupationStatusData, topUniversitiesData,
    lifestyleData, roomTypeData, priceDistributionData, cityDistributionData, areaDistributionData,
    nationalityData, signupByHourData,
  ]);

  const handleExportCsv = React.useCallback(() => {
    try {
      setExporting('csv');
      const csv = '\ufeff' + buildCsv(); // BOM for Excel UTF-8 (Arabic)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sakanak-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: isRTL ? 'تم تنزيل ملف CSV' : 'CSV downloaded' });
    } catch (e: any) {
      toast({ title: isRTL ? 'فشل التصدير' : 'Export failed', description: e?.message, variant: 'destructive' });
    } finally {
      setExporting(null);
    }
  }, [buildCsv, isRTL]);

  const handleExportPdf = React.useCallback(async () => {
    if (!dashboardRef.current) return;
    try {
      setExporting('pdf');
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      const node = dashboardRef.current;
      const canvas = await html2canvas(node, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: getComputedStyle(document.body).backgroundColor || '#ffffff',
        logging: false,
        windowWidth: node.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const usableWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      // Cover page with key metrics
      pdf.setFontSize(18);
      pdf.text('Sakanak — Analytics Report', margin, 16);
      pdf.setFontSize(11);
      pdf.setTextColor(100);
      pdf.text(`Generated: ${format(new Date(), 'PPpp')}`, margin, 24);
      pdf.text(`Date range: ${rangeLabel}`, margin, 30);
      pdf.setTextColor(0);
      pdf.setFontSize(12);
      pdf.text('Key Metrics', margin, 42);
      pdf.setFontSize(10);
      const metrics: [string, string | number][] = [
        ['Total Users', totalUsers],
        ['Verified Users', verifiedUsers],
        ['Verification Rate', totalUsers > 0 ? `${Math.round((verifiedUsers / totalUsers) * 100)}%` : '0%'],
        ['Total Rooms', totalRooms],
        ['Total Room Views', totalRoomViews.toLocaleString()],
        ['New Users (7d)', growthMetrics.last7d],
        ['New Users (30d)', growthMetrics.last30d],
        ['New Rooms (7d)', growthMetrics.last7dRooms],
        ['New Rooms (30d)', growthMetrics.last30dRooms],
        ['Avg Listing Price', `${growthMetrics.avgPrice.toLocaleString()} EGP`],
        ['Median Listing Price', `${growthMetrics.medianPrice.toLocaleString()} EGP`],
      ];
      let y = 50;
      metrics.forEach(([k, v]) => {
        pdf.text(`${k}:`, margin, y);
        pdf.text(String(v), margin + 70, y);
        y += 6;
      });

      // Append the rendered dashboard, paginated across pages
      pdf.addPage();
      let heightLeft = imgHeight;
      let position = margin;
      pdf.addImage(imgData, 'JPEG', margin, position, usableWidth, imgHeight, undefined, 'FAST');
      heightLeft -= (pageHeight - margin * 2);

      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, usableWidth, imgHeight, undefined, 'FAST');
        heightLeft -= (pageHeight - margin * 2);
      }

      pdf.save(`sakanak-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast({ title: isRTL ? 'تم تنزيل ملف PDF' : 'PDF downloaded' });
    } catch (e: any) {
      toast({ title: isRTL ? 'فشل التصدير' : 'Export failed', description: e?.message, variant: 'destructive' });
    } finally {
      setExporting(null);
    }
  }, [rangeLabel, totalUsers, verifiedUsers, totalRooms, totalRoomViews, growthMetrics, isRTL]);

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

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="section-container">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link to="/admin" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
            <div className="p-3 rounded-xl bg-primary/10">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold">
                {isRTL ? 'التحليلات والإحصائيات' : 'Analytics & Statistics'}
              </h1>
              <p className="text-muted-foreground">
                {isRTL ? 'نظرة عامة على أداء المنصة' : 'Platform performance overview'}
              </p>
            </div>

            {/* Export menu */}
            <div className="ms-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!!exporting || profilesLoading || roomsLoading}
                  >
                    {exporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isRTL ? 'تصدير التقرير' : 'Export report'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56">
                  <DropdownMenuLabel>
                    {isRTL ? `الفترة: ${rangeLabel}` : `Range: ${rangeLabel}`}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportCsv} disabled={!!exporting}>
                    <FileSpreadsheet className="w-4 h-4" />
                    {isRTL ? 'تنزيل CSV' : 'Download CSV'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPdf} disabled={!!exporting}>
                    <FileText className="w-4 h-4" />
                    {isRTL ? 'تنزيل PDF' : 'Download PDF'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div ref={dashboardRef}>

          {/* Date Range Filter */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CalendarRange className="w-4 h-4 text-primary" />
                  {isRTL ? 'الفترة الزمنية:' : 'Date range:'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { key: 'all', en: 'All time', ar: 'كل الوقت' },
                    { key: '7d', en: 'Last 7 days', ar: 'آخر 7 أيام' },
                    { key: '30d', en: 'Last 30 days', ar: 'آخر 30 يوم' },
                    { key: '90d', en: 'Last 90 days', ar: 'آخر 90 يوم' },
                    { key: 'custom', en: 'Custom', ar: 'مخصص' },
                  ] as const).map(opt => (
                    <Button
                      key={opt.key}
                      size="sm"
                      variant={rangePreset === opt.key ? 'default' : 'outline'}
                      onClick={() => setRangePreset(opt.key)}
                    >
                      {isRTL ? opt.ar : opt.en}
                    </Button>
                  ))}
                </div>

                {rangePreset === 'custom' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn('justify-start text-left font-normal', !customFrom && 'text-muted-foreground')}
                        >
                          <Calendar className="w-4 h-4 me-2" />
                          {customFrom ? format(customFrom, 'PP') : (isRTL ? 'من' : 'From')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarUI
                          mode="single"
                          selected={customFrom}
                          onSelect={setCustomFrom}
                          initialFocus
                          className={cn('p-3 pointer-events-auto')}
                        />
                      </PopoverContent>
                    </Popover>
                    <span className="text-muted-foreground text-sm">→</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn('justify-start text-left font-normal', !customTo && 'text-muted-foreground')}
                        >
                          <Calendar className="w-4 h-4 me-2" />
                          {customTo ? format(customTo, 'PP') : (isRTL ? 'إلى' : 'To')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarUI
                          mode="single"
                          selected={customTo}
                          onSelect={setCustomTo}
                          disabled={(date) => customFrom ? date < customFrom : false}
                          initialFocus
                          className={cn('p-3 pointer-events-auto')}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {dateFrom && dateTo && (
                  <div className="text-xs text-muted-foreground lg:ms-auto">
                    {isRTL ? 'يعرض البيانات من' : 'Showing data from'}{' '}
                    <span className="font-medium text-foreground">{format(dateFrom, 'PP')}</span>{' '}
                    {isRTL ? 'إلى' : 'to'}{' '}
                    <span className="font-medium text-foreground">{format(dateTo, 'PP')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Segment Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-end gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-medium lg:mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  {isRTL ? 'فلاتر القطاع:' : 'Segment filters:'}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                  {/* Governorate */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      {isRTL ? 'المحافظة' : 'Governorate'}
                    </label>
                    <Select value={filterGovernorate} onValueChange={setFilterGovernorate}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-72 bg-popover z-50">
                        <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                        {governorateOptions.map(g => (
                          <SelectItem key={g} value={g}>
                            {getGovernorateLabel(g, isRTL)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Area */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      {isRTL ? 'المنطقة' : 'City / Area'}
                    </label>
                    <Select
                      value={filterArea}
                      onValueChange={setFilterArea}
                      disabled={filterGovernorate === 'all'}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder={isRTL ? 'اختر محافظة أولاً' : 'Pick governorate first'} />
                      </SelectTrigger>
                      <SelectContent className="max-h-72 bg-popover z-50">
                        <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                        {areaOptions.map(a => (
                          <SelectItem key={a} value={a}>
                            {getAreaLabel(a, isRTL)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Room Type */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      {isRTL ? 'نوع الإعلان' : 'Listing type'}
                    </label>
                    <Select value={filterRoomType} onValueChange={setFilterRoomType}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                        <SelectItem value="private_room">{isRTL ? 'غرفة خاصة' : 'Private Room'}</SelectItem>
                        <SelectItem value="shared_room">{isRTL ? 'غرفة مشتركة' : 'Shared Room'}</SelectItem>
                        <SelectItem value="studio">{isRTL ? 'استوديو' : 'Studio'}</SelectItem>
                        <SelectItem value="apartment">{isRTL ? 'شقة' : 'Apartment'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      {isRTL ? 'الجنس' : 'Gender'}
                    </label>
                    <Select value={filterGender} onValueChange={setFilterGender}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                        <SelectItem value="male">{isRTL ? 'ذكور' : 'Males'}</SelectItem>
                        <SelectItem value="female">{isRTL ? 'إناث' : 'Females'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {hasActiveFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetSegmentFilters}
                    className="lg:mb-0 self-end"
                  >
                    <X className="w-4 h-4 me-1" />
                    {isRTL ? 'مسح الفلاتر' : 'Clear filters'}
                  </Button>
                )}
              </div>

              {hasActiveFilter && (
                <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{isRTL ? 'مفعّل:' : 'Active:'}</span>
                  {filterGovernorate !== 'all' && (
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="w-3 h-3" />
                      {getGovernorateLabel(filterGovernorate, isRTL)}
                    </Badge>
                  )}
                  {filterArea !== 'all' && (
                    <Badge variant="secondary">{getAreaLabel(filterArea, isRTL)}</Badge>
                  )}
                  {filterRoomType !== 'all' && (
                    <Badge variant="secondary">
                      {filterRoomType === 'private_room' ? (isRTL ? 'غرفة خاصة' : 'Private Room')
                        : filterRoomType === 'shared_room' ? (isRTL ? 'غرفة مشتركة' : 'Shared Room')
                        : filterRoomType === 'studio' ? (isRTL ? 'استوديو' : 'Studio')
                        : (isRTL ? 'شقة' : 'Apartment')}
                    </Badge>
                  )}
                  {filterGender !== 'all' && (
                    <Badge variant="secondary">
                      {filterGender === 'male' ? (isRTL ? 'ذكور' : 'Males') : (isRTL ? 'إناث' : 'Females')}
                    </Badge>
                  )}
                  <span className="text-muted-foreground ms-auto">
                    {isRTL
                      ? `${profiles?.length || 0} مستخدم • ${rooms?.length || 0} إعلان`
                      : `${profiles?.length || 0} users • ${rooms?.length || 0} listings`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

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

          {/* Marketing Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{growthMetrics.last7d}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'مستخدمون آخر ٧ أيام' : 'New Users (7d)'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{growthMetrics.last30d}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'مستخدمون آخر ٣٠ يوم' : 'New Users (30d)'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-green-500/10">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{growthMetrics.avgPrice.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'متوسط سعر الإعلان' : 'Avg Listing Price'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-500/10">
                    <Target className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {totalUsers > 0 ? `${Math.round((verifiedUsers / totalUsers) * 100)}%` : '0%'}
                    </p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'معدل التحقق' : 'Verification Rate'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Age Distribution Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cake className="w-5 h-5 text-primary" />
                {isRTL ? 'توزيع الأعمار' : 'Age Distribution'}
              </CardTitle>
              <CardDescription>
                {isRTL
                  ? `الفئات العمرية للمستخدمين مقسمة حسب الجنس${(ageGroupsData as any).unknown ? ` (${(ageGroupsData as any).unknown} مستخدم بدون عمر محدد)` : ''}`
                  : `User age groups split by gender${(ageGroupsData as any).unknown ? ` (${(ageGroupsData as any).unknown} users with no age)` : ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profilesLoading ? (
                <Skeleton className="h-72" />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={(ageGroupsData as any).groups || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Bar dataKey="males" stackId="a" fill="#3b82f6" name={isRTL ? 'ذكور' : 'Males'} />
                    <Bar dataKey="females" stackId="a" fill="#ec4899" name={isRTL ? 'إناث' : 'Females'} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Occupation + Room Type */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  {isRTL ? 'الحالة المهنية' : 'Occupation Status'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'يساعد في استهداف الحملات (طلاب / موظفين)' : 'Helps target campaigns (students vs working)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profilesLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={occupationStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {occupationStatusData.map((entry, i) => (
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  {isRTL ? 'أنواع الإعلانات' : 'Listing Types'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'النوع الأكثر شيوعًا في السوق' : 'Most common listing types'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {roomsLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={roomTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {roomTypeData.map((entry, i) => (
                          <Cell key={i} fill={(entry as any).fill} />
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

          {/* Price Distribution */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                {isRTL ? 'توزيع الأسعار (شهريًا)' : 'Listing Price Distribution (per month)'}
              </CardTitle>
              <CardDescription>
                {isRTL
                  ? `متوسط: ${growthMetrics.avgPrice.toLocaleString()} جنيه — وسيط: ${growthMetrics.medianPrice.toLocaleString()} جنيه`
                  : `Average: ${growthMetrics.avgPrice.toLocaleString()} EGP — Median: ${growthMetrics.medianPrice.toLocaleString()} EGP`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roomsLoading ? (
                <Skeleton className="h-72" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="rooms" fill="#10b981" radius={[4, 4, 0, 0]} name={isRTL ? 'إعلانات' : 'Listings'} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top Universities + Lifestyle */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  {isRTL ? 'أكثر ١٠ جامعات' : 'Top 10 Universities'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'استهداف الحملات الطلابية' : 'For student-targeted campaigns'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profilesLoading ? (
                  <Skeleton className="h-72" />
                ) : topUniversitiesData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    {isRTL ? 'لا توجد بيانات جامعات' : 'No university data'}
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={topUniversitiesData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} name={isRTL ? 'طلاب' : 'Students'}>
                        {topUniversitiesData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {isRTL ? 'نمط حياة المستخدمين' : 'User Lifestyle'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'مدخنين / يملكون حيوانات أليفة' : 'Smokers and pet owners'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profilesLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="rounded-lg border border-border p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{isRTL ? 'مدخنون' : 'Smokers'}</p>
                      <p className="text-3xl font-bold text-orange-500">{lifestyleData.smokers}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {totalUsers > 0 ? `${Math.round((lifestyleData.smokers / totalUsers) * 100)}%` : '0%'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{isRTL ? 'غير مدخنين' : 'Non-smokers'}</p>
                      <p className="text-3xl font-bold text-green-500">{lifestyleData.nonSmokers}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {totalUsers > 0 ? `${Math.round((lifestyleData.nonSmokers / totalUsers) * 100)}%` : '0%'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{isRTL ? 'يملكون حيوانات' : 'With Pets'}</p>
                      <p className="text-3xl font-bold text-purple-500">{lifestyleData.withPets}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {totalUsers > 0 ? `${Math.round((lifestyleData.withPets / totalUsers) * 100)}%` : '0%'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{isRTL ? 'بدون حيوانات' : 'No Pets'}</p>
                      <p className="text-3xl font-bold text-blue-500">{lifestyleData.noPets}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {totalUsers > 0 ? `${Math.round((lifestyleData.noPets / totalUsers) * 100)}%` : '0%'}
                      </p>
                    </div>
                  </div>
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

          {/* Preferred Areas (1st & 2nd choice) */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {isRTL ? 'المناطق المفضلة للمستخدمين' : 'Most Chosen Preferred Areas'}
              </CardTitle>
              <CardDescription>
                {isRTL
                  ? `أكثر المناطق التي اختارها المستخدمون كأول وثاني تفضيل (${preferredAreasData.totalUsersWithPref} مستخدم لديه تفضيلات)`
                  : `Top areas users selected as 1st and 2nd preference (${preferredAreasData.totalUsersWithPref} users with preferences)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profilesLoading ? (
                <Skeleton className="h-72" />
              ) : preferredAreasData.combined.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  {isRTL ? 'لا توجد بيانات مناطق مفضلة بعد' : 'No preferred area data yet'}
                </p>
              ) : (
                <>
                  <ResponsiveContainer
                    width="100%"
                    height={Math.max(320, preferredAreasData.combined.length * 36)}
                  >
                    <BarChart
                      data={preferredAreasData.combined.map(d => ({
                        name: `${d.areaLabel} — ${d.governorateLabel}`,
                        first: d.first,
                        second: d.second,
                      }))}
                      layout="vertical"
                      margin={{ left: 8, right: 24 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        className="fill-muted-foreground"
                        width={180}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend />
                      <Bar
                        dataKey="first"
                        stackId="a"
                        fill="#F96300"
                        name={isRTL ? 'الاختيار الأول' : '1st Choice'}
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="second"
                        stackId="a"
                        fill="#3b82f6"
                        name={isRTL ? 'الاختيار الثاني' : '2nd Choice'}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Detailed breakdown table */}
                  <div className="mt-6 overflow-x-auto">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">
                      {isRTL ? 'تفاصيل المناطق' : 'Area Details'}
                    </h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs text-muted-foreground">
                          <th className={`py-2 px-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>#</th>
                          <th className={`py-2 px-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                            {isRTL ? 'المحافظة' : 'Governorate'}
                          </th>
                          <th className={`py-2 px-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                            {isRTL ? 'المنطقة' : 'Area'}
                          </th>
                          <th className="py-2 px-3 font-medium text-center">
                            {isRTL ? 'الاختيار الأول' : '1st Choice'}
                          </th>
                          <th className="py-2 px-3 font-medium text-center">
                            {isRTL ? 'الاختيار الثاني' : '2nd Choice'}
                          </th>
                          <th className="py-2 px-3 font-medium text-center">
                            {isRTL ? 'المجموع' : 'Total'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {preferredAreasData.combined.map((row, i) => (
                          <tr key={row.key} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                            <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                            <td className="py-2 px-3">
                              <Badge variant="outline" className="font-normal">{row.governorateLabel}</Badge>
                            </td>
                            <td className="py-2 px-3 font-medium text-foreground">{row.areaLabel}</td>
                            <td className="py-2 px-3 text-center">
                              <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                                {row.first}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-semibold">
                                {row.second}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-foreground">{row.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Governorate summary */}
                  {preferredAreasData.byGov.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold mb-3 text-foreground">
                        {isRTL ? 'ملخص حسب المحافظة' : 'Summary by Governorate'}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {preferredAreasData.byGov.map(g => (
                          <div
                            key={g.governorate}
                            className="rounded-lg border border-border bg-card/50 p-3"
                          >
                            <p className="text-xs text-muted-foreground truncate">{g.label}</p>
                            <p className="text-xl font-bold text-foreground">{g.total}</p>
                            <div className="flex gap-2 mt-1 text-[10px] text-muted-foreground">
                              <span>1st: <span className="text-primary font-semibold">{g.first}</span></span>
                              <span>2nd: <span className="text-blue-500 font-semibold">{g.second}</span></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>


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
          </div>{/* /dashboardRef */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAnalytics;
