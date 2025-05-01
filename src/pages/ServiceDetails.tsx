
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { servicesApi, subscriptionsApi } from '@/services/api';
import { getService, getSubscriptionStatus } from '@/lib/database'; // Only for backwards compatibility

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (id && user?.id) {
          // Get the service details
          const serviceResponse = await servicesApi.getById(id);
          if (!serviceResponse.success || !serviceResponse.data) {
            throw new Error('Failed to fetch service details');
          }
          setService(serviceResponse.data);
          
          // Check the subscription status
          const status = await getSubscriptionStatus(user.id, id);
          setSubscriptionStatus(status);
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
        toast.error("Failed to load service details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, user?.id]);

  const handleRequestSubscription = async () => {
    try {
      setIsSubscribing(true);
      if (!user?.id || !id) return;
      
      const response = await subscriptionsApi.subscribe(id);
      if (response.success) {
        setSubscriptionStatus("PENDING");
        toast.success("Subscription request submitted successfully");
      } else {
        throw new Error(response.message || 'Failed to request subscription');
      }
    } catch (error: any) {
      console.error("Error requesting subscription:", error);
      toast.error(error.message || "Failed to request subscription");
    } finally {
      setIsSubscribing(false);
    }
  };

  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case "ACTIVE":
        return <Badge variant="success">Subscribed</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending Approval</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Loading service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-center py-8">Service not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} className="mr-2" />
        Back
      </Button>
      
      <Card>
        <CardHeader className="relative">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{service.name}</CardTitle>
              <CardDescription className="mt-2">
                ${service.price.toFixed(2)} / month
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        
        {service.imageUrl && (
          <div className="px-6">
            <div className="aspect-[16/9] rounded-md overflow-hidden">
              <img
                src={service.imageUrl}
                alt={service.name}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        )}
        
        <CardContent className="pt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p>{service.description}</p>
            
            <Separator className="my-6" />
            
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold mb-2">AI Model Details</h3>
              <p className="text-sm text-eigengram-muted mb-2">
                Access this AI model via its secure endpoint:
              </p>
              <div className="bg-eigengram-muted/20 p-3 rounded flex items-center justify-between">
                <code className="text-sm truncate">{service.awsModelUrl}</code>
                <Button size="sm" variant="ghost">
                  <ExternalLink size={14} />
                </Button>
              </div>
              <p className="text-xs text-eigengram-muted mt-2">
                Note: You'll need valid authentication to access this endpoint
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            {subscriptionStatus === "ACTIVE" ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800 text-sm font-medium">
                  You're subscribed to this service. You can access the model using your API token.
                </p>
              </div>
            ) : subscriptionStatus === "PENDING" ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-yellow-800 text-sm font-medium">
                  Your subscription request is pending approval. You'll be notified once it's processed.
                </p>
              </div>
            ) : (
              <Button 
                className="w-full" 
                onClick={handleRequestSubscription}
                disabled={isSubscribing}
              >
                {isSubscribing ? "Processing..." : "Request Subscription"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceDetails;
