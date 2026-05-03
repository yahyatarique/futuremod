import * as React from "react";
import { cn } from "../../lib/utils";

export interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

function DashboardShell({ title, description, actions, children, className, ...props }: DashboardShellProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 mt-2 sm:mt-0 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

function DashboardGrid({
  cols = 4,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { cols?: 1 | 2 | 3 | 4 }) {
  const colsMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };
  return (
    <div className={cn("grid gap-4", colsMap[cols], className)} {...props}>
      {children}
    </div>
  );
}

export { DashboardShell, DashboardGrid };