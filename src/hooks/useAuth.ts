import { useCallback } from "react";

import { supabase } from "@/lib/supabase";
import { isAdminRole } from "@/lib/routes";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { loading, role, session, user } = useAuthStore();

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  return {
    loading,
    role,
    session,
    user,
    isAuthenticated: Boolean(session),
    isAdmin: isAdminRole(role),
    logout,
  };
}
