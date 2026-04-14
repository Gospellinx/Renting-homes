import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setTotalUnread(0);
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      // Get all messages involving the user
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error || !messages) {
        setLoading(false);
        return;
      }

      // Group by conversation partner
      const conversationMap = new Map<string, Message[]>();
      messages.forEach((msg) => {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, []);
        }
        conversationMap.get(partnerId)!.push(msg);
      });

      // Fetch partner profiles
      const partnerIds = Array.from(conversationMap.keys());
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", partnerIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      // Build conversation list
      const convos: Conversation[] = [];
      let unread = 0;

      conversationMap.forEach((msgs, partnerId) => {
        const profile = profileMap.get(partnerId);
        const unreadCount = msgs.filter(
          (m) => m.recipient_id === user.id && !m.read
        ).length;
        unread += unreadCount;

        convos.push({
          partnerId,
          partnerName: profile?.full_name || "Unknown User",
          partnerAvatar: profile?.avatar_url || null,
          lastMessage: msgs[0].content,
          lastMessageTime: msgs[0].created_at,
          unreadCount,
        });
      });

      setConversations(convos);
      setTotalUnread(unread);
      setLoading(false);
    };

    fetchConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === user.id || newMsg.recipient_id === user.id) {
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const sendMessage = async (recipientId: string, content: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: recipientId,
      content,
    });

    return { error };
  };

  const getConversation = async (partnerId: string) => {
    if (!user) return [];

    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true });

    // Mark messages as read
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", partnerId)
      .eq("recipient_id", user.id)
      .eq("read", false);

    return data || [];
  };

  return { conversations, loading, totalUnread, sendMessage, getConversation };
};
