import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Store,
  Mail,
  Phone,
} from "lucide-react";
import api from "@/lib/axios";

const fetchJobById = async (jobId) => {
  const { data } = await api.get(`/jobs/${jobId}`);
  return data;
};

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const { user, logout } = useAuth();

  const {
    data: job,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJobById(jobId),
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar user={user} onLogout={logout} />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading job details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar user={user} onLogout={logout} />
        <main className="flex-1 flex items-center justify-center">
          <h1 className="text-2xl font-bold">Job not found</h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar user={user} onLogout={logout} />
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to="/customer/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-md">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {job.service}
                </h1>
                <p className="text-muted-foreground">
                  Requested on {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
              {getStatusBadge(job.status)}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Description</h3>
                <p className="text-muted-foreground">{job.description}</p>
              </div>
              <div>
                <h3 className="font-semibold">Appointment</h3>
                <p className="text-muted-foreground">
                  {new Date(job.date).toLocaleString()}
                </p>
              </div>
            </div>

            {job.vendor && (
              <>
                <hr className="my-6 border-border" />
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Vendor Details
                  </h2>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                      <Store className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {job.vendor.name}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {job.vendor.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetailsPage;
