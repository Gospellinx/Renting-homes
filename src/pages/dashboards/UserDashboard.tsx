import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Heart, ArrowUpRight, PlusCircle, User, MapPin, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserDashboard = () => {
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
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Account Overview
            </h1>
            <p className="text-gray-500 mt-1">Manage your account details and saved properties.</p>
          </div>
          
          <Button asChild className="bg-[#1f1a54] text-white hover:bg-[#15113d] shadow-md">
            <Link to="/upload-property">
              <PlusCircle className="mr-2 h-4 w-4" />
              Upgrade to List Properties
            </Link>
          </Button>
        </div>

        {/* Profile Overview Card */}
        <Card className="border-0 shadow-sm bg-white overflow-hidden">
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
                  {profile?.full_name || "User Account"}
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

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-500" />
                Browse Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Explore thousands of homes, lands, and shops available for rent or sale.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link to="/search">Start Searching</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Saved Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                View properties you have favorited for easy access later.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link to="/dashboard/favorites">View Saved</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-yellow-500 bg-yellow-50/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-yellow-800">
                <ArrowUpRight className="h-5 w-5" />
                Want to list a property?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-800 mb-4">
                Upgrade to an Agent, Landlord, or Owner account to start listing properties.
              </p>
              <Button asChild className="w-full bg-yellow-600 text-white hover:bg-yellow-700">
                <Link to="/upgrade">Upgrade Account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
