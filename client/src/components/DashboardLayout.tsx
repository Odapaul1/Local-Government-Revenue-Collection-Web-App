import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, PanelLeft, Users, FileText, Wallet, BarChart3, Shield, TrendingUp, UserCog, Receipt, Building, Bell, Check, UserCircle } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const getMenuItems = (userRole?: string) => {
  const baseItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Payers", path: "/payers" },
    { icon: FileText, label: "Transactions", path: "/transactions" },
    { icon: Receipt, label: "Receipts", path: "/receipts" },
    { icon: TrendingUp, label: "Reports", path: "/reports" },
  ];
  
  if (userRole === "Super Admin") {
    baseItems.push({ icon: Building, label: "LGA Management", path: "/lgas" });
    baseItems.push({ icon: Wallet, label: "Revenue Categories", path: "/revenue-categories" });
    baseItems.push({ icon: UserCog, label: "Users", path: "/users" });
  }
  
  if (userRole === "Auditor" || userRole === "Super Admin") {
    baseItems.push({ icon: Shield, label: "Audit Logs", path: "/audit-logs" });
  }
  
  return baseItems;
};

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  const menuItems = getMenuItems(user?.role);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  const loginUrl = getLoginUrl();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Session Expired
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Your session has expired or you are not logged in. Please sign in again.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = "/";
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = getMenuItems(user?.role).find(item => item.path === location);
  const isMobile = useIsMobile();
  const isDev = import.meta.env.MODE === "development" || import.meta.env.VITE_OAUTH_PORTAL_URL === "https://your-auth-server.com";

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold tracking-tight truncate">
                    Navigation
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {getMenuItems(user?.role).map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setLocation("/profile")}
                  className="cursor-pointer"
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
         <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        <div className="flex border-b h-14 items-center justify-between bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {isMobile && <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />}
            <span className="font-semibold tracking-tight text-foreground text-sm">
              {activeMenuItem?.label ?? "Local Government Revenue"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isDev && <DevUserSwitcher />}
            <NotificationBell />
            {user?.role && (
              <Badge variant="outline" className="hidden sm:inline-flex bg-slate-50 border-slate-200">
                {user.role}
              </Badge>
            )}
          </div>
        </div>
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}

function DevUserSwitcher() {
  const { user } = useAuth();
  const DEV_USERS = [
    { openId: "dev-admin-open-id", name: "Dev Admin (Super Admin)" },
    { openId: "lga-admin-lagos", name: "Adebola Akinwale (LGA Admin - Ikeja)" },
    { openId: "lga-admin-kano", name: "Musa Haruna (LGA Admin - Nassarawa)" },
    { openId: "collector-ikeja-1", name: "Emeka Okonkwo (Collector - Ikeja)" },
    { openId: "collector-eti-osa-1", name: "Fatimah Bello (Collector - Eti-Osa)" },
    { openId: "auditor-central", name: "Chukwudi Eze (Auditor)" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 hover:text-amber-800 border-amber-500/30 font-semibold gap-1 text-xs px-2.5 h-8">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span>Switch User</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-1 rounded-xl shadow-lg border border-slate-100 bg-white">
        <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dev User Switcher</p>
        </div>
        {DEV_USERS.map((u) => {
          const isCurrent = user?.openId === u.openId;
          return (
            <DropdownMenuItem
              key={u.openId}
              onClick={() => {
                window.location.href = `/api/oauth/dev-login?as=${u.openId}`;
              }}
              className="flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-lg text-xs"
            >
              <span className={isCurrent ? "font-semibold text-emerald-700" : "text-slate-700"}>{u.name}</span>
              {isCurrent && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 ml-2" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationBell() {
  const [, navigate] = useLocation();
  const { data: notifications, refetch } = trpc.notification.list.useQuery();
  const { data: unreadCountResult, refetch: refetchCount } = trpc.notification.unreadCount.useQuery();
  const markAsReadMutation = trpc.notification.markAsRead.useMutation();
  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation();

  const unreadCount = unreadCountResult ?? 0;

  const handleMarkAsRead = async (id: number, relatedType?: string | null, relatedId?: number | null) => {
    try {
      await markAsReadMutation.mutateAsync({ id });
      refetch();
      refetchCount();
      if (relatedType === "transaction" && relatedId) {
        navigate(`/transactions/${relatedId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      refetch();
      refetchCount();
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-slate-100 focus:outline-none">
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-lg border border-slate-100 rounded-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50 rounded-t-xl">
          <h3 className="font-semibold text-sm text-slate-800 font-sans">Notifications</h3>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50">
          {notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => handleMarkAsRead(n.id, n.relatedEntityType, n.relatedEntityId)}
                className={`px-4 py-3 hover:bg-slate-50/80 cursor-pointer transition-colors flex gap-3 items-start ${!n.isRead ? "bg-emerald-50/20" : ""}`}
              >
                <div className="mt-1 shrink-0">
                  {!n.isRead ? (
                    <div className="h-2 w-2 rounded-full bg-emerald-600" />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed break-words">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
              <Bell className="h-8 w-8 text-slate-300 stroke-[1.5]" />
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

