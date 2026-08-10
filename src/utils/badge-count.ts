export function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : String(Math.max(0, count));
}

export function getCartAccessibilityLabel(count: number) {
  if (count <= 0) return "Cart";
  return `Cart, ${count} ${count === 1 ? "item" : "items"}`;
}

export function getNotificationsAccessibilityLabel(unreadCount: number) {
  if (unreadCount <= 0) return "Notifications";
  return `Notifications, ${unreadCount} unread`;
}
