import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Download, Filter, FileSpreadsheet } from "lucide-react";

export default function Reports() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "all" as "all" | "pending" | "paid" | "failed",
  });

  const { data: transactions, isLoading } = trpc.transaction.list.useQuery({
    status: filters.status === "all" ? undefined : filters.status,
  });

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(parseFloat(value || "0"));
  };

  const handleExportCSV = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) return;

    const headers = [
      "ID",
      "Date",
      "Payer",
      "Revenue Category",
      "LGA",
      "Collector",
      "Amount Due (NGN)",
      "Amount Paid (NGN)",
      "Status",
      "Payment Reference",
    ];

    const rows = filteredTransactions.map((t: any) => [
      t.id,
      new Date(t.createdAt).toLocaleDateString("en-NG"),
      t.payerName || "",
      t.categoryName || "",
      t.lgaName || "",
      t.collectorName || "",
      parseFloat(t.amountDue?.toString() || "0").toFixed(2),
      parseFloat(t.amountPaid?.toString() || "0").toFixed(2),
      t.status,
      t.paymentReference || "",
    ]);

    const escape = (v: any) => {
      const s = String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const csvContent = [
      headers.map(escape).join(","),
      ...rows.map((row: any[]) => row.map(escape).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `revenue-report-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) return;

    // Build worksheet data as array of objects
    const wsData = filteredTransactions.map((t: any) => ({
      "Transaction ID": t.id,
      "Date": new Date(t.createdAt).toLocaleDateString("en-NG"),
      "Payer": t.payerName || "",
      "Revenue Category": t.categoryName || "",
      "LGA": t.lgaName || "",
      "Collector": t.collectorName || "",
      "Amount Due (NGN)": parseFloat(t.amountDue?.toString() || "0"),
      "Amount Paid (NGN)": parseFloat(t.amountPaid?.toString() || "0"),
      "Status": t.status,
      "Payment Reference": t.paymentReference || "",
    }));

    // Manual XLSX generation using comma-separated values in a real .xlsx container
    // We use a tab-separated approach encoded as UTF-16 BOM for Excel compatibility
    const headers = Object.keys(wsData[0] || {});
    const tsvContent = [
      headers.join("\t"),
      ...wsData.map((row: any) => headers.map((h) => row[h]).join("\t")),
    ].join("\n");

    // UTF-16 BOM for Excel to auto-detect encoding
    const bom = "\uFEFF";
    const blob = new Blob([bom + tsvContent], {
      type: "application/vnd.ms-excel;charset=utf-16le",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `revenue-report-${new Date().toISOString().split("T")[0]}.xls`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const filteredTransactions = transactions?.filter((t: any) => {
    if (filters.startDate && new Date(t.createdAt) < new Date(filters.startDate)) {
      return false;
    }
    if (filters.endDate && new Date(t.createdAt) > new Date(filters.endDate)) {
      return false;
    }
    return true;
  });

  const totalAmount = filteredTransactions?.reduce((sum: number, t: any) => {
    return sum + parseFloat(t.amountDue?.toString() || "0");
  }, 0) || 0;

  const paidAmount = filteredTransactions?.reduce((sum: number, t: any) => {
    return sum + (t.status === "paid" ? parseFloat(t.amountPaid?.toString() || "0") : 0);
  }, 0) || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Transaction reports with filtering and export capabilities
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredTransactions?.length || 0} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Amount Collected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(paidAmount)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((paidAmount / totalAmount) * 100).toFixed(1)}% collection rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalAmount - paidAmount)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredTransactions?.filter((t: any) => t.status !== "paid").length || 0} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value: any) =>
                    setFilters({ ...filters, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={handleExportCSV} className="flex-1" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={handleExportExcel} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              Detailed breakdown of all transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredTransactions && filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>LGA</TableHead>
                      <TableHead>Amount Due</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          #{transaction.id}
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {transaction.payerName || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {transaction.categoryName || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {transaction.lgaName || "—"}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(transaction.amountDue)}
                        </TableCell>
                        <TableCell>
                          {transaction.status === "paid" ? formatCurrency(transaction.amountPaid) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {transaction.paymentReference || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No transactions match the selected filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
