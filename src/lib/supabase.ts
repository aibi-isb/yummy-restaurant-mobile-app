import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist the session across restarts using AsyncStorage
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Required for React Native — disables browser-based OAuth detection
    detectSessionInUrl: false,
  },
});
