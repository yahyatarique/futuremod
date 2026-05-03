import type { RegistryItem } from "../types";

export const statCard: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "stat-card",
  type: "registry:ui",
  title: "StatCard",
  description: "KPI / metric display card.",
  dependencies: [],
  registryDependencies: ["card"],
  import: "import { StatCard } from '@futuremod/ui'",
  files: [{ path: "components/ui/stat-card.tsx", type: "registry:ui" }],
  props: [
    { name: "label", type: "string", required: true, description: "Metric name" },
    { name: "value", type: "string | number", required: true, description: "Main value" },
    { name: "description", type: "string", required: false, description: "Sub-label" },
    { name: "trend", type: "{ value: string; direction: 'up'|'down'|'neutral' }", required: false, description: "Change indicator" },
    { name: "icon", type: "ReactNode", required: false, description: "Icon (lucide)" },
    { name: "variant", type: "'default'|'glass'", default: "default", required: false, description: "Card style" },
  ],
  variants: ["default", "glass"],
  example: `<StatCard
  label="Total Revenue"
  value="$48,295"
  description="vs. last month"
  trend={{ value: "+12.5%", direction: "up" }}
  icon={<DollarSign />}
/>`,
};