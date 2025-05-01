import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SubscriptionCardProps {
  id: string;
  serviceName: string;
  status: "PENDING" | "ACTIVE" | "INACTIVE" | "CANCELLED";
  startDate: string;
}

const SubscriptionCard = ({
  id,
  serviceName,
  status,
  startDate,
}: SubscriptionCardProps) => {
  const formattedDate = new Date(startDate).toLocaleDateString();

  const statusVariant = {
    ACTIVE: "success",
    PENDING: "warning",
    INACTIVE: "secondary",
    CANCELLED: "destructive",
  }[status] as "success" | "warning" | "secondary" | "destructive" | "default";

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{serviceName}</CardTitle>
          <Badge variant={statusVariant}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-VitalCarePlatform-muted">
          Started: {formattedDate}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link
            to={`/dashboard/services/${id}`}
            className="flex items-center justify-center"
          >
            View Service
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionCard;
