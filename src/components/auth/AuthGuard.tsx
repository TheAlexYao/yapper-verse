import { useSession } from "@supabase/auth-helpers-react";
import { Navigate } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const session = useSession();
  const isDevelopment = import.meta.env.DEV;

  // Allow access in development mode or if user is authenticated
  if (isDevelopment || session) {
    return <>{children}</>;
  }

  // Redirect to auth page if not in development and not authenticated
  return <Navigate to="/auth" replace />;
};