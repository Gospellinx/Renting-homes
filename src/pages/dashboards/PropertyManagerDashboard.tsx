import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, Building, LayoutList, User, MapPin, Phone, Mail, Loader2, Users, DollarSign, Home, Tag, Edit, Eye, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { buildStoragePath, PROPERTY_IMAGE_BUCKET } from "@/lib/propertySubmission";

type ManagedProperty = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  property_type: string;
  location: string;
  state: string;
  lga?: string | null;
  price: string;
  size?: string | null;
  images?: string[] | null;
  document_paths?: string[] | null;
  owner_name?: string | null;
  owner_phone?: string | null;
  owner_email?: string | null;
  verification_type?: string | null;
  status: string;
  created_at?: string;
};

type EditablePropertyFields = Pick<
  ManagedProperty,
  "title" | "description" | "location" | "state" | "lga" | "price" | "size" | "owner_phone" | "owner_email"
>;

const fallbackPropertyImage = "/placeholder.svg";

const getPropertyDetailPath = (property: ManagedProperty) =>
  `/property/${property.property_type.replace("_", "-")}/${property.id}`;

const getPropertyImageUrl = (image?: string | null) => {
  if (!image) return fallbackPropertyImage;
  if (/^https?:\/\//i.test(image)) return image;
  return supabase.storage.from(PROPERTY_IMAGE_BUCKET).getPublicUrl(image).data.publicUrl;
};

const getStoragePathFromImage = (image: string) => {
  if (!/^https?:\/\//i.test(image)) return image;

  const marker = `/storage/v1/object/public/${PROPERTY_IMAGE_BUCKET}/`;
  const markerIndex = image.indexOf(marker);
  if (markerIndex === -1) return null;

  return decodeURIComponent(image.slice(markerIndex + marker.length).split("?")[0]);
};

const getEditFormValues = (property: ManagedProperty): EditablePropertyFields => ({
  title: property.title ?? "",
  description: property.description ?? "",
  location: property.location ?? "",
  state: property.state ?? "",
  lga: property.lga ?? "",
  price: property.price ?? "",
  size: property.size ?? "",
  owner_phone: property.owner_phone ?? "",
  owner_email: property.owner_email ?? "",
});

const PropertyManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [properties, setProperties] = useState<ManagedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState<ManagedProperty | null>(null);
  const [editForm, setEditForm] = useState<EditablePropertyFields | null>(null);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [propertyToDelete, setPropertyToDelete] = useState<ManagedProperty | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProperties([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setProperties([]);

      const [{ data: profileData }, { data: propertyData, error: propertyError }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("properties").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (!isMounted) return;

      if (profileData) setProfile(profileData);

      if (propertyError) {
        console.error("Error fetching properties:", propertyError);
        toast({
          title: "Could not load your properties",
          description: propertyError.message,
          variant: "destructive",
        });
        setProperties([]);
      } else {
        setProperties((propertyData ?? []) as ManagedProperty[]);
      }

      setIsLoading(false);
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const getInitials = (name: string | null) => {
    if (!name) return "A";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">Approved</span>;
      case "pending_review":
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case "rejected":
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      case "archived":
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">Archived</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 capitalize">{status.replace('_', ' ')}</span>;
    }
  };

  const activeListings = properties.filter(p => p.status === 'approved').length;

  const openEditDialog = (property: ManagedProperty) => {
    setEditingProperty(property);
    setEditForm(getEditFormValues(property));
    setEditImages(property.images ?? []);
    setNewImageFiles([]);
  };

  const closeEditDialog = () => {
    if (isSaving) return;
    setEditingProperty(null);
    setEditForm(null);
    setEditImages([]);
    setNewImageFiles([]);
  };

  const updateEditField = (field: keyof EditablePropertyFields, value: string) => {
    setEditForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleAddEditImages = (files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast({
        title: "Choose image files",
        description: "Only property photos can be added here.",
        variant: "destructive",
      });
      return;
    }

    setNewImageFiles((current) => [...current, ...imageFiles]);
  };

  const removeExistingImage = (image: string) => {
    setEditImages((current) => current.filter((item) => item !== image));
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const uploadNewImages = async (property: ManagedProperty) => {
    if (!user || newImageFiles.length === 0) return [];

    const uploadedImages: string[] = [];

    for (const file of newImageFiles) {
      const storagePath = buildStoragePath(user.id, property.property_type, "image", file.name);
      const { error } = await supabase.storage.from(PROPERTY_IMAGE_BUCKET).upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type || undefined,
        upsert: false,
      });

      if (error) {
        throw new Error(error.message);
      }

      uploadedImages.push(supabase.storage.from(PROPERTY_IMAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl);
    }

    return uploadedImages;
  };

  const removeImagesFromStorage = async (images: string[]) => {
    const paths = images.map(getStoragePathFromImage).filter((path): path is string => Boolean(path));
    if (paths.length === 0) return;

    await supabase.storage.from(PROPERTY_IMAGE_BUCKET).remove(paths);
  };

  const handleUpdateProperty = async () => {
    if (!user || !editingProperty || !editForm) return;

    const trimmedForm = Object.fromEntries(
      Object.entries(editForm).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
    ) as EditablePropertyFields;

    if (!trimmedForm.title || !trimmedForm.description || !trimmedForm.location || !trimmedForm.state || !trimmedForm.price) {
      toast({
        title: "Missing listing details",
        description: "Title, description, location, state, and price are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const uploadedImages = await uploadNewImages(editingProperty);
      const nextImages = [...editImages, ...uploadedImages];

      if (nextImages.length === 0) {
        toast({
          title: "Add at least one property photo",
          description: "Listings need a photo so viewers can recognize the property.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from("properties")
        .update({ ...trimmedForm, images: nextImages })
        .eq("id", editingProperty.id)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const removedImages = (editingProperty.images ?? []).filter((image) => !editImages.includes(image));
      await removeImagesFromStorage(removedImages);

      setProperties((current) =>
        current.map((property) => (property.id === editingProperty.id ? (data as ManagedProperty) : property))
      );
      closeEditDialog();
      toast({
        title: "Property updated",
        description: "Your dashboard now shows the latest listing details.",
      });
    } catch (error) {
      toast({
        title: "Property was not updated",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!user || !propertyToDelete) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", propertyToDelete.id)
      .eq("user_id", user.id);

    setIsDeleting(false);

    if (error) {
      toast({
        title: "Property was not deleted",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setProperties((current) => current.filter((property) => property.id !== propertyToDelete.id));
    await removeImagesFromStorage(propertyToDelete.images ?? []);
    setPropertyToDelete(null);
    toast({
      title: "Property deleted",
      description: "The listing has been removed from your dashboard.",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Landlord Dashboard</h1>
            <p className="text-gray-500">Manage your profile, properties, and track performance.</p>
          </div>
          <Button asChild className="bg-[#26225f] hover:bg-[#1f1b50]">
            <Link to="/upload-property">
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Property
            </Link>
          </Button>
        </header>

        {/* Profile Overview Card */}
        <Card className="border-0 shadow-sm bg-white overflow-hidden mb-8">
          <div className="h-24 bg-[linear-gradient(90deg,#1f1a54_0%,#5564d8_55%,#d8a95b_100%)]"></div>
          <CardContent className="px-6 pb-6 pt-0 sm:flex sm:items-end sm:space-x-5">
            <div className="-mt-12 relative flex">
              <Avatar className="h-24 w-24 rounded-full ring-4 ring-white bg-gray-200 shadow-md">
                <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                <AvatarFallback className="text-2xl text-gray-500 bg-white">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
              <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {profile?.full_name || "Account Profile"}
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {profile?.user_type || "Landlord"}
                  </span>
                </h1>
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6 mt-1 text-sm text-gray-500">
                  <div className="mt-2 flex items-center">
                    <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    {user?.email}
                  </div>
                  {profile?.phone && (
                    <div className="mt-2 flex items-center">
                      <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {profile.phone}
                    </div>
                  )}
                  {profile?.location && (
                    <div className="mt-2 flex items-center">
                      <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {profile.location}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Button asChild variant="outline">
                  <Link to="/profile">Edit Profile</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-sm border-gray-100">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{properties.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <LayoutList className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-gray-100">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Listings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{activeListings}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-gray-100">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">85%</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-gray-100">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">₦2.4M</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Properties Section */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">My Properties</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#26225f]" />
          </div>
        ) : properties.length === 0 ? (
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-16 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Home className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties uploaded yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Get started by uploading your first property listing. It will immediately appear here and be visible to thousands of potential renters.
              </p>
              <Button asChild className="bg-[#26225f] hover:bg-[#1f1b50]">
                <Link to="/upload-property">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Upload First Property
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const mainImage = getPropertyImageUrl(property.images?.[0]);
                
              return (
                <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col">
                  <div className="aspect-[4/3] relative bg-gray-100">
                    <img 
                      src={mainImage} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackPropertyImage;
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(property.status)}
                    </div>
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-semibold text-gray-800 capitalize flex items-center shadow-sm">
                      <Tag className="h-3 w-3 mr-1" />
                      {property.property_type.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <CardContent className="p-5 flex-grow">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 mb-1" title={property.title}>
                      {property.title}
                    </h3>
                    <p className="text-gray-500 text-sm flex items-start mb-3 line-clamp-1">
                      <MapPin className="h-4 w-4 mr-1 shrink-0 mt-0.5 text-gray-400" />
                      {property.location}, {property.state}
                    </p>
                    
                    <div className="text-xl font-bold text-[#1f1a54]">
                      ₦{property.price}
                      <span className="text-xs text-gray-500 font-normal ml-1">/ month</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 border-t border-gray-50 flex justify-between gap-2 bg-gray-50/50">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-gray-600 hover:text-gray-900 bg-white"
                      onClick={() => navigate(getPropertyDetailPath(property))}
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-gray-600 hover:text-gray-900 bg-white"
                      onClick={() => openEditDialog(property)}
                    >
                      <Edit className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-10 px-0 text-red-500 hover:text-red-700 hover:bg-red-50 bg-white border-gray-200"
                      onClick={() => setPropertyToDelete(property)}
                      aria-label={`Delete ${property.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!editingProperty} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>Update the listing details shown in your dashboard and public property page.</DialogDescription>
          </DialogHeader>

          {editForm && (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="edit-title">Title</label>
                <Input id="edit-title" value={editForm.title} onChange={(event) => updateEditField("title", event.target.value)} />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="edit-description">Description</label>
                <Textarea
                  id="edit-description"
                  className="min-h-[120px]"
                  value={editForm.description}
                  onChange={(event) => updateEditField("description", event.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="edit-price">Price</label>
                  <Input id="edit-price" value={editForm.price} onChange={(event) => updateEditField("price", event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="edit-size">Size</label>
                  <Input id="edit-size" value={editForm.size ?? ""} onChange={(event) => updateEditField("size", event.target.value)} />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="edit-location">Location</label>
                <Input id="edit-location" value={editForm.location} onChange={(event) => updateEditField("location", event.target.value)} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="edit-state">State</label>
                  <Input id="edit-state" value={editForm.state} onChange={(event) => updateEditField("state", event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="edit-lga">LGA</label>
                  <Input id="edit-lga" value={editForm.lga ?? ""} onChange={(event) => updateEditField("lga", event.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="edit-phone">Owner phone</label>
                  <Input id="edit-phone" value={editForm.owner_phone ?? ""} onChange={(event) => updateEditField("owner_phone", event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="edit-email">Owner email</label>
                  <Input id="edit-email" type="email" value={editForm.owner_email ?? ""} onChange={(event) => updateEditField("owner_email", event.target.value)} />
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-gray-700">Property photos</label>
                  <Button asChild type="button" variant="outline" size="sm">
                    <label htmlFor="edit-images" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Add Photos
                    </label>
                  </Button>
                  <input
                    id="edit-images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      handleAddEditImages(event.target.files);
                      event.currentTarget.value = "";
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {editImages.map((image) => (
                    <div key={image} className="relative overflow-hidden rounded-lg border bg-gray-50">
                      <img src={getPropertyImageUrl(image)} alt="Property" className="h-24 w-full object-cover" />
                      <button
                        type="button"
                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"
                        onClick={() => removeExistingImage(image)}
                        aria-label="Remove existing photo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {newImageFiles.map((file, index) => (
                    <div key={`${file.name}-${file.lastModified}-${index}`} className="relative overflow-hidden rounded-lg border bg-gray-50 p-3">
                      <p className="line-clamp-2 pr-7 text-sm font-medium text-gray-700">{file.name}</p>
                      <p className="mt-1 text-xs text-gray-500">New photo</p>
                      <button
                        type="button"
                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"
                        onClick={() => removeNewImage(index)}
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeEditDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="button" className="bg-[#26225f] hover:bg-[#1f1b50]" onClick={handleUpdateProperty} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!propertyToDelete} onOpenChange={(open) => !open && !isDeleting && setPropertyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes "{propertyToDelete?.title}" from your uploaded properties. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                handleDeleteProperty();
              }}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default PropertyManagerDashboard;
