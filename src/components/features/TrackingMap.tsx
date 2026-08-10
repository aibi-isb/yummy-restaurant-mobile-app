import { type DemoCoord } from "@/services/paymentConfigService";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

type Props = {
  origin: DemoCoord;
  destination: DemoCoord;
  height?: number;
};

export default function TrackingMap({ origin, destination, height = 300 }: Props) {
  const midLat = (origin.latitude + destination.latitude) / 2;
  const midLng = (origin.longitude + destination.longitude) / 2;
  const latDelta = Math.abs(origin.latitude - destination.latitude) * 2.5;
  const lngDelta = Math.abs(origin.longitude - destination.longitude) * 2.5;

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: Math.max(latDelta, 0.02),
          longitudeDelta: Math.max(lngDelta, 0.02),
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Marker
          coordinate={origin}
          title="Restaurant"
          pinColor="#E53935"
        />
        <Marker
          coordinate={destination}
          title="Delivery Address"
          pinColor="#2E7D32"
        />
        <Marker.Animated
          coordinate={{ latitude: origin.latitude, longitude: origin.longitude }}
          title="Delivery Partner"
          pinColor="#1E88E5"
        />
        <Polyline
          coordinates={[
            { latitude: origin.latitude, longitude: origin.longitude },
            {
              latitude: (origin.latitude + destination.latitude) / 2,
              longitude: (origin.longitude + destination.longitude) / 2 + 0.003,
            },
            { latitude: destination.latitude, longitude: destination.longitude },
          ]}
          strokeColor="#1E88E5"
          strokeWidth={3}
          lineDashPattern={[8, 4]}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#1a1a1e",
  },
});
