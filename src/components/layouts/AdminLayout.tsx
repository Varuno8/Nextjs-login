
import { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { Home, Users, BookOpen, BarChart2, Settings, LogOut, Menu, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const isActive = location.pathname === to;

    return (
      <Link 
        to={to} 
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
          isActive 
            ? "bg-eigengram-accent text-white" 
            : "hover:bg-eigengram-background"
        )}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Link>
    );
  };

  const NavContent = () => (
    <>
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold text-gradient">Eigengram Admin</h2>
        <p className="mt-1 text-sm text-eigengram-muted">Healthcare AI Platform</p>
      </div>
      <Separator className="mb-4" />
      <nav className="space-y-1 px-2">
        <NavItem to="/admin" icon={Home} label="Dashboard" />
        <NavItem to="/admin/users" icon={Users} label="Users" />
        <NavItem to="/admin/subscriptions" icon={BookOpen} label="Subscriptions" />
        <NavItem to="/admin/analytics" icon={BarChart2} label="Analytics" />
        <NavItem to="/admin/feature-requests" icon={MessageSquare} label="Feature Requests" />
      </nav>

      <div className="mt-auto px-4 py-4">
        <Link 
          to="/dashboard" 
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-4 py-3 mb-4 rounded-md transition-colors hover:bg-eigengram-border"
        >
          <span className="text-eigengram-primary font-medium">User Dashboard</span>
        </Link>
        <Separator className="mb-4" />
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={handleLogout}
        >
          <LogOut size={20} className="mr-2" />
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-eigengram-background">
      {/* Sidebar for larger screens */}
      {!isMobile && (
        <div className="w-64 bg-white border-r border-eigengram-border flex flex-col">
          <NavContent />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top navbar */}
        <header className="bg-white border-b border-eigengram-border py-4 px-6 flex items-center justify-between">
          {isMobile && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <NavContent />
              </SheetContent>
            </Sheet>
          )}

          <div className="flex-1 flex justify-center md:justify-start">
            {isMobile && <h1 className="text-xl font-bold text-gradient">Eigengram Admin</h1>}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">{user?.name || user?.username}</p>
              <p className="text-xs text-eigengram-muted">{user?.email}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
