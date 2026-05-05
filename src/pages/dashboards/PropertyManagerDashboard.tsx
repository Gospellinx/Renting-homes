import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Building, Briefcase, Home, Settings, LogOut, LayoutDashboard, LayoutList, Search } from "lucide-react";
import logo from "@/assets/homes-logo.png";
import { supabase } from "@/integrations/supabase/client";

const PropertyManagerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null; user_type: string | null } | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("full_name, user_type")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getRoleInfo = (type: string | null) => {
    switch (type) {
      case "agent":
        return { label: "Agent", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" };
      case "landlord":
        return { label: "Landlord", icon: Building, color: "text-indigo-600", bg: "bg-indigo-50" };
      case "owner":
        return { label: "Property Owner", icon: Home, color: "text-emerald-600", bg: "bg-emerald-50" };
      default:
        return { label: "Manager", icon: Building, color: "text-gray-600", bg: "bg-gray-50" };
    }
  };

  const roleInfo = getRoleInfo(profile?.user_type || null);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col md:sticky md:top-0 md:h-screen">
        <div className="p-6 border-b border-gray-200">
          <Link to="/">
            <img src={logo} alt="Homes" className="h-8 w-auto" />
          </Link>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${roleInfo.bg}`}>
              <RoleIcon className={`h-6 w-6 ${roleInfo.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{roleInfo.label}</p>
              <p className="font-medium text-gray-900 truncate w-32" title={profile?.full_name || "User"}>
                {profile?.full_name || "User"}
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link 
              to="/dashboard/manager" 
              className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-md font-medium"
            >
              <LayoutDashboard className="h-5 w-5" />
              Overview
            </Link>
            <Link 
              to="/profile" 
              className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium transition-colors"
            >
              <Settings className="h-5 w-5 text-gray-400" />
              Settings
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-200">
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50" onClick={handleSignOut}>
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500">Manage your properties and track performance.</p>
          </div>
          <Button asChild className="bg-[#26225f] hover:bg-[#1f1b50]">
            <Link to="/upload-property">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
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
          <Card>
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
          <Card>
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
        <Card className="border-gray-200">
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
      </main>
    </div>
  );
};

export default PropertyManagerDashboard;
