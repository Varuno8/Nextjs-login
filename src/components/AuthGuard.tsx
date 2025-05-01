import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to sign-in");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 justify-center items-center min-h-screen bg-VitalCarePlatform-background">
        <div className="w-8 h-8 border-4 border-VitalCarePlatform-primary border-t-transparent rounded-full animate-spin"></div>
        <Badge>Authenticating...</Badge>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to signin page with return url
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
