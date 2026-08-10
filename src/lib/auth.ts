import AsyncStorage from "@react-native-async-storage/async-storage";
import { ONBOARDING_COMPLETE_KEY } from "./routes";
import { supabase } from "./supabase";

// ─── Sign up ──────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

// ─── Sign in ──────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  // Clear the onboarding flag so the next session (or a new user on the
  // same device) always sees the onboarding flow again.
  await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
}

// ─── Get current session ──────────────────────────────────────────────────────

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
