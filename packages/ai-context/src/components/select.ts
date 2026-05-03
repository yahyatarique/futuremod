import type { RegistryItem } from "../types";

export const select: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "select",
  type: "registry:ui",
  title: "Select",
  description: "Dropdown option picker.",
  dependencies: ["lucide-react"],
  registryDependencies: ["form-field"],
  import: "import { Select } from '@futuremod/ui'",
  files: [{ path: "components/ui/select.tsx", type: "registry:ui" }],
  props: [
    { name: "options", type: "{ value: string; label: string; disabled?: boolean }[]", required: true, description: "Dropdown options" },
    { name: "placeholder", type: "string", required: false, description: "Empty state label" },
    { name: "error", type: "boolean", required: false, description: "Error state" },
    { name: "value", type: "string", required: false, description: "Controlled value" },
    { name: "onChange", type: "(e: ChangeEvent<HTMLSelectElement>) => void", required: false, description: "Change handler" },
  ],
  example: `<Select
  options={[{ value: "admin", label: "Admin" }, { value: "user", label: "User" }]}
  placeholder="Select role"
/>`,
};