import {
  isUsernameAvailable,
  registerCustomer,
  signInWithIdentifier,
} from "@/services/authService";
import { supabase } from "@/services/supabase/client";

export { isUsernameAvailable, registerCustomer, signInWithIdentifier };

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
