
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Subscriptions from "./pages/Subscriptions";
import Account from "./pages/Account";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminFeatureRequests from "./pages/AdminFeatureRequests";
import AdminServiceDetails from "./pages/AdminServiceDetails";
import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";
import DashboardLayout from "./components/layouts/DashboardLayout";
import AdminLayout from "./components/layouts/AdminLayout";

// Create a new QueryClient instance 
const queryClient = new QueryClient();

// Define the App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              
              {/* User Dashboard Routes */}
              <Route element={<AuthGuard><DashboardLayout /></AuthGuard>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/services" element={<Services />} />
                <Route path="/dashboard/services/:id" element={<ServiceDetails />} />
                <Route path="/dashboard/subscriptions" element={<Subscriptions />} />
                <Route path="/dashboard/account" element={<Account />} />
              </Route>
              
              {/* Admin Routes */}
              <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/services/:id" element={<AdminServiceDetails />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/feature-requests" element={<AdminFeatureRequests />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
