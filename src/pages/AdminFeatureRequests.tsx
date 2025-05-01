
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { adminApi } from "@/services/api";
import { FeatureRequest } from "@/lib/types";

// Define possible response types
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
} | T[];

const AdminFeatureRequests = () => {
  const navigate = useNavigate();
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatureRequests = async () => {
      try {
        setIsLoading(true);
        // Use unknown as an intermediate type to avoid direct type conversion errors
        const response = await adminApi.getAllFeatureRequests() as unknown;
        
        // Check if response is an array (direct data) or has a data property
        if (Array.isArray(response)) {
          setFeatureRequests(response as FeatureRequest[]);
        } else if (response && typeof response === 'object' && 'success' in response && response.success && 'data' in response) {
          // Now we can safely access the data property
          setFeatureRequests((response as { success: boolean, data: FeatureRequest[] }).data);
        } else {
          toast.error("Failed to fetch feature requests");
        }
      } catch (error) {
        console.error("Error fetching feature requests:", error);
        toast.error("An error occurred while fetching feature requests");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeatureRequests();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      // Use unknown as an intermediate type to avoid direct type conversion errors
      const response = await adminApi.updateFeatureRequestStatus(id, newStatus) as unknown;
      
      // Handle both response formats
      if ((response && typeof response === 'object' && 'success' in response && response.success) || 
          (response && typeof response === 'object' && !('success' in response))) {
        setFeatureRequests(prev => 
          prev.map(req => 
            req.id === id ? { ...req, status: newStatus as FeatureRequest['status'] } : req
          )
        );
        toast.success(`Feature request status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update feature request status");
      }
    } catch (error) {
      console.error("Error updating feature request status:", error);
      toast.error("An error occurred while updating the status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'NEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} className="mr-2" />
        Back
      </Button>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feature Requests</h1>
        <p className="text-eigengram-muted mt-1">
          Review and manage user feature requests
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading feature requests...</div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Title</th>
                  <th className="text-left p-4 font-medium">Description</th>
                  <th className="text-left p-4 font-medium">Submitted By</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {featureRequests.length > 0 ? (
                  featureRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-eigengram-background/50">
                      <td className="p-4 font-medium">{request.title}</td>
                      <td className="p-4">
                        <div className="max-w-xs line-clamp-2">{request.description}</div>
                      </td>
                      <td className="p-4">{request.userEmail}</td>
                      <td className="p-4">{formatDate(request.submittedAt)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <Select
                          defaultValue={request.status}
                          onValueChange={(value) => handleStatusChange(request.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NEW">NEW</SelectItem>
                            <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                            <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                            <SelectItem value="REJECTED">REJECTED</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No feature requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminFeatureRequests;
