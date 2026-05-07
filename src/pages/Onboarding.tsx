import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Building, Home, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/homes-logo.png";

const userTypes = [
  { value: "user", label: "Normal User", description: "Can browse and view properties", icon: Search },
  { value: "agent", label: "Agent", description: "Can list and manage properties for clients", icon: Briefcase },
  { value: "landlord", label: "Landlord", description: "Can upload and manage rental properties", icon: Building },
  { value: "owner", label: "Property Owner", description: "Can list and manage owned properties", icon: Home },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, session } = useAuthContext();
  
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!user) return;

    if (user.user_metadata?.onboarding_completed) {
      const type = user.user_metadata?.user_type;
      let redirectPath = "/";
      if (type === "admin") redirectPath = "/admin";
      else if (type === "user") redirectPath = "/dashboard/user";
      else if (type === "agent" || type === "landlord" || type === "owner") redirectPath = "/dashboard/manager";
      
      navigate(redirectPath, { replace: true });
      return;
    }

    // Check if role is known
    const existingRole = user.user_metadata?.user_type;
    const pendingRole = sessionStorage.getItem("pending_user_role");
    
    if (existingRole) {
      setRole(existingRole);
    } else if (pendingRole) {
      setRole(pendingRole);
    }

    if (user.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user, navigate]);

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    sessionStorage.setItem("pending_user_role", selectedRole);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!role) {
      toast.error("Please select a role.");
      setLoading(false);
      return;
    }

    if (!fullName || !phone) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const updates = {
        user_type: role,
        full_name: fullName,
        phone_number: phone,
        onboarding_completed: true,
        ...(role !== "user" && {
          business_name: businessName,
          location: location,
          description: description,
        }),
      };

      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      // Update the public.profiles table
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: user.id,
        user_type: role,
        full_name: fullName,
        phone: phone,
        location: location || null,
        bio: description || null,
      }, { onConflict: 'user_id' });

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw new Error("Failed to update profile record.");
      }

      // Also refresh the session to ensure changes are propagated
      await supabase.auth.refreshSession();

      toast.success("Profile setup complete!");
      sessionStorage.removeItem("pending_user_role");
      
      let redirectPath = "/";
      if (role === "admin") redirectPath = "/admin";
      else if (role === "user") redirectPath = "/dashboard/user";
      else redirectPath = "/dashboard/manager";
      
      // Redirect
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isProfessional = role && role !== "user";

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <img src={logo} alt="Homes Nigeria" className="h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Complete your profile
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Just a few more details before you can access your account.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{!role ? "Step 1: Choose Account Type" : "Step 2: Profile Details"}</CardTitle>
            <CardDescription>
              {!role ? "Select how you plan to use Homes Nigeria." : "Tell us a bit more about yourself."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!role ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {userTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleRoleSelect(type.value)}
                      className="flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all hover:border-primary hover:bg-muted/50"
                    >
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{type.label}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      {(() => {
                        const Icon = userTypes.find((t) => t.value === role)?.icon || Search;
                        return <Icon className="h-5 w-5" />;
                      })()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Selected Role: {userTypes.find(t => t.value === role)?.label}</p>
                      <p className="text-xs text-muted-foreground">You can't change this later.</p>
                    </div>
                  </div>
                  {!user.user_metadata?.user_type && (
                    <Button variant="ghost" size="sm" onClick={() => setRole(null)}>
                      Change
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234..."
                      required
                    />
                  </div>

                  {isProfessional && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="businessName">Business/Agency Name</Label>
                        <Input
                          id="businessName"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. John Doe Properties Ltd"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Lagos, Abuja"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Short Description</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Tell us about the properties you manage..."
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
