import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useListingQuestions, useAskQuestion, useAnswerQuestion } from '@/hooks/useListingQuestions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Send, CheckCircle2, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ListingQAProps {
  roomId: string;
  ownerId: string;
}

export const ListingQA: React.FC<ListingQAProps> = ({ roomId, ownerId }) => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  
  const { data: questions, isLoading } = useListingQuestions(roomId);
  const askQuestion = useAskQuestion();
  const answerQuestion = useAnswerQuestion();

  const [newQuestion, setNewQuestion] = useState('');
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  const isOwner = user?.id === ownerId;
  const isVerified = profile?.verification_status === 'verified';

  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return;
    
    await askQuestion.mutateAsync({
      room_id: roomId,
      question: newQuestion.trim(),
    });
    
    setNewQuestion('');
  };

  const handleAnswer = async (questionId: string) => {
    if (!answerText.trim()) return;
    
    await answerQuestion.mutateAsync({
      questionId,
      answer: answerText.trim(),
      roomId,
    });
    
    setAnsweringId(null);
    setAnswerText('');
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="mt-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5 text-primary" />
          {t('qa.title') || 'Questions & Answers'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ask Question Form */}
        {!isOwner && user && (
          <div className="space-y-3">
            <Textarea
              placeholder={
                isVerified 
                  ? (t('qa.askPlaceholder') || 'Ask a question about this listing...')
                  : (t('qa.verifyFirst') || 'Verify your account to ask questions')
              }
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              disabled={!isVerified}
              rows={2}
              className="resize-none"
            />
            <Button
              size="sm"
              onClick={handleAskQuestion}
              disabled={!isVerified || !newQuestion.trim() || askQuestion.isPending}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {askQuestion.isPending 
                ? (t('common.sending') || 'Sending...')
                : (t('qa.askButton') || 'Ask Question')
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
              <div key={q.id} className="border rounded-lg p-4 space-y-3">
                {/* Question */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={q.asker?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {q.asker?.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {q.asker?.full_name || 'User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(q.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{q.question}</p>
                  </div>
                </div>

                {/* Answer */}
                {q.answer ? (
                  <div className="ml-11 p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {t('qa.ownerAnswer') || 'Owner'}
                      </Badge>
                      {q.answered_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(q.answered_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{q.answer}</p>
                  </div>
                ) : isOwner ? (
                  answeringId === q.id ? (
                    <div className="ml-11 space-y-2">
                      <Textarea
                        placeholder={t('qa.answerPlaceholder') || 'Write your answer...'}
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        rows={2}
                        className="resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAnswer(q.id)}
                          disabled={!answerText.trim() || answerQuestion.isPending}
                        >
                          {answerQuestion.isPending ? '...' : (t('qa.postAnswer') || 'Post Answer')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setAnsweringId(null);
                            setAnswerText('');
                          }}
                        >
                          {t('common.cancel') || 'Cancel'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-11"
                      onClick={() => setAnsweringId(q.id)}
                    >
                      {t('qa.answerButton') || 'Answer'}
                    </Button>
                  )
                ) : (
                  <div className="ml-11 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {t('qa.awaitingAnswer') || 'Awaiting owner response'}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>{t('qa.noQuestions') || 'No questions yet. Be the first to ask!'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ListingQA;
