import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface OnboardingState {
  currentStep: number;
  profileCompleted: boolean;
  verificationStarted: boolean;
  verificationApproved: boolean;
  groupChatJoined: boolean;
  isComplete: boolean;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    profileCompleted: false,
    verificationStarted: false,
    verificationApproved: false,
    groupChatJoined: false,
    isComplete: false,
  });
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) {
      setState({
        currentStep: 0,
        profileCompleted: false,
        verificationStarted: false,
        verificationApproved: false,
        groupChatJoined: false,
        isComplete: false,
      });
      setLoading(false);
      return;
    }

    const checkOnboardingStatus = async () => {
      try {
        // Check if user dismissed onboarding
        const dismissedKey = `onboarding_dismissed_${user.id}`;
        const wasDismissed = localStorage.getItem(dismissedKey);
        if (wasDismissed === "true") {
          setDismissed(true);
        }

        // Check profile completion
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone, location")
          .eq("user_id", user.id)
          .maybeSingle();

        const profileCompleted = !!(
          profile?.full_name &&
          profile?.phone &&
          profile?.location
        );

        // Check verification status
        const { data: verification } = await supabase
          .from("verification_requests")
          .select("status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const verificationStarted = !!verification;
        const verificationApproved = verification?.status === "approved";

        // Check if joined any group chat
        const { data: groupMembership } = await supabase
          .from("group_chat_members")
          .select("id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        const groupChatJoined = !!groupMembership;

        // Calculate current step
        let currentStep = 0;
        if (profileCompleted) currentStep = 1;
        if (verificationStarted) currentStep = 2;
        if (verificationApproved) currentStep = 3;
        if (groupChatJoined) currentStep = 4;

        const isComplete = profileCompleted && verificationApproved && groupChatJoined;

        setState({
          currentStep,
          profileCompleted,
          verificationStarted,
          verificationApproved,
          groupChatJoined,
          isComplete,
        });
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const dismissOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_dismissed_${user.id}`, "true");
      setDismissed(true);
    }
  };

  const resetOnboarding = () => {
    if (user) {
      localStorage.removeItem(`onboarding_dismissed_${user.id}`);
      setDismissed(false);
    }
  };

  return {
    ...state,
    loading,
    dismissed,
    dismissOnboarding,
    resetOnboarding,
    shouldShow: !loading && !dismissed && !state.isComplete && !!user,
  };
};
