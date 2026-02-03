import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePendingPayouts, useProcessPayout } from '@/hooks/usePayments';
import { useIsAdmin } from '@/hooks/useUserRole';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Loader2, DollarSign, Phone, MessageCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const AdminPayouts: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);
  const { data: payouts, isLoading: payoutsLoading } = usePendingPayouts();
  const processPayout = useProcessPayout();

  const isLoading = authLoading || roleLoading || payoutsLoading;

  const handleProcessPayout = async (payoutId: string, ownerName: string) => {
    try {
      await processPayout.mutateAsync({
        payoutId,
        notes: `Processed manually on ${format(new Date(), 'PPp')}`,
      });
      toast.success(`Payout to ${ownerName} marked as completed`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payout');
    }
  };

  const getPayoutMethodLabel = (method: string) => {
    switch (method) {
      case 'instapay':
        return 'Instapay';
      case 'vodafone_cash':
        return 'Vodafone Cash';
      case 'fawry':
        return 'Fawry';
      default:
        return method;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge className="bg-amber-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Ready to Pay</Badge>;
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user && !authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Please login to access this page.</p>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin && !roleLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-primary" />
            Payout Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Process pending payouts to room owners
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Payouts</CardTitle>
            <CardDescription>
              Payouts ready to be sent to owners after seeker confirmation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !payouts?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>No pending payouts</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Owner</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-medium">
                        {payout.owner?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {payout.reservation?.room?.title || 'N/A'}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        EGP {payout.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getPayoutMethodLabel(payout.payout_method)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {payout.owner?.phone && (
                            <a
                              href={`tel:${payout.owner.phone}`}
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              {payout.owner.phone}
                            </a>
                          )}
                          {payout.owner?.whatsapp && (
                            <a
                              href={`https://wa.me/${payout.owner.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payout.status)}
                      </TableCell>
                      <TableCell>
                        {payout.status === 'processing' && (
                          <Button
                            size="sm"
                            onClick={() => handleProcessPayout(payout.id, payout.owner?.full_name || 'Owner')}
                            disabled={processPayout.isPending}
                          >
                            {processPayout.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Mark Paid'
                            )}
                          </Button>
                        )}
                        {payout.status === 'pending' && (
                          <span className="text-sm text-muted-foreground">
                            Awaiting confirmation
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminPayouts;
