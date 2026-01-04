import { Link } from "react-router-dom";
import api from "@/lib/axios";

export const CategoryCard = ({ category, index = 0 }) => {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="group block"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="bg-card rounded-2xl p-6 border border-border card-hover h-full">
        <div className="flex flex-col items-center text-center gap-4">
          <img
            src={`${api.defaults.baseURL}${category.image}`}
            alt={category.name}
            className="w-16 h-16 rounded-2xl object-cover bg-primary-light group-hover:scale-110 transition-all duration-300"
          />
          <div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {category.description}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {category.services.length} services
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};
