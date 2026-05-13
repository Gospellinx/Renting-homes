import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Archive,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Home,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Search,
  Trash2,
  User,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PROPERTY_DOCUMENT_BUCKET, PROPERTY_IMAGE_BUCKET } from "@/lib/propertySubmission";

type PropertyRow = Tables<"properties">;
type ProfileRow = Tables<"profiles">;
type PropertyStatus = "pending_review" | "approved" | "rejected" | "archived";

const fallbackImage = "/placeholder.svg";

const getImageUrl = (image?: string | null) => {
  if (!image) return fallbackImage;
  if (/^https?:\/\//i.test(image)) return image;
  return supabase.storage.from(PROPERTY_IMAGE_BUCKET).getPublicUrl(image).data.publicUrl;
};

const getStoragePathFromUrl = (urlOrPath: string, bucket: string) => {
  if (!/^https?:\/\//i.test(urlOrPath)) return urlOrPath;

  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = urlOrPath.indexOf(marker);
  if (markerIndex === -1) return null;

  return decodeURIComponent(urlOrPath.slice(markerIndex + marker.length).split("?")[0]);
};

const getDetailPath = (property: PropertyRow) =>
  `/property/${property.property_type.replace("_", "-")}/${property.id}`;

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <Badge className="gap-1 bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
    case "rejected":
      return <Badge className="gap-1 bg-red-100 text-red-800"><XCircle className="h-3 w-3" /> Rejected</Badge>;
    case "archived":
      return <Badge className="gap-1 bg-slate-100 text-slate-700"><Archive className="h-3 w-3" /> Archived</Badge>;
    default:
      return <Badge className="gap-1 bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3" /> Pending</Badge>;
  }
};

const formatPropertyType = (value: string) => value.replace(/_/g, " ");

const AdminPropertiesTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyRow | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const [{ data: properties, error: propertiesError }, { data: profiles, error: profilesError }] =
        await Promise.all([
          supabase.from("properties").select("*").order("created_at", { ascending: false }),
          supabase.from("profiles").select("*"),
        ]);

      if (propertiesError) throw propertiesError;
      if (profilesError) throw profilesError;

      return {
        properties: (properties ?? []) as PropertyRow[],
        profiles: (profiles ?? []) as ProfileRow[],
      };
    },
  });

  const profilesByUserId = useMemo(() => {
    const map = new Map<string, ProfileRow>();
    (data?.profiles ?? []).forEach((profile) => map.set(profile.user_id, profile));
    return map;
  }, [data?.profiles]);

  const properties = data?.properties ?? [];
  const filteredProperties = properties.filter((property) => {
    const profile = profilesByUserId.get(property.user_id);
    const haystack = [
      property.title,
      property.location,
      property.state,
      property.lga,
      property.owner_name,
      property.owner_email,
      property.owner_phone,
      profile?.full_name,
      profile?.user_type,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = haystack.includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || property.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusMutation = useMutation({
    mutationFn: async ({ propertyId, status }: { propertyId: string; status: PropertyStatus }) => {
      const { error: updateError } = await supabase
        .from("properties")
        .update({ status })
        .eq("id", propertyId);

      if (updateError) throw updateError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      toast({
        title: "Property updated",
        description: `Listing marked as ${variables.status.replace("_", " ")}.`,
      });
    },
    onError: (mutationError) => {
      toast({
        title: "Property update failed",
        description: mutationError instanceof Error ? mutationError.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (property: PropertyRow) => {
      const { error: deleteError } = await supabase.from("properties").delete().eq("id", property.id);
      if (deleteError) throw deleteError;

      const imagePaths = (property.images ?? [])
        .map((image) => getStoragePathFromUrl(image, PROPERTY_IMAGE_BUCKET))
        .filter((path): path is string => Boolean(path));
      const documentPaths = property.document_paths ?? [];

      await Promise.allSettled([
        imagePaths.length > 0 ? supabase.storage.from(PROPERTY_IMAGE_BUCKET).remove(imagePaths) : Promise.resolve(),
        documentPaths.length > 0 ? supabase.storage.from(PROPERTY_DOCUMENT_BUCKET).remove(documentPaths) : Promise.resolve(),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      setPropertyToDelete(null);
      toast({ title: "Property deleted", description: "The listing and uploaded files were removed." });
    },
    onError: (deleteError) => {
      toast({
        title: "Delete failed",
        description: deleteError instanceof Error ? deleteError.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const openDocument = async (path: string) => {
    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from(PROPERTY_DOCUMENT_BUCKET)
      .createSignedUrl(path, 60 * 10);

    if (signedUrlError || !signedUrl?.signedUrl) {
      toast({
        title: "Could not open document",
        description: signedUrlError?.message ?? "The document link is unavailable.",
        variant: "destructive",
      });
      return;
    }

    window.open(signedUrl.signedUrl, "_blank", "noopener,noreferrer");
  };

  const stats = {
    total: properties.length,
    pending: properties.filter((property) => property.status === "pending_review").length,
    approved: properties.filter((property) => property.status === "approved").length,
    rejected: properties.filter((property) => property.status === "rejected").length,
    archived: properties.filter((property) => property.status === "archived").length,
  };

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
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <p className="font-medium">Could not load properties</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Check admin database permissions."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">All Properties</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Archived</p>
            <p className="text-2xl font-bold text-slate-600">{stats.archived}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Input
            placeholder="Search title, owner, email, phone, location..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
        <Tabs value={filterStatus} onValueChange={setFilterStatus}>
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending_review">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Home className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No properties match this view</p>
            </CardContent>
          </Card>
        ) : (
          filteredProperties.map((property) => {
            const profile = profilesByUserId.get(property.user_id);
            const isUpdating = statusMutation.isPending;

            return (
              <Card key={property.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      {property.images?.[0] ? (
                        <img
                          src={getImageUrl(property.images[0])}
                          alt={property.title}
                          className="h-24 w-28 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-28 items-center justify-center rounded-lg bg-muted">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {getStatusBadge(property.status)}
                          <Badge variant="outline" className="capitalize">
                            {formatPropertyType(property.property_type)}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{property.title}</CardTitle>
                        <CardDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {property.location}, {property.state}
                          </span>
                          <span>Submitted {new Date(property.created_at).toLocaleDateString()}</span>
                        </CardDescription>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{property.description}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground lg:text-right">
                      <p className="font-semibold text-foreground">₦{property.price}</p>
                      <p>{property.size}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 rounded-lg bg-muted/40 p-4 text-sm md:grid-cols-3">
                    <div>
                      <p className="text-muted-foreground">Owner</p>
                      <p className="font-medium">{property.owner_name || profile?.full_name || "Unknown owner"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Contact</p>
                      <p className="font-medium">{property.owner_phone}</p>
                      <p>{property.owner_email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Account</p>
                      <p className="font-medium capitalize">{profile?.user_type || "Unknown role"}</p>
                      <p className="truncate">{property.user_id}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(getDetailPath(property), {
                          state: { fromDashboard: true, dashboardPath: "/admin" },
                        })
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Page
                    </Button>

                    {property.document_paths?.map((path, index) => (
                      <Button key={path} variant="outline" size="sm" onClick={() => openDocument(path)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Document {index + 1}
                      </Button>
                    ))}

                    {property.status !== "approved" && (
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => statusMutation.mutate({ propertyId: property.id, status: "approved" })}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    )}

                    {property.status !== "rejected" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => statusMutation.mutate({ propertyId: property.id, status: "rejected" })}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    )}

                    {property.status !== "archived" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => statusMutation.mutate({ propertyId: property.id, status: "archived" })}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setPropertyToDelete(property)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <AlertDialog open={!!propertyToDelete} onOpenChange={(open) => !open && setPropertyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes "{propertyToDelete?.title}" from the platform and deletes uploaded media where
              possible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (propertyToDelete) deleteMutation.mutate(propertyToDelete);
              }}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPropertiesTab;
