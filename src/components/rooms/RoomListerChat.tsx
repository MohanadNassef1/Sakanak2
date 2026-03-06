import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Bot, User, Sparkles, X, CheckCircle, Home } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/room-lister-chat`;

const ChatBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isUser = msg.role === 'user';
  const displayContent = msg.content.replace(/\s*\[READY\]\s*/gi, '').trim();

  return (
    <div className={cn('flex gap-2 mb-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
          <ReactMarkdown>{displayContent}</ReactMarkdown>
        </div>
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
};

const RoomListerChat: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showReadyButton, setShowReadyButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showReadyButton]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Check for [READY] tag in the last assistant message
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'assistant' && lastMsg.content.includes('[READY]')) {
      setShowReadyButton(true);
    }
  }, [messages]);

  const getAuthToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const token = await getAuthToken();
    if (!token) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please sign in first');
      return;
    }

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setIsLoading(true);
    setShowReadyButton(false);

    let assistantSoFar = '';

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          language,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Flush remaining
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }
    } catch (e: any) {
      console.error('Chat error:', e);
      toast.error(e.message || 'Failed to get response');
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.content) return prev.slice(0, -1);
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, language]);

  const handleCreateListing = async () => {
    const token = await getAuthToken();
    if (!token) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please sign in first');
      return;
    }

    setIsCreating(true);

    try {
      // Step 1: Extract structured room data via AI tool calling
      const extractResp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          language,
          action: 'extract',
        }),
      });

      if (!extractResp.ok) {
        const errData = await extractResp.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to extract room details');
      }

      const { room_data } = await extractResp.json();
      if (!room_data) throw new Error('No room data extracted');

      // Step 2: Get user profile for gender enforcement
      const { data: profile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user!.id)
        .single();

      const preferredGender = profile?.gender === 'female' ? 'female' : 'male';
      const allowedGender = profile?.gender === 'female' ? 'females_only' : 'males_only';

      // Step 3: Create the room
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          title: room_data.title || 'Room Listing',
          description: room_data.description || '',
          room_type: room_data.room_type || 'private_room',
          price_per_month: room_data.price_per_month,
          city: room_data.city,
          area: room_data.area || '',
          address: room_data.address || '',
          available_from: room_data.available_from || format(new Date(), 'yyyy-MM-dd'),
          min_stay_months: room_data.min_stay_months || 1,
          max_roommates: room_data.max_roommates || 1,
          current_roommates: room_data.current_roommates || 0,
          allows_smoking: room_data.allows_smoking || false,
          allows_pets: room_data.allows_pets || false,
          has_wifi: room_data.has_wifi || false,
          has_ac: room_data.has_ac || false,
          has_elevator: room_data.has_elevator || false,
          has_balcony: room_data.has_balcony || false,
          has_doorman: room_data.has_doorman || false,
          has_natural_gas: room_data.has_natural_gas || false,
          has_water_heater: room_data.has_water_heater || false,
          has_private_bathroom: room_data.has_private_bathroom || false,
          allows_visits: room_data.allows_visits !== false,
          total_bedrooms: room_data.total_bedrooms || 1,
          deposit: room_data.deposit || 0,
          insurance_amount: room_data.insurance_amount || 0,
          bills_included: room_data.bills_included || [],
          owner_payout_method: room_data.owner_payout_method || 'instapay',
          payout_details: room_data.payout_details || '',
          location_link: room_data.location_link || '',
          lister_type: room_data.lister_type || 'landlord',
          preferred_gender: preferredGender,
          allowed_gender: allowedGender,
          photos: [],
          amenities: [],
          rules: [],
          personality_tags: [],
          owner_id: user!.id,
          status: 'active',
        } as any)
        .select('id')
        .single();

      if (error) throw error;

      toast.success(
        language === 'ar' ? '🎉 تم إنشاء الإعلان بنجاح!' : '🎉 Listing created successfully!'
      );

      // Navigate to edit page to add photos
      navigate(`/rooms/${data.id}`);
    } catch (e: any) {
      console.error('Create listing error:', e);
      toast.error(
        e.message || (language === 'ar' ? 'فشل إنشاء الإعلان' : 'Failed to create listing')
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const welcomeMessage =
    language === 'ar'
      ? 'مرحبًا! 👋 أنا مساعد سكنك الذكي لإنشاء الإعلانات. وصفلي أوضتك وأنا هعمل الإعلان!'
      : "Hi! 👋 I'm Sakanak's AI listing assistant. Describe your room and I'll create the listing for you!";

  return (
    <>
      {/* Toggle button */}
      <Button
        variant={isOpen ? 'outline' : 'default'}
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        {isOpen ? (
          <>
            <X className="w-4 h-4" />
            {language === 'ar' ? 'إغلاق المساعد' : 'Close Assistant'}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {language === 'ar' ? 'أنشئ بالذكاء الاصطناعي' : 'Create with AI'}
          </>
        )}
      </Button>

      {isOpen && (
        <div className="mt-4 rounded-2xl border border-border bg-background shadow-lg flex flex-col overflow-hidden" style={{ height: '520px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">
                  {language === 'ar' ? 'مساعد إنشاء الإعلان' : 'AI Listing Assistant'}
                </p>
                <p className="text-[11px] opacity-80">
                  {language === 'ar' ? 'وصف أوضتك وهنعملك إعلان' : 'Describe your room, we create the listing'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{welcomeMessage}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(language === 'ar'
                    ? ['عندي أوضة في المعادي بـ 5000', 'ستوديو في مدينة نصر', 'شقة في الشيخ زايد']
                    : ['I have a room in Maadi for 5000', 'Studio in Nasr City', 'Apartment in Sheikh Zayed']
                  ).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }}
                      className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <ChatBubble key={i} msg={msg} />
            ))}

            {/* Create Listing button */}
            {showReadyButton && !isCreating && (
              <div className="flex justify-center my-3">
                <Button
                  onClick={handleCreateListing}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4" />
                  {language === 'ar' ? 'أنشئ الإعلان الآن' : 'Create Listing Now'}
                </Button>
              </div>
            )}

            {isCreating && (
              <div className="flex justify-center my-3">
                <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === 'ar' ? 'جاري إنشاء الإعلان...' : 'Creating your listing...'}
                </div>
              </div>
            )}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === 'ar' ? 'وصفلي أوضتك...' : 'Describe your room...'}
                disabled={isLoading || isCreating}
                className="flex-1 text-sm"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <Button
                size="icon"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading || isCreating}
                className="h-10 w-10 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomListerChat;
