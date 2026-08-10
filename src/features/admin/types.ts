export type AdminMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  tone: "revenue" | "orders" | "customers" | "alert";
};

export type AdminOrder = {
  id: string;
  customer: string;
  itemCount: number;
  total: string;
  status: "Preparing" | "Ready" | "Delivering";
  time: string;
};

export type AdminOrderStatus = "New Order" | "Delivered" | "On Delivery";
export type AdminOrderCardStatus = "Pending" | "Preparing" | "Delivered" | "Payment Received";
export type AdminOperationalOrderStatus = "Preparing" | "Delivering" | "Delivered";

export type AdminOrderListItem = {
  id: string;
  date: string;
  customer: string;
  location: string;
  phone: string;
  amount: string;
  itemCount: number;
  primaryItemName: string;
  additionalItemCount: number;
  itemSummary: string;
  image: string;
  status: AdminOrderStatus;
  cardStatus: AdminOrderCardStatus;
};

export type AdminOrderHistoryItem = {
  id: string;
  label: string;
  timestamp: string;
  icon: "checkmark-circle-outline" | "bicycle-outline" | "card-outline" | "cube-outline";
  tone: "muted" | "danger";
};

export type AdminOrderDetailItem = {
  id: string;
  name: string;
  description: string;
  image: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  badge?: string;
};

export type AdminOrderDelivery = {
  courierName: string;
  status: AdminOrderStatus;
  phone: string;
  deliveryTime: string;
  distance: string;
  headline: string;
  description: string;
};

export type AdminOrderDetail = {
  id: string;
  customer: string;
  status: AdminOrderStatus;
  note: string;
  address: string;
  postCode: string;
  history: AdminOrderHistoryItem[];
  items: AdminOrderDetailItem[];
  delivery: AdminOrderDelivery;
};

export type AdminOrderStatusUpdateItem = {
  id: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

export type AdminOrderStatusUpdate = {
  id: string;
  customer: string;
  phone: string;
  addressLines: string[];
  paymentMethod: string;
  paymentStatus: AdminOrderCardStatus;
  orderDate: string;
  orderIdLabel: string;
  subtotal: string;
  deliveryFee: string;
  totalAmount: string;
  currentStatus: AdminOperationalOrderStatus;
  items: AdminOrderStatusUpdateItem[];
};

export type InventoryItem = {
  id: string;
  name: string;
  remaining: number;
  unit: string;
  level: "low" | "medium" | "healthy";
};

export type SalesPoint = {
  label: string;
  value: number;
};

export type AdminDashboard = {
  metrics: AdminMetric[];
  orders: AdminOrder[];
  inventory: InventoryItem[];
  sales: SalesPoint[];
  customerActivity: SalesPoint[];
  revenueHistory: { label: string; current: number; previous: number }[];
};

export type AdminOrders = {
  orders: AdminOrderListItem[];
  totalCount: number;
  visibleCount: number;
};

export type AdminCustomer = {
  id: string;
  name: string;
  location: string;
  phone: string;
  username: string;
  registrationDate: string;
};

export type AdminCustomerFoodStat = {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
};

export type AdminCustomerLikedFoodStat = {
  id: string;
  label: string;
  count: number;
  value: number;
  color: string;
};

export type AdminCustomerWeeklyLikePoint = {
  day: string;
  values: Record<string, number>;
};

export type AdminCustomerDetail = {
  customer: AdminCustomer;
  role: string;
  email: string;
  avatar: string;
  balance: string;
  approvedPaymentCount: number;
  mostOrderedFoods: AdminCustomerFoodStat[];
  likedFoods: AdminCustomerLikedFoodStat[];
  weeklyLikes: AdminCustomerWeeklyLikePoint[];
};

export type AdminCustomers = {
  customers: AdminCustomer[];
  totalCount: number;
  visibleCount: number;
};

export type AdminNotificationItem = {
  id: string;
  actor: string;
  action: string;
  time: string;
  href?: string;
  unreadCount?: number;
  read?: boolean;
  active?: boolean;
};

export type AdminNotificationSection = {
  id: string;
  title: string;
  items: AdminNotificationItem[];
};

export type AdminNotifications = {
  sections: AdminNotificationSection[];
};

export type AdminPaymentVerificationStatus = "Pending Approval" | "Approved" | "Rejected";

export type AdminPaymentVerificationInfoItem = {
  id: string;
  label: string;
  value: string;
  icon: "phone-portrait-outline" | "cash-outline" | "calendar-outline";
  valueWeight?: "regular" | "bold" | "semibold";
};

export type AdminPaymentVerification = {
  id: string;
  status: AdminPaymentVerificationStatus;
  timestamp: string;
  paymentInformation: AdminPaymentVerificationInfoItem[];
  customerName: string;
  relatedOrderId: string;
  adminNote: string;
};

export type AdminFoodMenuItem = {
  id: string;
  name: string;
  image: string;
  categories: string[];
  price: string;
  description: string;
  available: boolean;
  orders: string;
  favorites: string;
  views: string;
};

export type AdminMenuComparison = {
  id: string;
  label: string;
  percent: number;
  color: string;
};

export type AdminFoodRevenuePoint = {
  label: string;
  value: number;
};

export type AdminFoodDetail = {
  food: AdminFoodMenuItem;
  badge: string;
  categoryTrail: string[];
  ingredients: string;
  nutrition: string;
  revenue: AdminFoodRevenuePoint[];
};

export type AdminFoods = {
  menu: AdminFoodMenuItem[];
  totalCount: number;
  visibleCount: number;
  comparison: AdminMenuComparison[];
};
