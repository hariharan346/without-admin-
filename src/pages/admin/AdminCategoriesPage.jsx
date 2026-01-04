import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash } from "lucide-react";

// --- API Functions ---
const fetchCategories = async () => {
  const { data } = await api.get("/categories");
  return data;
};

const createCategory = async (newCategory) => {
  const { data } = await api.post("/categories", newCategory, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const updateCategory = async ({ id, updatedCategory }) => {
  const { data } = await api.put(`/categories/${id}`, updatedCategory, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const deleteCategory = async (id) => {
  await api.delete(`/categories/${id}`);
};

const createSubCategory = async (newSubCategory) => {
  const { data } = await api.post(`/subcategories`, newSubCategory, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const updateSubCategory = async ({ id, updatedSubCategory }) => {
  const { data } = await api.put(`/subcategories/${id}`, updatedSubCategory, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const deleteSubCategory = async (id) => {
  await api.delete(`/subcategories/${id}`);
};

const createService = async (newService) => {
  const { data } = await api.post(`/services`, newService, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const updateService = async ({ id, updatedService }) => {
  const { data } = await api.put(`/services/${id}`, updatedService, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const deleteService = async (id) => {
  await api.delete(`/services/${id}`);
};

// --- Main Component ---
const AdminCategoriesPage = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
  
    const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
    const [isSubCategoryFormOpen, setIsSubCategoryFormOpen] = useState(false);
    const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  
    const [categoryFormData, setCategoryFormData] = useState({ name: "", description: "" });
    const [subcategoryFormData, setSubcategoryFormData] = useState({ name: "", description: "" });
    const [serviceFormData, setServiceFormData] = useState({ name: "", description: "" });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
  
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingSubCategory, setEditingSubCategory] = useState(null);
    const [editingService, setEditingService] = useState(null);
  
    const [currentCategoryId, setCurrentCategoryId] = useState(null);
    const [currentSubCategoryId, setCurrentSubCategoryId] = useState(null);
  
    // Fetch Categories
    const {
      data: categories,
      isLoading: isLoadingCategories,
      isError: isErrorCategories,
    } = useQuery({
      queryKey: ["categories"],
      queryFn: fetchCategories,
    });
  
    // --- Mutations ---
  
    // Category Mutations
    const categoryCreateMutation = useMutation({
      mutationFn: createCategory,
      onSuccess: () => {
        queryClient.invalidateQueries(["categories"]);
        toast({ title: "Category created" });
        setIsCategoryFormOpen(false);
      },
      onError: (error) => toast({ title: "Error", description: error.response?.data?.message, variant: "destructive" }),
    });
  
    const categoryUpdateMutation = useMutation({
      mutationFn: updateCategory,
      onSuccess: () => {
        queryClient.invalidateQueries(["categories"]);
        toast({ title: "Category updated" });
        setIsCategoryFormOpen(false);
      },
      onError: (error) => toast({ title: "Error", description: error.response?.data?.message, variant: "destructive" }),
    });
  
    const categoryDeleteMutation = useMutation({
      mutationFn: deleteCategory,
      onSuccess: () => {
        queryClient.invalidateQueries(["categories"]);
        toast({ title: "Category deleted" });
      },
      onError: (error) => toast({ title: "Error", description: error.response?.data?.message, variant: "destructive" }),
    });
  
    // SubCategory Mutations
    const subCategoryCreateMutation = useMutation({
      mutationFn: createSubCategory,
      onSuccess: () => {
        queryClient.invalidateQueries(["categories"]);
        toast({ title: "Subcategory created" });
        setIsSubCategoryFormOpen(false);
      },
      onError: (error) => toast({ title: "Error", description: error.response?.data?.message, variant: "destructive" }),
    });

    const subCategoryUpdateMutation = useMutation({
        mutationFn: updateSubCategory,
        onSuccess: () => {
          queryClient.invalidateQueries(["categories"]);
          toast({ title: "Subcategory updated" });
          setIsSubCategoryFormOpen(false);
        },
        onError: (error) => toast({ title: "Error", description: error.response?.data?.message, variant: "destructive" }),
      });
    
      const subCategoryDeleteMutation = useMutation({
        mutationFn: deleteSubCategory,
        onSuccess: () => {
          queryClient.invalidateQueries(["categories"]);
          toast({ title: "Subcategory deleted" });
        },
        onError: (error) => toast({ title: "Error", description: error.response?.data?.message, variant: "destructive" }),
      });
  
    // Service Mutations
    const serviceCreateMutation = useMutation({
      mutationFn: createService,
      onSuccess: () => {
        queryClient.invalidateQueries(["categories"]);
        toast({ title: "Service created" });
        setIsServiceFormOpen(false);
      },
      onError: (error) => toast({ title: "Error", description: error.response?.data?.message, variant: "destructive" }),
    });

    const serviceUpdateMutation = useMutation({
        mutationFn: updateService,
        onSuccess: () => {
          queryClient.invalidateQueries(["categories"]);
          toast({ title: "Service updated" });
          setIsServiceFormOpen(false);
        },
        onError: (error) => toast({ title: "Error", description: error.response?.data?.message, variant: "destructive" }),
      });
    
      const serviceDeleteMutation = useMutation({
        mutationFn: deleteService,
        onSuccess: () => {
          queryClient.invalidateQueries(["categories"]);
          toast({ title: "Service deleted" });
        },
        onError: (error) => toast({ title: "Error", description: error.response?.data?.message, variant: "destructive" }),
      });
  
    // --- Handlers ---
  
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCategoryFormSubmit = () => {
        const formData = new FormData();
        formData.append("name", categoryFormData.name);
        formData.append("description", categoryFormData.description);
        if (imageFile) {
            formData.append("image", imageFile);
        }

      if (editingCategory) {
        categoryUpdateMutation.mutate({ id: editingCategory._id, updatedCategory: formData });
      } else {
        categoryCreateMutation.mutate(formData);
      }
    };
  
    const handleSubCategoryFormSubmit = () => {
        const formData = new FormData();
        formData.append("name", subcategoryFormData.name);
        formData.append("description", subcategoryFormData.description);
        if (currentCategoryId) {
            formData.append("category", currentCategoryId);
        }
        if (imageFile) {
            formData.append("image", imageFile);
        }

      if (editingSubCategory) {
        subCategoryUpdateMutation.mutate({ id: editingSubCategory._id, updatedSubCategory: formData });
      } else {
        subCategoryCreateMutation.mutate(formData);
      }
    };
  
    const handleServiceFormSubmit = () => {
        const formData = new FormData();
        formData.append("name", serviceFormData.name);
        formData.append("description", serviceFormData.description);
        if (imageFile) {
            formData.append("image", imageFile);
        }

      if (editingService) {
        serviceUpdateMutation.mutate({ id: editingService._id, updatedService: formData });
      } else {
        serviceCreateMutation.mutate(formData);
      }
    };

    const openCategoryDialog = (category = null) => {
        setEditingCategory(category);
        setCategoryFormData(category ? { name: category.name, description: category.description } : { name: "", description: "" });
        setImageFile(null);
        setImagePreview(category?.image ? `${api.defaults.baseURL}${category.image}`: "");
        setIsCategoryFormOpen(true);
      };
      
      const openSubCategoryDialog = (categoryId, subCategory = null) => {
        setCurrentCategoryId(categoryId);
        setEditingSubCategory(subCategory);
        setSubcategoryFormData(subCategory ? { name: subCategory.name, description: subCategory.description } : { name: "", description: "" });
        setImageFile(null);
        setImagePreview(subCategory?.image ? `${api.defaults.baseURL}${subCategory.image}`: "");
        setIsSubCategoryFormOpen(true);
      };
      
      const openServiceDialog = (subCategoryId, service = null) => {
        setCurrentSubCategoryId(subCategoryId);
        setEditingService(service);
        setServiceFormData(service ? { name: service.name, description: service.description } : { name: "", description: "" });
        setImageFile(null);
        setImagePreview(service?.image ? `${api.defaults.baseURL}${service.image}`: "");
        setIsServiceFormOpen(true);
      };

    if (isLoadingCategories) return <p>Loading...</p>;
    if (isErrorCategories) return <p>Error loading categories.</p>;

    return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-foreground">Manage Categories, Subcategories, and Services</h1>
              <Button onClick={() => openCategoryDialog()}>Add Category</Button>
            </div>
    
            <Accordion type="single" collapsible className="w-full">
              {categories.map((category) => (
                <AccordionItem value={category._id} key={category._id}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full items-center pr-4">
                      <div className="flex items-center gap-4">
                        <img src={`${api.defaults.baseURL}${category.image}`} alt={category.name} className="w-12 h-12 rounded-md object-cover" />
                        <span>{category.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={(e) => {e.stopPropagation(); openCategoryDialog(category);}}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={(e) => {e.stopPropagation(); categoryDeleteMutation.mutate(category._id);}}>Delete</Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Subcategories</h4>
                        <Button size="sm" onClick={() => openSubCategoryDialog(category._id)}>Add Subcategory</Button>
                      </div>
                      {category.subcategories?.map((sub) => (
                        <Accordion type="single" collapsible className="w-full pl-4" key={sub._id}>
                          <AccordionItem value={sub._id}>
                            <AccordionTrigger>
                                <div className="flex justify-between w-full items-center pr-4">
                                  <div className="flex items-center gap-4">
                                    <img src={`${api.defaults.baseURL}${sub.image}`} alt={sub.name} className="w-10 h-10 rounded-md object-cover" />
                                    <span>{sub.name}</span>
                                  </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={(e) => {e.stopPropagation(); openSubCategoryDialog(category._id, sub);}}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={(e) => {e.stopPropagation(); subCategoryDeleteMutation.mutate(sub._id);}}>Delete</Button>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pl-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-semibold">Services</h5>
                                    <Button size="sm" onClick={() => openServiceDialog(sub._id)}>Add Service</Button>
                                </div>
                                {sub.services?.map((service) => (
                                    <div key={service._id} className="flex justify-between items-center p-2 rounded-md">
                                        <div className="flex items-center gap-4">
                                          <img src={`${api.defaults.baseURL}${service.image}`} alt={service.name} className="w-8 h-8 rounded-md object-cover" />
                                          <span>{service.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openServiceDialog(sub._id, service)}>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => serviceDeleteMutation.mutate(service._id)}>Delete</Button>
                                        </div>
                                    </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
    
            {/* Category Dialog */}
            <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingCategory ? "Edit" : "Add"} Category</DialogTitle></DialogHeader>
                <Input placeholder="Name" value={categoryFormData.name} onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})} />
                <Textarea placeholder="Description" value={categoryFormData.description} onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})} />
                <Input type="file" onChange={handleFileChange} />
                {imagePreview && <img src={imagePreview} alt="preview" className="w-32 h-32 object-cover" />}
                <DialogFooter><Button onClick={handleCategoryFormSubmit}>Save</Button></DialogFooter>
              </DialogContent>
            </Dialog>

            {/* SubCategory Dialog */}
            <Dialog open={isSubCategoryFormOpen} onOpenChange={setIsSubCategoryFormOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingSubCategory ? "Edit" : "Add"} Subcategory</DialogTitle></DialogHeader>
                    <Input placeholder="Name" value={subcategoryFormData.name} onChange={(e) => setSubcategoryFormData({...subcategoryFormData, name: e.target.value})} />
                    <Textarea placeholder="Description" value={subcategoryFormData.description} onChange={(e) => setSubcategoryFormData({...subcategoryFormData, description: e.target.value})} />
                    <Input type="file" onChange={handleFileChange} />
                    {imagePreview && <img src={imagePreview} alt="preview" className="w-32 h-32 object-cover" />}
                    <DialogFooter><Button onClick={handleSubCategoryFormSubmit}>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Service Dialog */}
            <Dialog open={isServiceFormOpen} onOpenChange={setIsServiceFormOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingService ? "Edit" : "Add"} Service</DialogTitle></DialogHeader>
                    <Input placeholder="Name" value={serviceFormData.name} onChange={(e) => setServiceFormData({...serviceFormData, name: e.target.value})} />
                    <Textarea placeholder="Description" value={serviceFormData.description} onChange={(e) => setServiceFormData({...serviceFormData, description: e.target.value})} />
                    <Input type="file" onChange={handleFileChange} />
                    {imagePreview && <img src={imagePreview} alt="preview" className="w-32 h-32 object-cover" />}
                    <DialogFooter><Button onClick={handleServiceFormSubmit}>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>

          </main>
        </div>
      );
}

export default AdminCategoriesPage;