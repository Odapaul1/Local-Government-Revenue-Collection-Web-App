import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Users, FileText, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // For LGA-scoped roles, filter KPI to their LGA automatically
  const lgaId = (user?.role === "LGA Admin" || user?.role === "Revenue Collector")
    ? (user?.lgaId ?? undefined)
    : undefined;

  // Fetch transactions list (for recent list)
  const { data: transactions, isLoading: transactionsLoading } = trpc.transaction.list.useQuery(
    lgaId ? { lgaId } : {}
  );
  
  // Fetch real aggregated KPI stats scoped to user's LGA if applicable
  const { data: kpiData, isLoading: kpisLoading } = trpc.report.kpi.useQuery(
    lgaId ? { lgaId } : {}
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const KPICard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    trendUp,
  }: {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
  }) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{Icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="flex items-center mt-2 text-xs">
            {trendUp ? (
              <ArrowUpRight className="w-3 h-3 text-green-600 mr-1" />
            ) : (
              <ArrowDownLeft className="w-3 h-3 text-red-600 mr-1" />
            )}
            <span className={trendUp ? "text-green-600" : "text-red-600"}>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const isLoading = transactionsLoading || kpisLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  const CHART_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444", "#06b6d4"];

  const totalCollected = kpiData?.totalCollected || 0;
  const totalPending = kpiData?.totalPending || 0;
  const totalFailed = kpiData?.totalFailed || 0;
  const totalTransactions = kpiData?.totalTransactions || 0;
  const collectionRate = kpiData?.collectionRate || 0;

  const revenueByCategory = kpiData?.revenueByCategory || [];
  const revenueByLGA = kpiData?.revenueByLGA || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name}. Here's your revenue collection overview.
              {lgaId && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  LGA-scoped view
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {(user?.role === "Revenue Collector" || user?.role === "LGA Admin") && (
              <Button onClick={() => navigate("/transactions")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                New Transaction
              </Button>
            )}
            {user?.role === "Super Admin" && (
              <Button onClick={() => navigate("/revenue-categories")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Manage Categories
              </Button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Collected"
            value={formatCurrency(totalCollected)}
            description="Amount successfully collected"
            icon={<TrendingUp className="w-4 h-4" />}
            trend={`${collectionRate}% Collection Rate`}
            trendUp={collectionRate > 50}
          />
          <KPICard
            title="Pending"
            value={formatCurrency(totalPending)}
            description="Awaiting payment"
            icon={<AlertCircle className="w-4 h-4" />}
            trend={`${transactions?.filter((t: any) => t.status === "pending").length || 0} pending payments`}
          />
          <KPICard
            title="Failed"
            value={formatCurrency(totalFailed)}
            description="Payment failed"
            icon={<AlertCircle className="w-4 h-4" />}
            trend={`${transactions?.filter((t: any) => t.status === "failed").length || 0} failed payments`}
            trendUp={false}
          />
          <KPICard
            title="Total Transactions"
            value={`${totalTransactions}`}
            description="All time transactions"
            icon={<FileText className="w-4 h-4" />}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Revenue by Category */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>Distribution of collected revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) =>
                        `${name}: ${formatCurrency(value)}`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueByCategory.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">
                  No category collection data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by LGA */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue by LGA</CardTitle>
              <CardDescription>Distribution across Local Governments</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueByLGA.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByLGA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar
                      dataKey="value"
                      fill="#10b981"
                      name="Revenue (NGN)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">
                  No LGA collection data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest revenue collection activities</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/transactions")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions?.slice(0, 5).map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">Transaction #{transaction.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {formatCurrency(parseFloat(transaction.amountDue?.toString() || "0"))}
                    </p>
                    <Badge
                      variant={
                        transaction.status === "paid"
                          ? "default"
                          : transaction.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs mt-1"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
