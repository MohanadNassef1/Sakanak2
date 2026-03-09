import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, ArrowLeft, ArrowRight, Home, Search, MapPin, 
  CheckCircle, Clock, XCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

type RoomStatus = 'active' | 'rented' | 'expired';

const STATUS_CONFIG: Record<RoomStatus, { label: { en: string; ar: string }; color: string; icon: React.ElementType }> = {
  active: { label: { en: 'Available', ar: 'متاح' }, color: 'bg-green-500', icon: CheckCircle },
  rented: { label: { en: 'Rented', ar: 'مؤجرة' }, color: 'bg-emerald-600', icon: Home },
  expired: { label: { en: 'Pending', ar: 'قيد التفاوض' }, color: 'bg-orange-500', icon: Clock },
};

const AdminRoomStatus = () => {
  const { isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  const { data: rooms, isLoading: loadingRooms } = useQuery({
    queryKey: ['admin-all-rooms', searchQuery, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('rooms')
        .select('id, title, city, area, price_per_month, photos, status, owner_id')
        .in('status', ['active', 'rented', 'expired'] as any)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus as any);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,area.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) return [];
      return data;
    },
    enabled: isAdmin === true,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ roomId, status }: { roomId: string; status: 'active' | 'rented' | 'expired' }) => {
      const { error } = await supabase
        .from('rooms')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', roomId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['premium-rooms'] });
      toast.success(isRTL ? 'تم تحديث حالة الإعلان' : 'Room status updated');
    },
    onError: () => {
      toast.error(isRTL ? 'فشل في التحديث' : 'Failed to update status');
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

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as RoomStatus];
    if (!config) return <Badge variant="secondary">{status}</Badge>;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {isRTL ? config.label.ar : config.label.en}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="section-container max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {isRTL ? 'إدارة حالة الإعلانات' : 'Manage Room Status'}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isRTL ? 'تغيير حالة كل إعلان (متاح / مؤجرة / قيد التفاوض)' : 'Set each room as Available, Rented, or Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={isRTL ? 'ابحث بالعنوان أو المدينة...' : 'Search by title or city...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="active">{isRTL ? 'متاح' : 'Available'}</SelectItem>
                  <SelectItem value="rented">{isRTL ? 'مؤجرة' : 'Rented'}</SelectItem>
                  <SelectItem value="expired">{isRTL ? 'قيد التفاوض' : 'Pending'}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Rooms List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {isRTL ? 'الإعلانات' : 'Listings'}
                {rooms && (
                  <Badge variant="secondary" className="ml-2">{rooms.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRooms ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : rooms && rooms.length > 0 ? (
                <div className="space-y-3">
                  {rooms.map((room: any) => (
                    <div 
                      key={room.id}
                      className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border"
                    >
                      <img 
                        src={room.photos?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100'} 
                        alt={room.title}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{room.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {room.area ? `${room.area}, ` : ''}{room.city}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          EGP {room.price_per_month?.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {getStatusBadge(room.status)}
                        
                        <Select 
                          value={room.status}
                          onValueChange={(value) => updateStatus.mutate({ roomId: room.id, status: value as 'active' | 'rented' | 'expired' })}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">
                              <span className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {isRTL ? 'متاح' : 'Available'}
                              </span>
                            </SelectItem>
                            <SelectItem value="rented">
                              <span className="flex items-center gap-2">
                                <Home className="w-3 h-3 text-emerald-600" />
                                {isRTL ? 'مؤجرة' : 'Rented'}
                              </span>
                            </SelectItem>
                            <SelectItem value="expired">
                              <span className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-orange-500" />
                                {isRTL ? 'قيد التفاوض' : 'Pending'}
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Home className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>{isRTL ? 'لا توجد إعلانات' : 'No rooms found'}</p>
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

export default AdminRoomStatus;
