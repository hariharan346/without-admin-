import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
} from "lucide-react";
import api from "@/lib/axios";
import { format } from "date-fns";

const fetchUserRequests = async () => {
  const { data } = await api.get("/requests/my");
  return data;
};

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const {
    data: requests,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userRequests"],
    queryFn: fetchUserRequests,
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-primary">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-success">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar user={user} onLogout={logout} />
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user?.name}
          </h1>
          <p className="text-muted-foreground mb-8">
            Manage your service requests
          </p>

          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Your Service Requests ({requests?.length || 0})
              </h2>
              <Button asChild>
                <Link to="/open-request">Create Open Request</Link>
              </Button>
            </div>
            {isLoading ? (
              <p>Loading your requests...</p>
            ) : isError ? (
              <p>Error fetching your requests.</p>
            ) : requests && requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Link to={`/request/${request._id}`} key={request._id}>
                    <div
                      className="p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{request.service.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {request.vendor?.companyName || "Pending Vendor"}
                          </p>
                          <p className="text-sm mt-2">{request.description}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(request.status)}
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(request.createdAt), 'PPP p')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  You have not made any service requests yet.{" "}
                </p>
                <Link
                  to="/categories"
                  className="text-primary hover:underline mt-2 inline-block"
                >
                  Browse services
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
