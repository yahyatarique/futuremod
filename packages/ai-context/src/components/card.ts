import type { RegistryItem } from "../types";

export const card: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "card",
  type: "registry:ui",
  title: "Card",
  description: "Container for grouped content.",
  dependencies: ["class-variance-authority"],
  registryDependencies: [],
  import: "import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@futuremod/ui'",
  files: [{ path: "components/ui/card.tsx", type: "registry:ui" }],
  props: [
    { name: "variant", type: "'default'|'glass'|'outline'|'muted'", default: "default", required: false, description: "Visual style" },
    { name: "padding", type: "'none'|'sm'|'default'|'lg'", default: "none", required: false, description: "Inner padding" },
  ],
  variants: ["default", "glass", "outline", "muted"],
  example: `<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>Content here.</CardContent>
  <CardFooter><Button>Action</Button></CardFooter>
</Card>`,
};