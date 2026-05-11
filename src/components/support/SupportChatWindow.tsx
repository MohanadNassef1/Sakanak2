import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSupportChat } from '@/hooks/useSupportChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Loader2, Headphones, User, ShieldCheck, Paperclip, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { SupportAttachmentImage } from './SupportAttachmentImage';

interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SupportChatWindowProps {
  onBack: () => void;
  aiChatHistory?: AiChatMessage[];
}

const SupportChatWindow: React.FC<SupportChatWindowProps> = ({ onBack, aiChatHistory }) => {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const { conversation, messages, loading, getOrCreateConversation, sendMessage, uploadAttachment } = useSupportChat();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [contextSent, setContextSent] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getOrCreateConversation();
  }, [getOrCreateConversation]);

  // Auto-send AI chat history as context when conversation is ready (only if no context was sent before)
  useEffect(() => {
    if (!conversation?.id || contextSent || !aiChatHistory?.length) return;
    
    // Check if an AI context message already exists in this conversation
    const hasExistingContext = messages.some(m => m.content.startsWith('--- AI Chat History ---'));
    if (hasExistingContext) {
      setContextSent(true);
      return;
    }
    
    const contextLines = aiChatHistory.map(m => 
      `${m.role === 'user' ? '👤 User' : '🤖 AI'}: ${m.content}`
    ).join('\n\n');
    
    const contextMessage = `--- AI Chat History ---\n\n${contextLines}\n\n--- End of AI Chat ---`;
    
    sendMessage(contextMessage);
    setContextSent(true);
  }, [conversation?.id, contextSent, aiChatHistory, sendMessage, messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if ((!trimmed && !pendingFile) || sending) return;
    setSending(true);
    const fileToSend = pendingFile;
    const textToSend = trimmed;
    setInput('');
    setPendingFile(null);
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingPreview(null);

    let attachmentUrl: string | null = null;
    if (fileToSend) {
      attachmentUrl = await uploadAttachment(fileToSend);
      if (!attachmentUrl) {
        setSending(false);
        return;
      }
    }
    await sendMessage(textToSend, attachmentUrl);
    setSending(false);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'ar' ? 'يُسمح فقط بملفات الصور' : 'Only image files are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(language === 'ar' ? 'يجب أن يكون حجم الصورة أقل من 10 ميجابايت' : 'Image must be under 10MB');
      return;
    }
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const clearPending = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Headphones className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          {language === 'ar' ? 'يرجى تسجيل الدخول أولاً للتحدث مع خدمة العملاء' : 'Please log in first to chat with customer support'}
        </p>
      </div>
    );
  }

  // Filter out the AI context message from user-visible messages
  const visibleMessages = messages.filter(msg => !msg.content.startsWith('--- AI Chat History ---'));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Headphones className="w-5 h-5" />
        <div>
          <p className="font-semibold text-sm">
            {language === 'ar' ? 'خدمة العملاء' : 'Customer Support'}
          </p>
          <p className="text-[11px] opacity-80">
            {language === 'ar' ? 'فريق سكنك' : 'Sakanak Team'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Welcome message */}
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                <ShieldCheck className="w-4 h-4 text-green-600" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm bg-muted text-foreground">
                {language === 'ar'
                  ? 'مرحبًا! 👋 فريق دعم سكنك هنا لمساعدتك. اكتب رسالتك وهنرد عليك في أقرب وقت.'
                  : "Hello! 👋 Sakanak support team is here to help. Send your message and we'll reply as soon as possible."}
              </div>
            </div>

            {visibleMessages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={cn('flex gap-2', isMe ? 'justify-end' : 'justify-start')}>
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  <div>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl text-sm overflow-hidden',
                        msg.attachment_url ? 'p-1' : 'px-3.5 py-2.5',
                        isMe
                          ? 'bg-green-600 text-white rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      )}
                    >
                      {msg.attachment_url && (
                        <SupportAttachmentImage
                          attachmentUrl={msg.attachment_url}
                          className="rounded-xl max-w-full max-h-64 object-cover"
                        />
                      )}
                      {msg.content && msg.content !== '📷 Photo' && (
                        <div className={cn(msg.attachment_url && 'px-2.5 py-1.5')}>{msg.content}</div>
                      )}
                    </div>
                    <p className={cn('text-[10px] text-muted-foreground mt-0.5', isMe ? 'text-right' : 'text-left')}>
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </p>
                  </div>
                  {isMe && (
                    <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        {pendingPreview && (
          <div className="mb-2 relative inline-block">
            <img src={pendingPreview} alt="preview" className="h-20 w-20 object-cover rounded-lg border" />
            <button
              type="button"
              onClick={clearPending}
              className="absolute -top-1.5 -right-1.5 bg-foreground text-background rounded-full w-5 h-5 flex items-center justify-center shadow"
              aria-label="Remove"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFilePick}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || loading}
            className="h-10 w-10 flex-shrink-0"
            aria-label={language === 'ar' ? 'إرفاق صورة' : 'Attach photo'}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
            disabled={sending || loading}
            className="flex-1 text-sm"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={(!input.trim() && !pendingFile) || sending}
            className="h-10 w-10 flex-shrink-0 bg-green-600 hover:bg-green-700"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportChatWindow;
