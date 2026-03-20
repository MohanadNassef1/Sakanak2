import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Navigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, CheckCircle2, XCircle, AlertTriangle,
  RefreshCw, Clock, Ban, MailWarning, Send, ChevronRight, User
} from 'lucide-react';
import { format, subDays, subHours } from 'date-fns';

type TimeRange = '24h' | '7d' | '30d' | 'all';

interface EmailLogEntry {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
  subject?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  sent: { label: 'Sent', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" /> },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Clock className="w-3 h-3" /> },
  dlq: { label: 'Failed', color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="w-3 h-3" /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="w-3 h-3" /> },
  suppressed: { label: 'Suppressed', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Ban className="w-3 h-3" /> },
  bounced: { label: 'Bounced', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <MailWarning className="w-3 h-3" /> },
  complained: { label: 'Complained', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: <AlertTriangle className="w-3 h-3" /> },
};

const PAGE_SIZE = 50;

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

const AdminEmailDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: checkingAdmin } = useIsAdmin(user?.id);
  const { isRTL } = useLanguage();

  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const getStartDate = () => {
    switch (timeRange) {
      case '24h': return subHours(new Date(), 24).toISOString();
      case '7d': return subDays(new Date(), 7).toISOString();
      case '30d': return subDays(new Date(), 30).toISOString();
      default: return null;
    }
  };

  // Fetch from email_send_log (all emails now log here)
  const { data: rawLogs, isLoading: logsLoading, refetch } = useQuery({
    queryKey: ['emailLogs', timeRange],
    queryFn: async () => {
      const startDate = getStartDate();

      let query = supabase
        .from('email_send_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      if (startDate) query = query.gte('created_at', startDate);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((l: any) => ({
        id: l.id,
        message_id: l.message_id,
        template_name: l.template_name,
        recipient_email: l.recipient_email,
        status: l.status,
        error_message: l.error_message,
        created_at: l.created_at,
        metadata: l.metadata,
      })) as EmailLogEntry[];
    },
    enabled: !!isAdmin,
  });

  // Deduplicate by message_id, keeping latest status
  const deduplicatedLogs = React.useMemo(() => {
    if (!rawLogs) return [];
    const map = new Map<string, EmailLogEntry>();
    for (const log of rawLogs) {
      const key = log.message_id || log.id;
      const existing = map.get(key);
      if (!existing || new Date(log.created_at) > new Date(existing.created_at)) {
        map.set(key, log);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [rawLogs]);

  const templateNames = React.useMemo(() => {
    const names = new Set(deduplicatedLogs.map(l => l.template_name));
    return Array.from(names).sort();
  }, [deduplicatedLogs]);

  // Apply filters (including user filter)
  const filteredLogs = React.useMemo(() => {
    return deduplicatedLogs.filter(log => {
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;
      if (templateFilter !== 'all' && log.template_name !== templateFilter) return false;
      if (selectedUser && log.recipient_email !== selectedUser) return false;
      return true;
    });
  }, [deduplicatedLogs, statusFilter, templateFilter, selectedUser]);

  const stats = React.useMemo(() => {
    const total = filteredLogs.length;
    const sent = filteredLogs.filter(l => l.status === 'sent').length;
    const failed = filteredLogs.filter(l => l.status === 'dlq' || l.status === 'failed').length;
    const pending = filteredLogs.filter(l => l.status === 'pending').length;
    const suppressed = filteredLogs.filter(l => l.status === 'suppressed').length;
    return { total, sent, failed, pending, suppressed };
  }, [filteredLogs]);

  const paginatedLogs = filteredLogs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => {
            if (selectedUser) {
              setSelectedUser(null);
              setPage(0);
            } else {
              navigate('/admin');
            }
          }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            {selectedUser ? (
              <>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <User className="w-6 h-6 text-primary" />
                  {selectedUser}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {isRTL ? 'كل الرسائل المرسلة لهذا المستخدم' : 'All emails sent to this recipient'}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Mail className="w-6 h-6 text-primary" />
                  {isRTL ? 'لوحة مراقبة البريد' : 'Email Monitor'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {isRTL ? 'تتبع جميع رسائل البريد المرسلة' : 'Track every email sent from your platform'}
                </p>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">{isRTL ? 'الإجمالي' : 'Total'}</span>
              </div>
              <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">{isRTL ? 'مرسل' : 'Sent'}</span>
              </div>
              <p className="text-2xl font-bold tabular-nums text-emerald-700">{stats.sent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive mb-1">
                <XCircle className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">{isRTL ? 'فشل' : 'Failed'}</span>
              </div>
              <p className="text-2xl font-bold tabular-nums text-destructive">{stats.failed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">{isRTL ? 'قيد الانتظار' : 'Pending'}</span>
              </div>
              <p className="text-2xl font-bold tabular-nums text-amber-700">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Ban className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">{isRTL ? 'محظور' : 'Suppressed'}</span>
              </div>
              <p className="text-2xl font-bold tabular-nums">{stats.suppressed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(['24h', '7d', '30d', 'all'] as TimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => { setTimeRange(range); setPage(0); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range === '24h' ? (isRTL ? '٢٤ ساعة' : '24h') :
                 range === '7d' ? (isRTL ? '٧ أيام' : '7 days') :
                 range === '30d' ? (isRTL ? '٣٠ يوم' : '30 days') :
                 (isRTL ? 'الكل' : 'All time')}
              </button>
            ))}
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'كل الحالات' : 'All statuses'}</SelectItem>
              <SelectItem value="sent">{isRTL ? 'مرسل' : 'Sent'}</SelectItem>
              <SelectItem value="dlq">{isRTL ? 'فشل' : 'Failed (DLQ)'}</SelectItem>
              <SelectItem value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</SelectItem>
              <SelectItem value="suppressed">{isRTL ? 'محظور' : 'Suppressed'}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={templateFilter} onValueChange={(v) => { setTemplateFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'كل القوالب' : 'All templates'}</SelectItem>
              {templateNames.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedUser && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setSelectedUser(null); setPage(0); }}
              className="gap-1"
            >
              <XCircle className="w-3 h-3" />
              {selectedUser}
            </Button>
          )}

          <span className="text-sm text-muted-foreground ml-auto tabular-nums">
            {filteredLogs.length} {isRTL ? 'رسالة' : 'emails'}
          </span>
        </div>

        {/* Email Log Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{isRTL ? 'القالب' : 'Template'}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{isRTL ? 'المستلم' : 'Recipient'}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{isRTL ? 'الموضوع' : 'Subject'}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{isRTL ? 'الوقت' : 'Time'}</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {logsLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td></td>
                    </tr>
                  ))
                ) : paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      <Send className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>{isRTL ? 'لا توجد رسائل بريد' : 'No emails found'}</p>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map(log => {
                    const subject = log.subject || (log.metadata as any)?.subject || null;
                    return (
                      <React.Fragment key={log.id}>
                        <tr
                          className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors group"
                          onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                        >
                          <td className="px-4 py-3">
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                              {log.template_name}
                            </code>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              className="font-mono text-xs text-primary hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(log.recipient_email);
                                setPage(0);
                              }}
                            >
                              {log.recipient_email}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                            {subject || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={log.status} />
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                            {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                          </td>
                          <td className="px-2 py-3">
                            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedRow === log.id ? 'rotate-90' : ''}`} />
                          </td>
                        </tr>
                        {expandedRow === log.id && (
                          <tr className="bg-muted/20">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="font-medium text-muted-foreground block mb-1">{isRTL ? 'معرف الرسالة' : 'Message ID'}</span>
                                  <p className="font-mono break-all bg-muted px-2 py-1 rounded">{log.message_id || '—'}</p>
                                </div>
                                {subject && (
                                  <div>
                                    <span className="font-medium text-muted-foreground block mb-1">{isRTL ? 'الموضوع' : 'Subject'}</span>
                                    <p className="bg-muted px-2 py-1 rounded">{subject}</p>
                                  </div>
                                )}
                                {log.error_message && (
                                  <div className="md:col-span-2">
                                    <span className="font-medium text-destructive block mb-1">{isRTL ? 'الخطأ' : 'Error'}</span>
                                    <p className="text-destructive bg-destructive/10 px-2 py-1.5 rounded">
                                      {log.error_message}
                                    </p>
                                  </div>
                                )}
                                {log.metadata && (
                                  <div className="md:col-span-2">
                                    <span className="font-medium text-muted-foreground block mb-1">{isRTL ? 'بيانات إضافية' : 'Metadata'}</span>
                                    <pre className="bg-muted p-2 rounded overflow-auto max-h-32 text-[11px] font-mono">
                                      {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                <div className="md:col-span-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedUser(log.recipient_email);
                                      setExpandedRow(null);
                                      setPage(0);
                                    }}
                                  >
                                    <User className="w-3.5 h-3.5" />
                                    {isRTL ? 'عرض كل رسائل هذا المستخدم' : `View all emails to ${log.recipient_email}`}
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                {isRTL ? 'السابق' : 'Previous'}
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                {isRTL ? 'التالي' : 'Next'}
              </Button>
            </div>
          )}
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default AdminEmailDashboard;
