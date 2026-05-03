// ── UI primitives ─────────────────────────────────────────
export { Button, buttonVariants } from "./components/ui/button";
export type { ButtonProps } from "./components/ui/button";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./components/ui/card";
export type { CardProps } from "./components/ui/card";

export { Badge, badgeVariants } from "./components/ui/badge";
export type { BadgeProps } from "./components/ui/badge";

export { Input } from "./components/ui/input";
export type { InputProps } from "./components/ui/input";

export { Label } from "./components/ui/label";

export { Textarea } from "./components/ui/textarea";
export type { TextareaProps } from "./components/ui/textarea";

export { Select } from "./components/ui/select";
export type { SelectProps } from "./components/ui/select";

export { Avatar } from "./components/ui/avatar";
export type { AvatarProps } from "./components/ui/avatar";

export { Spinner } from "./components/ui/spinner";
export type { SpinnerProps } from "./components/ui/spinner";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./components/ui/table";

export { Separator } from "./components/ui/separator";
export { Skeleton } from "./components/ui/skeleton";

export { StatCard } from "./components/ui/stat-card";
export type { StatCardProps } from "./components/ui/stat-card";

export { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";

export { FormField } from "./components/ui/form-field";
export type { FormFieldProps } from "./components/ui/form-field";

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
export type { TabsProps } from "./components/ui/tabs";

// ── Layout ────────────────────────────────────────────────
export { PageLayout } from "./components/layout/page-layout";
export type { PageLayoutProps } from "./components/layout/page-layout";

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  NavItem,
  NavGroup,
} from "./components/layout/sidebar";
export type { SidebarProps, NavItemProps } from "./components/layout/sidebar";

export { Header, HeaderTitle, HeaderActions } from "./components/layout/header";
export type { HeaderProps } from "./components/layout/header";

export { DashboardShell, DashboardGrid } from "./components/layout/dashboard-shell";
export type { DashboardShellProps } from "./components/layout/dashboard-shell";

export { EmptyState } from "./components/layout/empty-state";
export type { EmptyStateProps } from "./components/layout/empty-state";

// ── Utils ─────────────────────────────────────────────────
export { cn } from "./lib/utils";