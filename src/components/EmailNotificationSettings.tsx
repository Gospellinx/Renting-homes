import type { ComponentType } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  EmailNotificationPreferences,
  useEmailNotifications,
} from "@/hooks/useEmailNotifications";
import {
  BellRing,
  CheckCircle,
  Loader2,
  Mail,
  MailCheck,
  MessageCircleMore,
  ShieldCheck,
  UserRoundPlus,
} from "lucide-react";

const notificationOptions: Array<{
  key: keyof Omit<EmailNotificationPreferences, "enabled">;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    key: "verification",
    title: "Verification updates",
    description: "Approvals and rejections for residency or property checks.",
    icon: ShieldCheck,
  },
  {
    key: "connections",
    title: "Connection activity",
    description: "New requests and accepted connections from the community.",
    icon: UserRoundPlus,
  },
  {
    key: "messages",
    title: "Direct messages",
    description: "Inbox alerts when another user sends you a message.",
    icon: MessageCircleMore,
  },
];

const getSuccessMessage = (
  key: keyof EmailNotificationPreferences,
  nextValue: boolean
) => {
  if (key === "enabled") {
    return nextValue
      ? "All email notifications are now enabled."
      : "All email notifications are now disabled.";
  }

  return nextValue
    ? "That email notification option is now enabled."
    : "That email notification option is now disabled.";
};

const EmailNotificationSettings = () => {
  const { user } = useAuth();
  const { preferences, loading, saving, updatePreferences } = useEmailNotifications();

  const handleToggle = async (
    key: keyof EmailNotificationPreferences,
    nextValue: boolean
  ) => {
    const { error } = await updatePreferences({ [key]: nextValue });

    if (error) {
      toast({
        title: "Update failed",
        description: "We could not update your email notification preferences.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Preferences updated",
      description: getSuccessMessage(key, nextValue),
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Choose which updates should reach {user?.email || "your inbox"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Enable all email notifications</Label>
            <p className="text-sm text-muted-foreground">
              Turn every email alert on or off with one switch.
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={preferences.enabled}
            disabled={saving || !user?.email}
            onCheckedChange={(checked) => handleToggle("enabled", checked)}
          />
        </div>

        {preferences.enabled && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-primary">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">
              Email delivery is active for this account: {user?.email}
            </span>
          </div>
        )}

        <Separator />

        <div className="rounded-lg border bg-muted/20 p-4">
          <div className="mb-3 flex items-center gap-2 font-medium">
            <MailCheck className="h-4 w-4" />
            Notification options
          </div>
          <div className="space-y-4">
            {notificationOptions.map((option) => {
              const Icon = option.icon;
              const checked = preferences[option.key];

              return (
                <div key={option.key} className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-background p-2 shadow-sm">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor={`email-${option.key}`}>{option.title}</Label>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={`email-${option.key}`}
                    checked={checked}
                    disabled={saving || !user?.email || !preferences.enabled}
                    onCheckedChange={(value) => handleToggle(option.key, value)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-dashed p-4">
          <div className="mb-2 flex items-center gap-2 font-medium">
            <BellRing className="h-4 w-4" />
            How it works
          </div>
          <p className="text-sm text-muted-foreground">
            The main switch controls all email delivery. When it is on, you can choose the exact
            kinds of updates you want to receive.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailNotificationSettings;
