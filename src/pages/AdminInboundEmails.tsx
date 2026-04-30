import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Mail, Loader2, Search, RefreshCw, Trash2, MailOpen } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

interface InboundEmail {
  id: string;
  from_email: string;
  from_name: string | null;
  to_email: string;
  subject: string | null;
  text_body: string | null;
  html_body: string | null;
  is_read: boolean;
  received_at: string;
}

export default function AdminInboundEmails() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);
  const navigate = useNavigate();

  const [emails, setEmails] = useState<InboundEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<InboundEmail | null>(null);

  useEffect(() => {
    if (!authLoading && !roleLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  const fetchEmails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inbound_emails')
      .select('*')
      .order('received_at', { ascending: false })
      .limit(200);
    if (error) {
      toast.error('Failed to load inbound emails');
    } else {
      setEmails((data ?? []) as InboundEmail[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchEmails();
  }, [isAdmin]);

  const markRead = async (email: InboundEmail) => {
    if (email.is_read) return;
    await supabase.from('inbound_emails').update({ is_read: true }).eq('id', email.id);
    setEmails((prev) => prev.map((e) => (e.id === email.id ? { ...e, is_read: true } : e)));
  };

  const deleteEmail = async (id: string) => {
    if (!confirm('Delete this email?')) return;
    const { error } = await supabase.from('inbound_emails').delete().eq('id', id);
    if (error) {
      toast.error('Delete failed');
    } else {
      setEmails((prev) => prev.filter((e) => e.id !== id));
      setSelected(null);
      toast.success('Deleted');
    }
  };

  const filtered = emails.filter((e) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      e.from_email.toLowerCase().includes(q) ||
      (e.from_name ?? '').toLowerCase().includes(q) ||
      (e.subject ?? '').toLowerCase().includes(q) ||
      e.to_email.toLowerCase().includes(q)
    );
  });

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const unreadCount = emails.filter((e) => !e.is_read).length;

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="container mx-auto p-4 md:p-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Mail className="w-6 h-6" /> Inbound Emails
              </h1>
              <p className="text-sm text-muted-foreground">Replies received via webhook</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchEmails} disabled={loading}>
            <RefreshCw className={`w-4 h-4 me-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{emails.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Unread</div>
              <div className="text-2xl font-bold text-primary">{unreadCount}</div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Last 24h</div>
              <div className="text-2xl font-bold">
                {emails.filter((e) => Date.now() - new Date(e.received_at).getTime() < 86400000).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative mb-4">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by sender, subject, or recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Replies ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MailOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No inbound emails yet.</p>
                <p className="text-xs mt-2">Configure your inbound webhook in Resend pointing to the inbound-email-webhook function.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => {
                      setSelected(email);
                      markRead(email);
                    }}
                    className={`w-full text-start p-4 hover:bg-muted/50 transition-colors ${!email.is_read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!email.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                          <span className="font-medium truncate">
                            {email.from_name ?? email.from_email}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            &lt;{email.from_email}&gt;
                          </span>
                        </div>
                        <div className="text-sm font-medium truncate mb-1">
                          {email.subject || '(no subject)'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          To: {email.to_email}
                          {email.text_body && ` · ${email.text_body.slice(0, 80)}`}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {format(new Date(email.received_at), 'MMM d, HH:mm')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{selected.subject || '(no subject)'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[80px_1fr] gap-2">
                  <span className="text-muted-foreground">From:</span>
                  <span>
                    {selected.from_name && <strong>{selected.from_name} </strong>}
                    &lt;{selected.from_email}&gt;
                  </span>
                  <span className="text-muted-foreground">To:</span>
                  <span>{selected.to_email}</span>
                  <span className="text-muted-foreground">Date:</span>
                  <span>{format(new Date(selected.received_at), 'PPpp')}</span>
                </div>
                <div className="border-t pt-3">
                  {selected.html_body ? (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selected.html_body) }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans">{selected.text_body || '(empty)'}</pre>
                  )}
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <Badge variant={selected.is_read ? 'secondary' : 'default'}>
                    {selected.is_read ? 'Read' : 'Unread'}
                  </Badge>
                  <Button variant="destructive" size="sm" onClick={() => deleteEmail(selected.id)}>
                    <Trash2 className="w-4 h-4 me-2" /> Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
