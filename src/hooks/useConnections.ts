import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectionWithProfile extends Connection {
  partnerProfile: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    location: string | null;
  };
}

export const useConnections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setConnections([]);
      setPendingRequests([]);
      setLoading(false);
      return;
    }

    const fetchConnections = async () => {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Get all partner IDs
      const partnerIds = data.map((c) =>
        c.requester_id === user.id ? c.recipient_id : c.requester_id
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, location")
        .in("user_id", partnerIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      const withProfiles: ConnectionWithProfile[] = data.map((c) => {
        const partnerId = c.requester_id === user.id ? c.recipient_id : c.requester_id;
        return {
          ...c,
          partnerProfile: profileMap.get(partnerId) || {
            user_id: partnerId,
            full_name: null,
            avatar_url: null,
            location: null,
          },
        };
      });

      setConnections(withProfiles.filter((c) => c.status === "accepted"));
      setPendingRequests(
        withProfiles.filter((c) => c.status === "pending" && c.recipient_id === user.id)
      );
      setLoading(false);
    };

    fetchConnections();
  }, [user]);

  const sendConnectionRequest = async (recipientId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase.from("connections").insert({
      requester_id: user.id,
      recipient_id: recipientId,
    });

    // Create notification for recipient
    if (!error) {
      await supabase.from("notifications").insert({
        user_id: recipientId,
        type: "connection_request",
        title: "New Connection Request",
        message: "Someone wants to connect with you!",
        related_id: user.id,
      });
    }

    return { error };
  };

  const respondToRequest = async (connectionId: string, accept: boolean) => {
    if (!user) return { error: new Error("Not authenticated") };

    const connection = pendingRequests.find((c) => c.id === connectionId);
    if (!connection) return { error: new Error("Connection not found") };

    const { error } = await supabase
      .from("connections")
      .update({ status: accept ? "accepted" : "rejected" })
      .eq("id", connectionId);

    if (!error && accept) {
      // Notify the requester
      await supabase.from("notifications").insert({
        user_id: connection.requester_id,
        type: "connection_accepted",
        title: "Connection Accepted",
        message: "Your connection request was accepted!",
        related_id: user.id,
      });

      // Update local state
      const updatedConnection = { ...connection, status: "accepted" };
      setConnections((prev) => [...prev, updatedConnection]);
    }

    setPendingRequests((prev) => prev.filter((c) => c.id !== connectionId));
    return { error };
  };

  return { connections, pendingRequests, loading, sendConnectionRequest, respondToRequest };
};
