import { getRemotePaymentConfig } from "@/services/supabase/paymentConfigService";

export type PaymentMethodConfig = {
  id: string;
  label: string;
  icon: string;
  iconColor: string;
  isRecommended?: boolean;
  recommendedLabel?: string;
};

export type TrackingStepLabel = {
  label: string;
  statuses: string[];
};

export type DemoCoord = {
  latitude: number;
  longitude: number;
};

export type PaymentConfig = {
  paymentMethods: PaymentMethodConfig[];
  mobileNetworks: string[];
  infoText: string;
  securityBadgeText: string;
  progressSteps: string[];
  trackingStepLabels: TrackingStepLabel[];
  demoOrigin: DemoCoord;
  demoDestination: DemoCoord;
  trackingToastMessage: string;
};

const DEFAULT_CONFIG: PaymentConfig = {
  paymentMethods: [
    {
      id: "mobile_money",
      label: "Mobile Money",
      icon: "phone-portrait-outline",
      iconColor: "#2E7D32",
      isRecommended: true,
      recommendedLabel: "Recommended",
    },
    {
      id: "credit_card",
      label: "Card",
      icon: "card-outline",
      iconColor: "#E65100",
      isRecommended: false,
    },
  ],
  mobileNetworks: ["Orange Money", "Afrimoney", "QMoney", "Other"],
  infoText: "",
  securityBadgeText: "Secure Payment",
  progressSteps: ["Cart", "Checkout", "Payment", "Confirmation"],
  trackingStepLabels: [
    { label: "Order accepted", statuses: ["Pending", "Payment Received"] },
    { label: "Preparing", statuses: ["Preparing", "Ready"] },
    { label: "Delivered", statuses: ["Delivered"] },
  ],
  demoOrigin: { latitude: 8.484, longitude: -13.234 },
  demoDestination: { latitude: 8.464, longitude: -13.244 },
  trackingToastMessage: "Your Order is being tracked",
};

export async function getPaymentConfig(): Promise<PaymentConfig> {
  try {
    const remote = await getRemotePaymentConfig();
    if (remote) return remote;
  } catch {
    // Fall through to default.
  }
  return DEFAULT_CONFIG;
}
