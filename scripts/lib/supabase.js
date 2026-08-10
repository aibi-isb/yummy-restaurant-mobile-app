// ─── Admin Supabase Client ────────────────────────────────────────────────────
// Loads environment variables and exports a single admin-level Supabase client.
//
// Required .env variables:
//   SUPABASE_SERVICE_ROLE_KEY  — from Supabase Dashboard → Settings → API
//   SUPABASE_URL               — optional override (falls back to EXPO_PUBLIC_SUPABASE_URL)
//
// IMPORTANT: This client uses the service role key which bypasses Row Level
// Security. It must only be used in server-side / local scripts, never in the
// React Native app bundle.

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  console.error(
    '✗ Missing Supabase URL.\n' +
    '  Set SUPABASE_URL or EXPO_PUBLIC_SUPABASE_URL in your .env file.'
  );
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error(
    '✗ Missing SUPABASE_SERVICE_ROLE_KEY in .env\n' +
    '  Find it in: Supabase Dashboard → Settings → API → service_role'
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    // Scripts are not browser sessions — disable session persistence entirely.
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = { supabase };
