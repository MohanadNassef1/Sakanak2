import React, { useState } from 'react';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  useTenantViewings, 
  useLandlordViewings,
  useConfirmViewing,
  useCancelViewing,
  useAcceptCounterProposal,
  useConfirmRental,
  useCompleteViewing,
  useShareLocation,
} from '@/hooks/useViewings';
import MainLayout from '@/components/MainLayout';
import ViewingCard from '@/components/viewings/ViewingCard';
import CounterProposeDialog from '@/components/viewings/CounterProposeDialog';
import DeclineDialog from '@/components/viewings/DeclineDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Home, Calendar, AlertCircle } from 'lucide-react';
import { ViewingRequest } from '@/types/viewing';

const MyViewingsContent: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: tenantViewings, isLoading: tenantLoading } = useTenantViewings();
  const { data: landlordViewings, isLoading: landlordLoading } = useLandlordViewings();

  const confirmViewing = useConfirmViewing();
  const cancelViewing = useCancelViewing();
  const acceptCounter = useAcceptCounterProposal();
  const confirmRental = useConfirmRental();
  const completeViewing = useCompleteViewing();
  const shareLocation = useShareLocation();

  // Dialog states
  const [counterProposeViewing, setCounterProposeViewing] = useState<ViewingRequest | null>(null);
  const [declineViewingId, setDeclineViewingId] = useState<string | null>(null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { from: '/my-viewings' } });
    }
  }, [user, authLoading, navigate]);

  const isLoading = tenantLoading || landlordLoading;

  // Filter viewings by status
  const activeViewings = tenantViewings?.filter(v => 
    ['pending', 'counter_proposed', 'confirmed', 'completed'].includes(v.status)
  ) || [];
  
  const pastViewings = tenantViewings?.filter(v => 
    ['rental_confirmed', 'declined', 'cancelled', 'expired'].includes(v.status)
  ) || [];

  const pendingRequests = landlordViewings?.filter(v => 
    ['pending', 'counter_proposed'].includes(v.status)
  ) || [];

  const scheduledViewings = landlordViewings?.filter(v => 
    v.status === 'confirmed'
  ) || [];

  const completedViewings = landlordViewings?.filter(v => 
    v.status === 'completed'
  ) || [];

  const pastLandlordViewings = landlordViewings?.filter(v => 
    ['rental_confirmed', 'declined', 'cancelled', 'expired'].includes(v.status)
  ) || [];

  // Track which rooms already have a confirmed viewing (to disable confirm on pending ones)
  const roomsWithConfirmedViewing = new Set(
    scheduledViewings.map(v => v.room_id)
  );

  // Compute queue position per room for landlord viewings (ordered by created_at ascending)
  const queuePositionMap = React.useMemo(() => {
    const map = new Map<string, number>();
    if (!landlordViewings) return map;
    
    // Group active viewings by room, sorted by created_at ascending (first booked = #1)
    const activeStatuses = ['pending', 'counter_proposed', 'confirmed', 'completed'];
    const activeByRoom = new Map<string, ViewingRequest[]>();
    
    // Sort all landlord viewings by created_at ascending
    const sorted = [...landlordViewings]
      .filter(v => activeStatuses.includes(v.status))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    sorted.forEach(v => {
      if (!activeByRoom.has(v.room_id)) activeByRoom.set(v.room_id, []);
      activeByRoom.get(v.room_id)!.push(v);
    });
    
    // Assign position numbers only for rooms with 2+ viewings
    activeByRoom.forEach((viewings) => {
      if (viewings.length >= 2) {
        viewings.forEach((v, idx) => {
          map.set(v.id, idx + 1);
        });
      }
    });
    
    return map;
  }, [landlordViewings]);

  // Sort landlord viewing lists by created_at ascending (first booked first)
  const sortedPendingRequests = React.useMemo(() => 
    [...pendingRequests].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [pendingRequests]
  );
  const sortedScheduledViewings = React.useMemo(() => 
    [...scheduledViewings].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [scheduledViewings]
  );
  const sortedCompletedViewings = React.useMemo(() => 
    [...completedViewings].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [completedViewings]
  );

  // Determine if user has any current_tenant listings
  const hasCurrentTenantListings = landlordViewings?.some(v => v.room?.lister_type === 'current_tenant');
  const hasLandlordListings = landlordViewings?.some(v => v.room?.lister_type !== 'current_tenant');
  
  // Determine the host label
  const getHostLabel = () => {
    if (hasCurrentTenantListings && !hasLandlordListings) {
      return isRTL ? 'كمستأجر حالي' : 'As Current Tenant';
    } else if (!hasCurrentTenantListings && hasLandlordListings) {
      return isRTL ? 'كمالك' : 'As Landlord';
    } else {
      return isRTL ? 'كمضيف' : 'As Host';
    }
  };

  const handleShareLocation = async (viewing: ViewingRequest) => {
    if (!viewing.room?.address) {
      // Could also get address from room details
      return;
    }
    await shareLocation.mutateAsync({
      viewingId: viewing.id,
      roomAddress: viewing.room.address || `${viewing.room.city}, ${viewing.room.area || ''}`,
    });
  };

  const handleMarkArrived = async (viewingId: string) => {
    await completeViewing.mutateAsync(viewingId);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-secondary/30 pt-4 md:pt-8 pb-32" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-4 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-2 sm:gap-3">
              <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
              {t('viewings.myViewings')}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('viewings.manageViewings')}
            </p>
          </div>

          <Tabs defaultValue="as-tenant" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-4 md:mb-6 h-auto">
              <TabsTrigger value="as-tenant" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 text-xs sm:text-sm">
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{t('viewings.asTenant')}</span>
                {activeViewings.length > 0 && (
                  <span className="ml-0.5 sm:ml-1 px-1.5 py-0.5 text-[10px] sm:text-xs bg-primary/20 rounded-full shrink-0">
                    {activeViewings.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="as-landlord" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 text-xs sm:text-sm">
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{getHostLabel()}</span>
                {pendingRequests.length > 0 && (
                  <span className="ml-0.5 sm:ml-1 px-1.5 py-0.5 text-[10px] sm:text-xs bg-primary/20 rounded-full shrink-0">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Tenant View */}
            <TabsContent value="as-tenant" className="space-y-6">
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map(i => (
                    <Skeleton key={i} className="h-64 rounded-xl" />
                  ))}
                </div>
              ) : activeViewings.length === 0 && pastViewings.length === 0 ? (
                <EmptyState 
                  icon={Calendar}
                  title={t('viewings.noViewings')}
                  description={t('viewings.noViewingsDescription')}
                  actionLabel={t('viewings.browseRooms')}
                  onAction={() => navigate('/rooms')}
                />
              ) : (
                <>
                  {/* Active Viewings */}
                  {activeViewings.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        {t('viewings.active')}
                      </h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {activeViewings.map(viewing => (
                          <ViewingCard
                            key={viewing.id}
                            viewing={viewing}
                            role="tenant"
                            onAcceptCounter={() => acceptCounter.mutate(viewing.id)}
                            onCancel={() => cancelViewing.mutate(viewing.id)}
                            onConfirmRental={() => confirmRental.mutate(viewing.id)}
                            onDecline={() => setDeclineViewingId(viewing.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confirm Arrival Button for confirmed viewings */}
                  {activeViewings.filter(v => v.status === 'confirmed').length > 0 && (
                    <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">
                            {t('viewings.atProperty')}
                          </p>
                          <p className="text-sm text-muted-foreground mb-3">
                            {t('viewings.markArrivedDescription')}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {activeViewings
                              .filter(v => v.status === 'confirmed')
                              .map(v => (
                                <button
                                  key={v.id}
                                  onClick={() => handleMarkArrived(v.id)}
                                  className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                  {v.room?.title || t('viewings.viewing')} - {t('viewings.imHere')}
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Past Viewings */}
                  {pastViewings.length > 0 && (
                    <div className="space-y-4 mt-8">
                      <h2 className="text-lg font-semibold text-muted-foreground">
                        {t('viewings.past')}
                      </h2>
                      <div className="grid gap-4 md:grid-cols-2 opacity-75">
                        {pastViewings.map(viewing => (
                          <ViewingCard
                            key={viewing.id}
                            viewing={viewing}
                            role="tenant"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Landlord View */}
            <TabsContent value="as-landlord" className="space-y-6">
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map(i => (
                    <Skeleton key={i} className="h-64 rounded-xl" />
                  ))}
                </div>
              ) : sortedPendingRequests.length === 0 && sortedScheduledViewings.length === 0 && sortedCompletedViewings.length === 0 && pastLandlordViewings.length === 0 ? (
                <EmptyState 
                  icon={Eye}
                  title={t('viewings.noRequests')}
                  description={t('viewings.noRequestsDescription')}
                />
              ) : (
                <>
                  {/* Pending Requests */}
                  {sortedPendingRequests.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        {t('viewings.pendingRequests')}
                        <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          {sortedPendingRequests.length}
                        </span>
                      </h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {sortedPendingRequests.map(viewing => (
                          <ViewingCard
                            key={viewing.id}
                            viewing={viewing}
                            role="landlord"
                            hasConfirmedForRoom={roomsWithConfirmedViewing.has(viewing.room_id)}
                            queuePosition={queuePositionMap.get(viewing.id)}
                            onConfirm={() => confirmViewing.mutate(viewing.id)}
                            onCounterPropose={() => setCounterProposeViewing(viewing)}
                            onCancel={() => cancelViewing.mutate(viewing.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scheduled Viewings */}
                  {sortedScheduledViewings.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-500" />
                        {t('viewings.scheduled')}
                        <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {sortedScheduledViewings.length}
                        </span>
                      </h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {sortedScheduledViewings.map(viewing => (
                          <ViewingCard
                            key={viewing.id}
                            viewing={viewing}
                            role="landlord"
                            queuePosition={queuePositionMap.get(viewing.id)}
                            onShareLocation={() => handleShareLocation(viewing)}
                            onMarkCompleted={() => completeViewing.mutate(viewing.id)}
                            onCancel={() => cancelViewing.mutate(viewing.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Viewings - Awaiting Rental Confirmation */}
                  {sortedCompletedViewings.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Home className="w-5 h-5 text-primary" />
                        {isRTL ? 'بانتظار تأكيد الإيجار' : 'Awaiting Rental Confirmation'}
                      </h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {sortedCompletedViewings.map(viewing => (
                          <ViewingCard
                            key={viewing.id}
                            viewing={viewing}
                            role="landlord"
                            queuePosition={queuePositionMap.get(viewing.id)}
                            onConfirmRental={() => confirmRental.mutate(viewing.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past Landlord Viewings */}
                  {pastLandlordViewings.length > 0 && (
                    <div className="space-y-4 mt-8">
                      <h2 className="text-lg font-semibold text-muted-foreground">
                        {t('viewings.past')}
                      </h2>
                      <div className="grid gap-4 md:grid-cols-2 opacity-75">
                        {pastLandlordViewings.map(viewing => (
                          <ViewingCard
                            key={viewing.id}
                            viewing={viewing}
                            role="landlord"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Counter Propose Dialog */}
      {counterProposeViewing && (
        <CounterProposeDialog
          viewingId={counterProposeViewing.id}
          originalDate={counterProposeViewing.proposed_date}
          originalTimeStart={counterProposeViewing.proposed_time_start}
          originalTimeEnd={counterProposeViewing.proposed_time_end}
          open={!!counterProposeViewing}
          onOpenChange={(open) => !open && setCounterProposeViewing(null)}
        />
      )}

      {/* Decline Dialog */}
      {declineViewingId && (
        <DeclineDialog
          viewingId={declineViewingId}
          open={!!declineViewingId}
          onOpenChange={(open) => !open && setDeclineViewingId(null)}
        />
      )}
    </MainLayout>
  );
};

// Empty State Component
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
      <Icon className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const MyViewings: React.FC = () => {
  return (
    <LanguageProvider>
      <MyViewingsContent />
    </LanguageProvider>
  );
};

export default MyViewings;
