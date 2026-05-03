import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Card } from "./card";

const trendVariants = cva("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium", {
  variants: {
    direction: {
      up: "bg-success/15 text-success",
      down: "bg-destructive/15 text-destructive",
      neutral: "bg-muted text-muted-foreground",
    },
  },
  defaultVariants: { direction: "neutral" },
});

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  description?: string;
  trend?: { value: string; direction: "up" | "down" | "neutral" };
  icon?: React.ReactNode;
  variant?: "default" | "glass";
}

function StatCard({ className, label, value, description, trend, icon, variant = "default", ...props }: StatCardProps) {
  return (
    <Card variant={variant} className={cn("p-6", className)} {...props}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3">
          <span className={cn(trendVariants({ direction: trend.direction }))}>
            {trend.direction === "up" && "↑"}
            {trend.direction === "down" && "↓"}
            {trend.value}
          </span>
        </div>
      )}
    </Card>
  );
}

export { StatCard };