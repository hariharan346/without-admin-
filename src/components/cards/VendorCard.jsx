import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Phone, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const VendorCard = ({ vendor, serviceId, index = 0 }) => {
  return (
    <div
      className="bg-card rounded-2xl p-6 border border-border card-hover animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Vendor Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-foreground">
                  {vendor.user.name}
                </h3>
                {vendor.isAvailable ? (
                  <Badge
                    variant="default"
                    className="bg-success text-success-foreground text-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <XCircle className="w-3 h-3 mr-1" />
                    Unavailable
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {vendor.companyName}
              </p>
              {vendor.minPrice && vendor.maxPrice && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-foreground">Price Range</p>
                  <p className="text-lg font-semibold text-primary">
                    ${vendor.minPrice} - ${vendor.maxPrice}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Rating & Location */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              <span>{vendor.location}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 lg:w-40">
          <Button asChild variant="default" className="w-full">
            <Link
              to={`/vendor/${vendor._id}${
                serviceId ? `?service=${serviceId}` : ""
              }`}
            >
              View Profile
            </Link>
          </Button>
          {vendor.isAvailable && (
            <Button asChild variant="hero" className="w-full">
              <Link
                to={`/request/${vendor._id}${
                  serviceId ? `?service=${serviceId}` : ""
                }`}
              >
                Request Service
              </Link>
            </Button>
          )}
          <a
            href={`tel:${vendor.phone}`}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-2"
          >
            <Phone className="w-4 h-4" />
            Call Now
          </a>
        </div>
      </div>
    </div>
  );
};
