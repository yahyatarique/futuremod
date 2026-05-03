import { getFuturemodRootDomain, getProjectSlugFromLocation } from "./project-site";

/**
 * True when the browser is probably on a customer project subdomain, not localhost
 * or the marketing apex/root host. Enables the legacy standalone editor entry.
 */
export function isStandaloneProjectHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h.endsWith(".local")) {
    return false;
  }

  const root = getFuturemodRootDomain();

  const slug = getProjectSlugFromLocation();
  if (slug === "local" || slug === "default") {
    return false;
  }

  if (h === root || h === `www.${root}`) {
    return false;
  }

  return h.endsWith(`.${root}`);
}
