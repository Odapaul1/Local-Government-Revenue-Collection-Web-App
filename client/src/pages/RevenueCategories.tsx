import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function RevenueCategories() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amountType: "fixed" as "fixed" | "variable",
    fixedAmount: "",
    calculationLogic: "",
  });

  const { data: categories, isLoading, refetch } = trpc.revenueCategory.list.useQuery();
  const createMutation = trpc.revenueCategory.create.useMutation();
  const updateMutation = trpc.revenueCategory.update.useMutation();
  const deleteMutation = trpc.revenueCategory.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("Revenue category updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Revenue category created successfully");
      }
      setIsOpen(false);
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        amountType: "fixed",
        fixedAmount: "",
        calculationLogic: "",
      });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || "",
      amountType: category.amountType,
      fixedAmount: category.fixedAmount?.toString() || "",
      calculationLogic: category.calculationLogic || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this revenue category?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Revenue category deleted successfully");
        refetch();
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      amountType: "fixed",
      fixedAmount: "",
      calculationLogic: "",
    });
  };

  if (user?.role !== "Super Admin") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Revenue Categories</h1>
            <p className="text-muted-foreground mt-1">
              Manage revenue types and collection categories
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleClose()}>
                <Plus className="w-4 h-4 mr-2" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Revenue Category" : "Create Revenue Category"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Update the revenue category details"
                    : "Add a new revenue collection category"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Market Levies"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe this revenue category"
                  />
                </div>

                <div>
                  <Label htmlFor="amountType">Amount Type</Label>
                  <Select
                    value={formData.amountType}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, amountType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="variable">Variable Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.amountType === "fixed" && (
                  <div>
                    <Label htmlFor="fixedAmount">Fixed Amount (NGN)</Label>
                    <Input
                      id="fixedAmount"
                      type="number"
                      value={formData.fixedAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, fixedAmount: e.target.value })
                      }
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                )}

                {formData.amountType === "variable" && (
                  <div>
                    <Label htmlFor="calculationLogic">Calculation Logic</Label>
                    <Textarea
                      id="calculationLogic"
                      value={formData.calculationLogic}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          calculationLogic: e.target.value,
                        })
                      }
                      placeholder="e.g., percentage_of_property_value"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingId ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
            <CardDescription>
              {categories?.length || 0} revenue categories configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category: any) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {category.amountType === "fixed"
                              ? "Fixed"
                              : "Variable"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {category.amountType === "fixed"
                            ? `₦${parseFloat(
                                category.fixedAmount || "0"
                              ).toLocaleString()}`
                            : "Calculated"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Active</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No revenue categories yet. Create one to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
