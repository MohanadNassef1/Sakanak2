import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  useAllVerificationRequests, 
  useApproveVerification, 
  useRejectVerification 
} from '@/hooks/useAdminVerification';
import { useIsAdmin } from '@/hooks/useUserRole';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  ExternalLink,
  Loader2,
  User,
  ShieldAlert
} from 'lucide-react';
import { format } from 'date-fns';
import { logError } from '@/lib/logger';

const AdminVerification: React.FC = () => {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin(user?.id);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: requests, isLoading } = useAllVerificationRequests(statusFilter);
  const approveVerification = useApproveVerification();
  const rejectVerification = useRejectVerification();

  if (loading || isAdminLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="container max-w-2xl mx-auto px-4 py-20 text-center">
          <ShieldAlert className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('admin.accessDenied')}</h1>
          <p className="text-muted-foreground">{t('admin.accessDeniedDesc')}</p>
        </div>
      </MainLayout>
    );
  }

  const handleApprove = async (requestId: string) => {
    try {
      await approveVerification.mutateAsync(requestId);
      toast.success(t('admin.approveSuccess'));
    } catch (error: any) {
      logError('AdminVerification.approve', error);
      toast.error(t('admin.approveError'));
    }
  };

  const handleRejectClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequestId || !rejectionReason.trim()) {
      toast.error(t('admin.rejectReasonRequired'));
      return;
    }

    try {
      await rejectVerification.mutateAsync({
        requestId: selectedRequestId,
        reason: rejectionReason,
      });
      toast.success(t('admin.rejectSuccess'));
      setRejectDialogOpen(false);
      setSelectedRequestId(null);
      setRejectionReason('');
    } catch (error: any) {
      logError('AdminVerification.reject', error);
      toast.error(t('admin.rejectError'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />{t('admin.pending')}</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />{t('admin.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />{t('admin.rejected')}</Badge>;
      default:
        return null;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'national_id':
        return t('verification.nationalId');
      case 'passport':
        return t('verification.passport');
      case 'driver_license':
        return t('verification.driverLicense');
      default:
        return type;
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{t('admin.verificationTitle')}</h1>
              <p className="text-muted-foreground">{t('admin.verificationSubtitle')}</p>
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.allRequests')}</SelectItem>
              <SelectItem value="pending">{t('admin.pending')}</SelectItem>
              <SelectItem value="approved">{t('admin.approved')}</SelectItem>
              <SelectItem value="rejected">{t('admin.rejected')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="py-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* User Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={request.profiles?.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{request.profiles?.full_name || 'Unknown User'}</h3>
                        <p className="text-sm text-muted-foreground">{request.profiles?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {request.profiles?.gender === 'male' ? t('auth.male') : t('auth.female')}
                          </Badge>
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                    </div>

                    {/* Document Info */}
                    <div className="flex flex-col gap-1 min-w-[200px]">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{getDocumentTypeLabel(request.document_type)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('admin.submittedOn')} {format(new Date(request.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                       <div className="flex gap-3">
                         <a 
                           href={request.document_url_front || request.document_url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-xs text-primary hover:underline flex items-center gap-1"
                         >
                           {t('admin.viewFront')}
                           <ExternalLink className="w-3 h-3" />
                         </a>
                         {request.document_url_back && (
                           <a 
                             href={request.document_url_back} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-xs text-primary hover:underline flex items-center gap-1"
                           >
                             {t('admin.viewBack')}
                             <ExternalLink className="w-3 h-3" />
                           </a>
                         )}
                       </div>
                    </div>

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          disabled={approveVerification.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {approveVerification.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {t('admin.approve')}
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectClick(request.id)}
                          disabled={rejectVerification.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          {t('admin.reject')}
                        </Button>
                      </div>
                    )}

                    {request.status === 'rejected' && request.rejection_reason && (
                      <div className="bg-red-500/10 rounded-lg p-3 min-w-[200px]">
                        <p className="text-xs font-medium text-red-600">{t('verification.reason')}:</p>
                        <p className="text-xs text-red-600/80">{request.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-20 text-center">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">{t('admin.noRequests')}</h3>
              <p className="text-sm text-muted-foreground/70">{t('admin.noRequestsHint')}</p>
            </CardContent>
          </Card>
        )}

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('admin.rejectTitle')}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="reason">{t('admin.rejectReasonLabel')}</Label>
              <Textarea
                id="reason"
                className="mt-2"
                placeholder={t('admin.rejectReasonPlaceholder')}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectConfirm}
                disabled={rejectVerification.isPending || !rejectionReason.trim()}
              >
                {rejectVerification.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {t('admin.confirmReject')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default AdminVerification;
