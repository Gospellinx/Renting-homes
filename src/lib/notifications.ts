import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type AppNotificationType =
  | "verification"
  | "verification_approved"
  | "verification_rejected"
  | "connection_request"
  | "connection_accepted"
  | "new_message";

export interface NotifyUserInput {
  userId: string;
  type: AppNotificationType;
  title: string;
  message: string;
  relatedId?: string | null;
  actionUrl?: string;
  emailSubject?: string;
}

const sendNotificationEmail = async (
  notification: NotifyUserInput & { notificationId: string }
) => {
  const { error } = await supabase.functions.invoke("send-notification-email", {
    body: {
      notificationId: notification.notificationId,
      recipientUserId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      subject: notification.emailSubject,
      actionUrl: notification.actionUrl,
    },
  });

  return error ?? null;
};

export const notifyUser = async (
  notification: NotifyUserInput
): Promise<{
  data: Tables<"notifications"> | null;
  error: unknown;
  emailError: Error | null;
}> => {
  const payload: TablesInsert<"notifications"> = {
    user_id: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    related_id: notification.relatedId ?? null,
  };

  const { data, error } = await supabase
    .from("notifications")
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    return {
      data: null,
      error,
      emailError: null,
    };
  }

  const emailError = await sendNotificationEmail({
    ...notification,
    notificationId: data.id,
  });

  if (emailError) {
    console.error("Failed to send notification email:", emailError);
  }

  return {
    data,
    error: null,
    emailError,
  };
};

export const getUserDisplayName = (
  user: Pick<User, "email" | "user_metadata"> | null | undefined
) => {
  const fullName = user?.user_metadata?.full_name;

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }

  const emailPrefix = user?.email?.split("@")[0]?.trim();
  return emailPrefix || "Someone";
};

export const truncateNotificationMessage = (value: string, maxLength = 140) => {
  const trimmedValue = value.trim();

  if (trimmedValue.length <= maxLength) {
    return trimmedValue;
  }

  return `${trimmedValue.slice(0, maxLength - 1).trimEnd()}...`;
};
