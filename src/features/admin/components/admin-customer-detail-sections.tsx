import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { AdminCustomerDetail, AdminCustomerFoodStat } from "@/features/admin/types";
import { Image } from "expo-image";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

export function AdminCustomerProfileCard({ detail }: { detail: AdminCustomerDetail }) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileTop}>
        <Image source={{ uri: detail.avatar }} style={styles.avatar} contentFit="cover" accessibilityLabel={detail.customer.name} />
        <View style={styles.profileCopy}>
          <View style={styles.profileHeader}>
            <View style={styles.profileNameGroup}>
              <Text style={styles.customerName}>{detail.customer.name}</Text>
              <Text style={styles.role}>{detail.role}</Text>
            </View>
            <View style={styles.quickActions}>
              <IconButton icon="call-outline" label={`Call ${detail.customer.name}`} phone={detail.customer.phone} />
            </View>
          </View>
          <InfoLine icon="location-outline" text={detail.customer.location} />
        </View>
      </View>

      <View style={styles.profileMetaGrid}>
        <ProfileMeta icon="mail-outline" label="Email" value={detail.email} tone="#e53935" />
        <ProfileMeta icon="call-outline" label="Phone" value={detail.customer.phone} tone="#2563eb" />
      </View>
    </View>
  );
}

function IconButton({ icon, label, phone }: { icon: "call-outline"; label: string; phone: string }) {
  return (
    <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={label} onPress={() => { if (phone) void Linking.openURL(`tel:${phone}`); }}>
      <PhosphorIcon name={icon} size={13} color="#b0b0b0" />
    </Pressable>
  );
}

function InfoLine({ icon, text }: { icon: "location-outline"; text: string }) {
  return (
    <View style={styles.infoLine}>
      <PhosphorIcon name={icon} size={13} color="#b0b0b0" />
      <Text style={styles.infoLineText}>{text}</Text>
    </View>
  );
}

