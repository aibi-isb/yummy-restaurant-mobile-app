import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Spacing } from "@/constants/theme";
import { AdminCustomer } from "@/features/admin/types";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const COLUMNS = [
  { key: "name", label: "Customer Name", width: 126 },
  { key: "location", label: "Location", width: 164 },
  { key: "phone", label: "Phone No.", width: 118 },
  { key: "username", label: "Username", width: 101 },
  { key: "registrationDate", label: "Registration Date", width: 159 },
] as const;

type AdminCustomersTableProps = {
  customers: AdminCustomer[];
  visibleCount: number;
  totalCount: number;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onSort: (key: (typeof COLUMNS)[number]["key"]) => void;
  sortKey: (typeof COLUMNS)[number]["key"];
};

export function AdminCustomersTable({ customers, onPageChange, onSort, page, pageCount, sortKey, visibleCount, totalCount }: AdminCustomersTableProps) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {COLUMNS.map((column) => (
              <Pressable key={column.key} style={[styles.headerCell, { width: column.width }]} onPress={() => onSort(column.key)} accessibilityRole="button" accessibilityState={{ selected: sortKey === column.key }} accessibilityLabel={`Sort by ${column.label}`}>
                <Text style={styles.headerText} numberOfLines={1}>
                  {column.label}
                </Text>
                <PhosphorIcon name="swap-vertical" size={10} color={Colors.textPrimary} />
              </Pressable>
            ))}
          </View>

          {customers.map((customer) => (
            <Pressable
              key={customer.id}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`Open ${customer.name} detail`}
              onPress={() => router.push(`/admin-customers/${customer.id}` as never)}
            >
              <Text style={[styles.cellText, styles.name, { width: COLUMNS[0].width }]} numberOfLines={1}>
                {customer.name}
              </Text>
              <Text style={[styles.cellText, styles.muted, { width: COLUMNS[1].width }]} numberOfLines={1}>
                {customer.location}
              </Text>
              <Text style={[styles.cellText, styles.phone, { width: COLUMNS[2].width }]} selectable>
                {customer.phone}
              </Text>
              <Text style={[styles.cellText, styles.username, { width: COLUMNS[3].width }]} numberOfLines={1}>
                {customer.username}
              </Text>
              <Text style={[styles.cellText, styles.muted, { width: COLUMNS[4].width }]} selectable>
                {customer.registrationDate}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText} selectable>
          Showing {visibleCount} from {totalCount} data
        </Text>
        <View style={styles.pagination}>
          <PaginationButton icon="chevron-back" disabled={page <= 1} onPress={() => onPageChange(page - 1)} />
          {Array.from({ length: Math.max(1, pageCount) }, (_, index) => index + 1).map((value) => <PaginationButton key={value} label={`${value}`} active={value === page} onPress={() => onPageChange(value)} />)}
          <PaginationButton icon="chevron-forward" disabled={page >= pageCount} onPress={() => onPageChange(page + 1)} />
        </View>
      </View>
    </View>
  );
}

function PaginationButton({
  active,
  disabled,
  icon,
  label,
  onPress,
}: {
  active?: boolean;
  disabled?: boolean;
  icon?: "chevron-back" | "chevron-forward";
  label?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.pageButton,
        active && styles.pageButtonActive,
        disabled && styles.pageButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label ? `Go to page ${label}` : icon === "chevron-back" ? "Previous page" : "Next page"}
      onPress={onPress}
    >
      {icon ? (
        <PhosphorIcon name={icon} size={14} color={disabled ? Colors.textDisabled : Colors.textMuted} />
      ) : (
        <Text style={[styles.pageLabel, active && styles.pageLabelActive]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
  },
  table: {
    width: 669,
  },
  headerRow: {
    height: 35,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.danger,
  },
  headerCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingLeft: 19,
  },
  headerText: {
    color: Colors.textPrimary,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "800",
  },
  row: {
    height: 43,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  cellText: {
    fontSize: 10.5,
    lineHeight: 14,
    paddingLeft: 19,
  },
  name: {
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  muted: {
    color: Colors.textMuted,
    fontWeight: "400",
  },
  phone: {
    color: Colors.danger,
    fontWeight: "700",
  },
  username: {
    color: Colors.textPrimary,
    fontWeight: "800",
  },
  footer: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  footerText: {
    flex: 1,
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 14,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  pageButton: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  pageButtonActive: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  pageButtonDisabled: {
    opacity: 0.3,
  },
  pageLabel: {
    color: Colors.textMuted,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  pageLabelActive: {
    color: Colors.textPrimary,
  },
  pressed: {
    opacity: 0.76,
  },
});
