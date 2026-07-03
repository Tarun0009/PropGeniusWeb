export const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"] as const;
export const AUTH_ENTRY_ROUTES = ["/login", "/signup", "/forgot-password"] as const;
export const PROTECTED_HOME = "/dashboard";
export const LOGIN_ROUTE = "/login";

const PUBLIC_ROUTE_PREFIXES = ["/api/", "/p/"] as const;
const PUBLIC_EXACT_ROUTES = ["/", ...AUTH_ROUTES] as const;

export function isAuthEntryRoute(pathname: string) {
  return AUTH_ENTRY_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isPublicRoute(pathname: string) {
  if (PUBLIC_EXACT_ROUTES.some((route) => pathname === route)) return true;
  return PUBLIC_ROUTE_PREFIXES.some((route) => pathname.startsWith(route));
}

export function getSafeRedirectPath(value: string | null | undefined, fallback = PROTECTED_HOME) {
  if (!value || !value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (AUTH_ROUTES.some((route) => value === route || value.startsWith(`${route}?`) || value.startsWith(`${route}/`))) return fallback;
  return value;
}

export function buildLoginRedirect(pathname: string, search = "") {
  const next = `${pathname}${search}`;
  const query = next && next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
  return `${LOGIN_ROUTE}${query}`;
}

export function buildAuthCallbackUrl(origin: string, params?: Record<string, string>) {
  const url = new URL("/api/auth/callback", origin);
  Object.entries(params || {}).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}