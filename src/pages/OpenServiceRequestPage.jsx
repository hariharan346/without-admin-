import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

const fetchServices = async () => {
  const { data } = await api.get("/services");
  return data;
};

const createJob = async (jobData) => {
  const { data } = await api.post("/jobs", jobData);
  return data;
};

const OpenServiceRequestPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  const [selectedService, setSelectedService] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      toast({
        title: "Request Submitted!",
        description: "Your open service request has been created.",
      });
      navigate("/customer/dashboard");
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to request a service.",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }

    if (!selectedService || !description.trim() || !date.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      service: selectedService,
      description,
      date,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar user={user} onLogout={logout} />

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            to="/customer/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-md">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Create an Open Service Request
            </h1>
            <p className="text-muted-foreground mb-6">
              This request will be visible to all relevant vendors.
            </p>

            {!user && (
              <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-xl mb-6">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Login Required</p>
                  <p className="text-sm text-muted-foreground">
                    Please{" "}
                    <Link to="/auth/login" className="text-primary hover:underline">
                      login
                    </Link>{" "}
                    or{" "}
                    <Link
                      to="/auth/register"
                      className="text-primary hover:underline"
                    >
                      register
                    </Link>{" "}
                    to submit a service request.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div className="space-y-2">
                <Label htmlFor="service">Service Type *</Label>
                {isLoadingServices ? (
                  <p>Loading services...</p>
                ) : (
                  <Select
                    value={selectedService}
                    onValueChange={setSelectedService}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s._id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Problem Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Describe Your Problem *</Label>
                <Textarea
                  id="description"
                  placeholder="Please describe the issue or service you need in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Date & Time */}
              <div className="space-y-2">
                <Label htmlFor="date">Appointment Date & Time *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Submitting..." : "Submit Open Request"}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OpenServiceRequestPage;
