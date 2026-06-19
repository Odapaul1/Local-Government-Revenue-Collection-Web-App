import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Calendar, User, Building, Landmark, FileText, CheckCircle, XCircle, AlertCircle, Receipt, ArrowRight, Info } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function TransactionDetail({ params }: { params: { id: string } }) {
  const transactionId = parseInt(params.id);
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: "paid" as "pending" | "paid" | "failed",
    reason: "",
    amountPaid: "",
  });

  const { data: transaction, isLoading, refetch } = trpc.transaction.getById.useQuery({ id: transactionId });
  const { data: statusHistory, isLoading: historyLoading } = trpc.transaction.getStatusHistory.useQuery({ id: transactionId });
  const { data: receipt, refetch: refetchReceipt } = trpc.receipt.getByTransactionId.useQuery({ transactionId });

  const updateStatusMutation = trpc.transaction.updateStatus.useMutation();
  const createReceiptMutation = trpc.receipt.create.useMutation();

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStatusMutation.mutateAsync({
        id: transactionId,
        status: statusForm.status,
        reason: statusForm.reason || undefined,
        amountPaid: statusForm.status === "paid" ? parseFloat(statusForm.amountPaid || "0") : undefined,
      });
      toast.success("Transaction status updated successfully");
      setIsStatusDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const handleGenerateReceipt = async () => {
    try {
      await createReceiptMutation.mutateAsync({ transactionId });
      toast.success("Receipt generated successfully");
      refetchReceipt();
      navigate(`/receipts`);
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

  if (!transaction) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Transaction not found.</p>
          <Button onClick={() => navigate("/transactions")} className="mt-4">
            Back to Transactions
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

  const canUpdateStatus = user?.role === "Super Admin" || user?.role === "LGA Admin";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/transactions")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Transaction details</h1>
              {getStatusBadge(transaction.status)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Ref: {transaction.paymentReference || "N/A"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Details of the revenue transaction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payer</p>
                      <button 
                        onClick={() => navigate(`/payers/${transaction.payerId}`)}
                        className="text-base font-semibold text-emerald-600 hover:underline text-left mt-0.5"
                      >
                        {transaction.payerName}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Landmark className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Revenue Category</p>
                      <p className="text-base font-semibold mt-0.5">{transaction.categoryName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Local Government Area (LGA)</p>
                      <p className="text-base font-semibold mt-0.5">{transaction.lgaName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date Initiated</p>
                      <p className="text-base font-semibold mt-0.5">
                        {new Date(transaction.createdAt).toLocaleDateString("en-NG", {
                          dateStyle: "medium",
                        })} at {new Date(transaction.createdAt).toLocaleTimeString("en-NG", {
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Collector / Revenue Officer</p>
                      <p className="text-base font-semibold mt-0.5">{transaction.collectorName || "System"}</p>
                    </div>
                  </div>

                  {transaction.paidAt && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date Paid</p>
                        <p className="text-base font-semibold mt-0.5">
                          {new Date(transaction.paidAt).toLocaleDateString("en-NG", {
                            dateStyle: "medium",
                          })} at {new Date(transaction.paidAt).toLocaleTimeString("en-NG", {
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {transaction.description && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-muted-foreground">Description / Notes</p>
                    <p className="text-sm text-foreground mt-1 whitespace-pre-line">{transaction.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Status History Timeline</CardTitle>
                <CardDescription>Audit log of status adjustments</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {historyLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : statusHistory && statusHistory.length > 0 ? (
                  <div className="relative border-l pl-6 space-y-6 ml-3">
                    {statusHistory.map((history, idx) => (
                      <div key={history.id || idx} className="relative">
                        <div className="absolute -left-[31px] top-1 bg-background border-2 rounded-full w-4 h-4 flex items-center justify-center">
                          <div className={`w-1.5 h-1.5 rounded-full ${history.newStatus === "paid" ? "bg-green-500" : history.newStatus === "failed" ? "bg-red-500" : "bg-yellow-500"}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm capitalize">Status: {history.newStatus}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(history.changedAt).toLocaleDateString()} at {new Date(history.changedAt).toLocaleTimeString()}
                            </span>
                          </div>
                          {history.reason && (
                            <p className="text-xs text-muted-foreground mt-1 italic">Reason: "{history.reason}"</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">Changed by: {history.changedByName || "System"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Info className="w-4 h-4" />
                    No status history recorded.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm bg-slate-50">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Financial summary of transaction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Amount Due</span>
                  <span className="text-lg font-bold">{formatCurrency(transaction.amountDue)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Amount Paid</span>
                  <span className="text-lg font-bold text-green-700">{formatCurrency(transaction.amountPaid || "0.00")}</span>
                </div>
                {transaction.status === "paid" && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Balance</span>
                    <span className="text-sm font-semibold text-green-600">FULLY PAID</span>
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  {transaction.status === "paid" && (
                    <>
                      {receipt ? (
                        <Button 
                          onClick={() => navigate(`/receipts`)} 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                        >
                          <Receipt className="w-4 h-4" />
                          View Receipt
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleGenerateReceipt} 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                        >
                          <Receipt className="w-4 h-4" />
                          Generate Receipt
                        </Button>
                      )}
                    </>
                  )}

                  {canUpdateStatus && transaction.status !== "paid" && (
                    <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          Update Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Transaction Status</DialogTitle>
                          <DialogDescription>
                            Mark this transaction as Paid or Failed, recording the audit details.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateStatus} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="status">New Status</Label>
                            <Select
                              value={statusForm.status}
                              onValueChange={(val: any) => setStatusForm({ ...statusForm, status: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {statusForm.status === "paid" && (
                            <div className="space-y-2">
                              <Label htmlFor="amountPaid">Amount Paid (NGN)</Label>
                              <Input
                                id="amountPaid"
                                type="number"
                                step="0.01"
                                placeholder={transaction.amountDue.toString()}
                                value={statusForm.amountPaid}
                                onChange={(e) => setStatusForm({ ...statusForm, amountPaid: e.target.value })}
                                required
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="reason">Reason / Comments</Label>
                            <Input
                              id="reason"
                              placeholder="e.g., Bank transfer confirmed, check bounced"
                              value={statusForm.reason}
                              onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                            />
                          </div>

                          <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={updateStatusMutation.isPending}>
                              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
