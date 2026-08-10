import type { PaymentConfig } from "@/services/paymentConfigService";
import { supabase } from "@/services/supabase/client";

function mapConfig(row: any): PaymentConfig {
  return {
    paymentMethods: row.payment_methods ?? [],
    mobileNetworks: row.mobile_networks ?? [],
    infoText: row.info_text ?? "",
    securityBadgeText: row.security_badge_text ?? "",
    progressSteps: row.progress_steps ?? [],
    trackingStepLabels: row.tracking_step_labels ?? [],
    demoOrigin: row.demo_origin ?? {},
    demoDestination: row.demo_destination ?? {},
    trackingToastMessage: row.tracking_toast_message ?? "",
  };
}

export async function getRemotePaymentConfig(): Promise<PaymentConfig | null> {
  const { data, error } = await supabase
    .from("payment_config")
    .select("payment_methods,mobile_networks,info_text,security_badge_text,progress_steps,tracking_step_labels,demo_origin,demo_destination,tracking_toast_message")
    .eq("id", "default")
    .single();

  if (error) return null;
  if (!data) return null;
  return mapConfig(data);
}
