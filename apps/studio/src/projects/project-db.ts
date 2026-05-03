/**
 * Supabase-backed project storage.
 *
 * All functions are async and call the `projects` table via the Supabase JS
 * client.  RLS policies ensure users can only access their own rows.
 */

import { supabase } from "../lib/supabase";
import { slugifyTitle } from "./project-storage";
import { RESERVED_SLUGS } from "./reserved-slugs";

export interface StoredProject {
  slug: string;
  title: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function listProjects(userId: string): Promise<StoredProject[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("slug, title, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    slug:      row.slug,
    title:     row.title,
    updatedAt: row.updated_at as string,
  }));
}

// ---------------------------------------------------------------------------
// Write helpers
// ---------------------------------------------------------------------------

/** Derive a slug that is unique across this user's existing projects. */
async function uniqueSlug(userId: string, base: string): Promise<string> {
  const normalized = base.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const safe = RESERVED_SLUGS.has(normalized) ? `${normalized}-site` : normalized;

  // Fetch all existing slugs for this user in one query
  const { data } = await supabase
    .from("projects")
    .select("slug")
    .eq("user_id", userId);

  const taken = new Set((data ?? []).map((r: { slug: string }) => r.slug));

  if (!taken.has(safe)) return safe;
  let i = 2;
  while (taken.has(`${safe}-${i}`)) i += 1;
  return `${safe}-${i}`;
}

export async function addProject(
  userId: string,
  title: string
): Promise<StoredProject> {
  const baseSlug = slugifyTitle(title);
  const slug = await uniqueSlug(userId, baseSlug);

  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: userId, slug, title: title.trim() || slug })
    .select("slug, title, updated_at")
    .single();

  if (error) throw error;

  return {
    slug:      data.slug,
    title:     data.title,
    updatedAt: data.updated_at as string,
  };
}

export async function touchProject(
  userId: string,
  slug: string
): Promise<void> {
  await supabase
    .from("projects")
    .update({ updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("slug", slug);
}

export async function removeProject(
  userId: string,
  slug: string
): Promise<void> {
  await supabase
    .from("projects")
    .delete()
    .eq("user_id", userId)
    .eq("slug", slug);
}
