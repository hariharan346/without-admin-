import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


const fetchCategoriesWithServices = async () => {
  const { data } = await api.get("/categories"); // Assuming this endpoint returns categories populated with services
  return data;
};

const VendorRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
    location: "",
  });
  const [selectedSubServices, setSelectedSubServices] = useState([]); // Stores array of service _ids
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategoriesWithServices,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSubServices.length === 0) {
      toast({
        title: "Select Services",
        description: "Please select at least one service.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await register({
        ...formData,
        role: "vendor",
        servicesProvided: selectedSubServices, // Send array of service _ids
      });
      setIsLoading(false);

      toast({
        title: "Welcome!",
        description: "Your shop has been registered.",
      });
      navigate("/vendor/dashboard");
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Email already exists or invalid data.",
        variant: "destructive",
      });
    }
  };

  const toggleSubService = (subServiceId) => {
    setSelectedSubServices((prev) =>
      prev.includes(subServiceId)
        ? prev.filter((id) => id !== subServiceId)
        : [...prev, subServiceId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-10 px-4">
        <div className="container max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Register Your Shop
            </h1>
            <p className="text-muted-foreground mt-2">
              Join ServiConnect as a service provider
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <hr className="border-border" />

              <div className="space-y-2">
                <Label>Shop / Business Name</Label>
                <Input
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Services Offered *</Label>
                {isLoadingCategories ? (
                  <p>Loading services...</p>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {categories && categories.map((category) => (
                      <AccordionItem value={category._id} key={category._id}>
                        <AccordionTrigger>{category.name}</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2">
                            {category.subcategories.map((subcategory) => (
                              <label
                                key={subcategory._id}
                                className="flex items-center gap-2 text-sm cursor-pointer"
                              >
                                <Checkbox
                                  checked={selectedSubServices.includes(subcategory._id)}
                                  onCheckedChange={() => toggleSubService(subcategory._id)}
                                />
                                {subcategory.name}
                              </label>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register Shop"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already registered?{" "}
              <Link to="/auth/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorRegisterPage;
