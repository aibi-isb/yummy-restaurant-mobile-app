import { normalizeRole, type UserRole } from "@/lib/routes";
import { supabase } from "@/services/supabase/client";

export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  username: string;
  phone: string;
  address: string;
  affiliationAddress?: string;
  avatarUrl?: string;
  role: UserRole;
  primaryNetwork?: string;
  cardHolder?: string;
  cardLast4?: string;
  cardExpiry?: string;
  createdAt?: string;
};

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,username,phone,address,affiliation_address,avatar_url,role,primary_network,card_holder,card_last4,card_expiry,created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    email: data.email ?? "",
    fullName: data.full_name ?? "",
    username: data.username ?? "",
    phone: data.phone ?? "",
    address: data.address ?? "",
    affiliationAddress: data.affiliation_address ?? undefined,
    avatarUrl: data.avatar_url ?? undefined,
    role: normalizeRole(data.role),
    primaryNetwork: data.primary_network ?? undefined,
    cardHolder: data.card_holder ?? undefined,
    cardLast4: data.card_last4 ?? undefined,
    cardExpiry: data.card_expiry ?? undefined,
    createdAt: data.created_at ?? undefined,
  } satisfies UserProfile;
}

export async function getCustomers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,username,phone,address,affiliation_address,avatar_url,role,primary_network,card_holder,card_last4,card_expiry,created_at")
    .neq("role", "admin")
    .neq("role", "super_admin")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email ?? "",
    fullName: row.full_name ?? "",
    username: row.username ?? "",
    phone: row.phone ?? "",
    address: row.address ?? "",
    avatarUrl: row.avatar_url ?? undefined,
    role: "customer" as const,
    createdAt: row.created_at ?? undefined,
  })) satisfies UserProfile[];
}
