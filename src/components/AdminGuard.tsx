import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== "ADMIN") {
      toast.error("You don't have permission to access this area");
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 justify-center items-center min-h-screen bg-VitalCarePlatform-background">
        <div className="w-8 h-8 border-4 border-VitalCarePlatform-primary border-t-transparent rounded-full animate-spin"></div>
        <Badge>Checking admin privileges...</Badge>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
