import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, Building, LayoutList, User, MapPin, Phone, Mail, Loader2, Users, DollarSign, Home, Tag, Edit, Eye, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PropertyManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Fetch Profile
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });

      // Fetch Properties
      const fetchProperties = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from("properties")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) throw error;
          if (data) setProperties(data);
        } catch (error) {
          console.error("Error fetching properties:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProperties();
    }
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
              const mainImage = property.images && property.images.length > 0 
                ? `${supabase.storage.from('property-images').getPublicUrl(property.images[0]).data.publicUrl}`
                : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"; // Fallback image
                
              return (
                <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col">
                  <div className="aspect-[4/3] relative bg-gray-100">
                    <img 
                      src={mainImage} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
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
                      onClick={() => navigate(`/property/${property.property_type.replace('_', '-')}/${property.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-gray-600 hover:text-gray-900 bg-white">
                      <Edit className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="w-10 px-0 text-red-500 hover:text-red-700 hover:bg-red-50 bg-white border-gray-200">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PropertyManagerDashboard;
