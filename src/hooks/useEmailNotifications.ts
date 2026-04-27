import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface EmailNotificationPreferences {
  enabled: boolean;
  verification: boolean;
  connections: boolean;
  messages: boolean;
}

const defaultPreferences: EmailNotificationPreferences = {
  enabled: true,
  verification: true,
  connections: true,
  messages: true,
};

export const useEmailNotifications = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] =
    useState<EmailNotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPreference = async () => {
      if (!user) {
        if (isMounted) {
          setPreferences(defaultPreferences);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "email_notifications_enabled, email_verification_notifications, email_connection_notifications, email_message_notifications"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (!error && data) {
        setPreferences({
          enabled:
            typeof data.email_notifications_enabled === "boolean"
              ? data.email_notifications_enabled
              : defaultPreferences.enabled,
          verification:
            typeof data.email_verification_notifications === "boolean"
              ? data.email_verification_notifications
              : defaultPreferences.verification,
          connections:
            typeof data.email_connection_notifications === "boolean"
              ? data.email_connection_notifications
              : defaultPreferences.connections,
          messages:
            typeof data.email_message_notifications === "boolean"
              ? data.email_message_notifications
              : defaultPreferences.messages,
        });
      } else {
        setPreferences(defaultPreferences);
      }

      setLoading(false);
    };

    loadPreference();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const updatePreferences = async (
    updates: Partial<EmailNotificationPreferences>
  ) => {
    if (!user) {
      return { error: new Error("Not authenticated") };
    }

    const nextPreferences = {
      ...preferences,
      ...updates,
    };

    setSaving(true);

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        email_notifications_enabled: nextPreferences.enabled,
        email_verification_notifications: nextPreferences.verification,
        email_connection_notifications: nextPreferences.connections,
        email_message_notifications: nextPreferences.messages,
      },
      { onConflict: "user_id" }
    );

    if (!error) {
      setPreferences(nextPreferences);
    }

    setSaving(false);
    return { error };
  };

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
  };
};
