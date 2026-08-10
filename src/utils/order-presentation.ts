export type OrderItemName = {
  name: string;
};

export type OrderFoodSummary = {
  primaryItemName: string;
  additionalItemCount: number;
  itemCount: number;
};

export function getOrderFoodSummary(items: OrderItemName[] | undefined): OrderFoodSummary {
  const safeItems = items ?? [];

  return {
    primaryItemName: safeItems[0]?.name?.trim() || "Order items",
    additionalItemCount: Math.max(0, safeItems.length - 1),
    itemCount: safeItems.length,
  };
}

export function formatAdditionalItemLabel(summary: OrderFoodSummary) {
  if (!summary.additionalItemCount) {
    return `${summary.itemCount} ${summary.itemCount === 1 ? "item" : "items"}`;
  }

  return `+${summary.additionalItemCount} more · ${summary.itemCount} items`;
}
