/** KV segment; reserved — cannot be used as a Puck page id. */
export const PROJECT_PUBLIC_PAGE_ID = "__public__";

export function projectPublicKvKey(projectSlug: string): string {
  return `${projectSlug}:${PROJECT_PUBLIC_PAGE_ID}`;
}
