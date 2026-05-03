import * as React from "react";
import { cn } from "../../lib/utils";

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
  width?: "sm" | "default" | "lg";
}

const widthMap = {
  sm: "w-14",
  default: "w-60",
  lg: "w-72",
};

function Sidebar({ collapsed = false, width = "default", className, children, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-14" : widthMap[width],
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-14 items-center border-b border-border px-4", className)} {...props} />
  )
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto px-2 py-3", className)} {...props} />
  )
);
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("border-t border-border p-3", className)} {...props} />
  )
);
SidebarFooter.displayName = "SidebarFooter";

export interface NavItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
  collapsed?: boolean;
  badge?: string | number;
}

const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(
  ({ href = "#", icon, active, collapsed, badge, className, children, ...props }, ref) => (
    <a
      ref={ref}
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0 size-4">{icon}</span>}
      {!collapsed && <span className="flex-1 truncate">{children}</span>}
      {!collapsed && badge !== undefined && (
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
          {badge}
        </span>
      )}
    </a>
  )
);
NavItem.displayName = "NavItem";

const NavGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { label?: string; collapsed?: boolean }
>(({ label, collapsed, className, children, ...props }, ref) => (
  <div ref={ref} className={cn("mb-4", className)} {...props}>
    {label && !collapsed && (
      <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </p>
    )}
    <div className="space-y-0.5">{children}</div>
  </div>
));
NavGroup.displayName = "NavGroup";

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, NavItem, NavGroup };