function ProfileMeta({
  icon,
  label,
  tone,
  value,
}: {
  icon: "call-outline" | "mail-outline";
  label: string;
  tone: string;
  value: string;
}) {
  return (
    <View style={styles.profileMeta}>
      <View style={[styles.profileMetaIcon, { backgroundColor: `${tone}26` }]}>
        <PhosphorIcon name={icon} size={13} color={tone} />
      </View>
      <View style={styles.profileMetaCopy}>
        <Text style={styles.profileMetaLabel}>{label}</Text>
        <Text style={styles.profileMetaValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function AdminCustomerOrderedFoodCard({ foods }: { foods: AdminCustomerFoodStat[] }) {
  return (
    <View style={styles.card}>
      <CardHeader title="Most Ordered Food" subtitle="Foods ordered by this customer." withSegments />
      <View style={styles.foodList}>
        {foods.map((food) => (
          <View key={food.id} style={styles.foodRow}>
            <Image source={{ uri: food.image }} style={styles.foodImage} contentFit="cover" accessibilityLabel={food.name} />
            <View style={styles.foodCopy}>
              <Text style={styles.foodName} numberOfLines={1}>
                {food.name}
              </Text>
              <Text style={styles.foodCategory}>{food.category}</Text>
            </View>
            <Text style={styles.foodPrice}>{food.price}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function AdminCustomerBalanceCard({ detail }: { detail: AdminCustomerDetail }) {
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceTopRow}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <PhosphorIcon name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.55)" />
      </View>
      <Text style={styles.balanceValue}>{detail.balance}</Text>
      <View style={styles.cardNumberRow}>
        <View>
          <Text style={styles.balanceCaption}>APPROVED PAYMENTS</Text>
          <Text style={styles.cardNumber}>{detail.approvedPaymentCount}</Text>
        </View>
      </View>
      <View style={styles.balanceFooter}>
        <Text style={styles.balanceName}>{detail.customer.name}</Text>
        <View style={styles.switchTrack}>
          <View style={styles.switchThumb} />
        </View>
      </View>
    </View>
  );
}

export function AdminCustomerLikedFoodCard({ detail }: { detail: AdminCustomerDetail }) {
  const maxValue = 800;

  return (
    <View style={styles.card}>
      <CardHeader title="Most Ordered Food Activity" subtitle="Menu activity from this customer's orders." withSegments />
      <View style={styles.chartArea}>
        <View style={styles.yAxis}>
          {[800, 600, 400, 200, 0].map((label) => (
            <Text key={label} style={styles.axisLabel}>
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.barCanvas}>
          {[0, 1, 2, 3, 4].map((line) => (
            <View key={line} style={[styles.gridLine, { top: line * 28 }]} />
          ))}
          <View style={styles.barGroups}>
            {detail.weeklyLikes.map((day) => (
              <View key={day.day} style={styles.dayGroup}>
                <View style={styles.bars}>
                  {detail.likedFoods.map((food) => (
                    <View
                      key={food.id}
                      style={[
                        styles.bar,
                        {
                          height: Math.max(4, (day.values[food.id] / maxValue) * 112),
                          backgroundColor: food.color,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.dayLabel}>{day.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.legendGrid}>
        {detail.likedFoods.map((food) => (
          <View key={food.id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: food.color }]} />
            <Text style={styles.legendLabel}>
              {food.label} ({food.count})
            </Text>
            <Text style={styles.legendValue}>{food.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CardHeader({ subtitle, title, withSegments }: { subtitle: string; title: string; withSegments?: boolean }) {
  return (
    <View style={styles.cardHeader}>
      <View style={styles.cardTitleGroup}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      {withSegments ? (
        <View style={styles.segmentedControl}>
          <Segment label="Monthly" active />
          <Segment label="Weekly" />
          <Segment label="Daily" />
        </View>
      ) : null}
    </View>
  );
}

function Segment({ active, label }: { active?: boolean; label: string }) {
  return (
    <View style={[styles.segment, active && styles.segmentActive]}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    gap: 18,
    padding: 18,
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
  },
  profileTop: {
    flexDirection: "row",
    gap: 17,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 5,
    backgroundColor: "#2a2a2a",
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
    gap: 7,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  profileNameGroup: {
    flex: 1,
    minWidth: 0,
  },
  customerName: {
    color: Colors.textPrimary,
    fontSize: 15.75,
    lineHeight: 20,
    fontWeight: "800",
  },
  role: {
    color: Colors.danger,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
  },
  quickActions: {
    flexDirection: "row",
    gap: 5,
  },
  iconButton: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  infoLine: {
    flexDirection: "row",
    gap: 5,
    alignItems: "flex-start",
  },
  infoLineText: {
    flex: 1,
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 17,
  },
  profileMetaGrid: {
    paddingLeft: 101,
    gap: 10,
  },
  profileMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  profileMetaIcon: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    borderCurve: "continuous",
  },
  profileMetaCopy: {
    flex: 1,
    minWidth: 0,
  },
  profileMetaLabel: {
    color: "#b0b0b0",
    fontSize: 10,
    lineHeight: 13,
  },
  profileMetaValue: {
    color: Colors.textPrimary,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "800",
  },
  card: {
    gap: 18,
    padding: 18,
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  cardTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 15,
  },
  segmentedControl: {
    flexDirection: "row",
    gap: 5,
  },
  segment: {
    height: 25,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#262626",
  },
  segmentActive: {
    backgroundColor: "#2a2a2a",
  },
  segmentText: {
    color: "#b0b0b0",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: Colors.textPrimary,
  },
  foodList: {
    gap: 0,
  },
  foodRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  foodImage: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: "#2a2a2a",
  },
  foodCopy: {
    flex: 1,
    minWidth: 0,
  },
  foodName: {
    color: Colors.textPrimary,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "800",
  },
  foodCategory: {
    color: "#b0b0b0",
    fontSize: 10,
    lineHeight: 15,
  },
  foodPrice: {
    color: Colors.textPrimary,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "900",
  },
  balanceCard: {
    minHeight: 130,
    overflow: "hidden",
    gap: 8,
    padding: 18,
    borderRadius: 14,
    borderCurve: "continuous",
    backgroundColor: "#ce1212",
  },
  balanceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    color: Colors.textPrimary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  balanceValue: {
    color: Colors.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  cardNumberRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  balanceCaption: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800",
  },
  cardNumber: {
    color: Colors.textPrimary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
  },
  expiresBlock: {
    alignItems: "flex-end",
  },
  balanceFooter: {
    marginTop: 6,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.18)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceName: {
    color: Colors.textPrimary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  switchTrack: {
    width: 31,
    height: 17,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  switchThumb: {
    width: 13,
    height: 13,
    borderRadius: Radius.full,
    backgroundColor: Colors.textPrimary,
  },
  chartArea: {
    height: 150,
    flexDirection: "row",
    gap: 8,
  },
  yAxis: {
    width: 28,
    height: 126,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  axisLabel: {
    color: "#767676",
    fontSize: 8.5,
    lineHeight: 11,
    fontVariant: ["tabular-nums"],
  },
  barCanvas: {
    flex: 1,
    height: 144,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#2a2a2a",
    borderStyle: "dashed",
  },
  barGroups: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayGroup: {
    width: 30,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  bars: {
    height: 112,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  bar: {
    width: 4,
    borderRadius: Radius.full,
  },
  dayLabel: {
    color: "#b0b0b0",
    fontSize: 8.5,
    lineHeight: 11,
  },
  legendGrid: {
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    paddingTop: 11,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 16,
    rowGap: 8,
  },
  legendItem: {
    width: "46%",
    minWidth: 130,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  legendLabel: {
    flex: 1,
    color: "#b0b0b0",
    fontSize: 9.5,
    lineHeight: 13,
  },
  legendValue: {
    color: Colors.textPrimary,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  pressed: {
    opacity: 0.76,
  },
});
