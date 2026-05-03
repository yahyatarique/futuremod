import type { RegistryItem } from "../types.js";

export const table: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "table",
  type: "registry:ui",
  title: "Table",
  description: "Structured data grid.",
  dependencies: [],
  registryDependencies: [],
  import: "import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@futuremod/ui'",
  files: [{ path: "components/ui/table.tsx", type: "registry:ui" }],
  props: [],
  example: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Date</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Alice</TableCell>
      <TableCell><Badge variant="success">Active</Badge></TableCell>
      <TableCell>2025-01-01</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
};