import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft } from "lucide-react";
import api from "@/lib/axios";
import { categories as staticCategories } from "@/data/services"; // Import static categories

const fetchServices = async () => {
  const { data } = await api.get("/services");
  return data;
};

const CategoriesPage = () => {
  const { user, logout } = useAuth();

  const {
    data: services,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  const categories = services
    ? Object.values(
        services.reduce((acc, service) => {
          if (!acc[service.category]) {
            acc[service.category] = {
              id: service.category.toLowerCase().replace(/ /g, "-"),
              name: service.category,
              services: [],
            };
          }
          acc[service.category].services.push(service);
          return acc;
        }, {})
      ).map((dynamicCategory) => {
        // Merge with static category data to get icon and description
        const staticCategory = staticCategories.find(
          (sc) => sc.name === dynamicCategory.name
        );
        return staticCategory
          ? { ...dynamicCategory, icon: staticCategory.icon, description: staticCategory.description }
          : dynamicCategory;
      })
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar user={user} onLogout={logout} />

      <main className="flex-1">
        {/* Header */}
        <section className="py-10 bg-gradient-hero">
          <div className="container mx-auto px-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              All Service Categories
            </h1>
            <p className="text-muted-foreground mt-2">
              Browse through our comprehensive list of services
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading && <p>Loading categories...</p>}
            {isError && <p>Error fetching categories.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CategoriesPage;
