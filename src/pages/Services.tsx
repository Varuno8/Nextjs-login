import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  getServices,
  getUserSubscriptions,
  Service,
  Subscription,
} from "@/lib/mock-data";
import ServiceGrid from "@/components/ServiceGrid";
import { Search } from "lucide-react";

const Services = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (user?.id) {
          const [servicesData, subscriptionsData] = await Promise.all([
            getServices(),
            getUserSubscriptions(user.id),
          ]);

          setServices(servicesData);
          setSubscriptions(subscriptionsData);
          setFilteredServices(servicesData);
        }
      } catch (error) {
        console.error("Error fetching services data:", error);
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

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredServices(services);
      return;
    }

    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
    );

    setFilteredServices(filtered);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search Services</h1>
        <p className="text-VitalCarePlatform-muted mt-1">
          Find and subscribe to healthcare AI services
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-VitalCarePlatform-muted h-4 w-4" />
          <Input
            placeholder="Search services..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading services...</div>
      ) : (
        <ServiceGrid
          services={filteredServices}
          subscriptionStatus={subscriptionStatus}
          dashboard={true}
          emptyMessage={
            searchQuery
              ? `No services found matching "${searchQuery}"`
              : "No services available at this time."
          }
        />
      )}
    </div>
  );
};

export default Services;
