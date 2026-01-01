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
} from "lucide-react";
import { useState } from "react";
import api from "@/lib/axios";

const fetchVendorJobs = async () => {
  const { data } = await api.get("/jobs/vendor");
  return data;
};

const fetchPendingJobs = async () => {
  const { data } = await api.get("/jobs/vendor/pending");
  return data;
};

const updateJobStatus = async ({ jobId, status }) => {
  const { data } = await api.patch(`/jobs/${jobId}/${status}`);
  return data;
};

const VendorDashboard = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [isAvailable, setIsAvailable] = useState(user?.vendor?.isAvailable ?? true);

  const { data: assignedJobs, isLoading: isLoadingAssigned } = useQuery({
    queryKey: ["vendorJobs"],
    queryFn: fetchVendorJobs,
  });

  const { data: pendingJobs, isLoading: isLoadingPending } = useQuery({
    queryKey: ["pendingJobs"],
    queryFn: fetchPendingJobs,
  });

  const mutation = useMutation({
    mutationFn: updateJobStatus,
    onSuccess: () => {
      queryClient.invalidateQueries("vendorJobs");
      queryClient.invalidateQueries("pendingJobs");
    },
  });

  const handleStatusUpdate = (jobId, status) => {
    mutation.mutate({ jobId, status });
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
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const JobCard = ({ job, isPending }) => (
    <div className="p-4 bg-muted/50 rounded-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{job.service}</span>
            {getStatusBadge(job.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            Customer: {job.customer.name}
          </p>
          <p className="text-sm text-muted-foreground">
            Email: {job.customer.email}
          </p>
          <p className="text-sm mt-2">{job.description}</p>
        </div>
        <div className="flex gap-2">
          {isPending && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(job._id, "accept")}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate(job._id, "reject")}
              >
                Reject
              </Button>
            </>
          )}
          {job.status === "accepted" && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleStatusUpdate(job._id, "complete")}
            >
              Mark Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar user={user} onLogout={logout} />
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Store className="w-8 h-8 text-primary" />
                {user?.vendor?.companyName || user?.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                {user?.vendor?.location}
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
              <Switch
                id="available"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
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

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Incoming Requests</h2>
              {isLoadingPending ? (
                <p>Loading requests...</p>
              ) : pendingJobs && pendingJobs.length > 0 ? (
                <div className="space-y-4">
                  {pendingJobs.map((job) => (
                    <JobCard key={job._id} job={job} isPending />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No incoming requests.</p>
              )}
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Your Jobs</h2>
              {isLoadingAssigned ? (
                <p>Loading your jobs...</p>
              ) : assignedJobs && assignedJobs.length > 0 ? (
                <div className="space-y-4">
                  {assignedJobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">You have no assigned jobs.</p>
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
