import { getCartTotals } from "@/services/cartService";
import type { CartLine } from "@/services/cartService";
import type { Order, OrderStatus } from "@/services/orderService";
import { supabase } from "@/services/supabase/client";

type OrderRow = {
  id: string;
  user_id: string;
  customer_name: string | null;
  phone: string | null;
  address: string | null;
  subtotal: number | string | null;
  delivery_fee: number | string | null;
  tax: number | string | null;
  total: number | string | null;
  status: OrderStatus | null;
  payment_status: Order["paymentStatus"] | null;
  created_at: string | null;
  estimated_delivery_at?: string | null;
  delivery_partner_name?: string | null;
  delivery_partner_phone?: string | null;
  order_items?: any[];
};

function mapOrderRow(row: OrderRow): Order {
  const items = (row.order_items ?? []).map((item) => ({
    id: String(item.id),
    foodId: String(item.food_id),
    name: item.food_name ?? item.foods?.name ?? "Food item",
    price: Number(item.price ?? item.foods?.price ?? 0),
    quantity: Number(item.quantity ?? 1),
    image: item.image ?? item.foods?.image ?? "",
  })) satisfies CartLine[];

  return {
    id: String(row.id),
    userId: String(row.user_id),
    customerName: row.customer_name ?? "Customer",
    phone: row.phone ?? "",
    address: row.address ?? "",
    items,
    subtotal: Number(row.subtotal ?? 0),
    deliveryFee: Number(row.delivery_fee ?? 0),
    tax: Number(row.tax ?? 0),
    total: Number(row.total ?? 0),
    status: row.status ?? "Pending",
    paymentStatus: row.payment_status ?? "Unpaid",
    createdAt: row.created_at ?? new Date().toISOString(),
    estimatedDeliveryAt: row.estimated_delivery_at ?? undefined,
    deliveryPartnerName: row.delivery_partner_name ?? undefined,
    deliveryPartnerPhone: row.delivery_partner_phone ?? undefined,
  };
}

const orderSelect =
  "id,user_id,customer_name,phone,address,subtotal,delivery_fee,tax,total,status,payment_status,created_at,estimated_delivery_at,delivery_partner_name,delivery_partner_phone,order_items(id,food_id,food_name,price,quantity,image,foods(name,price,image))";

export async function getAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapOrderRow(row as OrderRow));
}

export async function getOrdersByUser(userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapOrderRow(row as OrderRow));
}

export async function createRemoteOrder(orderData: {
  userId: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartLine[];
}) {
  const totals = getCartTotals(orderData.items);
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: orderData.userId,
      customer_name: orderData.customerName,
      phone: orderData.phone,
      address: orderData.address,
      subtotal: totals.subtotal,
      delivery_fee: totals.deliveryFee,
      tax: totals.tax,
      total: totals.total,
      status: "Pending",
      payment_status: "Unpaid",
    })
    .select("id")
    .single();

  if (error) throw error;

  const orderId = data.id;
  const orderItems = orderData.items.map((item) => ({
    order_id: orderId,
    food_id: item.foodId,
    food_name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));

  if (orderItems.length) {
    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;
  }

  const orders = await getOrdersByUser(orderData.userId);
  return orders.find((order) => order.id === orderId) ?? null;
}

export async function updateRemoteOrderStatus(orderId: string, status: OrderStatus) {
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw error;
  return (await getAllOrders()).find((order) => order.id === orderId) ?? null;
}

export async function updateRemoteOrderPayment(
  orderId: string,
  paymentStatus: Order["paymentStatus"],
) {
  const values: Record<string, string> = {
    payment_status: paymentStatus,
    updated_at: new Date().toISOString(),
  };

  if (paymentStatus === "Approved") {
    values.status = "Payment Received";
  }

  const { error } = await supabase
    .from("orders")
    .update(values)
    .eq("id", orderId);

  if (error) throw error;
}
