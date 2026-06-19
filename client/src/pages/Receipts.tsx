import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Download, Printer, Eye } from "lucide-react";
import { toast } from "sonner";

export default function Receipts() {
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: receipts, isLoading } = trpc.receipt.list.useQuery();

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(parseFloat(value || "0"));
  };

  const generateReceiptHTML = (receipt: any) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Receipt ${receipt.receiptNumber}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; color: #1a1a1a; }
        .page { max-width: 680px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #065f46, #059669); color: #fff; padding: 32px 40px; text-align: center; }
        .header .flag-badge { display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 12px; }
        .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        .header p { font-size: 13px; opacity: 0.85; }
        .receipt-badge { background: #fff; color: #065f46; display: inline-flex; align-items: center; gap: 8px; border-radius: 8px; padding: 6px 16px; margin-top: 16px; font-weight: 700; font-size: 14px; }
        .paid-stamp { display: inline-block; border: 3px solid #4ade80; color: #4ade80; border-radius: 50%; width: 80px; height: 80px; line-height: 74px; text-align: center; font-size: 13px; font-weight: 800; letter-spacing: 2px; margin-top: 16px; text-transform: uppercase; }
        .body { padding: 32px 40px; }
        .meta-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 24px; }
        .meta-block { flex: 1; }
        .meta-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin-bottom: 4px; }
        .meta-value { font-size: 14px; font-weight: 600; color: #111; }
        .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
        .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #059669; margin-bottom: 12px; }
        .detail-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #f3f4f6; }
        .detail-label { font-size: 13px; color: #6b7280; }
        .detail-value { font-size: 13px; font-weight: 600; color: #111; text-align: right; max-width: 60%; }
        .total-box { background: #f0fdf4; border: 2px solid #86efac; border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
        .total-label { font-size: 14px; font-weight: 700; color: #065f46; }
        .total-amount { font-size: 24px; font-weight: 800; color: #065f46; }
        .footer { text-align: center; padding: 20px 40px 28px; border-top: 1px solid #f3f4f6; }
        .footer p { font-size: 11px; color: #9ca3af; margin-bottom: 4px; }
        .barcode-text { font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 2px; color: #374151; background: #f9fafb; border-radius: 4px; padding: 6px 12px; display: inline-block; margin-top: 8px; }
        @media print {
          body { background: white; }
          .page { box-shadow: none; margin: 0; border-radius: 0; max-width: 100%; }
          @page { size: A4; margin: 15mm; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="flag-badge">🇳🇬 Federal Republic of Nigeria</div>
          <h1>Local Government Revenue Collection</h1>
          <p>Official Payment Receipt</p>
          <div class="receipt-badge">
            <span>Receipt No.</span>
            <strong>${receipt.receiptNumber}</strong>
          </div>
          <br/>
          <div class="paid-stamp">PAID</div>
        </div>

        <div class="body">
          <div class="meta-row">
            <div class="meta-block">
              <div class="meta-label">Receipt Date</div>
              <div class="meta-value">${new Date(receipt.generatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
            <div class="meta-block" style="text-align:right">
              <div class="meta-label">Transaction ID</div>
              <div class="meta-value">#${receipt.transactionId}</div>
            </div>
          </div>

          <hr class="divider" />

          <div class="section-title">Payer Details</div>
          <div class="detail-row">
            <span class="detail-label">Payer Name</span>
            <span class="detail-value">${receipt.payerName || "—"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payer Type</span>
            <span class="detail-value" style="text-transform:capitalize">${receipt.payerType || "—"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Local Government Area</span>
            <span class="detail-value">${receipt.lgaName || "—"}</span>
          </div>

          <hr class="divider" />

          <div class="section-title">Payment Details</div>
          <div class="detail-row">
            <span class="detail-label">Revenue Category</span>
            <span class="detail-value">${receipt.categoryName || "—"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Due</span>
            <span class="detail-value">${formatCurrency(receipt.amountDue)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Reference</span>
            <span class="detail-value">${receipt.paymentReference || "—"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date Paid</span>
            <span class="detail-value">${receipt.paidAt ? new Date(receipt.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : new Date(receipt.generatedAt).toLocaleDateString("en-NG")}</span>
          </div>

          <div class="total-box">
            <span class="total-label">Total Amount Paid</span>
            <span class="total-amount">${formatCurrency(receipt.amountPaid)}</span>
          </div>
        </div>

        <div class="footer">
          <p>This is an official payment receipt issued by the Local Government Revenue Collection System.</p>
          <p>Authorised by the Office of Revenue Management • All activities are logged and audited.</p>
          <div class="barcode-text">${receipt.receiptNumber}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const handlePrint = (receipt: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print receipts");
      return;
    }
    printWindow.document.write(generateReceiptHTML(receipt));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleDownload = (receipt: any) => {
    // Open in new tab so user can use browser Print → Save as PDF
    const tab = window.open("", "_blank");
    if (!tab) {
      toast.error("Please allow pop-ups to download receipts");
      return;
    }
    tab.document.write(generateReceiptHTML(receipt));
    tab.document.close();
    tab.focus();
    setTimeout(() => {
      tab.print();
      toast.success("Use 'Save as PDF' in the print dialog to download your receipt");
    }, 500);
  };


  const filteredReceipts = receipts?.filter((r: any) =>
    r.receiptNumber.includes(searchTerm) ||
    r.transactionId.toString().includes(searchTerm) ||
    r.payerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
          <p className="text-muted-foreground mt-1">
            View, print, and download payment receipts
          </p>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Search Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by receipt number, transaction ID, or payer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Receipts Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>All Receipts</CardTitle>
            <CardDescription>
              {filteredReceipts?.length || 0} receipts found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredReceipts && filteredReceipts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Payer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts.map((receipt: any) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-medium">
                          {receipt.receiptNumber}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          #{receipt.transactionId}
                        </TableCell>
                        <TableCell className="text-sm">
                          {receipt.payerName || "—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(receipt.amountPaid)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(receipt.generatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedReceipt(receipt)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrint(receipt)}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(receipt)}
                            >
                              <Download className="w-4 h-4" />
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
                  No receipts found.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receipt Detail Dialog */}
        {selectedReceipt && (
          <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Receipt {selectedReceipt.receiptNumber}</DialogTitle>
                <DialogDescription>
                  Transaction details and payment confirmation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Receipt #</span>
                    <span className="font-medium">{selectedReceipt.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-medium">#{selectedReceipt.transactionId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payer</span>
                    <span className="font-medium">{selectedReceipt.payerName || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{selectedReceipt.categoryName || "—"}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Amount</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(selectedReceipt.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {new Date(selectedReceipt.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handlePrint(selectedReceipt)}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleDownload(selectedReceipt)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
