import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

const AdminVendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/vendors");
        setVendors(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch vendors");
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const handleDelete = async (vendorId) => {
    try {
      await api.delete(`/admin/vendors/${vendorId}`);
      setVendors(vendors.filter((vendor) => vendor._id !== vendorId));
      toast({
        title: "Vendor Deleted",
        description: "The vendor has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vendor.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Manage Vendors
        </h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor._id}>
                <TableCell>{vendor.user.name}</TableCell>
                <TableCell>{vendor.user.email}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(vendor._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  );
};

export default AdminVendorsPage;