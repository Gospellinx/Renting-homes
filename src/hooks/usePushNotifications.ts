import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const VAPID_PUBLIC_KEY = "BIpEPYQ1cNb2gT3RG4R9fxz9c8LNdxZlKpSQxnBQm8qp0d_8uLBgqNJKzXGzZ0qWY5cMaQzXZrKxCQ6wJaF6fxw";

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = "serviceWorker" in navigator && "PushManager" in window;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);

        if (user && Notification.permission === "granted") {
          await checkExistingSubscription();
        }
      }
      setLoading(false);
    };

    checkSupport();
  }, [user]);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers not supported");
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    return registration;
  };

  const subscribe = async () => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        return { error: new Error("Notification permission denied") };
      }

      const registration = await registerServiceWorker();

      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subscriptionJSON = subscription.toJSON();

      // Save subscription to database
      const { error } = await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        endpoint: subscriptionJSON.endpoint!,
        p256dh: subscriptionJSON.keys!.p256dh,
        auth: subscriptionJSON.keys!.auth,
      });

      if (!error) {
        setIsSubscribed(true);
      }

      return { error };
    } catch (error) {
      console.error("Error subscribing:", error);
      return { error: error as Error };
    }
  };

  const unsubscribe = async () => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove subscription from database
        const { error } = await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("endpoint", subscription.endpoint);

        if (!error) {
          setIsSubscribed(false);
        }

        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error("Error unsubscribing:", error);
      return { error: error as Error };
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribe,
    unsubscribe,
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}
