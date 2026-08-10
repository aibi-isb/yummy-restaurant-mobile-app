import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { getSessionRole, UserRole } from "@/lib/routes";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  /** true while the initial session is being loaded from storage */
  loading: boolean;
  setSession: (session: Session | null) => void;
  /** Call once on app start — loads the persisted session and subscribes to changes */
  init: () => () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  role: null,
  loading: true,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      role: session ? getSessionRole(session) : null,
    }),

  init: () => {
    let mounted = true;

    const applySession = (session: Session | null) => {
      if (!mounted) return;

      if (!session) {
        set({ session: null, user: null, role: null, loading: false });
        return;
      }

      set({
        session,
        user: session.user,
        role: getSessionRole(session),
        loading: false,
      });
    };

    // Load the persisted session and refresh its JWT before resolving the role.
    // Auth metadata (including the server-controlled admin role) can change
    // after a session is persisted, so using the stale token can make a valid
    // admin write fail an RLS policy check.
    const loadSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          applySession(null);
          return;
        }

        const refreshed = await supabase.auth.refreshSession();
        applySession(refreshed.error || !refreshed.data.session ? data.session : refreshed.data.session);
      } catch {
        if (mounted) set({ session: null, user: null, role: null, loading: false });
      }
    };

    void loadSession();

    // Keep the store in sync whenever Supabase refreshes or invalidates the token
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        applySession(session);
      },
    );

    // Return the cleanup function so the caller can unsubscribe
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  },
}));
