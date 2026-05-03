import type { RegistryItem } from "../types";

export const avatar: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "avatar",
  type: "registry:ui",
  title: "Avatar",
  description: "User photo or initials fallback.",
  dependencies: [],
  registryDependencies: [],
  import: "import { Avatar } from '@futuremod/ui'",
  files: [{ path: "components/ui/avatar.tsx", type: "registry:ui" }],
  props: [
    { name: "src", type: "string", required: false, description: "Image URL" },
    { name: "alt", type: "string", required: false, description: "Alt text" },
    { name: "fallback", type: "string", required: false, description: "Initials (max 2 chars)" },
    { name: "size", type: "'xs'|'sm'|'default'|'lg'|'xl'", default: "default", required: false, description: "Size" },
  ],
  variants: ["xs", "sm", "default", "lg", "xl"],
  example: `<Avatar src="/avatar.png" fallback="YT" size="default" />`,
};