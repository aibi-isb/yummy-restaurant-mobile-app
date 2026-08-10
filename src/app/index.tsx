import { GuardLoading } from "@/components/navigation/GuardLoading";
import { ADMIN_HOME_ROUTE, CUSTOMER_HOME_ROUTE, PUBLIC_START_ROUTE, isAdminRole } from "@/lib/routes";
import { useAuthStore } from "@/store/authStore";
import { Redirect } from "expo-router";

export default function IndexRoute() {
  const { loading, role, session } = useAuthStore();

  if (loading) {
    return <GuardLoading />;
  }

  if (!session) {
    return <Redirect href={PUBLIC_START_ROUTE} />;
  }

  return <Redirect href={isAdminRole(role) ? ADMIN_HOME_ROUTE : CUSTOMER_HOME_ROUTE} />;
}
