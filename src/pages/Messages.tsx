import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import { Conversation } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Shield } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const { t, isRTL } = useLanguage();
  const isMobile = useIsMobile();
  
  const selectedConversationId = searchParams.get('conversation');

  const handleSelectConversation = (conversation: Conversation) => {
    setSearchParams({ conversation: conversation.id });
  };

  const handleBack = () => {
    setSearchParams({});
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
          <MessageCircle className="w-16 h-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">{t('messages.signInRequired')}</h1>
          <p className="text-muted-foreground text-center">
            {t('messages.signInDesc')}
          </p>
          <Button onClick={() => navigate('/auth')}>
            {t('messages.signIn')}
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Mobile view: show either list or chat
  if (isMobile) {
    return (
      <MainLayout>
        <div className="h-[calc(100vh-64px)]">
          {selectedConversationId ? (
            <ChatWindow 
              conversationId={selectedConversationId} 
              onBack={handleBack}
            />
          ) : (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-card">
                <h1 className={`text-xl font-bold flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MessageCircle className="w-5 h-5" />
                  {t('messages.title')}
                </h1>
              </div>
              <div className="flex-1 overflow-hidden">
                <ConversationList
                  selectedId={selectedConversationId || undefined}
                  onSelect={handleSelectConversation}
                />
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  // Desktop view: side-by-side
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h1 className={`text-2xl font-bold flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MessageCircle className="w-6 h-6" />
            {t('messages.title')}
          </h1>
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Shield className="w-4 h-4 text-primary" />
            <span>{t('messages.allChatsProtected')}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversation List */}
          <Card className="col-span-1 overflow-hidden">
            <ConversationList
              selectedId={selectedConversationId || undefined}
              onSelect={handleSelectConversation}
            />
          </Card>

          {/* Chat Window */}
          <Card className="col-span-2 overflow-hidden">
            {selectedConversationId ? (
              <ChatWindow conversationId={selectedConversationId} />
            ) : (
              <CardContent className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">{t('messages.selectConversation')}</p>
                <p className="text-sm">{t('messages.selectConversationDesc')}</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
