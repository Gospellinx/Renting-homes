import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface AdminVerificationRequest {
  id: string;
  user_id: string;
  status: string;
  property_address: string;
  property_type: string;
  ownership_type: string;
  ownership_document_url: string | null;
  occupancy_document_url: string | null;
  rejection_reason: string | null;
  flagged: boolean;
  flagged_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useAdminVerifications = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AdminVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setRequests([]);
      setLoading(false);
      setIsAdmin(false);
      return;
    }

    const checkAdminAndFetch = async () => {
      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // Fetch all verification requests
      const { data, error } = await supabase
        .from("verification_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRequests(data as AdminVerificationRequest[]);
      }
      setLoading(false);
    };

    checkAdminAndFetch();
  }, [user]);

  const approveRequest = async (requestId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("verification_requests")
      .update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (!error) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: "approved", reviewed_by: user.id, reviewed_at: new Date().toISOString() }
            : r
        )
      );

      // Create notification for user
      const request = requests.find((r) => r.id === requestId);
      if (request) {
        await supabase.from("notifications").insert({
          user_id: request.user_id,
          title: "Verification Approved",
          message: `Your verification for ${request.property_address} has been approved!`,
          type: "verification",
          related_id: requestId,
        });
      }
    }

    return { error };
  };

  const rejectRequest = async (requestId: string, reason: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("verification_requests")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (!error) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: "rejected",
                rejection_reason: reason,
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
              }
            : r
        )
      );

      // Create notification for user
      const request = requests.find((r) => r.id === requestId);
      if (request) {
        await supabase.from("notifications").insert({
          user_id: request.user_id,
          title: "Verification Rejected",
          message: `Your verification for ${request.property_address} has been rejected. Reason: ${reason}`,
          type: "verification",
          related_id: requestId,
        });
      }
    }

    return { error };
  };

  const flagRequest = async (requestId: string, reason: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("verification_requests")
      .update({
        flagged: true,
        flagged_reason: reason,
      })
      .eq("id", requestId);

    if (!error) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, flagged: true, flagged_reason: reason } : r
        )
      );
    }

    return { error };
  };

  const unflagRequest = async (requestId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("verification_requests")
      .update({
        flagged: false,
        flagged_reason: null,
      })
      .eq("id", requestId);

    if (!error) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, flagged: false, flagged_reason: null } : r
        )
      );
    }

    return { error };
  };

  return {
    requests,
    loading,
    isAdmin,
    approveRequest,
    rejectRequest,
    flagRequest,
    unflagRequest,
  };
};
