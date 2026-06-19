import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { User, Mail, Shield, Building, Calendar, Activity, Hash } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  "Super Admin": "bg-violet-100 text-violet-800 border-violet-200",
  "LGA Admin": "bg-blue-100 text-blue-800 border-blue-200",
  "Revenue Collector": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Auditor": "bg-amber-100 text-amber-800 border-amber-200",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  "Super Admin": "Full system access — manage LGAs, users, categories, and all transactions system-wide.",
  "LGA Admin": "Manage payers, transactions, and collectors within your assigned Local Government Area.",
  "Revenue Collector": "Create transactions and record payments within your assigned LGA.",
  "Auditor": "Read-only access to audit logs and all transaction records across all LGAs.",
};

export default function Profile() {
  const { user } = useAuth();
  const { data: lga } = trpc.lga.getById.useQuery(
    { id: user?.lgaId! },
    { enabled: !!user?.lgaId }
  );
  const { data: notifications } = trpc.notification.list.useQuery();
  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  if (!user) return null;

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const roleColor = ROLE_COLORS[user.role] || "bg-slate-100 text-slate-800 border-slate-200";
  const roleDescription = ROLE_DESCRIPTIONS[user.role] || "";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Your account information and system access level
          </p>
        </div>

        {/* Profile Card */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20 border-2 border-border shadow-sm">
                <AvatarFallback className="text-2xl font-bold bg-emerald-50 text-emerald-700">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold tracking-tight">{user.name || "—"}</h2>
                <p className="text-muted-foreground text-sm mt-0.5">{user.email || "No email on file"}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge className={`${roleColor} border text-xs font-semibold px-3 py-1`}>
                    <Shield className="w-3 h-3 mr-1.5" />
                    {user.role}
                  </Badge>
                  {user.isActive !== false ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1">
                      <Activity className="w-3 h-3 mr-1.5" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs font-semibold px-3 py-1">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Account Details</CardTitle>
            <CardDescription>Your identity and contact information as registered in the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            <ProfileRow
              icon={<Hash className="w-4 h-4" />}
              label="User ID"
              value={`#${user.id}`}
            />
            <Separator />
            <ProfileRow
              icon={<User className="w-4 h-4" />}
              label="Full Name"
              value={user.name || "—"}
            />
            <Separator />
            <ProfileRow
              icon={<Mail className="w-4 h-4" />}
              label="Email Address"
              value={user.email || <span className="text-muted-foreground italic">Not set</span>}
            />
            <Separator />
            <ProfileRow
              icon={<Shield className="w-4 h-4" />}
              label="System Role"
              value={
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${roleColor}`}>
                  {user.role}
                </span>
              }
            />
            {user.lgaId && (
              <>
                <Separator />
                <ProfileRow
                  icon={<Building className="w-4 h-4" />}
                  label="Assigned LGA"
                  value={lga ? `${lga.name}${lga.state ? ` — ${lga.state}` : ""}` : `LGA #${user.lgaId}`}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Role Permissions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Role & Permissions</CardTitle>
            <CardDescription>What you can do in this system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`rounded-lg p-4 border ${roleColor} bg-opacity-30`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" />
                <span className="font-semibold text-sm">{user.role}</span>
              </div>
              <p className="text-sm leading-relaxed">{roleDescription}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <PermissionBadge
                label="Create Transactions"
                allowed={user.role === "Revenue Collector" || user.role === "LGA Admin"}
              />
              <PermissionBadge
                label="Approve Payments"
                allowed={user.role === "Super Admin" || user.role === "LGA Admin"}
              />
              <PermissionBadge
                label="Manage Payers"
                allowed={user.role !== "Revenue Collector" && user.role !== "Auditor"}
              />
              <PermissionBadge
                label="View Reports"
                allowed={true}
              />
              <PermissionBadge
                label="View Audit Logs"
                allowed={user.role === "Auditor" || user.role === "Super Admin"}
              />
              <PermissionBadge
                label="Manage Users"
                allowed={user.role === "Super Admin"}
              />
              <PermissionBadge
                label="Manage LGAs"
                allowed={user.role === "Super Admin"}
              />
              <PermissionBadge
                label="Manage Revenue Categories"
                allowed={user.role === "Super Admin"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
            <CardDescription>Overview of your recent system activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-800">{unreadCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Unread Notifications</p>
              </div>
              <div className="rounded-lg border bg-emerald-50 p-4 text-center">
                <p className="text-3xl font-bold text-emerald-700">
                  {user.isActive !== false ? "Active" : "Inactive"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Account Status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground text-center pb-4">
          To update your name, email, or role, please contact a Super Admin.
          All profile changes are logged in the audit trail.
        </p>
      </div>
    </DashboardLayout>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 gap-4">
      <div className="flex items-center gap-2.5 text-muted-foreground min-w-[160px]">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-sm font-medium text-right">{value}</div>
    </div>
  );
}

function PermissionBadge({
  label,
  allowed,
}: {
  label: string;
  allowed: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
        allowed
          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
          : "bg-slate-50 text-slate-400 border-slate-100"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          allowed ? "bg-emerald-500" : "bg-slate-300"
        }`}
      />
      {label}
    </div>
  );
}
