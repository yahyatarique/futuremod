/**
 * Production: projects are assigned a slug suitable for `{slug}.{rootDomain}`, but the live
 * subdomain is only served after the owner enables “Share publicly”.
 * Browser storage is per-origin; we still pass the slug for API calls and persistence keys.
 */

const DEFAULT_ROOT_DOMAIN = "futuremod.site";

export function getFuturemodRootDomain(): string {
  const v = import.meta.env.VITE_FUTUREMOD_ROOT_DOMAIN;
  return (typeof v === "string" && v.trim() ? v.trim() : DEFAULT_ROOT_DOMAIN).toLowerCase();
}

/**
 * Optional dev/preview override. Example: `VITE_FUTUREMOD_PROJECT_SLUG=acme`.
 */
export function getProjectSlugFromLocation(): string {
  const override = import.meta.env.VITE_FUTUREMOD_PROJECT_SLUG;
  if (typeof override === "string" && override.trim()) {
    return override
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-")
      .replace(/\.+/g, ".");
  }

  if (typeof window === "undefined") {
    return "local";
  }

  const host = window.location.hostname.toLowerCase();
  const root = getFuturemodRootDomain();

  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) {
    return "local";
  }

  if (host === root || host === `www.${root}`) {
    return "default";
  }

  if (host.endsWith(`.${root}`)) {
    const sub = host.slice(0, -(root.length + 1));
    if (!sub) return "local";
    return sub.replace(/\./g, "-").toLowerCase();
  }

  return "local";
}

export function getProjectAppOrigin(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return `${window.location.protocol}//${window.location.host}`;
}
