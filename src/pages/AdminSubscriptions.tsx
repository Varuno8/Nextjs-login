
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllSubscriptions, updateSubscriptionStatus } from "@/lib/mock-data";
import { toast } from "sonner";

interface SubscriptionWithDetails {
  id: string;
  userId: string;
  serviceId: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  serviceName?: string;
  userName?: string;
}

const AdminSubscriptions = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        const data = await getAllSubscriptions();
        setSubscriptions(data);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleUpdateStatus = async (id: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'CANCELLED') => {
    try {
      setProcessingId(id);
      await updateSubscriptionStatus(id, newStatus);
      
      // Update local state
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, status: newStatus } : sub
        )
      );
      
      toast.success(`Subscription ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error(`Error updating subscription status:`, error);
      toast.error("Failed to update subscription status");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} className="mr-2" />
        Back
      </Button>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription Requests</h1>
        <p className="text-eigengram-muted mt-1">
          Manage user subscription requests
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading subscriptions...</div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Service</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Start Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-b hover:bg-eigengram-background/50">
                    <td className="p-4">{subscription.userName || "Unknown"}</td>
                    <td className="p-4">{subscription.serviceName || "Unknown"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        subscription.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        subscription.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="p-4">{formatDate(subscription.startDate)}</td>
                    <td className="p-4 space-x-2">
                      {subscription.status === 'PENDING' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="default"
                            disabled={processingId === subscription.id}
                            onClick={() => handleUpdateStatus(subscription.id, 'ACTIVE')}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={processingId === subscription.id}
                            onClick={() => handleUpdateStatus(subscription.id, 'CANCELLED')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {subscription.status === 'ACTIVE' && (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          disabled={processingId === subscription.id}
                          onClick={() => handleUpdateStatus(subscription.id, 'INACTIVE')}
                        >
                          Deactivate
                        </Button>
                      )}
                      
                      {subscription.status === 'INACTIVE' && (
                        <Button 
                          size="sm" 
                          variant="default"
                          disabled={processingId === subscription.id}
                          onClick={() => handleUpdateStatus(subscription.id, 'ACTIVE')}
                        >
                          Reactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminSubscriptions;
