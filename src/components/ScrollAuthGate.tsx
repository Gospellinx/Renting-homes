import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const RETURN_URL_KEY = "auth_return_url";

export const saveReturnUrl = () => {
  sessionStorage.setItem(RETURN_URL_KEY, window.location.pathname + window.location.search);
};

export const getReturnUrl = (): string | null => {
  return sessionStorage.getItem(RETURN_URL_KEY);
};

export const clearReturnUrl = () => {
  sessionStorage.removeItem(RETURN_URL_KEY);
};

const ScrollAuthGate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignUp = () => {
    saveReturnUrl();
    navigate("/auth?mode=signup");
  };

  const handleSignIn = () => {
    saveReturnUrl();
    navigate("/auth");
  };

  return (
    <div className="relative">
      {/* Gradient fade overlay */}
      <div className="h-32 bg-gradient-to-b from-transparent to-background" />
      
      {/* Auth wall */}
      <div className="bg-background pb-16 pt-4 flex flex-col items-center text-center px-4">
        <div className="p-3 bg-primary/10 rounded-full mb-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Sign up to continue browsing</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create a free account to view all listings, contact agents, and access exclusive features.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Button onClick={handleSignUp} className="flex-1">
            Create Account
          </Button>
          <Button onClick={handleSignIn} variant="outline" className="flex-1">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScrollAuthGate;
