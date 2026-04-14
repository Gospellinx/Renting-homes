import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface GroupChat {
  id: string;
  name: string;
  area: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export const useGroupChats = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [myGroups, setMyGroups] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      setMyGroups([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      // Check if user is verified
      const { data: verificationData } = await supabase
        .from("verification_requests")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .maybeSingle();

      setIsVerified(!!verificationData);

      if (!verificationData) {
        setLoading(false);
        return;
      }

      // Fetch all available groups
      const { data: groupsData } = await supabase
        .from("group_chats")
        .select("*")
        .order("created_at", { ascending: false });

      if (groupsData) {
        setGroups(groupsData);
      }

      // Fetch groups user is a member of
      const { data: membershipData } = await supabase
        .from("group_chat_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (membershipData && groupsData) {
        const memberGroupIds = membershipData.map((m) => m.group_id);
        setMyGroups(groupsData.filter((g) => memberGroupIds.includes(g.id)));
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const createGroup = async (name: string, area: string, description?: string) => {
    if (!user) return { error: new Error("Not authenticated"), group: null };

    const { data, error } = await supabase
      .from("group_chats")
      .insert({
        name,
        area,
        description,
        created_by: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      // Automatically join the group
      await supabase.from("group_chat_members").insert({
        group_id: data.id,
        user_id: user.id,
      });

      setGroups((prev) => [data, ...prev]);
      setMyGroups((prev) => [data, ...prev]);
    }

    return { error, group: data };
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase.from("group_chat_members").insert({
      group_id: groupId,
      user_id: user.id,
    });

    if (!error) {
      const group = groups.find((g) => g.id === groupId);
      if (group) {
        setMyGroups((prev) => [group, ...prev]);
      }
    }

    return { error };
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("group_chat_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id);

    if (!error) {
      setMyGroups((prev) => prev.filter((g) => g.id !== groupId));
    }

    return { error };
  };

  return {
    groups,
    myGroups,
    loading,
    isVerified,
    createGroup,
    joinGroup,
    leaveGroup,
  };
};

export const useGroupMessages = (groupId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !groupId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("group_messages")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
      }
      setLoading(false);
    };

    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`group_messages:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as GroupMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, groupId]);

  const sendMessage = async (content: string) => {
    if (!user || !groupId) return { error: new Error("Not authenticated") };

    const { error } = await supabase.from("group_messages").insert({
      group_id: groupId,
      sender_id: user.id,
      content,
    });

    return { error };
  };

  return { messages, loading, sendMessage };
};
