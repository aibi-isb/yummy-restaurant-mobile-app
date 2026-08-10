// ─── Notification types ───────────────────────────────────────────────────────

export type NotificationAction = "track_order" | "confirm" | "promo" | "none";

export type NotificationItem = {
  id: string;
  icon: string;       // MCP localhost asset URL
  title: string;
  orderId?: string;
  foodName?: string;
  foodMeta?: string;
  body?: string;
  time: string;
  action: NotificationAction;
  badge?: string;     // optional status badge asset URL
};

// ─── Figma MCP icon assets ────────────────────────────────────────────────────

/** Arriving Soon — scooter/rider icon  (imgFrame3546) */
export const iconArrivingSoon =
  "http://localhost:3845/assets/429c9ac5552557b90a3a13ae7a7c51e0d07e26fd.svg";

/** Order Placed — chef hat icon  (imgFrame3545) */
export const iconOrderPlaced =
  "http://localhost:3845/assets/52d900465a52cc79a4a4eabab654819cf2f2e0be.svg";

/** Order Delivered — green shopping bag icon  (imgFrame3547) */
export const iconOrderDelivered =
  "http://localhost:3845/assets/86318cf37ea3e53e2a151a45a61a80bd1ed5390c.svg";

/** Payment Verified — card/wallet icon  (imgFrame3548) */
export const iconPaymentVerified =
  "http://localhost:3845/assets/f01189cc8d6f32f074587b09e16352841b325c97.svg";

/** Promo / gift icon  (imgImage) */
export const iconPromo =
  "http://localhost:3845/assets/4fa12cecf9b2cf5b8d21055cfbbd282085a1165a.png";

/** Pending badge — yellow dot  (imgFrame3544) */
export const badgePending =
  "http://localhost:3845/assets/20f3b8dd90fa9f2d81500e4f0c0a0f54c8704d19.svg";

/** Success badge — green check  (imgFrame3543) */
export const badgeSuccess =
  "http://localhost:3845/assets/995fc3f6e1363142ab7ffbd32fae28651028fb82.svg";

// ─── Mock data ────────────────────────────────────────────────────────────────

export const todayNotifications: NotificationItem[] = [
  {
    id: "n1",
    icon: iconArrivingSoon,
    title: "Arriving Soon",
    orderId: "PO78965412",
    body: "Order is on transport",
    time: "Just Now",
    action: "track_order",
  },
  {
    id: "n2",
    icon: iconOrderPlaced,
    title: "Order Placed",
    orderId: "PO78965412",
    body: "Order is in preparation",
    time: "10:50 AM",
    action: "track_order",
    badge: badgePending,
  },
  {
    id: "n3",
    icon: iconOrderDelivered,
    title: "Order Delivered",
    orderId: "PO78965412",
    body: "Receive your order",
    time: "12:00 PM",
    action: "confirm",
    badge: badgeSuccess,
  },
];

export const yesterdayNotifications: NotificationItem[] = [
  {
    id: "n4",
    icon: iconOrderDelivered,
    title: "Order Delivered",
    orderId: "PO78965412",
    time: "Yesterday - 6:50 PM",
    action: "confirm",
    badge: badgeSuccess,
  },
  {
    id: "n5",
    icon: iconPaymentVerified,
    title: "Payment Verified",
    orderId: "PO78965412",
    body: "Receive your order",
    time: "12:00 PM",
    action: "none",
    badge: badgeSuccess,
  },
];
