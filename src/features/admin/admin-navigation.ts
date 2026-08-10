export type AdminNavSection = "dashboard" | "order" | "foods" | "notifications" | "customer";

export function normalizeAdminPath(pathname: string) {
  return pathname.replace(/^\/\(admin\)/, "") || "/";
}

export function getAdminActiveSection(pathname: string): AdminNavSection | null {
  const adminPath = normalizeAdminPath(pathname);

  if (adminPath === "/") return "dashboard";
  if (adminPath.startsWith("/admin-orders")) return "order";
  if (adminPath.startsWith("/admin-foods") || adminPath.startsWith("/admin-categories")) return "foods";
  if (adminPath.startsWith("/admin-notifications")) return "notifications";
  if (adminPath.startsWith("/admin-customers")) return "customer";

  return null;
}
