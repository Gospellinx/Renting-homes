import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Briefcase, Building, Home, CheckCircle2, Loader2 } from "lucide-react";
import logo from "@/assets/homes-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const upgradeOptions = [
  { 
    value: "agent", 
    label: "Agent", 
    description: "I want to list and manage properties for clients.", 
    icon: Briefcase,
    benefits: ["List multiple properties", "Client management tools", "Agent profile page"]
  },
  { 
    value: "landlord", 
    label: "Landlord", 
    description: "I want to upload and manage my rental properties.", 
    icon: Building,
    benefits: ["List rental properties", "Manage tenants", "Receive applications"]
  },
  { 
    value: "owner", 
    label: "Property Owner", 
    description: "I want to list and manage my owned properties.", 
    icon: Home,
    benefits: ["List properties for sale", "Direct buyer contact", "Property verification"]
  },
];

const UpgradeAccount = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!user || !selectedRole) return;
    
    setIsUpgrading(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ user_type: selectedRole })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: { user_type: selectedRole }
      });

      if (authError) throw authError;

      toast({
        title: "Account Upgraded!",
        description: "Your account has been successfully upgraded.",
      });
      
      // Redirect to the new dashboard
      navigate(`/dashboard/${selectedRole}`);
    } catch (error) {
      console.error("Upgrade error:", error);
      toast({
        title: "Upgrade failed",
        description: "We couldn't upgrade your account right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f2f4fb_0%,#f7f7fb_42%,#f4f1ec_100%)] flex flex-col">
      <header className="border-0 bg-transparent">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Homes" className="h-10 w-auto" />
          </Link>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-[#d7daf0] bg-white/85 px-4 text-[#241f66] shadow-[0_10px_25px_rgba(31,26,84,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[#bfc6f5] hover:bg-white"
          >
            <Link to="/dashboard/user" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container max-w-4xl py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1f1a54] mb-4">Upgrade Your Account</h1>
          <p className="text-xl text-[#6f7599] max-w-2xl mx-auto">
            Unlock the ability to list properties by upgrading to a professional account type. It's free and takes just a second.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {upgradeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedRole === option.value;
            
            return (
              <Card 
                key={option.value}
                className={`cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? "ring-2 ring-[#26225f] shadow-lg scale-105 bg-[#f8f9ff] border-[#b8c1fb]" 
                    : "hover:shadow-md hover:border-[#d7daf0] border-transparent"
                }`}
                onClick={() => setSelectedRole(option.value)}
              >
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                    isSelected ? "bg-[#26225f] text-white" : "bg-[#f0f2fb] text-[#26225f]"
                  }`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl">{option.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-center text-[#6f7599] mb-6 h-10">
                    {option.description}
                  </p>
                  <ul className="space-y-3">
                    {option.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start text-sm text-[#4a5073]">
                        <CheckCircle2 className="h-4 w-4 text-[#34A853] mr-2 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg"
            className="w-full max-w-md h-14 text-lg rounded-2xl bg-[#26225f] text-white shadow-[0_16px_32px_rgba(38,34,95,0.18)] hover:bg-[#1f1b50]"
            disabled={!selectedRole || isUpgrading}
            onClick={handleUpgrade}
          >
            {isUpgrading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Upgrading...
              </>
            ) : (
              "Confirm Upgrade"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default UpgradeAccount;
