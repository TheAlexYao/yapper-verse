import { useSession, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const session = useSession();
  const { isLoading } = useSessionContext();
  const isDevelopment = import.meta.env.DEV;

  // Show nothing while loading to prevent flash of redirect
  if (isLoading) {
    return null;
  }

  // Allow access in development mode or if user is authenticated
  if (isDevelopment || session) {
    return <>{children}</>;
  }

  // Redirect to auth page if not in development and not authenticated
  return <Navigate to="/auth" replace />;
};