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
import { Plus, Eye, Search, FileText } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function Transactions() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    payerId: "",
    revenueCategoryId: "",
    amountDue: "",
    description: "",
  });

  const { data: transactions, isLoading, refetch } = trpc.transaction.list.useQuery({
    status: statusFilter === "all" ? undefined : (statusFilter as any),
  });
  const { data: payers } = trpc.payer.list.useQuery({});
  const { data: categories } = trpc.revenueCategory.list.useQuery();
  const createMutation = trpc.transaction.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        payerId: parseInt(formData.payerId),
        revenueCategoryId: parseInt(formData.revenueCategoryId),
        amountDue: formData.amountDue,
        description: formData.description,
      });
      toast.success("Transaction created successfully");
      setIsOpen(false);
      setFormData({
        payerId: "",
        revenueCategoryId: "",
        amountDue: "",
        description: "",
      });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      payerId: "",
      revenueCategoryId: "",
      amountDue: "",
      description: "",
    });
  };

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(parseFloat(value || "0"));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 hover:bg-green-100 border-0";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-0";
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-100 border-0";
      default:
        return "outline";
    }
  };

  const filteredTransactions = transactions?.filter((tx: any) => {
    const query = searchQuery.toLowerCase();
    return (
      tx.id.toString().includes(query) ||
      (tx.payerName || "").toLowerCase().includes(query) ||
      (tx.categoryName || "").toLowerCase().includes(query) ||
      (tx.paymentReference || "").toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track revenue collection transactions
            </p>
          </div>
          {(user?.role === "Revenue Collector" || user?.role === "LGA Admin") && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleClose} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Transaction</DialogTitle>
                  <DialogDescription>
                    Initiate a new revenue collection transaction
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="payer">Payer</Label>
                    <Select
                      value={formData.payerId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, payerId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payer" />
                      </SelectTrigger>
                      <SelectContent>
                        {payers?.map((payer: any) => (
                          <SelectItem key={payer.id} value={payer.id.toString()}>
                            {payer.name} ({payer.lgaName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Revenue Category</Label>
                    <Select
                      value={formData.revenueCategoryId}
                      onValueChange={(value) => {
                        const cat = categories?.find((c) => c.id === parseInt(value));
                        setFormData({ 
                          ...formData, 
                          revenueCategoryId: value,
                          amountDue: cat?.amountType === "fixed" ? cat.fixedAmount?.toString() || "" : ""
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category: any) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name} ({category.amountType === "fixed" ? formatCurrency(category.fixedAmount || 0) : "Variable"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount Due (NGN)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amountDue}
                      onChange={(e) =>
                        setFormData({ ...formData, amountDue: e.target.value })
                      }
                      placeholder="0.00"
                      step="0.01"
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
                      placeholder="Transaction details"
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
                    <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center space-x-2 bg-background border rounded-lg px-3 py-2 max-w-sm flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID, payer, category, ref..."
              className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-[180px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle>Transactions List</CardTitle>
            <CardDescription>
              {filteredTransactions?.length || 0} matching transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredTransactions && filteredTransactions.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>LGA</TableHead>
                      <TableHead>Amount Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-semibold text-xs">
                          #{transaction.id}
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {transaction.payerName || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {transaction.categoryName || "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {transaction.lgaName || "—"}
                        </TableCell>
                        <TableCell className="font-semibold text-sm">
                          {formatCurrency(transaction.amountDue)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {transaction.paymentReference || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/transactions/${transaction.id}`)}>
                            <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg border-dashed">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold text-sm">No Transactions Found</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a new transaction or adjust your filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
