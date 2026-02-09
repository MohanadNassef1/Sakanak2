import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsAdmin } from '@/hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Gift, Users, CheckCircle, Trophy } from 'lucide-react';

interface ReferralStat {
  user_id: string;
  full_name: string;
  referral_code: string;
  total_signups: number;
  verified_signups: number;
}

const AdminReferrals: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isRTL } = useLanguage();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && !roleLoading && !isAdmin) {
      navigate('/');
    }
  }, [authLoading, roleLoading, isAdmin, navigate]);

  // Fetch referral stats
  const { data: referralStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-referral-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_referral_stats');
      if (error) throw error;
      return data as ReferralStat[];
    },
    enabled: isAdmin,
  });

  // Calculate totals
  const totalReferrals = referralStats?.reduce((sum, s) => sum + s.total_signups, 0) || 0;
  const totalVerified = referralStats?.reduce((sum, s) => sum + s.verified_signups, 0) || 0;

  if (authLoading || roleLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-secondary/30 pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <Skeleton className="h-12 w-64 mb-8" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-secondary/30 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-2">
                <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
                {isRTL ? 'العودة للوحة التحكم' : 'Back to Admin'}
              </Button>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Gift className="w-8 h-8 text-primary" />
                {isRTL ? 'لوحة الإحالات' : 'Referral Dashboard'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isRTL ? 'تتبع أداء برنامج الإحالة' : 'Track referral program performance'}
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold">{referralStats?.length || 0}</div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'السفراء النشطون' : 'Active Ambassadors'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Gift className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-3xl font-bold">{totalReferrals}</div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'إجمالي التسجيلات' : 'Total Signups'}
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-3xl font-bold text-primary">{totalVerified}</div>
                <p className="text-sm text-muted-foreground font-medium">
                  {isRTL ? 'التسجيلات الموثقة (مقياس الدفع)' : 'Verified Signups (Payout Metric)'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                {isRTL ? 'لوحة المتصدرين' : 'Leaderboard'}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'مرتبة حسب عدد التسجيلات الموثقة'
                  : 'Ranked by verified signups count'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : referralStats && referralStats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>{isRTL ? 'اسم السفير' : 'Ambassador Name'}</TableHead>
                      <TableHead>{isRTL ? 'الكود' : 'Code'}</TableHead>
                      <TableHead className="text-center">
                        {isRTL ? 'إجمالي التسجيلات' : 'Total Signups'}
                      </TableHead>
                      <TableHead className="text-center">
                        <span className="flex items-center justify-center gap-1 text-primary font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          {isRTL ? 'التسجيلات الموثقة' : 'Verified Signups'}
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralStats.map((stat, index) => (
                      <TableRow key={stat.user_id}>
                        <TableCell className="font-medium">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{stat.full_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {stat.referral_code}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{stat.total_signups}</TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={stat.verified_signups > 0 ? 'default' : 'secondary'}
                            className={stat.verified_signups > 0 ? 'bg-green-500' : ''}
                          >
                            {stat.verified_signups}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isRTL ? 'لا توجد بيانات إحالة بعد' : 'No referral data yet'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {isRTL 
                      ? 'سيظهر هنا السفراء بمجرد إنشاء أكواد الإحالة الخاصة بهم'
                      : 'Ambassadors will appear here once they generate their referral codes'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminReferrals;
