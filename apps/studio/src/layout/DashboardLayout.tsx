import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut } from "lucide-react";
import {
  Avatar,
  Button,
  PageLayout,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  NavGroup,
  cn,
} from "@futuremod/ui";
import { useSession } from "../auth/SessionContext";
import { ThemeToggle } from "../theme/ThemeToggle";

export function DashboardLayout() {
  const { user, signOut } = useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const navCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  return (
    <PageLayout
      className="min-h-screen"
      sidebar={
        <Sidebar className="shrink-0">
          <SidebarHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* Logomark */}
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold select-none">
                  FM
                </div>
                <span className="truncate font-bold tracking-tight">FutureMod</span>
              </div>
              <ThemeToggle />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <NavGroup label="Studio">
              <NavLink to="/dashboard" className={navCls} end>
                <LayoutDashboard className="size-4 shrink-0" aria-hidden />
                Projects
              </NavLink>
            </NavGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2">
              <Avatar
                fallback={(user?.name ?? user?.email ?? "?").slice(0, 2).toUpperCase()}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{user?.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Sign out"
                onClick={handleSignOut}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
      }
    >
      <Outlet />
    </PageLayout>
  );
}
