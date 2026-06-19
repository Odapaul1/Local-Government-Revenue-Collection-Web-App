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
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function Payers() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactDetails: "",
    taxpayerId: "",
    lgaId: "",
    payerType: "individual" as "individual" | "business" | "organization",
  });

  const { data: payers, isLoading, refetch } = trpc.payer.list.useQuery({});
  const { data: lgas, isLoading: isLgasLoading } = trpc.lga.list.useQuery();
  const createMutation = trpc.payer.create.useMutation();
  const updateMutation = trpc.payer.update.useMutation();
  const deleteMutation = trpc.payer.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name,
          address: formData.address,
          contactDetails: formData.contactDetails,
          taxpayerId: formData.taxpayerId,
          payerType: formData.payerType,
        });
        toast.success("Payer updated successfully");
      } else {
        const lgaIdNum = formData.lgaId !== "" ? parseInt(formData.lgaId, 10) : undefined;
        if (!formData.lgaId) {
          toast.error("Please select a Local Government Area");
          return;
        }
        if (Number.isNaN(lgaIdNum)) {
          toast.error("Please select a valid LGA");
          return;
        }

        await createMutation.mutateAsync({
          name: formData.name,
          address: formData.address,
          contactDetails: formData.contactDetails,
          taxpayerId: formData.taxpayerId,
          lgaId: lgaIdNum,
          payerType: formData.payerType,
        });
        toast.success("Payer created successfully");
      }
      setIsOpen(false);
      setEditingId(null);
      setFormData({
        name: "",
        address: "",
        contactDetails: "",
        taxpayerId: "",
        lgaId: "",
        payerType: "individual",
      });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const handleEdit = (payer: any) => {
    setEditingId(payer.id);
    setFormData({
      name: payer.name,
      address: payer.address || "",
      contactDetails: payer.contactDetails || "",
      taxpayerId: payer.taxpayerId || "",
      lgaId: payer.lgaId !== null && payer.lgaId !== undefined ? payer.lgaId.toString() : "",
      payerType: payer.payerType,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this payer?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Payer deleted successfully");
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
      address: "",
      contactDetails: "",
      taxpayerId: "",
      lgaId: "",
      payerType: "individual",
    });
  };

  const canManage = user?.role === "Super Admin" || user?.role === "LGA Admin";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payers</h1>
            <p className="text-muted-foreground mt-1">
              Manage taxpayers and revenue payers
            </p>
          </div>
          {canManage && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleClose}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Payer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit Payer" : "Create Payer"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingId
                      ? "Update the payer details"
                      : "Add a new payer to the system"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Payer name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="payerType">Payer Type</Label>
                    <Select
                      value={formData.payerType}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, payerType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="organization">Organization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {!editingId && (
                    <div>
                      <Label htmlFor="lgaId">Local Government Area</Label>
                      <Select
                        value={formData.lgaId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, lgaId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isLgasLoading ? "Loading LGAs..." : "Select LGA"} />
                        </SelectTrigger>
                        <SelectContent>
                          {isLgasLoading ? (
                            <SelectItem value="__loading__" disabled>
                              Loading LGAs...
                            </SelectItem>
                          ) : lgas && lgas.length > 0 ? (
                            lgas.map((lga: any) => (
                              <SelectItem key={lga.id} value={lga.id.toString()}>
                                {lga.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="__none__" disabled>
                              No LGAs available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Full address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact">Contact Details</Label>
                    <Input
                      id="contact"
                      value={formData.contactDetails}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactDetails: e.target.value,
                        })
                      }
                      placeholder="Phone number or email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="taxpayerId">Taxpayer ID</Label>
                    <Input
                      id="taxpayerId"
                      value={formData.taxpayerId}
                      onChange={(e) =>
                        setFormData({ ...formData, taxpayerId: e.target.value })
                      }
                      placeholder="Optional taxpayer ID"
                    />
                  </div>

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
          )}
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>All Payers</CardTitle>
            <CardDescription>
              {payers?.length || 0} payers in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : payers && payers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Taxpayer ID</TableHead>
                      <TableHead>LGA Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payers.map((payer: any) => (
                      <TableRow key={payer.id}>
                        <TableCell className="font-semibold text-sm">
                          {payer.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {payer.payerType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payer.contactDetails || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {payer.taxpayerId || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payer.lgaName || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/payers/${payer.id}`)}>
                              <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                            {canManage && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(payer)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(payer.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </>
                            )}
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
                  No payers yet. Create one to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
