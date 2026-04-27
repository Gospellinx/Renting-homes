import {
  Bell,
  CheckCheck,
  Handshake,
  MessageCircleMore,
  ShieldCheck,
  ShieldX,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "verification":
    case "verification_approved":
      return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
    case "verification_rejected":
      return <ShieldX className="h-4 w-4 text-destructive" />;
    case "connection_request":
      return <UserPlus className="h-4 w-4 text-primary" />;
    case "connection_accepted":
      return <Handshake className="h-4 w-4 text-amber-600" />;
    case "new_message":
      return <MessageCircleMore className="h-4 w-4 text-sky-600" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="mr-1 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: () => void;
}) => {
  return (
    <div
      className={`cursor-pointer p-4 transition-colors hover:bg-muted/50 ${
        !notification.read ? "bg-primary/5" : ""
      }`}
      onClick={onMarkAsRead}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted/60">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="truncate text-sm text-muted-foreground">
            {notification.message}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
            })}
          </p>
        </div>
        {!notification.read && (
          <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
        )}
      </div>
    </div>
  );
};
