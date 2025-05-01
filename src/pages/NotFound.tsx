
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const returnPath = isAuthenticated ? '/dashboard' : '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-eigengram-background p-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-9xl font-bold text-gradient">404</h1>
        <h2 className="text-2xl font-semibold mt-6 mb-2">Page Not Found</h2>
        <p className="text-eigengram-muted mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild size="lg">
          <Link to={returnPath}>Return to {isAuthenticated ? 'Dashboard' : 'Home'}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
