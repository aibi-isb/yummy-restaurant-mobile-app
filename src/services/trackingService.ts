import { getPaymentConfig, type DemoCoord, type TrackingStepLabel } from "@/services/paymentConfigService";

export type TrackingConfig = {
  trackingStepLabels: TrackingStepLabel[];
  demoOrigin: DemoCoord;
  demoDestination: DemoCoord;
  trackingToastMessage: string;
};

export async function getTrackingConfig(): Promise<TrackingConfig> {
  const full = await getPaymentConfig();
  return {
    trackingStepLabels: full.trackingStepLabels,
    demoOrigin: full.demoOrigin,
    demoDestination: full.demoDestination,
    trackingToastMessage: full.trackingToastMessage,
  };
}
