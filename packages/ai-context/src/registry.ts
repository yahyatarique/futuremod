import type { Registry, RegistryItem } from "./types.js";

import { button } from "./components/button.js";
import { card } from "./components/card.js";
import { badge } from "./components/badge.js";
import { input } from "./components/input.js";
import { select } from "./components/select.js";
import { avatar } from "./components/avatar.js";
import { table } from "./components/table.js";
import { statCard } from "./components/stat-card.js";
import { alert } from "./components/alert.js";
import { tabs } from "./components/tabs.js";
import { formField } from "./components/form-field.js";
import { dashboardShell } from "./layout/dashboard-shell.js";
import { sidebar } from "./layout/sidebar.js";
import { pageLayout } from "./layout/page-layout.js";
import { emptyState } from "./layout/empty-state.js";

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