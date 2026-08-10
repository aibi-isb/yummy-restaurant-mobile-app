import { AdminNotificationsList, AdminNotificationsToolbar } from "@/features/admin/components/admin-notifications-list";
import { Colors } from "@/constants/theme";
import { useNotifications } from "@/hooks/useNotifications";
import { createNotification } from "@/services/notificationService";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminNotificationsScreen() {
  const { markRead, notifications, refresh } = useNotifications();
  const [query, setQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const sections = useMemo(() => [{
      id: "recent",
      title: "Recent Message",
      items: notifications.map((item) => ({
        id: item.id,
        actor: item.userId === "all" ? "Admin Broadcast" : item.userId,
        action: `${item.title} - ${item.message}`,
        time: new Date(item.createdAt).toLocaleString(),
        href: item.type === "payment" ? "/admin-payment-verification" : undefined,
        read: item.read,
        active: !item.read,
      })),
    }].map((section) => ({ ...section, items: section.items.filter((item) => !query.trim() || `${item.actor} ${item.action}`.toLowerCase().includes(query.trim().toLowerCase())) })), [notifications, query]);

  const sendBroadcast = async () => {
    if (!title.trim() || !message.trim()) return;
    await createNotification({
      userId: "all",
      type: "admin",
      title: title.trim(),
      message: message.trim(),
    });
    setTitle("");
    setMessage("");
    setComposeOpen(false);
    await refresh();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <Stack.Screen options={{ title: "Notifications" }} />
      <StatusBar style="light" />

      <View style={styles.panel}>
        <AdminNotificationsToolbar query={query} onQueryChange={setQuery} onCreateNotification={() => setComposeOpen(true)} />
        <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <AdminNotificationsList sections={sections} onMarkRead={markRead} />
        </ScrollView>
      </View>

      <Modal visible={composeOpen} transparent animationType="fade" onRequestClose={() => setComposeOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.composeCard}>
            <Text style={styles.composeTitle}>Create Notification</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor="#888" style={styles.composeInput} />
            <TextInput value={message} onChangeText={setMessage} placeholder="Message" placeholderTextColor="#888" style={[styles.composeInput, styles.composeMessage]} multiline />
            <View style={styles.composeActions}>
              <Pressable onPress={() => setComposeOpen(false)} style={styles.composeCancel}><Text style={styles.composeCancelText}>Cancel</Text></Pressable>
              <Pressable onPress={() => void sendBroadcast()} style={styles.composeSend}><Text style={styles.composeSendText}>Send</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  panel: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: "#2a2a2a",
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  modalBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: Colors.scrim },
  composeCard: { width: "100%", maxWidth: 420, gap: 12, padding: 18, borderRadius: 12, backgroundColor: Colors.surface },
  composeTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: "800" },
  composeInput: { minHeight: 42, paddingHorizontal: 12, borderRadius: 8, color: Colors.textPrimary, backgroundColor: Colors.input },
  composeMessage: { minHeight: 90, paddingTop: 12, textAlignVertical: "top" },
  composeActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  composeCancel: { padding: 10 },
  composeCancelText: { color: Colors.textMuted },
  composeSend: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.danger },
  composeSendText: { color: Colors.textPrimary, fontWeight: "800" },
});
