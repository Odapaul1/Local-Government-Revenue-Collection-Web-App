import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Landmark, CheckCircle, ShieldAlert, BarChart3, Receipt, Users, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, loading, isAuthenticated, login, register, isLoggingIn, isRegistering, logout } = useAuth();
  const [, navigate] = useLocation();

  const [activeTab, setActiveTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"Super Admin" | "LGA Admin" | "Revenue Collector" | "Auditor">("Revenue Collector");
  const [regLgaId, setRegLgaId] = useState<string>("");

  const { data: lgas } = trpc.lga.list.useQuery();

  // Remove auto-redirect to allow users to see the landing page and manage their session.

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm font-semibold text-slate-700">Connecting to Unified Revenue Network...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email: loginEmail, password: loginPassword });
      toast.success("Successfully logged in");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to login");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        lgaId: regLgaId ? parseInt(regLgaId, 10) : null
      });
      toast.success("Account created successfully. Please sign in.");
      setLoginEmail(regEmail);
      setLoginPassword("");
      setActiveTab("login");
    } catch (err: any) {
      toast.error(err.message || "Failed to register");
    }
  };

  const needsLga = regRole === "LGA Admin" || regRole === "Revenue Collector";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-800 via-slate-900 to-slate-950 text-white font-sans antialiased overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl border border-emerald-400/30 shadow-lg shadow-emerald-900/30">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight block">LG-Rev</span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block">Unified Revenue Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400/90 tracking-wide uppercase">Core Network Active</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12 relative z-10">
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-emerald-400 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Federal Republic of Nigeria • Local Government Registry
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Secure, Automated <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">
              LGA Revenue Collection
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
            The next-generation unified platform for transparent revenue assessment, collector monitoring, and instantaneous payment receipting across Nigerian Local Government Areas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-lg">
            <div className="flex gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-emerald-500/25 transition-all">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Taxpayer Registry</h3>
                <p className="text-xs text-slate-400 mt-0.5">Enriched profiles with comprehensive payment records</p>
              </div>
            </div>
            <div className="flex gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-emerald-500/25 transition-all">
              <BarChart3 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Real-time Analytics</h3>
                <p className="text-xs text-slate-400 mt-0.5">Instant aggregates of LGA performance and category collection</p>
              </div>
            </div>
            <div className="flex gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-emerald-500/25 transition-all">
              <Receipt className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Instant Receipting</h3>
                <p className="text-xs text-slate-400 mt-0.5">Printable and downloadable digital transaction proofs</p>
              </div>
            </div>
            <div className="flex gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-emerald-500/25 transition-all">
              <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Audit Compliance</h3>
                <p className="text-xs text-slate-400 mt-0.5">Immutable records with role-based system audits</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 w-full flex justify-center">
          <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between gap-6">
            {isAuthenticated && user ? (
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-emerald-600/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Welcome back, {user.name}</h3>
                <p className="text-sm text-emerald-400 font-medium">Logged in as {user.role}</p>
                <div className="pt-6 flex flex-col gap-3">
                  <Button onClick={() => navigate("/dashboard")} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6">
                    Continue to Dashboard
                  </Button>
                  <Button variant="outline" onClick={logout} className="w-full border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white py-6">
                    Sign Out & Switch User
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 mb-6">
                  <TabsTrigger value="login" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Log In</TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input id="login-email" type="email" required placeholder="name@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="pl-9 bg-slate-900/50 border-white/10 focus:border-emerald-500 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input id="login-password" type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="pl-9 bg-slate-900/50 border-white/10 focus:border-emerald-500 text-white" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mt-6" disabled={isLoggingIn}>
                      {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input id="reg-name" required placeholder="Adebola Akinwale" value={regName} onChange={(e) => setRegName(e.target.value)} className="pl-9 bg-slate-900/50 border-white/10 focus:border-emerald-500 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input id="reg-email" type="email" required placeholder="name@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="pl-9 bg-slate-900/50 border-white/10 focus:border-emerald-500 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input id="reg-password" type="password" minLength={6} required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="pl-9 bg-slate-900/50 border-white/10 focus:border-emerald-500 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={regRole} onValueChange={(v: any) => setRegRole(v)}>
                        <SelectTrigger className="bg-slate-900/50 border-white/10 text-white">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Super Admin">Super Admin</SelectItem>
                          <SelectItem value="LGA Admin">LGA Admin</SelectItem>
                          <SelectItem value="Revenue Collector">Revenue Collector</SelectItem>
                          <SelectItem value="Auditor">Auditor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {needsLga && (
                      <div className="space-y-2">
                        <Label>LGA</Label>
                        <Select value={regLgaId} onValueChange={setRegLgaId} required={needsLga}>
                          <SelectTrigger className="bg-slate-900/50 border-white/10 text-white">
                            <SelectValue placeholder="Select LGA" />
                          </SelectTrigger>
                          <SelectContent>
                            {lgas?.map((lga) => (
                              <SelectItem key={lga.id} value={lga.id.toString()}>{lga.name}, {lga.state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mt-6" disabled={isRegistering}>
                      {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-xs text-slate-500 border-t border-white/5 mt-auto relative z-10">
        <p>© 2026 Local Government Revenue Collection Portal. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
