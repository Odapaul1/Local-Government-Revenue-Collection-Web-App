import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import RevenueCategories from "./pages/RevenueCategories";
import Transactions from "./pages/Transactions";
import Payers from "./pages/Payers";
import AuditLogs from "./pages/AuditLogs";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import Receipts from "./pages/Receipts";
import TransactionDetail from "./pages/TransactionDetail";
import PayerDetail from "./pages/PayerDetail";
import LGAManagement from "./pages/LGAManagement";
import Profile from "./pages/Profile";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/revenue-categories"} component={RevenueCategories} />
      <Route path={"/transactions"} component={Transactions} />
      <Route path={"/transactions/:id"} component={TransactionDetail} />
      <Route path={"/payers"} component={Payers} />
      <Route path={"/payers/:id"} component={PayerDetail} />
      <Route path={"/audit-logs"} component={AuditLogs} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/users"} component={UserManagement} />
      <Route path={"/receipts"} component={Receipts} />
      <Route path={"/lgas"} component={LGAManagement} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
