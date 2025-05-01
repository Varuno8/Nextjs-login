import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogClose,
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getServices, Service } from "@/lib/mock-data";
import { servicesApi } from "@/services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    awsModelUrl: ""
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const data = await getServices();
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewService(prev => ({ ...prev, [name]: value }));
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Convert price to number
      const serviceData = {
        ...newService,
        price: parseFloat(newService.price)
      };
      
      console.log("Calling servicesApi.create with:", serviceData);
      const response = await servicesApi.create(serviceData);
      console.log("Response from servicesApi.create:", response);
      
      if (response && response.success) {
        toast.success("Service added successfully");
        setIsAddDialogOpen(false);
        
        // Add the new service to the state with the returned ID and required properties
        if (response.data) {
          const newServiceData: Service = {
            id: response.data.id,
            name: response.data.name,
            description: response.data.description,
            price: response.data.price,
            category: response.data.category || "",
            imageUrl: response.data.imageUrl || "",
            awsModelUrl: response.data.awsModelUrl || "",
            isActive: response.data.isActive || true,
            createdAt: response.data.createdAt || new Date().toISOString(),
            updatedAt: response.data.updatedAt || new Date().toISOString()
          };
          
          setServices(prevServices => [newServiceData, ...prevServices]);
        }
        
        // Reset form
        setNewService({
          name: "",
          description: "",
          price: "",
          category: "",
          imageUrl: "",
          awsModelUrl: ""
        });
      } else {
        toast.error(response?.message || "Failed to add service");
      }
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("An error occurred while adding the service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = (serviceId: string) => {
    navigate(`/admin/services/${serviceId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-eigengram-muted mt-1">
            Manage services and users
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{services.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Services ({services.length})</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PackagePlus size={16} className="mr-2" />
          Add a new service
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading services...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card 
              key={service.id} 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardClick(service.id)}
            >
              {service.imageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={service.imageUrl} 
                    alt={service.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{service.name}</CardTitle>
                <CardDescription>${service.price.toFixed(2)} / month</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-eigengram-foreground/80 line-clamp-2">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="md:col-span-3 bg-eigengram-primary/5">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild>
              <Link to="/admin/users">Manage Users</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/subscriptions">Manage Subscriptions</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard">Go to User Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add Service Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new service.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddService}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  className="col-span-3"
                  value={newService.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  name="category"
                  className="col-span-3"
                  value={newService.category}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  className="col-span-3"
                  placeholder="0.00"
                  value={newService.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  className="col-span-3"
                  rows={3}
                  value={newService.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  className="col-span-3"
                  placeholder="https://..."
                  value={newService.imageUrl}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="awsModelUrl" className="text-right">
                  Model URL
                </Label>
                <Input
                  id="awsModelUrl"
                  name="awsModelUrl"
                  className="col-span-3"
                  placeholder="https://..."
                  value={newService.awsModelUrl}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
