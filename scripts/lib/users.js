// ─── User Seeding ─────────────────────────────────────────────────────────────
// Creates (or retrieves) the two seed Auth users and upserts their profile rows.
// All profile rows are tagged with seed_tag = 'default' so clear.js can target
// only seeded data without touching manually created records.

const { supabase } = require('./supabase');
const { findUserByEmail, createAuthUser, ensureAuthUserRole } = require('./auth');
const { getEnabledSeedUsers, validateSeedUsers } = require('../data/users');
const { SEED_TAG, isMissingSeedMetadataError, seedKey, stripSeedMetadataRows } = require('./seedKeys');
const logger = require('./logger');

// ─── Internal helper ──────────────────────────────────────────────────────────

/**
 * Ensure one seed user exists in Auth and has a corresponding profile row.
 *
 * @param {{ email: string, password: string, role: string, fullName: string, username: string, phone?: string, address?: string, seedKey?: string }} account
 */
async function ensureUser({ email, password, role, fullName, username, phone, address, seedKey: accountSeedKey }) {
  logger.step(`Provisioning ${role}: ${email}`);

  // ── 1. Auth user ────────────────────────────────────────────────────────────
  let user = await findUserByEmail(email);

  if (user) {
    logger.warn(`Auth user already exists — reusing: ${email} (${user.id})`);
  } else {
    user = await createAuthUser(email, password, {
      username,
      full_name: fullName,
      role,
    });
    logger.success(`Auth user created: ${email} (${user.id})`);
  }

  user = await ensureAuthUserRole(user, role);
  await upsertProfile({ userId: user.id, email, role, fullName, username, phone, address, seedKey: accountSeedKey });
}

async function upsertProfile({ userId, email, role, fullName, username, phone, address, seedKey: accountSeedKey }) {
  // Upsert so repeated runs update the role/seed_tag in place rather than
  // failing on a unique-key conflict.
  const row = {
    id: userId,
    email,
    role,
    full_name: fullName,
    username,
    phone,
    address,
    seed_tag: SEED_TAG,
    seed_key: accountSeedKey ?? seedKey('user', username),
  };

  await upsertProfileRow(row, email);

  logger.success(`Profile upserted:  ${role} — ${userId}`);
}

async function upsertProfileRow(row, email) {
  let attempt = { ...row };

  for (let retries = 0; retries < 8; retries += 1) {
    const { error } = await supabase
      .from('profiles')
      .upsert(attempt, { onConflict: 'id' });

    if (!error) return;

    const missingColumn = error.message?.match(/'([^']+)' column/)?.[1];
    if (missingColumn && Object.prototype.hasOwnProperty.call(attempt, missingColumn)) {
      logger.warn(`profiles.${missingColumn} is missing — retrying profile upsert without that column.`);
      const { [missingColumn]: _removed, ...nextAttempt } = attempt;
      attempt = nextAttempt;
      continue;
    }

    if (isMissingSeedMetadataError(error)) {
      logger.warn('profiles seed metadata columns are missing — retrying profile upsert without seed_tag/seed_key.');
      attempt = stripSeedMetadataRows(attempt);
      continue;
    }

    if (
      attempt.role === 'super_admin' &&
      (
        error.message?.includes('profiles_role_check') ||
        error.message?.includes('violates check constraint') ||
        error.message?.includes('invalid input value for enum user_role')
      )
    ) {
      logger.warn('profiles.role does not allow super_admin yet — retrying profile upsert with admin role.');
      attempt = { ...attempt, role: 'admin' };
      continue;
    }

    throw new Error(`Could not upsert profile for ${email}: ${error.message}`);
  }

  throw new Error(`Could not upsert profile for ${email}: profile schema compatibility retries exhausted.`);
}

// ─── Exported seeding functions ───────────────────────────────────────────────

async function seedUsers() {
  const users = getEnabledSeedUsers();
  validateSeedUsers(users);

  for (const user of users) {
    await ensureUser(user);
  }
}

async function seedProfiles() {
  const users = getEnabledSeedUsers();
  validateSeedUsers(users);

  for (const account of users) {
    const user = await findUserByEmail(account.email);
    if (!user) {
      throw new Error(`Auth user is missing for ${account.email}. Run npm run seed:users first.`);
    }

    await upsertProfile({
      userId: user.id,
      email: account.email,
      role: account.role,
      fullName: account.fullName,
      username: account.username,
      phone: account.phone,
      address: account.address,
      seedKey: account.seedKey,
    });
  }
}

/** Create (or retrieve) the admin auth user and profile. */
async function createAdminUser() {
  const admin = getEnabledSeedUsers().find((user) => ['admin', 'super_admin'].includes(user.role));
  if (!admin) throw new Error('No enabled admin seed user is configured.');
  validateSeedUsers([admin]);
  await ensureUser(admin);
}

/** Create (or retrieve) the customer auth user and profile. */
async function createCustomer() {
  const customer = getEnabledSeedUsers().find((user) => user.role === 'customer');
  if (!customer) throw new Error('No enabled customer seed user is configured.');
  validateSeedUsers([customer]);
  await ensureUser(customer);
}

module.exports = { createAdminUser, createCustomer, seedProfiles, seedUsers };
