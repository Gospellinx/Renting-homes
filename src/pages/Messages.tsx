import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessages, Message, Conversation } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activePartnerId = searchParams.get("partner");
  const { user } = useAuth();
  const { conversations, loading, sendMessage, getConversation } = useMessages();
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [activePartner, setActivePartner] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activePartnerId) {
      loadConversation(activePartnerId);
      const partner = conversations.find((c) => c.partnerId === activePartnerId);
      if (partner) setActivePartner(partner);
    }
  }, [activePartnerId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  // Subscribe to new messages in active conversation
  useEffect(() => {
    if (!activePartnerId || !user) return;

    const channel = supabase
      .channel("active-conversation")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === user.id && newMsg.recipient_id === activePartnerId) ||
            (newMsg.sender_id === activePartnerId && newMsg.recipient_id === user.id)
          ) {
            setActiveMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activePartnerId, user]);

  const loadConversation = async (partnerId: string) => {
    const messages = await getConversation(partnerId);
    setActiveMessages(messages);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activePartnerId) return;

    setSending(true);
    await sendMessage(activePartnerId, newMessage.trim());
    setNewMessage("");
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f2f4fb_0%,#f7f7fb_42%,#f4f1ec_100%)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,104,228,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(72,153,255,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(162,153,255,0.12),transparent_42%)] z-0" />
      
      <header className="relative z-40 border-b border-[#d7daf0] bg-white/80 sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-[#1f1a54] hover:text-[#26225f] hover:bg-[#eef1ff]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-[#1f1a54]">Messages</h1>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-150px)]">
          {/* Conversations List */}
          <div className="border border-[#d7daf0] rounded-lg overflow-hidden bg-white/90">
            <div className="p-4 border-b border-[#d7daf0] bg-[#eef1ff]">
              <h3 className="font-semibold text-[#1f1a54]">Conversations</h3>
            </div>
            <ScrollArea className="h-full">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-1">Connect with neighbors to start chatting</p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((convo) => (
                    <button
                      key={convo.partnerId}
                      className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                        activePartnerId === convo.partnerId ? "bg-muted" : ""
                      }`}
                      onClick={() => navigate(`/messages?partner=${convo.partnerId}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={convo.partnerAvatar || undefined} />
                          <AvatarFallback>
                            {convo.partnerName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{convo.partnerName}</p>
                            {convo.unreadCount > 0 && (
                              <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                {convo.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {convo.lastMessage}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col">
            {activePartnerId && activePartner ? (
              <>
                <div className="p-4 border-b bg-muted/50 flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={activePartner.partnerAvatar || undefined} />
                    <AvatarFallback>
                      {activePartner.partnerName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{activePartner.partnerName}</p>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {activeMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender_id === user?.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            msg.sender_id === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatDistanceToNow(new Date(msg.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      disabled={sending}
                    />
                    <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
