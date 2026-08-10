import { AdminDashboard } from "@/features/admin/types";
import { getCustomers } from "@/services/customerService";
import { getFoods } from "@/services/foodService";
import { getOrders } from "@/services/orderService";
import { getPayments } from "@/services/paymentService";

function shortDay(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);
}

export function getAdminDashboard(): AdminDashboard {
  return {
    metrics: [],
    orders: [],
    inventory: [],
    sales: [],
    customerActivity: [],
    revenueHistory: [],
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboard> {
  const [foods, orders, payments, customers] = await Promise.all([
    getFoods(),
    getOrders(),
    getPayments(),
    getCustomers(),
  ]);

  const pendingPayments = payments.filter((payment) => payment.status === "Pending Verification");
  const approvedPayments = payments.filter((payment) => payment.status === "Approved");
  const deliveredOrders = orders.filter((order) => order.status === "Delivered");
  const revenue = approvedPayments.reduce((sum, payment) => sum + payment.amount, 0);

  const today = new Date();
  const sales = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    const dayKey = day.toISOString().slice(0, 10);
    const value = approvedPayments
      .filter((payment) => payment.createdAt.slice(0, 10) === dayKey)
      .reduce((sum, payment) => sum + payment.amount, 0);

    return { label: shortDay(day), value };
  });

  const customerActivity = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    const dayKey = day.toISOString().slice(0, 10);
    return {
      label: shortDay(day),
      value: orders.filter((order) => order.createdAt.slice(0, 10) === dayKey).length,
    };
  });

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = today.getFullYear();
  const revenueHistory = monthLabels.map((label, month) => ({
    label,
    current: approvedPayments
      .filter((payment) => {
        const date = new Date(payment.createdAt);
        return date.getFullYear() === currentYear && date.getMonth() === month;
      })
      .reduce((sum, payment) => sum + payment.amount, 0),
    previous: approvedPayments
      .filter((payment) => {
        const date = new Date(payment.createdAt);
        return date.getFullYear() === currentYear - 1 && date.getMonth() === month;
      })
      .reduce((sum, payment) => sum + payment.amount, 0),
  }));

  return {
    metrics: [
      { id: "orders", label: "Orders", value: String(orders.length), delta: "All orders", tone: "orders" },
      { id: "customers", label: "Customers", value: String(customers.length), delta: "Profiles", tone: "customers" },
      { id: "foods", label: "Foods", value: String(foods.length), delta: "Menu items", tone: "orders" },
      { id: "pending-payments", label: "Pending Payments", value: String(pendingPayments.length), delta: "Verify", tone: "alert" },
      { id: "revenue", label: "Revenue", value: `Le ${revenue}`, delta: `${approvedPayments.length} approved`, tone: "revenue" },
      { id: "delivered", label: "Delivered", value: String(deliveredOrders.length), delta: "Completed", tone: "orders" },
    ],
    orders: orders.slice(0, 5).map((order) => ({
      id: order.id,
      customer: order.customerName,
      itemCount: order.items.length,
      total: `Le ${order.total}`,
      status: order.status === "Ready" ? "Ready" : order.status === "Delivered" ? "Delivering" : "Preparing",
      time: new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    })),
    inventory: foods.slice(0, 5).map((food) => ({
      id: food.id,
      name: food.name,
      remaining: food.available ? 1 : 0,
      unit: food.available ? "available" : "unavailable",
      level: food.available ? "healthy" : "low",
    })),
    sales,
    customerActivity,
    revenueHistory,
  };
}
