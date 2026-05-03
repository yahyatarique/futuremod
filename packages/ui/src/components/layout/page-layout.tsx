import * as React from "react";
import { cn } from "../../lib/utils";

export interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

function PageLayout({ sidebar, header, footer, children, className, ...props }: PageLayoutProps) {
  return (
    <div className={cn("flex min-h-screen bg-background", className)} {...props}>
      {sidebar}
      <div className="flex flex-1 flex-col overflow-hidden">
        {header}
        <main className="flex-1 overflow-auto p-6">{children}</main>
        {footer}
      </div>
    </div>
  );
}

export { PageLayout };