import * as React from "react";
import { cn } from "../../lib/utils";

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
  border?: boolean;
  glass?: boolean;
}

function Header({ sticky = false, border = true, glass = false, className, children, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        "flex h-14 w-full items-center gap-4 px-6",
        sticky && "sticky top-0 z-40",
        border && "border-b border-border",
        glass
          ? "bg-background/80 backdrop-blur-surface"
          : "bg-background",
        className
      )}
      {...props}
    >
      {children}
    </header>
  );
}

const HeaderTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h1 ref={ref} className={cn("text-base font-semibold", className)} {...props} />
  )
);
HeaderTitle.displayName = "HeaderTitle";

const HeaderActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("ml-auto flex items-center gap-2", className)} {...props} />
  )
);
HeaderActions.displayName = "HeaderActions";

export { Header, HeaderTitle, HeaderActions };