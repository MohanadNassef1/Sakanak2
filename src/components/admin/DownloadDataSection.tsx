import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Loader2, Database, CalendarCheck, CreditCard, MessagesSquare, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  EXTRA_DATASETS, ExtraDataset, fetchAllRows, toCsv, downloadText, downloadZip, timestamp,
} from '@/lib/dataExport';

interface Props {
  isRTL: boolean;
}

const META: Record<
  ExtraDataset['key'],
  { icon: React.ElementType; en: string; ar: string; enDesc: string; arDesc: string }
> = {
  reservations: {
    icon: CalendarCheck,
    en: 'Reservations', ar: 'الحجوزات',
    enDesc: 'Booking and reservation activity',
    arDesc: 'نشاط الحجز والحجوزات',
  },
  payments: {
    icon: CreditCard,
    en: 'Payments', ar: 'المدفوعات',
    enDesc: 'Payment and transaction data',
    arDesc: 'بيانات المدفوعات والمعاملات',
  },
  messages: {
    icon: MessagesSquare,
    en: 'Messages', ar: 'الرسائل',
    enDesc: 'User messaging activity (metadata only)',
    arDesc: 'نشاط المراسلة بين المستخدمين (بيانات وصفية فقط)',
  },
  searches: {
    icon: Search,
    en: 'Searches', ar: 'عمليات البحث',
    enDesc: 'User search activity and criteria',
    arDesc: 'نشاط البحث ومعايير البحث',
  },
};

const DownloadDataSection: React.FC<Props> = ({ isRTL }) => {
  const [busy, setBusy] = React.useState<string | null>(null);

  const { data: counts, isLoading } = useQuery({
    queryKey: ['extra-dataset-counts'],
    queryFn: async () => {
      const entries = await Promise.all(
        EXTRA_DATASETS.map(async (ds) => {
          const { count, error } = await supabase
            .from(ds.table)
            .select('id', { count: 'exact', head: true });
          return [ds.key, error ? null : count ?? 0] as const;
        }),
      );
      return Object.fromEntries(entries) as Record<ExtraDataset['key'], number | null>;
    },
  });

  const available = (key: ExtraDataset['key']) => (counts?.[key] ?? 0) > 0;

  const downloadOne = async (ds: ExtraDataset) => {
    try {
      setBusy(ds.key);
      const rows = await fetchAllRows(ds.table, ds.columns);
      downloadText(toCsv(rows, ds.columns.split(', ')), ds.file, 'text/csv');
      toast({
        title: isRTL ? 'تم التنزيل' : 'Download ready',
        description: `${ds.file} — ${rows.length} ${isRTL ? 'صف' : 'rows'}`,
      });
    } catch (e: unknown) {
      toast({
        title: isRTL ? 'فشل التنزيل' : 'Download failed',
        description: e instanceof Error ? e.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setBusy(null);
    }
  };

  const downloadAll = async () => {
    try {
      setBusy('all');
      const files: Record<string, string> = {};
      let total = 0;
      for (const ds of EXTRA_DATASETS) {
        if (!available(ds.key)) continue;
        const rows = await fetchAllRows(ds.table, ds.columns);
        files[ds.file] = toCsv(rows, ds.columns.split(', '));
        total += rows.length;
      }
      if (Object.keys(files).length === 0) {
        toast({
          title: isRTL ? 'لا توجد بيانات' : 'Nothing to download',
          description: isRTL ? 'لا تتوفر أي مجموعة بيانات بعد.' : 'No dataset is available yet.',
          variant: 'destructive',
        });
        return;
      }
      await downloadZip(files, `sakanak-datasets-${timestamp()}.zip`);
      toast({
        title: isRTL ? 'تم التنزيل' : 'Download ready',
        description: `${Object.keys(files).length} ${isRTL ? 'ملف' : 'files'} — ${total} ${isRTL ? 'صف' : 'rows'}`,
      });
    } catch (e: unknown) {
      toast({
        title: isRTL ? 'فشل التنزيل' : 'Download failed',
        description: e instanceof Error ? e.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <CardTitle>{isRTL ? 'تنزيل بيانات إضافية' : 'Download Additional Data'}</CardTitle>
            <CardDescription>
              {isRTL
                ? 'نزّل مجموعات البيانات المطلوبة لمتابعة مشروع تحليلات SQL الخاص بسكنك.'
                : 'Download the datasets required to continue the Sakanak SQL analytics project.'}
            </CardDescription>
          </div>
        </div>
        <Button onClick={downloadAll} disabled={!!busy || isLoading} className="w-full sm:w-auto shrink-0">
          {busy === 'all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isRTL ? 'تنزيل باقي البيانات' : 'Download Remaining Data'}
        </Button>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {EXTRA_DATASETS.map((ds) => {
            const meta = META[ds.key];
            const Icon = meta.icon;
            const count = counts?.[ds.key];
            const ok = available(ds.key);
            return (
              <div
                key={ds.key}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{isRTL ? meta.ar : meta.en}</span>
                      <Badge variant="secondary" className="text-[10px]">CSV</Badge>
                      {isLoading ? (
                        <Skeleton className="h-4 w-12" />
                      ) : ok ? (
                        <span className="text-xs text-muted-foreground">
                          {count?.toLocaleString()} {isRTL ? 'صف' : 'rows'}
                        </span>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          {isRTL ? 'غير متاحة بعد' : 'Not available yet'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {isRTL ? meta.arDesc : meta.enDesc}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto shrink-0"
                  disabled={!!busy || isLoading || !ok}
                  onClick={() => downloadOne(ds)}
                >
                  {busy === ds.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isRTL ? 'تنزيل' : 'Download'}
                </Button>
              </div>
            );
          })}
        </div>

        <Button
          onClick={downloadAll}
          disabled={!!busy || isLoading}
          variant="secondary"
          className="mt-4 w-full sm:w-auto"
        >
          {busy === 'all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isRTL ? 'تنزيل كل مجموعات البيانات' : 'Download All Datasets'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DownloadDataSection;
