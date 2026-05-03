import type { Registry, RegistryItem } from "./types";

import { button } from "./components/button";
import { card } from "./components/card";
import { badge } from "./components/badge";
import { input } from "./components/input";
import { select } from "./components/select";
import { avatar } from "./components/avatar";
import { table } from "./components/table";
import { statCard } from "./components/stat-card";
import { alert } from "./components/alert";
import { tabs } from "./components/tabs";
import { formField } from "./components/form-field";
import { dashboardShell } from "./layout/dashboard-shell";
import { sidebar } from "./layout/sidebar";
import { pageLayout } from "./layout/page-layout";
import { emptyState } from "./layout/empty-state";

export const items: RegistryItem[] = [
  // UI primitives
  button,
  card,
  badge,
  input,
  select,
  avatar,
  table,
  statCard,
  alert,
  tabs,
  formField,
  // Layout
  dashboardShell,
  sidebar,
  pageLayout,
  emptyState,
];

export const registry: Registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "@futuremod/ui",
  homepage: "https://github.com/yahyatarique/futuremod",
  items: items.map(({ name, type, title, description, import: imp }) => ({
    name,
    type,
    title,
    description,
    import: imp,
  })),
};

export function getItem(name: string): RegistryItem | undefined {
  return items.find((item) => item.name === name);
}