import { supabase } from "./supabase";

/**
 * Updates visibility on the edge (KV) + Supabase via the worker.
 * Must run while the user has a valid session.
 */
export async function setProjectPublicOnWeb(
  projectSlug: string,
  publicOnWeb: boolean
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await fetch("/api/project/visibility", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify({ projectSlug, publicOnWeb }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}
