import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Users, Store, FileText, CheckCircle2, Clock } from "lucide-react";

// Fetch overview statistics
const fetchOverviewStats = async () => {
  const { data } = await api.get("/admin/overview-stats");
  return data;
};

// Fetch all service requests for admin
const fetchAllServiceRequests = async () => {
  const { data } = await api.get("/admin/requests");
  return data;
};

const AdminDashboardPage = () => {
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
  } = useQuery({
    queryKey: ["adminOverviewStats"],
    queryFn: fetchOverviewStats,
  });

  const {
    data: serviceRequests,
    isLoading: isLoadingRequests,
    isError: isErrorRequests,
  } = useQuery({
    queryKey: ["adminServiceRequests"],
    queryFn: fetchAllServiceRequests,
  });

  if (isLoadingStats || isLoadingRequests) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8 px-4">
          <p>Loading admin dashboard...</p>
        </main>
      </div>
    );
  }

  if (isErrorStats || isErrorRequests) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8 px-4">
          <p>Error fetching dashboard data.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <Button asChild>
            <Link to="/admin/categories">Manage Categories</Link>
          </Button>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Including customers and admins
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Vendors
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalVendors}</div>
              <p className="text-xs text-muted-foreground">
                Service Providers on platform
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalServiceRequests}
              </div>
              <p className="text-xs text-muted-foreground">
                All time service requests
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Requests
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalPendingRequests}
              </div>
              <p className="text-xs text-muted-foreground">
                Requests awaiting action
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Requests
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalCompletedRequests}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully finished requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for Charts/Analytics */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Request Statistics (Coming Soon)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Charts and more detailed analytics will be displayed here.
              </p>
              {/* You can add simple text-based summaries here if needed from serviceRequests */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Recent Requests:</h3>
                {serviceRequests && serviceRequests.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {serviceRequests.slice(0, 5).map((req) => (
                      <li key={req._id}>
                        {req.service.name} by {req.user.name} (Status:{" "}
                        {req.status})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No requests found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;