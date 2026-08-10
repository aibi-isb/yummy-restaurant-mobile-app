import { AdminCustomersTable } from "@/features/admin/components/admin-customers-table";
import { AdminFilterButton } from "@/features/admin/components/admin-filter-button";
import { useCustomers } from "@/hooks/useCustomers";
import { Colors, Spacing } from "@/constants/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAdminTheme } from "@/providers/theme-provider";

export default function AdminCustomersScreen() {
  const { colors } = useAdminTheme();
  const { customers, error, loading } = useCustomers();
  const [query, setQuery] = useState("");
  const [profileFilter, setProfileFilter] = useState<"all" | "complete" | "incomplete">("all");
  const [sortKey, setSortKey] = useState<"name" | "location" | "phone" | "username" | "registrationDate">("registrationDate");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredCustomers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return [...customers]
      .filter((customer) => {
        const complete = Boolean(customer.phone && customer.location);
        const matchesProfile = profileFilter === "all" || (profileFilter === "complete" ? complete : !complete);
        const haystack = [customer.name, customer.email, customer.username, customer.phone, customer.location].join(" ").toLowerCase();
        return matchesProfile && (!term || haystack.includes(term));
      })
      .sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])));
  }, [customers, profileFilter, query, sortKey]);
  const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const visibleCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={[]}>
      <Stack.Screen options={{ title: "Customers" }} />
      <StatusBar style="light" />

      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <View style={styles.titleGroup}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>General Customer</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Here is your general customers list data</Text>
          </View>

          <AdminFilterButton label={profileFilter === "all" ? "Filter" : profileFilter} leadingIcon="filter-outline" accessibilityLabel="Filter customers" onPress={() => setProfileFilter((value) => value === "all" ? "complete" : value === "complete" ? "incomplete" : "all")} />
        </View>

        <TextInput value={query} onChangeText={(value) => { setQuery(value); setPage(1); }} placeholder="Search customers" placeholderTextColor={colors.textMuted} style={[styles.searchInput, { backgroundColor: colors.input, color: colors.textPrimary, borderColor: colors.inputBorder }]} accessibilityLabel="Search customers" />
        {loading ? <Text style={[styles.stateText, { color: colors.textMuted }]}>Loading customers…</Text> : null}
        {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

        <AdminCustomersTable
          customers={visibleCustomers}
          visibleCount={visibleCustomers.length}
          totalCount={filteredCustomers.length}
          page={page}
          pageCount={pageCount}
          onPageChange={(nextPage) => setPage(Math.max(1, Math.min(pageCount, nextPage)))}
          onSort={(key) => { setSortKey(key); setPage(1); }}
          sortKey={sortKey}
        />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: 14,
    gap: 21,
    paddingBottom: 24,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  titleGroup: {
    flex: 1,
    minWidth: 190,
    gap: 2,
  },
  title: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 10.5,
    lineHeight: 14,
  },
  searchInput: { height: 34, paddingHorizontal: 10, borderRadius: 7, backgroundColor: Colors.input, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.inputBorder },
  stateText: { fontSize: 13 },
  errorText: { fontSize: 13, fontWeight: "700" },
});
