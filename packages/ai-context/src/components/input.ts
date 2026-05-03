import type { RegistryItem } from "../types.js";

export const input: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "input",
  type: "registry:ui",
  title: "Input",
  description: "Text input field.",
  dependencies: [],
  registryDependencies: ["form-field"],
  import: "import { Input } from '@futuremod/ui'",
  files: [{ path: "components/ui/input.tsx", type: "registry:ui" }],
  props: [
    { name: "type", type: "string", default: "text", required: false, description: "HTML input type" },
    { name: "placeholder", type: "string", required: false, description: "Placeholder text" },
    { name: "error", type: "boolean", required: false, description: "Error state styling" },
    { name: "disabled", type: "boolean", required: false, description: "Disabled" },
    { name: "value", type: "string", required: false, description: "Controlled value" },
    { name: "onChange", type: "(e: ChangeEvent<HTMLInputElement>) => void", required: false, description: "Change handler" },
  ],
  example: `<FormField label="Email" required>
  <Input type="email" placeholder="you@example.com" />
</FormField>`,
};