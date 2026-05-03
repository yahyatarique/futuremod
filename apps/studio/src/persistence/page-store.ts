const KEY_PREFIX = "futuremod-studio-page:";

export function getSavedPageId(userId: string, projectSlug: string): string {
  try {
    return localStorage.getItem(`${KEY_PREFIX}${projectSlug}:${userId}`) ?? "default";
  } catch {
    return "default";
  }
}

export function setSavedPageId(userId: string, projectSlug: string, pageId: string) {
  try {
    localStorage.setItem(`${KEY_PREFIX}${projectSlug}:${userId}`, pageId);
  } catch {
    /* ignore */
  }
}
