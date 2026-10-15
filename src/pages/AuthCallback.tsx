import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { consumePostAuthRedirectPath } from "@/lib/authRedirect";
import { getDashboardPathForUser } from "@/lib/dashboardPath";

/**
 * OAuth Callback Handler
 * Handles the redirect from OAuth providers (Google, etc.)
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Check for error from OAuth provider
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      console.error("OAuth Error from provider:", error, errorDescription);
      navigate("/auth?error=" + encodeURIComponent(errorDescription || error), { replace: true });
      return;
    }

    // If AuthContext already has the authenticated user, redirect immediately
    if (!loading && user) {
      console.log("OAuth callback: user already authenticated:", user.email);
      navigate(consumePostAuthRedirectPath(getDashboardPathForUser(user)), { replace: true });
      return;
    }

    const processOAuth = async () => {
      try {
        const code = searchParams.get("code");
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn("exchangeCodeForSession error (may have been handled automatically):", exchangeError);
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.user && isMounted) {
              navigate(consumePostAuthRedirectPath(getDashboardPathForUser(sessionData.session.user)), { replace: true });
              return;
            }
            if (isMounted) {
              navigate("/auth?error=" + encodeURIComponent(exchangeError.message || "Failed to complete Google sign-in."), { replace: true });
              return;
            }
          }

          if (data?.session?.user && isMounted) {
            navigate(consumePostAuthRedirectPath(getDashboardPathForUser(data.session.user)), { replace: true });
            return;
          }
        }

        // Check if a session exists
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user && isMounted) {
          navigate(consumePostAuthRedirectPath(getDashboardPathForUser(sessionData.session.user)), { replace: true });
          return;
        }
      } catch (err) {
        console.error("Error processing OAuth callback:", err);
      }
    };

    processOAuth();

    // Safety timeout: if after 5 seconds still not resolved, redirect back to /auth
    const timeout = setTimeout(async () => {
      if (!isMounted) return;
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        navigate(consumePostAuthRedirectPath(getDashboardPathForUser(sessionData.session.user)), { replace: true });
      } else {
        setIsProcessing(false);
        navigate("/auth?error=" + encodeURIComponent("Authentication took too long to complete. Please try signing in again."), { replace: true });
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [user, loading, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">
          {isProcessing ? "Completing authentication..." : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}
