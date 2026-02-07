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
import { 
  Shield, ArrowLeft, ArrowRight, Home, Star, Search, 
  X, GripVertical, Check, MapPin, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const AdminFeaturedRooms = () => {
  const { isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

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

  // Fetch current featured room IDs
  const { data: featuredRoomIds, isLoading: loadingSettings } = useQuery({
    queryKey: ['homepage-featured-rooms-setting'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'homepage_featured_rooms')
        .single();
      
      if (error) return [];
      return (data?.value as string[]) || [];
    },
    enabled: isAdmin === true,
  });

  // Fetch featured rooms details
  const { data: featuredRooms, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-rooms-details', featuredRoomIds],
    queryFn: async () => {
      if (!featuredRoomIds || featuredRoomIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('rooms')
        .select('id, title, city, area, price_per_month, photos, status')
        .in('id', featuredRoomIds);
      
      if (error) return [];
      
      // Sort by the order in featuredRoomIds
      return featuredRoomIds
        .map(id => data?.find(r => r.id === id))
        .filter(Boolean);
    },
    enabled: !!featuredRoomIds && featuredRoomIds.length > 0,
  });

  // Fetch all active rooms for selection
  const { data: allRooms, isLoading: loadingRooms } = useQuery({
    queryKey: ['all-active-rooms', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('rooms')
        .select('id, title, city, area, price_per_month, photos, status')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,area.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) return [];
      return data;
    },
    enabled: isAdmin === true,
  });

  // Update featured rooms
  const updateFeatured = useMutation({
    mutationFn: async (roomIds: string[]) => {
      const { error } = await supabase
        .from('site_settings')
        .update({ 
          value: roomIds,
          updated_at: new Date().toISOString(),
          updated_by: user?.id 
        })
        .eq('key', 'homepage_featured_rooms');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-featured-rooms-setting'] });
      queryClient.invalidateQueries({ queryKey: ['featured-rooms-details'] });
      queryClient.invalidateQueries({ queryKey: ['premium-rooms'] });
      toast.success(isRTL ? 'تم تحديث الإعلانات المميزة' : 'Featured rooms updated');
    },
    onError: () => {
      toast.error(isRTL ? 'فشل في التحديث' : 'Failed to update');
    },
  });

  const addRoom = (roomId: string) => {
    if (!featuredRoomIds) return;
    if (featuredRoomIds.length >= 3) {
      toast.error(isRTL ? 'الحد الأقصى 3 إعلانات' : 'Maximum 3 rooms allowed');
      return;
    }
    if (featuredRoomIds.includes(roomId)) {
      toast.error(isRTL ? 'الإعلان مضاف بالفعل' : 'Room already added');
      return;
    }
    updateFeatured.mutate([...featuredRoomIds, roomId]);
  };

  const removeRoom = (roomId: string) => {
    if (!featuredRoomIds) return;
    updateFeatured.mutate(featuredRoomIds.filter(id => id !== roomId));
  };

  const moveRoom = (index: number, direction: 'up' | 'down') => {
    if (!featuredRoomIds) return;
    const newIds = [...featuredRoomIds];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newIds.length) return;
    [newIds[index], newIds[swapIndex]] = [newIds[swapIndex], newIds[index]];
    updateFeatured.mutate(newIds);
  };

  // Loading states
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

  const availableRooms = allRooms?.filter(r => !featuredRoomIds?.includes(r.id)) || [];

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
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {isRTL ? 'الإعلانات المميزة بالصفحة الرئيسية' : 'Homepage Featured Rooms'}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isRTL ? 'اختر 3 إعلانات تظهر في الصفحة الرئيسية' : 'Select 3 rooms to display on the homepage'}
                </p>
              </div>
            </div>
          </div>

          {/* Current Featured Rooms */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                {isRTL ? 'الإعلانات المختارة' : 'Selected Rooms'}
                <Badge variant="secondary" className="ml-2">
                  {featuredRoomIds?.length || 0}/3
                </Badge>
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'هذه الإعلانات ستظهر في الصفحة الرئيسية بالترتيب المحدد'
                  : 'These rooms will appear on the homepage in the selected order'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSettings || loadingFeatured ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : featuredRooms && featuredRooms.length > 0 ? (
                <div className="space-y-3">
                  {featuredRooms.map((room: any, index: number) => (
                    <div 
                      key={room.id}
                      className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border"
                    >
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveRoom(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowLeft className={`w-3 h-3 ${isRTL ? '' : 'rotate-90'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveRoom(index, 'down')}
                          disabled={index === featuredRooms.length - 1}
                        >
                          <ArrowRight className={`w-3 h-3 ${isRTL ? '' : 'rotate-90'}`} />
                        </Button>
                      </div>
                      
                      <Badge className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                        {index + 1}
                      </Badge>
                      
                      <img 
                        src={room.photos?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100'} 
                        alt={room.title}
                        className="w-16 h-16 rounded-lg object-cover"
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
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeRoom(room.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Home className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>{isRTL ? 'لم يتم اختيار أي إعلانات بعد' : 'No rooms selected yet'}</p>
                  <p className="text-sm">{isRTL ? 'اختر من القائمة أدناه' : 'Select from the list below'}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Rooms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                {isRTL ? 'الإعلانات المتاحة' : 'Available Rooms'}
              </CardTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={isRTL ? 'ابحث بالعنوان أو المدينة...' : 'Search by title or city...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loadingRooms ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : availableRooms.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {availableRooms.map((room: any) => (
                    <div 
                      key={room.id}
                      className="flex items-center gap-3 p-3 hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer group"
                      onClick={() => addRoom(room.id)}
                    >
                      <img 
                        src={room.photos?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100'} 
                        alt={room.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{room.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {room.area ? `${room.area}, ` : ''}{room.city} • EGP {room.price_per_month?.toLocaleString()}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={featuredRoomIds?.length === 3}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {isRTL ? 'إضافة' : 'Add'}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{isRTL ? 'لا توجد نتائج' : 'No rooms found'}</p>
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

export default AdminFeaturedRooms;
