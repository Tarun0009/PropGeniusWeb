import type { UserRole } from "@/types/user";

export function canManageOrg(role: UserRole): boolean {
  return role === "owner" || role === "admin";
}

export function canManageTeam(role: UserRole): boolean {
  return role === "owner" || role === "admin";
}

export function canManageBilling(role: UserRole): boolean {
  return role === "owner";
}
