import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/context/AuthContext";
import { useGroupChats, useGroupMessages, GroupChat } from "@/hooks/useGroupChats";
import { 
  MessageSquare, 
  Users, 
  MapPin, 
  Plus,
  Send,
  Search,
  Shield,
  Loader2,
  ArrowLeft,
  LogOut
} from 'lucide-react';

const GroupChats = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups, myGroups, loading, isVerified, createGroup, joinGroup, leaveGroup } = useGroupChats();
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newGroupForm, setNewGroupForm] = useState({ name: '', area: '', description: '' });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Sign In Required</h1>
        <p className="text-muted-foreground text-center">Please sign in to access group chats</p>
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Verification Required</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Only verified residents can access group chats. Please complete your resident verification first.
        </p>
        <Button onClick={() => navigate('/community')}>Get Verified</Button>
      </div>
    );
  }

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = async () => {
    if (!newGroupForm.name || !newGroupForm.area) {
      toast({ title: "Error", description: "Name and area are required", variant: "destructive" });
      return;
    }

    setCreating(true);
    const { error, group } = await createGroup(newGroupForm.name, newGroupForm.area, newGroupForm.description);
    setCreating(false);

    if (error) {
      toast({ title: "Error", description: "Failed to create group", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Group created successfully" });
      setNewGroupForm({ name: '', area: '', description: '' });
      setCreateDialogOpen(false);
      if (group) setSelectedGroup(group);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    const { error } = await joinGroup(groupId);
    if (error) {
      toast({ title: "Error", description: "Failed to join group", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "You've joined the group" });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    const { error } = await leaveGroup(groupId);
    if (error) {
      toast({ title: "Error", description: "Failed to leave group", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "You've left the group" });
      setSelectedGroup(null);
    }
  };

  const isMember = (groupId: string) => myGroups.some(g => g.id === groupId);

  if (selectedGroup) {
    return (
      <GroupChatView 
        group={selectedGroup} 
        onBack={() => setSelectedGroup(null)}
        onLeave={() => handleLeaveGroup(selectedGroup.id)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton showHomeLink={false} />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Group Chats</h1>
                <p className="text-muted-foreground">Connect with verified residents in your area</p>
              </div>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Start a new group chat for your property or area
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Group Name</Label>
                    <Input
                      value={newGroupForm.name}
                      onChange={(e) => setNewGroupForm({...newGroupForm, name: e.target.value})}
                      placeholder="e.g., Lekki Gardens Residents"
                    />
                  </div>
                  <div>
                    <Label>Area/Property</Label>
                    <Input
                      value={newGroupForm.area}
                      onChange={(e) => setNewGroupForm({...newGroupForm, area: e.target.value})}
                      placeholder="e.g., Lekki Phase 1"
                    />
                  </div>
                  <div>
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={newGroupForm.description}
                      onChange={(e) => setNewGroupForm({...newGroupForm, description: e.target.value})}
                      placeholder="What's this group about?"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateGroup} disabled={creating}>
                    {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Create Group
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Input
            placeholder="Search groups by name or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>

        {/* My Groups */}
        {myGroups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Groups
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map((group) => (
                <Card 
                  key={group.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedGroup(group)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {group.area}
                        </CardDescription>
                      </div>
                      <Badge className="bg-primary/10 text-primary">Member</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {group.description || "No description"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Groups */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {myGroups.length > 0 ? 'Discover Groups' : 'All Groups'}
          </h2>
          {filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No groups found</p>
                <p className="text-sm text-muted-foreground mt-1">Be the first to create one!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.filter(g => !isMember(g.id)).map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {group.area}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {group.description || "No description"}
                    </p>
                    <Button 
                      className="w-full gap-2"
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      <Users className="h-4 w-4" />
                      Join Group
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Group Chat View Component
const GroupChatView = ({ 
  group, 
  onBack, 
  onLeave 
}: { 
  group: GroupChat; 
  onBack: () => void;
  onLeave: () => void;
}) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useGroupMessages(group.id);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!messageInput.trim()) return;

    setSending(true);
    const { error } = await sendMessage(messageInput.trim());
    setSending(false);

    if (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } else {
      setMessageInput('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold">{group.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {group.area}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="gap-1 text-destructive" onClick={onLeave}>
          <LogOut className="h-4 w-4" />
          Leave
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">Be the first to say hello!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {message.sender_id.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`rounded-lg px-3 py-2 ${
                      isOwn 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <Button onClick={handleSend} disabled={sending || !messageInput.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupChats;
