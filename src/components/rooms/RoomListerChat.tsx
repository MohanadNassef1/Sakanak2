import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Bot, User, Sparkles, X, CheckCircle, Home, Camera, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useUploadRoomPhoto } from '@/hooks/useCreateRoom';
import { format } from 'date-fns';
import { logError } from '@/lib/logger';

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
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const uploadMutation = useUploadRoomPhoto();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showReadyButton, setShowReadyButton] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const supportsVoice = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startRecognitionWithLang = useCallback((lang: 'ar' | 'en') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    let restartedWithOtherLang = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');

      // If started with Arabic but interim shows only Latin chars → user is speaking English
      // If started with English but interim shows Arabic chars → user is speaking Arabic
      if (!restartedWithOtherLang && !event.results[0].isFinal && transcript.length > 2) {
        const hasArabic = /[\u0600-\u06FF]/.test(transcript);
        const hasLatin = /[a-zA-Z]/.test(transcript);
        
        if (lang === 'ar' && !hasArabic && hasLatin) {
          // Started Arabic, but getting English text → switch to English
          restartedWithOtherLang = true;
          recognition.abort();
          startRecognitionWithLang('en');
          return;
        } else if (lang === 'en' && hasArabic) {
          // Started English, but getting Arabic chars → switch to Arabic
          restartedWithOtherLang = true;
          recognition.abort();
          startRecognitionWithLang('ar');
          return;
        }
      }

      setInput(transcript);
    };

    recognition.onend = () => {
      if (!restartedWithOtherLang) {
        setIsListening(false);
        recognitionRef.current = null;
      }
    };

    recognition.onerror = () => {
      if (!restartedWithOtherLang) {
        setIsListening(false);
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const toggleVoiceInput = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(language === 'ar' ? 'المتصفح لا يدعم الإدخال الصوتي' : 'Browser does not support voice input');
      return;
    }

    // Always start with Arabic first (primary audience), auto-switch to English if needed
    startRecognitionWithLang('ar');
  }, [isListening, language, startRecognitionWithLang]);

  const MAX_PHOTOS = 6;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showReadyButton, photos]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_PHOTOS - photos.length;
    const filesToUpload = Array.from(files).slice(0, remaining);

    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        toast.error(t('rooms.form.invalidImage'));
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('rooms.form.imageTooLarge'));
        continue;
      }
      try {
        const url = await uploadMutation.mutateAsync(file);
        setPhotos(prev => [...prev, url]);
      } catch (error) {
        toast.error(t('rooms.form.uploadError'));
        logError('RoomListerChat.photoUpload', error);
      }
    }
    e.target.value = '';
  }, [photos, uploadMutation, t]);

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
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

    if (photos.length === 0) {
      toast.error(language === 'ar' ? 'يرجى رفع صورة واحدة على الأقل' : 'Please upload at least one photo');
      return;
    }

    setIsCreating(true);

    try {
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user!.id)
        .single();

      const preferredGender = profile?.gender === 'female' ? 'female' : 'male';
      const allowedGender = profile?.gender === 'female' ? 'females_only' : 'males_only';

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
          
          location_link: room_data.location_link || '',
          lister_type: room_data.lister_type || 'landlord',
          preferred_gender: preferredGender,
          allowed_gender: allowedGender,
          photos: photos,
          amenities: [],
          rules: [],
          personality_tags: [],
          owner_id: user!.id,
          status: 'active',
        } as any)
        .select('id')
        .single();

      if (error) throw error;

      // Insert payout info into separate secure table
      if (room_data.owner_payout_method || room_data.payout_details) {
        await supabase
          .from('room_payout_info')
          .insert({
            room_id: data.id,
            owner_id: user!.id,
            payout_method: room_data.owner_payout_method || 'instapay',
            payout_details: room_data.payout_details || null,
          } as any);
      }

      supabase.functions.invoke('notify-admin', {
        body: {
          type: 'new_room',
          user_name: user!.user_metadata?.full_name || user!.email,
          user_email: user!.email,
          room_title: room_data.title,
          room_city: room_data.city,
        },
      }).catch(err => console.error('Admin notification failed:', err));

      toast.success(
        language === 'ar' ? '🎉 تم إنشاء الإعلان بنجاح!' : '🎉 Listing created successfully!'
      );

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
      ? 'مرحبًا! 👋 أنا مساعد سكنك الذكي لإنشاء الإعلانات. وصفلي أوضتك وأنا هعمل الإعلان! لا تنسى ترفع صور الأوضة من تحت.'
      : "Hi! 👋 I'm Sakanak's AI listing assistant. Describe your room and I'll create the listing for you! Don't forget to upload room photos below.";

  return (
    <>
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
        <div className="mt-4 space-y-4">
          {/* Chat Window */}
          <div className="rounded-2xl border border-border bg-background shadow-lg flex flex-col overflow-hidden" style={{ height: '480px' }}>
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
                <div className="flex flex-col items-center gap-2 my-3">
                  {photos.length === 0 && (
                    <p className="text-xs text-destructive">
                      {language === 'ar' ? '⚠️ يرجى رفع صورة واحدة على الأقل أدناه' : '⚠️ Please upload at least one photo below'}
                    </p>
                  )}
                  <Button
                    onClick={handleCreateListing}
                    disabled={photos.length === 0}
                    className="gap-2"
                    variant={photos.length > 0 ? 'default' : 'outline'}
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
                {supportsVoice && (
                  <Button
                    size="icon"
                    variant={isListening ? 'destructive' : 'outline'}
                    onClick={toggleVoiceInput}
                    disabled={isLoading || isCreating}
                    className={cn('h-10 w-10 flex-shrink-0', isListening && 'animate-pulse')}
                    title={language === 'ar' ? 'إدخال صوتي' : 'Voice input'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
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

          {/* Photo Uploader Section */}
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-sm">
                {language === 'ar' ? 'صور الغرفة' : 'Room Photos'}
              </h3>
              <span className="text-xs text-muted-foreground">
                ({photos.length}/{MAX_PHOTOS})
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <img src={photo} alt={`Room ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {photos.length < MAX_PHOTOS && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploadMutation.isPending}
                  />
                  {uploadMutation.isPending ? (
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {language === 'ar' ? 'أضف صورة' : 'Add Photo'}
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>

            {photos.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {language === 'ar'
                  ? 'ارفع صور الغرفة لإكمال الإعلان (مطلوب صورة واحدة على الأقل)'
                  : 'Upload room photos to complete the listing (at least 1 required)'}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RoomListerChat;
