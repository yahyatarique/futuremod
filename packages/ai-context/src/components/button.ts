import type { RegistryItem } from "../types";

export const button: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "button",
  type: "registry:ui",
  title: "Button",
  description: "Clickable action trigger.",
  dependencies: ["class-variance-authority"],
  registryDependencies: [],
  import: "import { Button } from '@futuremod/ui'",
  files: [{ path: "components/ui/button.tsx", type: "registry:ui" }],
  props: [
    { name: "variant", type: "'default'|'destructive'|'outline'|'secondary'|'ghost'|'link'|'accent'|'glass'", default: "default", required: false, description: "Visual style" },
    { name: "size", type: "'default'|'sm'|'lg'|'xl'|'icon'|'icon-sm'|'icon-lg'", default: "default", required: false, description: "Size" },
    { name: "loading", type: "boolean", default: "false", required: false, description: "Shows spinner, disables" },
    { name: "disabled", type: "boolean", required: false, description: "Disabled state" },
    { name: "onClick", type: "() => void", required: false, description: "Click handler" },
    { name: "children", type: "ReactNode", required: true, description: "Label or icon+label" },
  ],
  variants: ["default", "destructive", "outline", "secondary", "ghost", "link", "accent", "glass"],
  example: `<Button variant="default" size="default">Save changes</Button>`,
};