
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { servicesApi, subscriptionsApi } from "@/services/api";
import ServiceGrid from "@/components/ServiceGrid";
import { Service, Subscription } from "@/lib/types";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (user?.id) {
          // Check if user ID is a valid UUID format
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
            console.error("Invalid UUID format for user ID:", user.id);
            toast.error("Invalid user ID format. Please try signing out and back in.");
            
            // Still fetch general services even if user ID is invalid
            const servicesResponse = await servicesApi.getAll();
            if (servicesResponse.success) {
              setServices(servicesResponse.data);
            }
            setIsLoading(false);
            return;
          }
          
          const [servicesResponse, subscriptionsResponse] = await Promise.all([
            servicesApi.getAll(),
            subscriptionsApi.getUserSubscriptions(user.id)
          ]);
          
          if (servicesResponse.success) {
            setServices(servicesResponse.data);
          } else {
            console.error("Failed to fetch services:", servicesResponse.message);
            toast.error("Failed to load available services");
          }
          
          if (subscriptionsResponse.success) {
            setSubscriptions(subscriptionsResponse.data);
          } else {
            console.error("Failed to fetch subscriptions:", subscriptionsResponse.message);
            toast.error("Failed to load your subscriptions");
          }
        } else {
          // If user is not logged in, just fetch services
          const servicesResponse = await servicesApi.getAll();
          if (servicesResponse.success) {
            setServices(servicesResponse.data);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Error loading dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]);

  const subscriptionStatus = subscriptions.reduce((acc, subscription) => {
    acc[subscription.serviceId] = subscription.status === "ACTIVE";
    return acc;
  }, {} as Record<string, boolean>);
  
  const subscribedServices = services.filter(service => 
    subscriptionStatus[service.id]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name || user?.username}</h1>
        <p className="text-eigengram-muted mt-1">
          Access and manage your healthcare AI services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {subscriptions.filter(sub => sub.status === "ACTIVE").length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Available Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {services.length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {subscriptions.filter(sub => sub.status === "PENDING").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscribed" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="subscribed">My Subscriptions</TabsTrigger>
          <TabsTrigger value="available">Available Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscribed" className="mt-0">
          {isLoading ? (
            <div className="text-center py-12">Loading your subscriptions...</div>
          ) : (
            <ServiceGrid 
              services={subscribedServices}
              subscriptionStatus={subscriptionStatus}
              dashboard={true}
              emptyMessage="You don't have any active subscriptions yet."
            />
          )}
        </TabsContent>
        
        <TabsContent value="available" className="mt-0">
          {isLoading ? (
            <div className="text-center py-12">Loading available services...</div>
          ) : (
            <ServiceGrid 
              services={services}
              subscriptionStatus={subscriptionStatus}
              dashboard={true}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
