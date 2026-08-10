import { useCallback } from "react";

import type { AppNotification } from "@/services/notificationService";
import { useNotificationStore } from "@/store/notification-store";
import { useFocusEffect } from "expo-router";

const EMPTY_NOTIFICATIONS: AppNotification[] = [];

export function useNotifications(userId?: string) {
  const scope = userId ?? "all";
  const {
    scope: activeScope,
    notifications: storedNotifications,
    loading: storedLoading,
    error: storedError,
    refresh: refreshStore,
    markRead: markReadStore,
  } = useNotificationStore();
  const notifications = activeScope === scope
    ? storedNotifications
    : EMPTY_NOTIFICATIONS;
  const loading = activeScope === scope ? storedLoading : true;
  const error = activeScope === scope ? storedError : null;

  const refresh = useCallback(
    () => refreshStore(scope, userId),
    [refreshStore, scope, userId]
  );

  useFocusEffect(useCallback(() => {
    void refresh();
  }, [refresh]));

  const markRead = useCallback(
    (id: string) => markReadStore(scope, id),
    [markReadStore, scope]
  );

  return { notifications, loading, error, refresh, markRead };
}
