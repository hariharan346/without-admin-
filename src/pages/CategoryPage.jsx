import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { categories as staticCategories } from "@/data/services";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft } from "lucide-react";
import api from "@/lib/axios";

const fetchServices = async () => {
  const { data } = await api.get("/services");
  return data;
};

const CategoryPage = () => {
  const { categoryId } = useParams();
  const { user, logout } = useAuth();

  const {
    data: services,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  const category = staticCategories.find((c) => c.id === categoryId);
  const filteredServices = services?.filter(
    (s) => s.category === category?.name
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar user={user} onLogout={logout} />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar user={user} onLogout={logout} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Category Not Found
            </h1>
            <Link to="/categories" className="text-primary hover:underline">
              Browse all categories
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = category.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar user={user} onLogout={logout} />

      <main className="flex-1">
        {/* Header */}
        <section className="py-10 bg-gradient-hero">
          <div className="container mx-auto px-4">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              All Categories
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {category.name}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {category.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Available Services ({filteredServices.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service, index) => {
                const staticService = category.services.find(
                  (s) => s.name === service.name
                );
                if (!staticService) return null;
                return (
                  <ServiceCard
                    key={service._id}
                    service={{ ...service, ...staticService }}
                    index={index}
                  />
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
