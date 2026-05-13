import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  BarChart3,
  CheckCircle,
  Clock,
  Crown,
  Eye,
  FileText,
  Home,
  Loader2,
  Megaphone,
  Search,
  Shield,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type ProfileRow = Tables<"profiles">;
type UserRoleRow = Tables<"user_roles">;
type PropertyRow = Tables<"properties">;
type CampaignRow = Tables<"ad_campaigns">;
type VerificationRow = Tables<"verification_requests">;
type AdSetRow = Tables<"ad_sets">;
type AdRow = Tables<"ads">;
type UserType = "user" | "agent" | "landlord" | "owner";
type PropertyStatus = "pending_review" | "approved" | "rejected" | "archived";
type VerificationStatus = "pending" | "approved" | "rejected";
type AdStatus = "pending_review" | "approved" | "rejected" | "paused";

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

const statusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-800"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
    case "archived":
      return <Badge className="bg-slate-100 text-slate-700"><Archive className="mr-1 h-3 w-3" />Archived</Badge>;
    case "pending_review":
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const AdminUsersTab = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedProfile, setSelectedProfile] = useState<ProfileRow | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [
        { data: profiles, error: profilesError },
        { data: roles, error: rolesError },
        { data: properties, error: propertiesError },
        { data: campaigns, error: campaignsError },
        { data: verifications, error: verificationsError },
        { data: adSets, error: adSetsError },
        { data: ads, error: adsError },
      ] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
        supabase.from("properties").select("*"),
        supabase.from("ad_campaigns").select("*"),
        supabase.from("verification_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("ad_sets").select("*"),
        supabase.from("ads").select("*").order("created_at", { ascending: false }),
      ]);

      if (profilesError) throw profilesError;
      if (rolesError) throw rolesError;
      if (propertiesError) throw propertiesError;
      if (campaignsError) throw campaignsError;
      if (verificationsError) throw verificationsError;
      if (adSetsError) throw adSetsError;
      if (adsError) throw adsError;

      return {
        profiles: (profiles ?? []) as ProfileRow[],
        roles: (roles ?? []) as UserRoleRow[],
        properties: (properties ?? []) as PropertyRow[],
        campaigns: (campaigns ?? []) as CampaignRow[],
        verifications: (verifications ?? []) as VerificationRow[],
        adSets: (adSets ?? []) as AdSetRow[],
        ads: (ads ?? []) as AdRow[],
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

  const verificationsByUserId = useMemo(() => {
    const map = new Map<string, VerificationRow[]>();
    (data?.verifications ?? []).forEach((request) => {
      map.set(request.user_id, [...(map.get(request.user_id) ?? []), request]);
    });
    return map;
  }, [data?.verifications]);

  const propertiesByUserId = useMemo(() => {
    const map = new Map<string, PropertyRow[]>();
    (data?.properties ?? []).forEach((property) => {
      map.set(property.user_id, [...(map.get(property.user_id) ?? []), property]);
    });
    return map;
  }, [data?.properties]);

  const campaignsByUserId = useMemo(() => {
    const map = new Map<string, CampaignRow[]>();
    (data?.campaigns ?? []).forEach((campaign) => {
      map.set(campaign.user_id, [...(map.get(campaign.user_id) ?? []), campaign]);
    });
    return map;
  }, [data?.campaigns]);

  const adSetCampaignUserIds = useMemo(() => {
    const campaignUserIds = new Map((data?.campaigns ?? []).map((campaign) => [campaign.id, campaign.user_id]));
    const map = new Map<string, string>();
    (data?.adSets ?? []).forEach((adSet) => {
      const userId = campaignUserIds.get(adSet.campaign_id);
      if (userId) map.set(adSet.id, userId);
    });
    return map;
  }, [data?.adSets, data?.campaigns]);

  const adsByUserId = useMemo(() => {
    const map = new Map<string, AdRow[]>();
    (data?.ads ?? []).forEach((ad) => {
      const userId = adSetCampaignUserIds.get(ad.ad_set_id);
      if (userId) map.set(userId, [...(map.get(userId) ?? []), ad]);
    });
    return map;
  }, [adSetCampaignUserIds, data?.ads]);

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

  const updateVerificationStatus = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: VerificationStatus }) => {
      const { error: updateError } = await supabase
        .from("verification_requests")
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          rejection_reason: status === "rejected" ? "Rejected by admin from user management." : null,
        })
        .eq("id", requestId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Verification updated", description: "The user's request status was changed." });
    },
    onError: (mutationError) => {
      toast({
        title: "Verification update failed",
        description: mutationError instanceof Error ? mutationError.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePropertyStatus = useMutation({
    mutationFn: async ({ propertyId, status }: { propertyId: string; status: PropertyStatus }) => {
      const { error: updateError } = await supabase.from("properties").update({ status }).eq("id", propertyId);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      toast({ title: "Property updated", description: "The listing status was changed." });
    },
    onError: (mutationError) => {
      toast({
        title: "Property update failed",
        description: mutationError instanceof Error ? mutationError.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateAdStatus = useMutation({
    mutationFn: async ({ adId, status }: { adId: string; status: AdStatus }) => {
      const { data: ad, error: updateError } = await supabase
        .from("ads")
        .update({
          status,
          rejection_reason: status === "rejected" ? "Rejected by admin from user management." : null,
        })
        .eq("id", adId)
        .select("ad_set_id")
        .single();

      if (updateError) throw updateError;

      if (status === "approved" && ad?.ad_set_id) {
        const { data: adSet, error: adSetError } = await supabase
          .from("ad_sets")
          .select("campaign_id")
          .eq("id", ad.ad_set_id)
          .single();

        if (adSetError) throw adSetError;

        await Promise.all([
          supabase.from("ad_sets").update({ status: "active" }).eq("id", ad.ad_set_id),
          adSet?.campaign_id
            ? supabase.from("ad_campaigns").update({ status: "active" }).eq("id", adSet.campaign_id)
            : Promise.resolve({ error: null }),
        ]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      queryClient.invalidateQueries({ queryKey: ["approved-ads"] });
      toast({ title: "Ad updated", description: "The ad moderation status was changed." });
    },
    onError: (mutationError) => {
      toast({
        title: "Ad update failed",
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
  const selectedVerifications = selectedProfile ? verificationsByUserId.get(selectedProfile.user_id) ?? [] : [];
  const selectedProperties = selectedProfile ? propertiesByUserId.get(selectedProfile.user_id) ?? [] : [];
  const selectedCampaigns = selectedProfile ? campaignsByUserId.get(selectedProfile.user_id) ?? [] : [];
  const selectedAds = selectedProfile ? adsByUserId.get(selectedProfile.user_id) ?? [] : [];
  const selectedActivity = [
    ...selectedVerifications.map((item) => ({
      id: `verification-${item.id}`,
      date: item.created_at,
      label: "Verification request",
      detail: `${item.property_address} • ${item.status}`,
    })),
    ...selectedProperties.map((item) => ({
      id: `property-${item.id}`,
      date: item.created_at,
      label: "Property submission",
      detail: `${item.title} • ${item.status}`,
    })),
    ...selectedCampaigns.map((item) => ({
      id: `campaign-${item.id}`,
      date: item.created_at,
      label: "Ad campaign",
      detail: `${item.name} • ${item.status}`,
    })),
    ...selectedAds.map((item) => ({
      id: `ad-${item.id}`,
      date: item.created_at,
      label: "Ad creative",
      detail: `${item.headline} • ${item.status}`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                      <p>{verificationsByUserId.get(profile.user_id)?.length ?? 0} verification requests</p>
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
                    <Button size="sm" variant="secondary" onClick={() => setSelectedProfile(profile)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Manage Activity
                    </Button>

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

      <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProfile?.full_name || "User activity"}</DialogTitle>
            <DialogDescription>
              Manage this user's verification requests, property submissions, ads, and recent activity.
            </DialogDescription>
          </DialogHeader>

          {selectedProfile && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="flex h-auto flex-wrap justify-start">
                <TabsTrigger value="overview"><BarChart3 className="mr-2 h-4 w-4" />Analytics</TabsTrigger>
                <TabsTrigger value="verification"><FileText className="mr-2 h-4 w-4" />Verification</TabsTrigger>
                <TabsTrigger value="properties"><Home className="mr-2 h-4 w-4" />Properties</TabsTrigger>
                <TabsTrigger value="ads"><Megaphone className="mr-2 h-4 w-4" />Ads</TabsTrigger>
                <TabsTrigger value="activity"><Clock className="mr-2 h-4 w-4" />Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-4">
                  <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Verifications</p><p className="text-2xl font-bold">{selectedVerifications.length}</p></CardContent></Card>
                  <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Properties</p><p className="text-2xl font-bold">{selectedProperties.length}</p></CardContent></Card>
                  <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Campaigns</p><p className="text-2xl font-bold">{selectedCampaigns.length}</p></CardContent></Card>
                  <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Ads</p><p className="text-2xl font-bold">{selectedAds.length}</p></CardContent></Card>
                </div>
                <Card>
                  <CardContent className="grid gap-3 pt-6 text-sm md:grid-cols-3">
                    <div><p className="text-muted-foreground">User ID</p><p className="truncate font-medium">{selectedProfile.user_id}</p></div>
                    <div><p className="text-muted-foreground">Role</p><p className="font-medium">{roleLabel(selectedProfile.user_type)}</p></div>
                    <div><p className="text-muted-foreground">Joined</p><p className="font-medium">{new Date(selectedProfile.created_at).toLocaleDateString()}</p></div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="verification" className="space-y-3">
                {selectedVerifications.length === 0 ? <EmptyState label="No verification requests" /> : selectedVerifications.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="space-y-3 pt-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{request.property_address}</p>
                          <p className="text-sm text-muted-foreground">{request.property_type} • {request.ownership_type} • {new Date(request.created_at).toLocaleDateString()}</p>
                        </div>
                        {statusBadge(request.status)}
                      </div>
                      {request.rejection_reason && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{request.rejection_reason}</p>}
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" disabled={updateVerificationStatus.isPending} onClick={() => updateVerificationStatus.mutate({ requestId: request.id, status: "approved" })}>Approve</Button>
                        <Button size="sm" variant="destructive" disabled={updateVerificationStatus.isPending} onClick={() => updateVerificationStatus.mutate({ requestId: request.id, status: "rejected" })}>Reject</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="properties" className="space-y-3">
                {selectedProperties.length === 0 ? <EmptyState label="No property submissions" /> : selectedProperties.map((property) => (
                  <Card key={property.id}>
                    <CardContent className="space-y-3 pt-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{property.title}</p>
                          <p className="text-sm text-muted-foreground">{property.location}, {property.state} • {property.property_type} • ₦{property.price}</p>
                        </div>
                        {statusBadge(property.status)}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" disabled={updatePropertyStatus.isPending} onClick={() => updatePropertyStatus.mutate({ propertyId: property.id, status: "approved" })}>Approve</Button>
                        <Button size="sm" variant="destructive" disabled={updatePropertyStatus.isPending} onClick={() => updatePropertyStatus.mutate({ propertyId: property.id, status: "rejected" })}>Reject</Button>
                        <Button size="sm" variant="outline" disabled={updatePropertyStatus.isPending} onClick={() => updatePropertyStatus.mutate({ propertyId: property.id, status: "archived" })}>Archive</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="ads" className="space-y-3">
                {selectedAds.length === 0 ? <EmptyState label="No ads submitted" /> : selectedAds.map((ad) => (
                  <Card key={ad.id}>
                    <CardContent className="space-y-3 pt-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{ad.headline}</p>
                          <p className="text-sm text-muted-foreground">{ad.name} • {ad.ad_type} • {ad.impressions ?? 0} impressions • {ad.clicks ?? 0} clicks</p>
                        </div>
                        {statusBadge(ad.status)}
                      </div>
                      {ad.rejection_reason && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{ad.rejection_reason}</p>}
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" disabled={updateAdStatus.isPending} onClick={() => updateAdStatus.mutate({ adId: ad.id, status: "approved" })}>Approve</Button>
                        <Button size="sm" variant="destructive" disabled={updateAdStatus.isPending} onClick={() => updateAdStatus.mutate({ adId: ad.id, status: "rejected" })}>Reject</Button>
                        <Button size="sm" variant="outline" disabled={updateAdStatus.isPending} onClick={() => updateAdStatus.mutate({ adId: ad.id, status: "paused" })}>Pause</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="activity" className="space-y-3">
                {selectedActivity.length === 0 ? <EmptyState label="No activity yet" /> : selectedActivity.map((activity) => (
                  <div key={activity.id} className="rounded-lg border bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{activity.label}</p>
                      <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleString()}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{activity.detail}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EmptyState = ({ label }: { label: string }) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
      <Users className="mb-3 h-10 w-10" />
      <p>{label}</p>
    </CardContent>
  </Card>
);

export default AdminUsersTab;
