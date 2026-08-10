import { fetchCustomersFromSupabase } from "@/services/supabase/customerRepository";

export async function getCustomers() {
  return fetchCustomersFromSupabase();
}
