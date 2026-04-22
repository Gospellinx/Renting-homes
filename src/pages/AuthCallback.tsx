import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * OAuth Callback Handler
 * This page handles the redirect from OAuth providers (Google, Apple, etc.)
 * Supabase automatically handles the token exchange, we just need to wait for auth state to update
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Check for error from OAuth provider
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      console.error("OAuth Error:", error, errorDescription);
      navigate("/auth?error=" + encodeURIComponent(errorDescription || error));
      return;
    }

    // If user is logged in, redirect to home or intended page
    if (!loading && user) {
      console.log("OAuth callback successful, redirecting user:", user.email);
      
      // Check for return URL in session storage (set by auth flow)
      const returnUrl = sessionStorage.getItem("auth_return_url");
      if (returnUrl) {
        sessionStorage.removeItem("auth_return_url");
        navigate(returnUrl);
      } else {
        navigate("/");
      }
    }
  }, [user, loading, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
