import type { Session } from "@supabase/supabase-js";

export type UserRole = "super_admin" | "admin" | "customer";

export const ONBOARDING_COMPLETE_KEY = "yummy:onboarding-complete";

export const PUBLIC_START_ROUTE = "/splash";
export const WELCOME_ROUTE = "/auth-choice";
export const LOGIN_ROUTE = "/login";
export const CUSTOMER_HOME_ROUTE = "/(customer)/home";
export const ADMIN_HOME_ROUTE = "/(admin)";

export function isAdminRole(role: unknown): role is "super_admin" | "admin" {
  return role === "super_admin" || role === "admin";
}

export function normalizeRole(role: unknown): UserRole {
  if (typeof role !== "string") return "customer";
  const value = role.toLowerCase();
  return value === "super_admin" || value === "admin" ? value : "customer";
}

export function getSessionRole(session: Session): UserRole {
  return normalizeRole(session.user.app_metadata?.role);
}

export function getSessionDestination(session: Session) {
  return isAdminRole(getSessionRole(session)) ? ADMIN_HOME_ROUTE : CUSTOMER_HOME_ROUTE;
}
