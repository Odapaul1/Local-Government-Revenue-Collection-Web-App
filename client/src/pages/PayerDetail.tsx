import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, User, Phone, MapPin, Building, CreditCard, Plus, Eye, CheckCircle, XCircle, AlertCircle, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function PayerDetail({ params }: { params: { id: string } }) {
  const payerId = parseInt(params.id);
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isTxDialogOpen, setIsTxDialogOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    revenueCategoryId: "",
    amountDue: "",
    description: "",
  });

  const { data: payer, isLoading, refetch: refetchPayer } = trpc.payer.getById.useQuery({ id: payerId });
  const { data: transactions, isLoading: txsLoading, refetch: refetchTxs } = trpc.payer.getPaymentHistory.useQuery({ id: payerId });
  const { data: categories } = trpc.revenueCategory.list.useQuery();

  const createTxMutation = trpc.transaction.create.useMutation();

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTxMutation.mutateAsync({
        payerId,
        revenueCategoryId: parseInt(txForm.revenueCategoryId),
        amountDue: txForm.amountDue,
        description: txForm.description || undefined,
      });
      toast.success("Transaction initiated successfully");
      setIsTxDialogOpen(false);
      setTxForm({
        revenueCategoryId: "",
        amountDue: "",
        description: "",
      });
      refetchTxs();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!payer) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Payer not found.</p>
          <Button onClick={() => navigate("/payers")} className="mt-4">
            Back to Payers
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrency = (val: string | number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(typeof val === "string" ? parseFloat(val) : val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1 border-0"><CheckCircle className="w-3 h-3" /> Paid</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1 border-0"><XCircle className="w-3 h-3" /> Failed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 flex items-center gap-1 border-0"><AlertCircle className="w-3 h-3" /> Pending</Badge>;
    }
  };

  const canCreateTx = user?.role === "Revenue Collector" || user?.role === "LGA Admin";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/payers")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{payer.name}</h1>
              <Badge variant="outline" className="capitalize">
                {payer.payerType}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Taxpayer ID: {payer.taxpayerId || "N/A"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Payer demographic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Payer Name</span>
                    <span className="font-semibold text-sm">{payer.name}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Taxpayer ID</span>
                    <span className="font-semibold text-sm font-mono">{payer.taxpayerId || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Contact Details</span>
                    <span className="font-semibold text-sm">{payer.contactDetails || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Address</span>
                    <span className="font-semibold text-sm">{payer.address || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Local Government Area (LGA)</span>
                    <span className="font-semibold text-sm">{payer.lgaName || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {canCreateTx && (
              <Dialog open={isTxDialogOpen} onOpenChange={setIsTxDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Initiate Transaction</DialogTitle>
                    <DialogDescription>
                      Create a new pending transaction for {payer.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTransaction} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Revenue Category</Label>
                      <Select
                        value={txForm.revenueCategoryId}
                        onValueChange={(val) => {
                          const cat = categories?.find((c) => c.id === parseInt(val));
                          setTxForm({
                            ...txForm,
                            revenueCategoryId: val,
                            amountDue: cat?.amountType === "fixed" ? cat.fixedAmount?.toString() || "" : "",
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select revenue category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name} ({cat.amountType === "fixed" ? formatCurrency(cat.fixedAmount || 0) : "Variable"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amountDue">Amount Due (NGN)</Label>
                      <Input
                        id="amountDue"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={txForm.amountDue}
                        onChange={(e) => setTxForm({ ...txForm, amountDue: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description / Narration</Label>
                      <Input
                        id="description"
                        placeholder="e.g., Q3 2026 Shop permit levy"
                        value={txForm.description}
                        onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsTxDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={createTxMutation.isPending}>
                        {createTxMutation.isPending ? "Creating..." : "Initiate"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm h-full">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Payment logs for this taxpayer</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {txsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : transactions && transactions.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-sm">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-semibold text-sm">
                              {tx.categoryName}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatCurrency(tx.amountDue)}
                            </TableCell>
                            <TableCell>{getStatusBadge(tx.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => navigate(`/transactions/${tx.id}`)}
                              >
                                <Eye className="w-4 h-4 text-muted-foreground" />
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
                      No payments or pending receipts exist for this taxpayer.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
