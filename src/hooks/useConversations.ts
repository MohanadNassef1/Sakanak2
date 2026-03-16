import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  room_id: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  // Joined data
  other_participant?: {
    full_name: string;
    avatar_url: string | null;
    verification_status: string;
    age?: number | null;
    occupation?: string | null;
    university?: string | null;
    personality_tags?: string[] | null;
    is_smoker?: boolean | null;
    has_pets?: boolean | null;
    nationality?: string | null;
    looking_for?: string | null;
  };
  room?: {
    title: string;
    photos: string[];
  };
  last_message?: {
    content: string;
    sender_id: string;
    created_at: string;
    read_at: string | null;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_filtered: boolean;
  read_at: string | null;
  created_at: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get conversations
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      if (!conversations) return [];

      // Get other participants' profiles and last messages
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.participant_one === user.id 
            ? conv.participant_two 
            : conv.participant_one;

          // Get other participant's profile - use public_profiles view to avoid exposing sensitive contact info
          const { data: profile } = await supabase
            .from('public_profiles')
            .select('full_name, avatar_url, is_verified, age, occupation, university, personality_tags, is_smoker, has_pets, nationality, looking_for')
            .eq('user_id', otherUserId)
            .maybeSingle();
          const mappedProfile = profile ? {
            full_name: profile.full_name || '',
            avatar_url: profile.avatar_url,
            verification_status: profile.is_verified ? 'verified' : 'unverified',
            age: profile.age,
            occupation: profile.occupation,
            university: profile.university,
            personality_tags: profile.personality_tags,
            is_smoker: profile.is_smoker,
            has_pets: profile.has_pets,
            nationality: profile.nationality,
            looking_for: profile.looking_for,
          } : null;

          // Get room if exists
          let room = null;
          if (conv.room_id) {
            const { data: roomData } = await supabase
              .from('rooms')
              .select('title, photos')
              .eq('id', conv.room_id)
              .single();
            room = roomData;
          }

          // Get last message
          const { data: messages } = await supabase
            .from('messages')
            .select('content, sender_id, created_at, read_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          // Count unread messages
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            ...conv,
            other_participant: mappedProfile,
            room,
            last_message: messages?.[0] || null,
            unread_count: count || 0,
          } as Conversation;
        })
      );

      return enrichedConversations;
    },
    enabled: !!user?.id,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return query;
};

export const useConversation = (conversationId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      
      const otherUserId = data.participant_one === user?.id 
        ? data.participant_two 
        : data.participant_one;

      // Use public_profiles view to avoid exposing sensitive contact info
      const { data: profileData } = await supabase
        .from('public_profiles')
        .select('full_name, avatar_url, is_verified')
        .eq('user_id', otherUserId)
        .maybeSingle();
      const profile = profileData ? {
        full_name: profileData.full_name || '',
        avatar_url: profileData.avatar_url,
        verification_status: profileData.is_verified ? 'verified' : 'unverified',
      } : null;

      let room = null;
      if (data.room_id) {
        const { data: roomData } = await supabase
          .from('rooms')
          .select('title, photos')
          .eq('id', data.room_id)
          .single();
        room = roomData;
      }

      return {
        ...data,
        other_participant: profile,
        room,
      } as Conversation;
    },
    enabled: !!conversationId && !!user?.id,
  });
};

export const useMessages = (conversationId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.setQueryData(['messages', conversationId], (old: Message[] | undefined) => {
            if (!old) return [payload.new as Message];
            return [...old, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  // Mark messages as read
  useEffect(() => {
    if (!conversationId || !user?.id || !query.data) return;

    const unreadMessages = query.data.filter(
      (msg) => msg.sender_id !== user.id && !msg.read_at
    );

    if (unreadMessages.length > 0) {
      supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
        });
    }
  }, [conversationId, user?.id, query.data, queryClient]);

  return query;
};

export const useSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
  });
};

export const useStartConversation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ otherUserId, roomId }: { otherUserId: string; roomId?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(participant_one.eq.${user.id},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${user.id})`
        )
        .maybeSingle();

      if (existing) {
        return existing;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant_one: user.id,
          participant_two: otherUserId,
          room_id: roomId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
  });
};
