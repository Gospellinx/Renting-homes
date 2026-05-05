import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requireOnboarding && !user?.user_metadata?.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.user_metadata?.user_type;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/upgrade" replace />;
    }
  }

  return <>{children}</>;
}
