export type RegistryItemType =
  | "registry:ui"
  | "registry:layout"
  | "registry:lib"
  | "registry:hook";

export interface RegistryItemFile {
  path: string;
  type: RegistryItemType;
}

export interface PropDef {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}

export interface RegistryItem {
  $schema: "https://ui.shadcn.com/schema/registry-item.json";
  name: string;
  type: RegistryItemType;
  title: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  import: string;
  files: RegistryItemFile[];
  props: PropDef[];
  variants?: string[];
  example: string;
}

export interface Registry {
  $schema: "https://ui.shadcn.com/schema/registry.json";
  name: string;
  homepage: string;
  items: Pick<RegistryItem, "name" | "type" | "title" | "description" | "import">[];
}