import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Building2, Search } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function LGAManagement() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    code: "",
  });

  const { data: lgas, isLoading, refetch } = trpc.lga.list.useQuery();
  const createMutation = trpc.lga.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync(formData);
      toast.success("LGA created successfully");
      setIsOpen(false);
      setFormData({
        name: "",
        state: "",
        code: "",
      });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      name: "",
      state: "",
      code: "",
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

  const filteredLgas = lgas?.filter(
    (lga) =>
      lga.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lga.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lga.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">LGA Management</h1>
            <p className="text-muted-foreground mt-1">
              Configure and manage Local Government Areas
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleClose()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New LGA
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Local Government Area</DialogTitle>
                <DialogDescription>
                  Add a new LGA to the platform registry.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">LGA Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Ikeja"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="e.g., Lagos"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">LGA Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="e.g., LG-IKJ"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create LGA"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2 bg-background border rounded-lg px-3 py-2 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search LGAs by name, state, or code..."
            className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle>Registered LGAs</CardTitle>
            <CardDescription>
              A list of all Local Government Areas configured in the system.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : filteredLgas && filteredLgas.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>LGA Name</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLgas.map((lga) => (
                      <TableRow key={lga.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {lga.name}
                        </TableCell>
                        <TableCell>{lga.state}</TableCell>
                        <TableCell>
                          <code className="px-2 py-0.5 rounded bg-muted text-xs font-mono">
                            {lga.code}
                          </code>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{lga.id}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg border-dashed">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold text-lg">No LGAs Found</h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery ? "No LGAs match your search query." : "Get started by adding a new LGA."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
