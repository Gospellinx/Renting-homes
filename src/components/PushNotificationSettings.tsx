import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const PushNotificationSettings = () => {
  const { isSupported, isSubscribed, permission, loading, subscribe, unsubscribe } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      const { error } = await unsubscribe();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to disable notifications",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Notifications Disabled",
          description: "You will no longer receive push notifications"
        });
      }
    } else {
      const { error } = await subscribe();
      if (error) {
        if (error.message === "Notification permission denied") {
          toast({
            title: "Permission Denied",
            description: "Please enable notifications in your browser settings",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to enable notifications",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Notifications Enabled",
          description: "You will now receive push notifications"
        });
      }
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              Please use a modern browser like Chrome, Firefox, or Edge to enable push notifications.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about verification updates, messages, and connection requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">Enable Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications even when you're not on the site
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={isSubscribed}
            onCheckedChange={handleToggle}
          />
        </div>

        {permission === 'denied' && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              Notifications are blocked. Please enable them in your browser settings.
            </span>
          </div>
        )}

        {isSubscribed && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">
              Push notifications are enabled. You'll receive updates even when you're away.
            </span>
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">You'll be notified about:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Verification status updates (approved/rejected)</li>
            <li>• New connection requests</li>
            <li>• New messages from connections</li>
            <li>• Group chat messages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationSettings;
