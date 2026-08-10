// ─── Auth Helpers ─────────────────────────────────────────────────────────────
// Low-level wrappers around Supabase Auth Admin API.
// Used by users.js (create) and clearData.js (delete).

const { supabase } = require('./supabase');
const { getEnabledSeedUsers } = require('../data/users');
const logger = require('./logger');

// Seed accounts — kept here so both users.js and clearData.js reference the
// same source of truth without duplicating the email strings.
const SEED_EMAILS = getEnabledSeedUsers().map((user) => user.email).filter(Boolean);

/**
 * Find a Supabase Auth user by email address.
 * Returns the user object if found, or null if no match.
 *
 * @param {string} email
 * @returns {Promise<import('@supabase/supabase-js').User | null>}
 */
async function findUserByEmail(email) {
  // listUsers is paginated; 1000 covers any realistic dev database.
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw new Error(`Could not list auth users: ${error.message}`);
  return data.users.find((u) => u.email === email) ?? null;
}

/**
 * Create a new Supabase Auth user with a confirmed email.
 * Throws if Supabase returns an error.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('@supabase/supabase-js').User>}
 */
async function createAuthUser(email, password, metadata = {}) {
  const { role, ...userMetadata } = metadata;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip the confirmation email in development
    user_metadata: userMetadata,
    app_metadata: role ? { role } : undefined,
  });
  if (error) throw new Error(`Could not create auth user ${email}: ${error.message}`);
  return data.user;
}

/** Keep the server-controlled Auth role in sync for new and existing seed users. */
async function ensureAuthUserRole(user, role) {
  if (user.app_metadata?.role === role) return user;

  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...(user.app_metadata ?? {}),
      role,
    },
  });

  if (error) {
    throw new Error(`Could not update Auth role for ${user.email}: ${error.message}`);
  }

  return data.user;
}

/**
 * Delete the seeded Auth users.
 * Silently skips any email that does not exist in Auth.
 */
async function deleteSeededAuthUsers() {
  for (const email of SEED_EMAILS) {
    const user = await findUserByEmail(email);
    if (!user) {
      logger.warn(`Auth user not found, skipping: ${email}`);
      continue;
    }
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw new Error(`Could not delete auth user ${email}: ${error.message}`);
    logger.step(`Deleted auth user: ${email}`);
  }
}

module.exports = {
  findUserByEmail,
  createAuthUser,
  ensureAuthUserRole,
  deleteSeededAuthUsers,
  SEED_EMAILS,
};
