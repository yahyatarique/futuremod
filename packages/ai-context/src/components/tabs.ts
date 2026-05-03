import type { RegistryItem } from "../types";

export const tabs: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "tabs",
  type: "registry:ui",
  title: "Tabs",
  description: "Switchable content panels.",
  dependencies: [],
  registryDependencies: [],
  import: "import { Tabs, TabsList, TabsTrigger, TabsContent } from '@futuremod/ui'",
  files: [{ path: "components/ui/tabs.tsx", type: "registry:ui" }],
  props: [
    { name: "defaultValue", type: "string", required: true, description: "Initially active tab" },
    { name: "value", type: "string", required: false, description: "Controlled active tab" },
    { name: "onValueChange", type: "(v: string) => void", required: false, description: "Tab change handler" },
  ],
  example: `<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content</TabsContent>
  <TabsContent value="analytics">Analytics content</TabsContent>
</Tabs>`,
};