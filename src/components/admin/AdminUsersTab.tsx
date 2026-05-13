import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Crown, Loader2, Mail, Search, Shield, UserCog, Users, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type ProfileRow = Tables<"profiles">;
type UserRoleRow = Tables<"user_roles">;
type PropertyRow = Tables<"properties">;
type CampaignRow = Tables<"ad_campaigns">;
type UserType = "user" | "agent" | "landlord" | "owner";

const userTypes: UserType[] = ["user", "agent", "landlord", "owner"];

const roleLabel = (value?: string | null) => {
  switch (value) {
    case "agent":
      return "Agent";
    case "landlord":
      return "Landlord";
    case "owner":
      return "Owner";
    default:
      return "User";
  }
};

const AdminUsersTab = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [
        { data: profiles, error: profilesError },
        { data: roles, error: rolesError },
        { data: properties, error: propertiesError },
        { data: campaigns, error: campaignsError },
      ] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
        supabase.from("properties").select("*"),
        supabase.from("ad_campaigns").select("*"),
      ]);

      if (profilesError) throw profilesError;
      if (rolesError) throw rolesError;
      if (propertiesError) throw propertiesError;
      if (campaignsError) throw campaignsError;

      return {
        profiles: (profiles ?? []) as ProfileRow[],
        roles: (roles ?? []) as UserRoleRow[],
        properties: (properties ?? []) as PropertyRow[],
        campaigns: (campaigns ?? []) as CampaignRow[],
      };
    },
  });

  const adminUserIds = useMemo(
    () => new Set((data?.roles ?? []).filter((role) => role.role === "admin").map((role) => role.user_id)),
    [data?.roles]
  );

  const propertyCounts = useMemo(() => {
    const counts = new Map<string, number>();
    (data?.properties ?? []).forEach((property) => counts.set(property.user_id, (counts.get(property.user_id) ?? 0) + 1));
    return counts;
  }, [data?.properties]);

  const campaignCounts = useMemo(() => {
    const counts = new Map<string, number>();
    (data?.campaigns ?? []).forEach((campaign) => counts.set(campaign.user_id, (counts.get(campaign.user_id) ?? 0) + 1));
    return counts;
  }, [data?.campaigns]);

  const filteredProfiles = (data?.profiles ?? []).filter((profile) => {
    const isAdmin = adminUserIds.has(profile.user_id);
    const matchesRole =
      filterRole === "all" ||
      (filterRole === "admin" ? isAdmin : (profile.user_type || "user") === filterRole);
    const haystack = [profile.full_name, profile.phone, profile.location, profile.user_type, profile.user_id]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesRole && haystack.includes(searchQuery.toLowerCase());
  });

  const updateUserType = useMutation({
    mutationFn: async ({ userId, userType }: { userId: string; userType: UserType }) => {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ user_type: userType })
        .eq("user_id", userId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User updated", description: "The account type was changed." });
    },
    onError: (mutationError) => {
      toast({
        title: "Could not update user",
        description: mutationError instanceof Error ? mutationError.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const setAdminRole = useMutation({
    mutationFn: async ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => {
      if (makeAdmin) {
        const { error: insertError } = await supabase
          .from("user_roles")
          .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

        if (insertError) throw insertError;
        return;
      }

      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");

      if (deleteError) throw deleteError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: variables.makeAdmin ? "Admin access granted" : "Admin access removed",
        description: "Role changes take effect the next time the user loads protected admin data.",
      });
    },
    onError: (mutationError) => {
      toast({
        title: "Role update failed",
        description: mutationError instanceof Error ? mutationError.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <XCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <p className="font-medium">Could not load users</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Check admin database permissions."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = data?.profiles.length ?? 0;
  const adminCount = adminUserIds.size;
  const professionalCount = (data?.profiles ?? []).filter((profile) => profile.user_type !== "user").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Admins</p>
            <p className="text-2xl font-bold text-[#1f1a54]">{adminCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Professional Accounts</p>
            <p className="text-2xl font-bold text-[#5cb85c]">{professionalCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Input
            placeholder="Search users by name, phone, location, role, user ID..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
        <Tabs value={filterRole} onValueChange={setFilterRole}>
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
            <TabsTrigger value="user">Users</TabsTrigger>
            <TabsTrigger value="agent">Agents</TabsTrigger>
            <TabsTrigger value="landlord">Landlords</TabsTrigger>
            <TabsTrigger value="owner">Owners</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {filteredProfiles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No users match this view</p>
            </CardContent>
          </Card>
        ) : (
          filteredProfiles.map((profile) => {
            const isAdmin = adminUserIds.has(profile.user_id);
            return (
              <Card key={profile.id}>
                <CardHeader>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge className="capitalize" variant="outline">
                          <UserCog className="mr-1 h-3 w-3" />
                          {roleLabel(profile.user_type)}
                        </Badge>
                        {isAdmin && (
                          <Badge className="bg-[#1f1a54] text-white">
                            <Crown className="mr-1 h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{profile.full_name || "Unnamed account"}</CardTitle>
                      <CardDescription className="mt-1">
                        Joined {new Date(profile.created_at).toLocaleDateString()} • {profile.location || "No location"}
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground lg:text-right">
                      <p>{propertyCounts.get(profile.user_id) ?? 0} properties</p>
                      <p>{campaignCounts.get(profile.user_id) ?? 0} ad campaigns</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 rounded-lg bg-muted/40 p-4 text-sm md:grid-cols-3">
                    <div>
                      <p className="text-muted-foreground">User ID</p>
                      <p className="truncate font-medium">{profile.user_id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{profile.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Notifications</p>
                      <p className="font-medium">
                        {profile.email_notifications_enabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {userTypes.map((userType) => (
                      <Button
                        key={userType}
                        size="sm"
                        variant={profile.user_type === userType ? "default" : "outline"}
                        disabled={updateUserType.isPending}
                        onClick={() => updateUserType.mutate({ userId: profile.user_id, userType })}
                      >
                        {profile.user_type === userType && <CheckCircle className="mr-2 h-4 w-4" />}
                        {roleLabel(userType)}
                      </Button>
                    ))}

                    <Button
                      size="sm"
                      variant={isAdmin ? "outline" : "default"}
                      disabled={setAdminRole.isPending}
                      onClick={() => setAdminRole.mutate({ userId: profile.user_id, makeAdmin: !isAdmin })}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      {isAdmin ? "Remove Admin" : "Make Admin"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminUsersTab;
