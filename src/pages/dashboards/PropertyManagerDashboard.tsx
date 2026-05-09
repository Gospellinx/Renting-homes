import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Building, LayoutList, Search, User, MapPin, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PropertyManagerDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    }
  }, [user]);

  const getInitials = (name: string | null) => {
    if (!name) return "A";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Account Overview</h1>
            <p className="text-gray-500">Manage your profile, properties, and track performance.</p>
          </div>
          <Button asChild className="bg-[#26225f] hover:bg-[#1f1b50]">
            <Link to="/upload-property">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        </header>

        {/* Profile Overview Card */}
        <Card className="border-0 shadow-sm bg-white overflow-hidden mb-8">
          <div className="h-24 bg-[#5cb85c]"></div>
          <CardContent className="px-6 pb-6 pt-0 sm:flex sm:items-end sm:space-x-5">
            <div className="-mt-12 relative flex">
              <Avatar className="h-24 w-24 rounded-full ring-4 ring-white bg-gray-200">
                <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                <AvatarFallback className="text-2xl text-gray-500">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
              <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {profile?.full_name || "Agent Account"}
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {profile?.user_type || "Agent"}
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Properties</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <LayoutList className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Listings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Views</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <Search className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties List */}
        <Card className="border-gray-200 bg-white">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg">Your Properties</CardTitle>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Building className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Get started by adding your first property listing. It will be visible to thousands of potential renters and buyers.
            </p>
            <Button asChild className="bg-[#26225f] hover:bg-[#1f1b50]">
              <Link to="/upload-property">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PropertyManagerDashboard;
