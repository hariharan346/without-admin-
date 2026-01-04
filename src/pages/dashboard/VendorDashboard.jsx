import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Store,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { format } from "date-fns";

// Fetch vendor's assigned requests
const fetchVendorRequests = async () => {
  const { data } = await api.get("/requests/vendor");
  return data;
};

// Fetch vendor's profile
const fetchVendorProfile = async () => {
  const { data } = await api.get("/auth/me"); // Assuming /auth/me populates vendor info for vendor users
  return data.vendor;
};

// Toggle vendor availability
const toggleAvailability = async (isAvailable) => {
  const { data } = await api.put("/vendors/availability", { isAvailable });
  return data;
};

// Update request status (accept, reject, complete)
const updateRequestStatus = async ({ requestId, statusType }) => {
  const { data } = await api.put(`/requests/${requestId}/${statusType}`);
  return data;
};

const VendorDashboard = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vendorProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["vendorProfile"],
    queryFn: fetchVendorProfile,
    enabled: user?.role === "vendor", // Only fetch if user is a vendor
  });

  const [isAvailable, setIsAvailable] = useState(vendorProfile?.isAvailable ?? true);

  useEffect(() => {
    if (vendorProfile) {
      setIsAvailable(vendorProfile.isAvailable);
    }
  }, [vendorProfile]);

  const { data: assignedRequests, isLoading: isLoadingAssigned } = useQuery({
    queryKey: ["vendorRequests"],
    queryFn: fetchVendorRequests,
    enabled: user?.role === "vendor",
  });

  const availabilityMutation = useMutation({
    mutationFn: toggleAvailability,
    onSuccess: (data) => {
      toast({
        title: "Availability Updated",
        description: `You are now ${data.isAvailable ? "available" : "unavailable"}.`,
      });
      queryClient.invalidateQueries(["vendorProfile"]); // Invalidate to refetch profile with new availability
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Could not update availability.",
        variant: "destructive",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: updateRequestStatus,
    onSuccess: (data) => {
      toast({
        title: "Request Updated",
        description: `Request status changed to ${data.status}.`,
      });
      queryClient.invalidateQueries(["vendorRequests"]); // Invalidate to refetch assigned requests
      queryClient.invalidateQueries(["openRequests"]); // Invalidate open requests as well
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Could not update request status.",
        variant: "destructive",
      });
    },
  });

  const handleAvailabilityToggle = () => {
    availabilityMutation.mutate(!isAvailable);
    setIsAvailable((prev) => !prev);
  };

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

  const RequestCard = ({ request }) => (
    <Link to={`/request/${request._id}`} className="block">
      <div className="p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {request.service.name}
            </span>
            {getStatusBadge(request.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(request.date), "PPP p")}
          </p>
        </div>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          Customer: {request.user.name} - {request.description}
        </p>
        <div className="flex gap-2 mt-4">
          {request.status === "pending" && (
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault(); // Prevent navigating
                statusMutation.mutate({ requestId: request._id, statusType: "accept" });
              }}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Accept
            </Button>
          )}
          {(request.status === "pending" || request.status === "accepted") && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault(); // Prevent navigating
                statusMutation.mutate({ requestId: request._id, statusType: "reject" });
              }}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
              Reject
            </Button>
          )}
          {request.status === "accepted" && (
            <Button
              size="sm"
              variant="success"
              onClick={(e) => {
                e.preventDefault(); // Prevent navigating
                statusMutation.mutate({ requestId: request._id, statusType: "complete" });
              }}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Complete
            </Button>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar user={user} onLogout={logout} />
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          {isLoadingProfile ? (
            <p>Loading vendor profile...</p>
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Store className="w-8 h-8 text-primary" />
                  {vendorProfile?.companyName || user?.name}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {vendorProfile?.location}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {vendorProfile?.services?.map((service) => (
                    <Badge key={service._id} variant="secondary">
                      {service.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                <Switch
                  id="available"
                  checked={isAvailable}
                  onCheckedChange={handleAvailabilityToggle}
                  disabled={availabilityMutation.isPending}
                />
                <Label htmlFor="available" className="cursor-pointer">
                  {isAvailable ? (
                    <span className="text-success font-medium">Available</span>
                  ) : (
                    <span className="text-muted-foreground">Unavailable</span>
                  )}
                </Label>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Your Assigned Requests</h2>
              {isLoadingAssigned ? (
                <p>Loading your requests...</p>
              ) : assignedRequests && assignedRequests.length > 0 ? (
                <div className="space-y-4">
                  {assignedRequests.map((request) => (
                    <RequestCard key={request._id} request={request} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <p>You have no assigned service requests.</p>
                  <Link to="/open-request" className="text-primary hover:underline mt-2 inline-block">
                    View Open Requests
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VendorDashboard;
