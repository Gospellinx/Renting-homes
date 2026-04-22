import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface VerificationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
}

interface DailyVerification {
  date: string;
  pending: number;
  approved: number;
  rejected: number;
}

interface GroupChatStats {
  totalGroups: number;
  totalMembers: number;
  totalMessages: number;
}

interface DailyActivity {
  date: string;
  verifications: number;
  messages: number;
  newUsers: number;
}

export interface AnalyticsData {
  verificationStats: VerificationStats;
  dailyVerifications: DailyVerification[];
  groupChatStats: GroupChatStats;
  dailyActivity: DailyActivity[];
  userStats: {
    totalUsers: number;
    verifiedUsers: number;
    adminUsers: number;
  };
}

export const useAdminAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setAnalytics(null);
      setLoading(false);
      setIsAdmin(false);
      return;
    }

    const fetchAnalytics = async () => {
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

      try {
        // Fetch verification requests
        const { data: verificationData } = await supabase
          .from("verification_requests")
          .select("*");

        const verifications = verificationData || [];

        // Calculate verification stats
        const verificationStats: VerificationStats = {
          total: verifications.length,
          pending: verifications.filter((v) => v.status === "pending").length,
          approved: verifications.filter((v) => v.status === "approved").length,
          rejected: verifications.filter((v) => v.status === "rejected").length,
          flagged: verifications.filter((v) => v.flagged).length,
        };

        // Calculate daily verifications (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split("T")[0];
        });

        const dailyVerifications: DailyVerification[] = last7Days.map((date) => {
          const dayVerifications = verifications.filter(
            (v) => v.created_at.split("T")[0] === date
          );
          return {
            date,
            pending: dayVerifications.filter((v) => v.status === "pending").length,
            approved: dayVerifications.filter((v) => v.status === "approved").length,
            rejected: dayVerifications.filter((v) => v.status === "rejected").length,
          };
        });

        // Fetch group chat stats
        const { data: groupsData } = await supabase.from("group_chats").select("id");
        const { data: membersData } = await supabase.from("group_chat_members").select("id");
        const { data: groupMessagesData } = await supabase.from("group_messages").select("id");

        const groupChatStats: GroupChatStats = {
          totalGroups: groupsData?.length || 0,
          totalMembers: membersData?.length || 0,
          totalMessages: groupMessagesData?.length || 0,
        };

        // Fetch user roles for user stats
        const { data: rolesData } = await supabase.from("user_roles").select("*");
        const { data: profilesData } = await supabase.from("profiles").select("id");

        const userStats = {
          totalUsers: profilesData?.length || 0,
          verifiedUsers: verifications.filter((v) => v.status === "approved").length,
          adminUsers: rolesData?.filter((r) => r.role === "admin").length || 0,
        };

        // Calculate daily activity (last 7 days)
        const dailyActivity: DailyActivity[] = last7Days.map((date) => ({
          date,
          verifications: verifications.filter((v) => v.created_at.split("T")[0] === date).length,
          messages: 0, // Would need message timestamps
          newUsers: 0, // Would need profile timestamps
        }));

        setAnalytics({
          verificationStats,
          dailyVerifications,
          groupChatStats,
          dailyActivity,
          userStats,
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  return { analytics, loading, isAdmin };
};
