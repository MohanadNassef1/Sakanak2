import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SupportMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  is_admin: boolean;
  content: string;
  attachment_url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface SupportConversation {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
  last_message_at: string | null;
}

export function useSupportChat() {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Find or create a support conversation for the current user
  const getOrCreateConversation = useCallback(async () => {
    if (!user?.id) return null;
    setLoading(true);
    try {
      // Check for existing open conversation
      const { data: existing } = await supabase
        .from('support_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        setConversation(existing as SupportConversation);
        return existing as SupportConversation;
      }

      // Create new conversation
      const { data: newConvo, error } = await supabase
        .from('support_conversations')
        .insert({ user_id: user.id, subject: 'Customer Support' })
        .select()
        .single();

      if (error) throw error;
      setConversation(newConvo as SupportConversation);
      return newConvo as SupportConversation;
    } catch (e: any) {
      console.error('Support chat error:', e);
      toast.error('Failed to start support chat');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (convoId: string) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data as SupportMessage[]);
  }, []);

  // Send a message and notify admins
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !conversation?.id) return;

    // Check if this is the first message in the conversation
    const isFirstMessage = messages.length === 0;

    const { error } = await supabase
      .from('support_messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        is_admin: false,
        content,
      });

    if (error) {
      toast.error('Failed to send message');
      console.error(error);
      return;
    }

    // Only notify admins on the first message of the conversation
    if (isFirstMessage) {
      supabase.functions.invoke('notify-support', {
        body: {
          conversation_id: conversation.id,
          message_content: content,
          sender_name: user.user_metadata?.full_name || user.email || 'User',
        },
      }).catch((e) => console.error('Failed to notify admins:', e));
    }
  }, [user?.id, user?.email, user?.user_metadata, conversation?.id, messages.length]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversation?.id) return;

    fetchMessages(conversation.id);

    const channel = supabase
      .channel(`support-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as SupportMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation?.id, fetchMessages]);

  return {
    conversation,
    messages,
    loading,
    getOrCreateConversation,
    sendMessage,
    uploadAttachment,
  };
}
