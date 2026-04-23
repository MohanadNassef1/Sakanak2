import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import { useSavedSearches, useDeleteSavedSearch, useToggleSavedSearch, useSearchNotifications, useMarkNotificationsRead } from '@/hooks/useSavedSearches';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Bell, BellOff, Home, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getGovernorateLabel, getAreaLabel } from '@/lib/locationData';

const roomTypeLabelsEn: Record<string, string> = {
  private_room: 'Private Room',
  shared_room: 'Shared Room',
  studio: 'Studio',
  apartment: 'Apartment',
};

const roomTypeLabelsAr: Record<string, string> = {
  private_room: 'غرفة خاصة',
  shared_room: 'غرفة مشتركة',
  studio: 'استوديو',
  apartment: 'شقة',
};

const MyAlertsContent: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: searches, isLoading } = useSavedSearches();
  const { data: notifications } = useSearchNotifications();
  const deleteSearch = useDeleteSavedSearch();
  const toggleSearch = useToggleSavedSearch();
  const markRead = useMarkNotificationsRead();

  React.useEffect(() => {
    if (notifications?.some(n => !n.is_read)) {
      markRead.mutate();
    }
  }, [notifications]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const getFilterSummary = (filters: any) => {
    const parts: string[] = [];
    if (filters.city) parts.push(getGovernorateLabel(filters.city, isRTL));
    if (filters.area) parts.push(getAreaLabel(filters.area, isRTL));
    if (filters.roomType) parts.push(isRTL ? roomTypeLabelsAr[filters.roomType] : roomTypeLabelsEn[filters.roomType]);
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice || 0;
      const max = filters.maxPrice || '∞';
      parts.push(`${min}-${max} EGP`);
    }
    return parts.length > 0 ? parts.join(' • ') : (isRTL ? 'كل الغرف' : 'All rooms');
  };

  // Count notifications per search
  const notifCounts: Record<string, number> = {};
  notifications?.forEach(n => {
    if (!n.is_read) {
      notifCounts[n.saved_search_id] = (notifCounts[n.saved_search_id] || 0) + 1;
    }
  });

  return (
    <MainLayout>
      <SEOHead title={isRTL ? 'تنبيهاتي - سكنك' : 'My Alerts - Sakanak'} description="Manage your saved search alerts" canonicalPath="/my-alerts" />
      <div className="min-h-screen bg-secondary/30 pb-32">
        <div className="bg-gradient-to-br from-primary/10 via-background to-orange-500/5 border-b border-border/50 pt-6 pb-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{isRTL ? 'تنبيهاتي' : 'My Alerts'}</h1>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'سنخبرك عند وجود غرف جديدة تطابق معاييرك' : "We'll notify you when new rooms match your criteria"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pt-6 max-w-2xl">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : searches && searches.length > 0 ? (
            <div className="space-y-3">
              {searches.map(search => (
                <Card key={search.id} className={`border-border/50 ${!search.is_active ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Home className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-medium text-sm truncate">
                            {search.label || getFilterSummary(search.filters)}
                          </span>
                          {notifCounts[search.id] && (
                            <Badge variant="default" className="text-xs">{notifCounts[search.id]} {isRTL ? 'جديد' : 'new'}</Badge>
                          )}
                        </div>
                        {search.label && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {getFilterSummary(search.filters)}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1.5">
                            <Switch
                              checked={search.is_active}
                              onCheckedChange={(checked) => toggleSearch.mutate({ id: search.id, is_active: checked })}
                              className="scale-75"
                            />
                            <span className="text-xs text-muted-foreground">
                              {search.is_active ? (isRTL ? 'مفعل' : 'Active') : (isRTL ? 'معطل' : 'Paused')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => {
                          deleteSearch.mutate(search.id);
                          toast.success(isRTL ? 'تم حذف التنبيه' : 'Alert deleted');
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <BellOff className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{isRTL ? 'لا توجد تنبيهات بعد' : 'No alerts yet'}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isRTL ? 'استخدم الفلاتر في صفحة تصفح الغرف واحفظ بحثك لتلقي التنبيهات' : 'Use filters on the Browse Rooms page and save your search to get notified'}
              </p>
              <Button onClick={() => navigate('/rooms')}>
                {isRTL ? 'تصفح الغرف' : 'Browse Rooms'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

const MyAlerts: React.FC = () => <MyAlertsContent />;

export default MyAlerts;
