
import { ReactNode } from "react";
import { Service } from "@/lib/mock-data";
import ServiceCard from "./ServiceCard";

interface ServiceGridProps {
  services: Service[];
  subscriptionStatus?: Record<string, boolean>;
  dashboard?: boolean;
  children?: ReactNode;
  emptyMessage?: string;
}

const ServiceGrid = ({ 
  services, 
  subscriptionStatus = {}, 
  dashboard = false,
  children,
  emptyMessage = "No services found."
}: ServiceGridProps) => {
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-eigengram-muted">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          subscribed={subscriptionStatus[service.id]}
          dashboard={dashboard}
        />
      ))}
    </div>
  );
};

export default ServiceGrid;
