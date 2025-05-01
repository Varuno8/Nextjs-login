import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionsApi } from "@/services/api";
import SubscriptionCard from "@/components/SubscriptionCard";
import { Subscription } from "@/lib/types";
import { toast } from "sonner";

const Subscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        if (user?.id) {
          // Check if user ID is a valid UUID format
          if (
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              user.id
            )
          ) {
            console.error("Invalid UUID format for user ID:", user.id);
            toast.error(
              "Invalid user ID format. Please try signing out and back in."
            );
            setIsLoading(false);
            return;
          }

          const response = await subscriptionsApi.getUserSubscriptions(user.id);
          if (response.success && Array.isArray(response.data)) {
            setSubscriptions(response.data);
          } else {
            console.error("Failed to fetch subscriptions:", response.message);
            toast.error("Failed to load subscriptions");
          }
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        toast.error("Error loading subscription data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user?.id]);

  // Filter active subscriptions
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === "ACTIVE"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Subscriptions</h1>
        <p className="text-VitalCarePlatform-muted mt-1">
          Manage and access your subscribed services
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading your subscriptions...</div>
      ) : activeSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              id={subscription.serviceId}
              serviceName={subscription.serviceName || "Unknown Service"}
              status={subscription.status}
              startDate={subscription.startDate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-VitalCarePlatform-muted">
            You don't have any active subscriptions yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
