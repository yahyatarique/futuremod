import type { RegistryItem } from "../types.js";

export const formField: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "form-field",
  type: "registry:ui",
  title: "FormField",
  description: "Label + input + error wrapper.",
  dependencies: [],
  registryDependencies: ["input", "label"],
  import: "import { FormField } from '@futuremod/ui'",
  files: [{ path: "components/ui/form-field.tsx", type: "registry:ui" }],
  props: [
    { name: "label", type: "string", required: false, description: "Field label" },
    { name: "hint", type: "string", required: false, description: "Helper text" },
    { name: "error", type: "string", required: false, description: "Validation error message" },
    { name: "required", type: "boolean", required: false, description: "Shows asterisk" },
    { name: "children", type: "ReactElement", required: true, description: "Input / Textarea / Select" },
  ],
  example: `<FormField label="Username" hint="3–20 characters" required error="Already taken">
  <Input placeholder="yahya" />
</FormField>`,
};