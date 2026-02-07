import React, { useState } from 'react';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useUserRole';
import { 
  useDeclineReports, 
  useAllWarnings, 
  useAllBans,
  useIssueWarning,
  useBanUser,
  useLiftBan,
  useDismissReport,
} from '@/hooks/useAdminSafety';
import MainLayout from '@/components/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  Shield, AlertTriangle, Ban, Eye, 
  Check, X, MessageSquare, Image as ImageIcon,
  User, Users
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format, parseISO } from 'date-fns';
import { DECLINE_REASON_LABELS, DeclineReport } from '@/types/viewing';

const AdminSafetyCenterContent: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);

  const { data: reports, isLoading: reportsLoading } = useDeclineReports();
  const { data: warnings, isLoading: warningsLoading } = useAllWarnings();
  const { data: bans, isLoading: bansLoading } = useAllBans();

  const issueWarning = useIssueWarning();
  const banUser = useBanUser();
  const liftBan = useLiftBan();
  const dismissReport = useDismissReport();

  // Dialog states
  const [actionReport, setActionReport] = useState<DeclineReport | null>(null);
  const [actionType, setActionType] = useState<'warning' | 'ban' | null>(null);
  const [targetUser, setTargetUser] = useState<'landlord' | 'tenant'>('landlord');
  const [actionReason, setActionReason] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [banDays, setBanDays] = useState('30');
  const [viewingEvidence, setViewingEvidence] = useState<string[] | null>(null);

  // Auth check
  React.useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-12 w-48" />
        </div>
      </MainLayout>
    );
  }

  const brokerFlaggedReports = reports?.filter(r => r.broker_illegal_fees && !r.admin_reviewed) || [];
  const otherPendingReports = reports?.filter(r => !r.broker_illegal_fees && !r.admin_reviewed) || [];
  const reviewedReports = reports?.filter(r => r.admin_reviewed) || [];
  const activeBans = bans?.filter(b => b.is_active) || [];

  const handleWarning = async () => {
    if (!actionReport || !actionReason) return;
    
    const userId = targetUser === 'landlord' ? actionReport.landlord_id : actionReport.tenant_id;
    
    await issueWarning.mutateAsync({
      user_id: userId,
      reason: actionReason,
      related_report_id: actionReport.id,
    });
    
    setActionReport(null);
    setActionType(null);
    setActionReason('');
    setTargetUser('landlord');
  };

  const handleBan = async () => {
    if (!actionReport || !actionReason) return;
    
    const userId = targetUser === 'landlord' ? actionReport.landlord_id : actionReport.tenant_id;
    
    const bannedUntil = isPermanent 
      ? undefined 
      : new Date(Date.now() + parseInt(banDays) * 24 * 60 * 60 * 1000).toISOString();
    
    await banUser.mutateAsync({
      user_id: userId,
      reason: actionReason,
      is_permanent: isPermanent,
      banned_until: bannedUntil,
      related_report_id: actionReport.id,
    });
    
    setActionReport(null);
    setActionType(null);
    setActionReason('');
    setIsPermanent(false);
    setBanDays('30');
    setTargetUser('landlord');
  };

  const handleDismiss = async (reportId: string) => {
    await dismissReport.mutateAsync({ reportId });
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'PPP');
    } catch {
      return dateStr;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-secondary/30 pt-8 pb-32" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              {t('admin.safetyCenter') || 'Safety Center'}
            </h1>
            <p className="text-muted-foreground">
              {t('admin.safetyCenterDescription') || 'Review reports and manage user safety actions'}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-red-200 dark:border-red-900">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-red-600">{brokerFlaggedReports.length}</div>
                <p className="text-sm text-muted-foreground">{t('admin.brokerFlags') || 'Broker Flags'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{otherPendingReports.length}</div>
                <p className="text-sm text-muted-foreground">{t('admin.pendingReports') || 'Pending Reports'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{warnings?.length || 0}</div>
                <p className="text-sm text-muted-foreground">{t('admin.warningsIssued') || 'Warnings Issued'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{activeBans.length}</div>
                <p className="text-sm text-muted-foreground">{t('admin.activeBans') || 'Active Bans'}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="broker-flags" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-6">
              <TabsTrigger value="broker-flags" className="text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 mr-1 hidden sm:inline" />
                Broker Flags
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-xs sm:text-sm">
                Reports
              </TabsTrigger>
              <TabsTrigger value="warnings" className="text-xs sm:text-sm">
                Warnings
              </TabsTrigger>
              <TabsTrigger value="bans" className="text-xs sm:text-sm">
                <Ban className="w-4 h-4 mr-1 hidden sm:inline" />
                Bans
              </TabsTrigger>
            </TabsList>

            {/* Broker Flags Tab */}
            <TabsContent value="broker-flags" className="space-y-4">
              {reportsLoading ? (
                <Skeleton className="h-48" />
              ) : brokerFlaggedReports.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('admin.noBrokerFlags') || 'No broker fraud reports pending review'}</p>
                  </CardContent>
                </Card>
              ) : (
                brokerFlaggedReports.map(report => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onWarning={() => { setActionReport(report); setActionType('warning'); }}
                    onBan={() => { setActionReport(report); setActionType('ban'); }}
                    onDismiss={() => handleDismiss(report.id)}
                    onViewEvidence={() => setViewingEvidence(report.evidence_photos)}
                    formatDate={formatDate}
                  />
                ))
              )}
            </TabsContent>

            {/* Other Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              {reportsLoading ? (
                <Skeleton className="h-48" />
              ) : otherPendingReports.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('admin.noReports') || 'All reports have been reviewed'}</p>
                  </CardContent>
                </Card>
              ) : (
                otherPendingReports.map(report => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onWarning={() => { setActionReport(report); setActionType('warning'); }}
                    onBan={() => { setActionReport(report); setActionType('ban'); }}
                    onDismiss={() => handleDismiss(report.id)}
                    onViewEvidence={() => setViewingEvidence(report.evidence_photos)}
                    formatDate={formatDate}
                  />
                ))
              )}
            </TabsContent>

            {/* Warnings Tab */}
            <TabsContent value="warnings" className="space-y-4">
              {warningsLoading ? (
                <Skeleton className="h-48" />
              ) : warnings && warnings.length > 0 ? (
                warnings.map(warning => (
                  <Card key={warning.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={(warning as any).user?.avatar_url} />
                            <AvatarFallback>{(warning as any).user?.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{(warning as any).user?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{warning.reason}</p>
                          </div>
                        </div>
                        <Badge variant={warning.acknowledged ? 'secondary' : 'outline'}>
                          {warning.acknowledged ? 'Acknowledged' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Issued: {formatDate(warning.created_at)}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No warnings issued yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Bans Tab */}
            <TabsContent value="bans" className="space-y-4">
              {bansLoading ? (
                <Skeleton className="h-48" />
              ) : bans && bans.length > 0 ? (
                bans.map(ban => (
                  <Card key={ban.id} className={ban.is_active ? 'border-red-200 dark:border-red-900' : ''}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={(ban as any).user?.avatar_url} />
                            <AvatarFallback>{(ban as any).user?.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{(ban as any).user?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{ban.reason}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={ban.is_active ? 'destructive' : 'secondary'}>
                            {ban.is_permanent ? 'Permanent' : ban.is_active ? 'Active' : 'Lifted'}
                          </Badge>
                          {ban.is_active && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => liftBan.mutate(ban.id)}
                            >
                              Lift Ban
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Banned: {formatDate(ban.created_at)}
                        {ban.banned_until && !ban.is_permanent && (
                          <> · Until: {formatDate(ban.banned_until)}</>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No bans recorded</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => { setActionType(null); setActionReport(null); setTargetUser('landlord'); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'warning' ? (
                <><AlertTriangle className="w-5 h-5 text-amber-500" /> Issue Warning</>
              ) : (
                <><Ban className="w-5 h-5 text-red-500" /> Ban User</>
              )}
            </DialogTitle>
            <DialogDescription>
              Choose who to take action against
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Target User Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Who to {actionType}? *</Label>
              <RadioGroup
                value={targetUser}
                onValueChange={(value: 'landlord' | 'tenant') => setTargetUser(value)}
                className="grid grid-cols-2 gap-3"
              >
                <div className="relative">
                  <RadioGroupItem
                    value="landlord"
                    id="target-landlord"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="target-landlord"
                    className="flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <User className="w-6 h-6" />
                    <div className="text-center">
                      <p className="font-medium text-sm">Landlord</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {actionReport?.landlord?.full_name || 'Unknown'}
                      </p>
                    </div>
                  </Label>
                </div>
                <div className="relative">
                  <RadioGroupItem
                    value="tenant"
                    id="target-tenant"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="target-tenant"
                    className="flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <Users className="w-6 h-6" />
                    <div className="text-center">
                      <p className="font-medium text-sm">Tenant</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {actionReport?.tenant?.full_name || 'Unknown'}
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Explain why this action is being taken..."
                rows={3}
              />
            </div>

            {actionType === 'ban' && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="permanent"
                    checked={isPermanent}
                    onCheckedChange={(c) => setIsPermanent(!!c)}
                  />
                  <Label htmlFor="permanent">Permanent ban</Label>
                </div>

                {!isPermanent && (
                  <div className="space-y-2">
                    <Label>Ban duration (days)</Label>
                    <Input
                      type="number"
                      value={banDays}
                      onChange={(e) => setBanDays(e.target.value)}
                      min="1"
                      max="365"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionType(null); setTargetUser('landlord'); }}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'ban' ? 'destructive' : 'default'}
              onClick={actionType === 'warning' ? handleWarning : handleBan}
              disabled={!actionReason || issueWarning.isPending || banUser.isPending}
            >
              {actionType === 'warning' 
                ? `Warn ${targetUser === 'landlord' ? 'Landlord' : 'Tenant'}` 
                : `Ban ${targetUser === 'landlord' ? 'Landlord' : 'Tenant'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evidence Viewer */}
      <Dialog open={!!viewingEvidence} onOpenChange={() => setViewingEvidence(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Evidence Photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {viewingEvidence?.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Evidence ${i + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

// Report Card Component
interface ReportCardProps {
  report: DeclineReport;
  onWarning: () => void;
  onBan: () => void;
  onDismiss: () => void;
  onViewEvidence: () => void;
  formatDate: (date: string) => string;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onWarning,
  onBan,
  onDismiss,
  onViewEvidence,
  formatDate,
}) => (
  <Card className={report.broker_illegal_fees ? 'border-red-200 dark:border-red-900' : ''}>
    <CardHeader className="pb-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={report.tenant?.avatar_url || undefined} />
            <AvatarFallback>{report.tenant?.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">
              {report.tenant?.full_name} reported {report.landlord?.full_name}
            </CardTitle>
            <CardDescription>{report.room?.title} - {report.room?.city}</CardDescription>
          </div>
        </div>
        <Badge variant={report.broker_illegal_fees ? 'destructive' : 'secondary'}>
          {DECLINE_REASON_LABELS[report.reason]}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      {report.reason_details && (
        <p className="text-sm bg-muted p-3 rounded-lg">{report.reason_details}</p>
      )}
      
      {report.broker_illegal_fees && report.broker_fee_details && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            Broker Fee Details:
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">{report.broker_fee_details}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          {report.evidence_photos.length > 0 && (
            <Button size="sm" variant="outline" onClick={onViewEvidence}>
              <ImageIcon className="w-4 h-4 mr-1" />
              {report.evidence_photos.length} Photos
            </Button>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDate(report.created_at)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            <X className="w-4 h-4 mr-1" />
            Dismiss
          </Button>
          <Button size="sm" variant="outline" onClick={onWarning}>
            <AlertTriangle className="w-4 h-4 mr-1" />
            Warn
          </Button>
          <Button size="sm" variant="destructive" onClick={onBan}>
            <Ban className="w-4 h-4 mr-1" />
            Ban
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminSafetyCenter: React.FC = () => {
  return (
    <LanguageProvider>
      <AdminSafetyCenterContent />
    </LanguageProvider>
  );
};

export default AdminSafetyCenter;
