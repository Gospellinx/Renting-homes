import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home, Search, Heart, ArrowUpRight, PlusCircle } from "lucide-react";
import logo from "@/assets/homes-logo.png";
import { supabase } from "@/integrations/supabase/client";

const UserDashboard = () => {
  const { user, signOut } = useAuth();
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f2f4fb_0%,#f7f7fb_42%,#f4f1ec_100%)]">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Homes" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/profile">Profile Settings</Link>
            </Button>
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1f1a54]">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}!
            </h1>
            <p className="text-[#6f7599] mt-1">Manage your saved properties and searches</p>
          </div>
          
          <Button asChild className="bg-[#d8a95b] text-white hover:bg-[#c29852] shadow-md">
            <Link to="/upgrade">
              <PlusCircle className="mr-2 h-4 w-4" />
              Upgrade to List Properties
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-[#d7daf0] shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Search className="h-5 w-5 text-[#4285F4]" />
                Browse Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#6f7599] mb-4">
                Explore thousands of homes, lands, and shops available for rent or sale.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link to="/search">Start Searching</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[#d7daf0] shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#EA4335]" />
                Saved Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#6f7599] mb-4">
                View properties you have favorited for easy access later.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link to="/profile">View Saved</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[#d8a95b] bg-[linear-gradient(135deg,#fcf7eb_0%,#ffffff_100%)] shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-[#7a4b16]">
                <ArrowUpRight className="h-5 w-5" />
                Want to list a property?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#7a4b16] mb-4">
                Upgrade to an Agent, Landlord, or Owner account to start listing properties.
              </p>
              <Button asChild className="w-full bg-[#d8a95b] text-white hover:bg-[#c29852]">
                <Link to="/upgrade">Upgrade Account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
};

export default UserDashboard;
