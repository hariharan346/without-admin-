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

const fetchUserJobs = async () => {
  const { data } = await api.get("/jobs/my");
  return data;
};

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const {
    data: jobs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userJobs"],
    queryFn: fetchUserJobs,
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
                Your Service Requests ({jobs?.length || 0})
              </h2>
              <Button asChild>
                <Link to="/open-request">Create Open Request</Link>
              </Button>
            </div>
            {isLoading ? (
              <p>Loading your jobs...</p>
            ) : isError ? (
              <p>Error fetching your jobs.</p>
            ) : jobs && jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Link to={`/job/${job._id}`} key={job._id}>
                    <div
                      className="p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{job.service}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {job.vendor?.name || "Pending Vendor"}
                          </p>
                          <p className="text-sm mt-2">{job.description}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(job.status)}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No service requests yet.{" "}
                <Link
                  to="/categories"
                  className="text-primary hover:underline"
                >
                  Browse services
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
