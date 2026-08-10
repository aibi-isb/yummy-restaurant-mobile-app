import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius } from "@/constants/theme";
import { AdminNotificationItem, AdminNotificationSection } from "@/features/admin/types";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type AdminNotificationsListProps = {
  sections: AdminNotificationSection[];
  onMarkRead?: (id: string) => void;
};

export function AdminNotificationsToolbar({ onCreateNotification, onQueryChange, query }: { onCreateNotification?: () => void; onQueryChange: (query: string) => void; query: string }) {
  return (
    <View style={styles.toolbar}>
      <View style={styles.searchBox}>
        <PhosphorIcon name="search" size={13} color="#b0b0b0" />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          style={styles.searchInput}
          placeholder="Search here..."
          placeholderTextColor="#b0b0b0"
          returnKeyType="search"
          accessibilityLabel="Search admin notifications"
        />
      </View>
      <Pressable style={({ pressed }) => [styles.addButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Create notification" onPress={onCreateNotification}>
        <PhosphorIcon name="add" size={18} color={Colors.textPrimary} />
      </Pressable>
    </View>
  );
}

export function AdminNotificationsList({ onMarkRead, sections }: AdminNotificationsListProps) {
  return (
    <View style={styles.list}>
      {sections.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionItems}>
            {section.items.map((item) => (
              <AdminNotificationRow key={item.id} item={item} onMarkRead={onMarkRead} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function AdminNotificationRow({ item, onMarkRead }: { item: AdminNotificationItem; onMarkRead?: (id: string) => void }) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.row, item.active && styles.rowActive, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${item.actor}: ${item.action}`}
      onPress={() => {
        onMarkRead?.(item.id);
        if (item.href) {
          router.push(item.href as never);
        }
      }}
    >
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.actor)}</Text>
        </View>
        {item.active ? <View style={styles.onlineDot} /> : null}
      </View>

      <View style={styles.rowCopy}>
        <View style={styles.rowTop}>
          <Text style={styles.actor} numberOfLines={1}>
            {item.actor}
          </Text>
          <Text style={styles.time} numberOfLines={1}>
            {item.time}
          </Text>
        </View>
        <Text style={styles.action} numberOfLines={1}>
          {item.action}
        </Text>
      </View>

      {item.unreadCount ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      ) : item.read ? (
        <PhosphorIcon name="checkmark" size={12} color={Colors.danger} />
      ) : null}
    </Pressable>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  searchBox: {
    flex: 1,
    minWidth: 0,
    height: 29,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderCurve: "continuous",
    backgroundColor: Colors.input,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: Colors.textPrimary,
    fontSize: 10.5,
    paddingVertical: 0,
  },
  addButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: Colors.danger,
  },
  list: {
    flex: 1,
  },
  section: {
    gap: 4,
  },
  sectionTitle: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    color: Colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  sectionItems: {
    gap: 0,
  },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowActive: {
    backgroundColor: "rgba(58,18,18,0.6)",
  },
  avatarWrap: {
    width: 32,
    height: 32,
    justifyContent: "center",
  },
  avatar: {
    width: 31.5,
    height: 31.5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: Colors.input,
  },
  avatarText: {
    color: Colors.textPrimary,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
  },
  onlineDot: {
    position: "absolute",
    right: -1,
    bottom: 1,
    width: 9,
    height: 9,
    borderRadius: Radius.full,
    backgroundColor: Colors.danger,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  actor: {
    flex: 1,
    minWidth: 0,
    color: Colors.textPrimary,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "800",
  },
  time: {
    color: Colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },
  action: {
    color: Colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },
  unreadBadge: {
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: Colors.danger,
  },
  unreadText: {
    color: Colors.textPrimary,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.76,
  },
});
