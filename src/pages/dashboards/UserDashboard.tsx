import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Heart, ArrowUpRight, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}!
            </h1>
            <p className="text-gray-500 mt-1">Manage your saved properties and searches</p>
          </div>
          
          <Button asChild className="bg-[#1f1a54] text-white hover:bg-[#15113d] shadow-md">
            <Link to="/upgrade">
              <PlusCircle className="mr-2 h-4 w-4" />
              Upgrade to List Properties
            </Link>
          </Button>
        </div>

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
                <Link to="/profile">View Saved</Link>
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
