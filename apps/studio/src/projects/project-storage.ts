/**
 * Per-user project list in localStorage until a real database exists.
 */
import { RESERVED_SLUGS } from "./reserved-slugs";

export interface StoredProject {
  slug: string;
  title: string;
  updatedAt: string;
}

const prefix = "futuremod-projects:";

function key(userId: string) {
  return `${prefix}${userId}`;
}

export function listProjects(userId: string): StoredProject[] {
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredProject[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : [];
  } catch {
    return [];
  }
}

function writeAll(userId: string, projects: StoredProject[]) {
  try {
    localStorage.setItem(key(userId), JSON.stringify(projects));
  } catch {
    /* ignore */
  }
}

export function slugifyTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || "page";
}

export function ensureUniqueSlug(userId: string, base: string): string {
  const normalized = base.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const safe = RESERVED_SLUGS.has(normalized) ? `${normalized}-site` : normalized;
  const existing = new Set(listProjects(userId).map((p) => p.slug));
  if (!existing.has(safe)) return safe;
  let i = 2;
  while (existing.has(`${safe}-${i}`)) i += 1;
  return `${safe}-${i}`;
}

export function addProject(userId: string, title: string): StoredProject {
  const slug = ensureUniqueSlug(userId, slugifyTitle(title));
  const project: StoredProject = {
    slug,
    title: title.trim() || slug,
    updatedAt: new Date().toISOString(),
  };
  const all = listProjects(userId);
  writeAll(userId, [project, ...all]);
  return project;
}

export function touchProject(userId: string, slug: string) {
  const all = listProjects(userId);
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx === -1) return;
  const next = [...all];
  next[idx] = { ...next[idx]!, updatedAt: new Date().toISOString() };
  writeAll(userId, next);
}

export function removeProject(userId: string, slug: string) {
  writeAll(
    userId,
    listProjects(userId).filter((p) => p.slug !== slug)
  );
}
