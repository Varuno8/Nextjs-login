import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Service } from "@/lib/mock-data";

interface ServiceCardProps {
  service: Service;
  subscribed?: boolean;
  dashboard?: boolean;
}

const ServiceCard = ({
  service,
  subscribed,
  dashboard = false,
}: ServiceCardProps) => {
  const { id, name, description, price, imageUrl } = service;

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{name}</CardTitle>
          {subscribed && <Badge variant="secondary">Subscribed</Badge>}
        </div>
        <CardDescription className="flex justify-between mt-1">
          <span>${price.toFixed(2)} / month</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-VitalCarePlatform-foreground/80 line-clamp-3">
          {description}
        </p>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          asChild
          className="w-full"
          variant={subscribed ? "outline" : "default"}
        >
          <Link
            to={dashboard ? `/dashboard/services/${id}` : `/services/${id}`}
            className="flex items-center justify-center"
          >
            View Details
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
