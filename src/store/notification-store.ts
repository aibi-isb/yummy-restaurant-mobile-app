import {
  type AppNotification,
  getNotifications,
  markNotificationRead,
} from "@/services/notificationService";
import { create } from "zustand";

type NotificationState = {
  scope: string | null;
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;
  refresh: (scope: string, userId?: string) => Promise<void>;
  markRead: (scope: string, id: string) => Promise<void>;
};

const refreshes = new Map<string, Promise<void>>();
const revisions = new Map<string, number>();

function getRevision(scope: string) {
  return revisions.get(scope) ?? 0;
}

function bumpRevision(scope: string) {
  revisions.set(scope, getRevision(scope) + 1);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Could not load notifications.";
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  const activateScope = (scope: string) => {
    if (get().scope !== scope) {
      set({ scope, notifications: [], loading: true, error: null });
    }
  };

  return {
    scope: null,
    notifications: [],
    loading: true,
    error: null,

    refresh: async (scope, userId) => {
      activateScope(scope);

      const pendingRefresh = refreshes.get(scope);
      if (pendingRefresh) {
        return pendingRefresh;
      }

      set({ loading: true, error: null });
      const revision = getRevision(scope);
      const refresh = (async () => {
        try {
          const notifications = await getNotifications(userId);
          if (get().scope === scope && getRevision(scope) === revision) {
            set({ notifications, loading: false, error: null });
          }
        } catch (error) {
          if (get().scope === scope && getRevision(scope) === revision) {
            set({ loading: false, error: getErrorMessage(error) });
          }
        }
      })();

      refreshes.set(scope, refresh);
      try {
        await refresh;
      } finally {
        if (refreshes.get(scope) === refresh) {
          refreshes.delete(scope);
        }
      }
    },

    markRead: async (scope, id) => {
      activateScope(scope);
      bumpRevision(scope);

      try {
        await markNotificationRead(id);
        if (get().scope === scope) {
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notification.id === id ? { ...notification, read: true } : notification
            ),
            loading: false,
            error: null,
          }));
        }
      } catch (error) {
        if (get().scope === scope) {
          set({ loading: false, error: getErrorMessage(error) });
        }
        throw error;
      }
    },
  };
});
