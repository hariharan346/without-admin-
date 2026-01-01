import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";

import Index from "./pages/Index";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VendorRegisterPage from "./pages/auth/VendorRegisterPage";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import VendorDashboard from "./pages/dashboard/VendorDashboard";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryPage from "./pages/CategoryPage";
import ServicePage from "./pages/ServicePage";
import VendorProfilePage from "./pages/VendorProfilePage";
import ServiceRequestPage from "./pages/ServiceRequestPage";
import OpenServiceRequestPage from "./pages/OpenServiceRequestPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Index />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/vendor-register" element={<VendorRegisterPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/service/:serviceId" element={<ServicePage />} />
        <Route path="/vendor/:vendorId" element={<VendorProfilePage />} />
        <Route path="/request/:vendorId" element={<ServiceRequestPage />} />
        <Route path="/job/:jobId" element={<JobDetailsPage />} />

        {/* CUSTOMER */}
        <Route element={<ProtectedRoute role="user" />}>
          <Route
            path="/customer/dashboard"
            element={<CustomerDashboard />}
          />
          <Route path="/open-request" element={<OpenServiceRequestPage />} />
        </Route>

        {/* VENDOR */}
        <Route element={<ProtectedRoute role="vendor" />}>
          <Route
            path="/vendor/dashboard"
            element={<VendorDashboard />}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
