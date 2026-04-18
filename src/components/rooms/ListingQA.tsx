import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useListingQuestions, useAskQuestion, useAnswerQuestion, useDeleteQuestion } from '@/hooks/useListingQuestions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Send, CheckCircle2, Clock, HelpCircle, AlertCircle, Trash2, ShieldAlert } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { containsBlockedContent, getBlockedContentMessage } from '@/lib/messageFilter';
import { toast } from 'sonner';

interface ListingQAProps {
  roomId: string;
  ownerId: string;
  listerType?: 'landlord' | 'current_tenant' | 'landlord_and_tenant' | null;
}

export const ListingQA: React.FC<ListingQAProps> = ({ roomId, ownerId, listerType }) => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  
  const { data: questions, isLoading } = useListingQuestions(roomId);
  const { data: ownerInfo } = useQuery({
    queryKey: ['room-owner-public', ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_room_owner_public_info', { _owner_id: ownerId });
      if (error) throw error;
      return (data && data[0]) || null;
    },
  });
  const askQuestion = useAskQuestion();
  const answerQuestion = useAnswerQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [newQuestion, setNewQuestion] = useState('');
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerError, setAnswerError] = useState<string | null>(null);

  const isOwner = user?.id === ownerId;
  const isVerified = profile?.verification_status === 'verified';

  const listerRoleLabel = (() => {
    if (listerType === 'current_tenant') return isRTL ? 'المستأجر الحالي' : 'Current Tenant';
    if (listerType === 'landlord_and_tenant') return isRTL ? 'المالك والمستأجر الحالي' : 'Landlord & Current Tenant';
    return isRTL ? 'المالك' : 'Landlord';
  })();

  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestion.mutateAsync({ questionId, roomId });
  };

  const canDeleteQuestion = (askerId: string) => {
    // User can delete if they're the asker OR the room owner
    return user?.id === askerId || isOwner;
  };

  const handleQuestionChange = (value: string) => {
    setNewQuestion(value);
    if (value && containsBlockedContent(value)) {
      setQuestionError(t('viewing.noContactInfo') || 'Contact information (phone, email, links) is not allowed');
    } else {
      setQuestionError(null);
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswerText(value);
    if (value && containsBlockedContent(value)) {
      setAnswerError(t('viewing.noContactInfo') || 'Contact information (phone, email, links) is not allowed');
    } else {
      setAnswerError(null);
    }
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return;
    
    if (containsBlockedContent(newQuestion)) {
      toast.error(getBlockedContentMessage());
      return;
    }
    
    await askQuestion.mutateAsync({
      room_id: roomId,
      question: newQuestion.trim(),
    });
    
    setNewQuestion('');
    setQuestionError(null);
  };

  const handleAnswer = async (questionId: string) => {
    if (!answerText.trim()) return;
    
    if (containsBlockedContent(answerText)) {
      toast.error(getBlockedContentMessage());
      return;
    }
    
    await answerQuestion.mutateAsync({
      questionId,
      answer: answerText.trim(),
      roomId,
    });
    
    setAnsweringId(null);
    setAnswerText('');
    setAnswerError(null);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="mt-6 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="bg-primary/5 border-b border-border space-y-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <HelpCircle className="w-5 h-5 text-primary" />
          {t('qa.title')}
        </CardTitle>
        {/* Safety Notice - Always visible */}
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {isRTL 
              ? 'لحمايتك، لا يُسمح بمشاركة أرقام الهاتف أو الروابط أو معلومات الموقع في الأسئلة والأجوبة.'
              : 'For your safety, phone numbers, links, and location info are not allowed in Q&A.'
            }
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Ask Question Form */}
        {!isOwner && user && (
          <div className="space-y-3 p-4 bg-secondary/30 rounded-xl border border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              {isRTL ? 'اطرح سؤالاً' : 'Ask a Question'}
            </div>
            <Textarea
              placeholder={
                isVerified 
                  ? t('qa.askPlaceholder')
                  : t('qa.verifyFirst')
              }
              value={newQuestion}
              onChange={(e) => handleQuestionChange(e.target.value)}
              disabled={!isVerified}
              rows={2}
              className={`resize-none bg-background ${questionError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {questionError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{questionError}</span>
              </div>
            )}
            <Button
              size="sm"
              onClick={handleAskQuestion}
              disabled={!isVerified || !newQuestion.trim() || !!questionError || askQuestion.isPending}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {askQuestion.isPending 
                ? (t('common.loading'))
                : t('qa.askButton')
              }
            </Button>
          </div>
        )}

        {/* Questions List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : questions && questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="border rounded-xl p-4 space-y-3 bg-card hover:shadow-sm transition-shadow">
                {/* Question */}
                <div className="flex items-start gap-3">
                  <Link to={`/user/${q.asker_id}`} className="shrink-0">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/10 hover:ring-primary/40 transition">
                      <AvatarImage src={q.asker?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {q.asker?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/user/${q.asker_id}`}
                          className="font-medium text-sm text-foreground hover:text-primary hover:underline transition-colors"
                        >
                          {q.asker?.full_name || 'User'}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(q.created_at)}
                        </span>
                      </div>
                      {/* Delete button */}
                      {canDeleteQuestion(q.asker_id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteQuestion(q.id)}
                          disabled={deleteQuestion.isPending}
                          title={isRTL ? 'حذف السؤال' : 'Delete question'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{q.question}</p>
                  </div>
                </div>

                {/* Answer */}
                {q.answer ? (
                  <div className={`${isRTL ? 'mr-12' : 'ml-12'} p-3 bg-primary/5 rounded-lg border-l-2 border-primary`}>
                    <div className="flex items-start gap-3 mb-2">
                      <Link to={`/user/${ownerId}`} className="shrink-0">
                        <Avatar className="h-8 w-8 ring-2 ring-primary/20 hover:ring-primary/50 transition">
                          <AvatarImage src={ownerInfo?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {ownerInfo?.full_name?.charAt(0) || 'O'}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/user/${ownerId}`}
                            className="font-medium text-sm text-foreground hover:text-primary hover:underline transition-colors"
                          >
                            {ownerInfo?.full_name || listerRoleLabel}
                          </Link>
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {listerRoleLabel}
                          </Badge>
                          {q.answered_at && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(q.answered_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{q.answer}</p>
                  </div>
                ) : isOwner ? (
                  answeringId === q.id ? (
                    <div className={`${isRTL ? 'mr-12' : 'ml-12'} space-y-2`}>
                      <Textarea
                        placeholder={t('qa.answerPlaceholder')}
                        value={answerText}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        rows={2}
                        className={`resize-none ${answerError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                      {answerError && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          <span>{answerError}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAnswer(q.id)}
                          disabled={!answerText.trim() || !!answerError || answerQuestion.isPending}
                        >
                          {answerQuestion.isPending ? '...' : t('qa.postAnswer')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setAnsweringId(null);
                            setAnswerText('');
                            setAnswerError(null);
                          }}
                        >
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className={`${isRTL ? 'mr-12' : 'ml-12'}`}
                      onClick={() => setAnsweringId(q.id)}
                    >
                      {t('qa.answerButton')}
                    </Button>
                  )
                ) : (
                  <div className={`${isRTL ? 'mr-12' : 'ml-12'} flex items-center gap-2 text-xs text-muted-foreground`}>
                    <Clock className="w-3 h-3" />
                    {t('qa.awaitingAnswer')}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/5 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-primary/40" />
            </div>
            <p className="font-medium">{t('qa.noQuestions')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ListingQA;
