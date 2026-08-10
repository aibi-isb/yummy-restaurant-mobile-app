// ─── Clear Seeded Data ────────────────────────────────────────────────────────
// Deletes all rows tagged with seed_tag = 'default', working from child tables
// up to parent tables to respect foreign-key constraints.
//
// Tables that may not yet exist in the schema are handled gracefully — the
// delete call will simply return 0 affected rows without throwing.
//
// IMPORTANT: This function only deletes seed data. Rows created manually
// during development or testing (without seed_tag = 'default') are left intact.

const { supabase } = require('./supabase');
const { deleteSeededAuthUsers } = require('./auth');
const { seedCategories } = require('../data/categories');
const { seedNotificationTemplates } = require('../data/notifications');
const { seedOrderPlans } = require('../data/orders');
const { seedProducts } = require('../data/products');
const { getEnabledSeedUsers } = require('../data/users');
const { SEED_TAG, isMissingSeedMetadataError } = require('./seedKeys');
const logger = require('./logger');

// ─── Deletion order ───────────────────────────────────────────────────────────
// Child tables first → parent tables last.
// Add new tables here as the schema grows; the loop handles everything.

const SEED_TAG_TABLES = [
  'notifications',  // depends on profiles
  'favorites',      // depends on foods, profiles
  'payments',       // depends on orders
  'order_items',    // depends on orders, foods
  'orders',         // depends on profiles
  'cart_items',     // depends on foods, profiles
  'foods',          // depends on categories
  'categories',     // no FK dependencies on seed tables
  'profiles',       // depends on auth.users (deleted last via Auth API)
];

function isMissingTableError(error, table) {
  const message = error?.message ?? '';

  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    message.includes(`Could not find the table 'public.${table}' in the schema cache`) ||
    message.includes(`relation "${table}" does not exist`)
  );
}

function orderItemIds() {
  return seedOrderPlans.flatMap((plan, index) =>
    Array.from({ length: plan.itemCount }, (_, itemIndex) =>
      `00000000-0000-5000-8000-${String(index * 10 + itemIndex + 1).padStart(12, '0')}`
    )
  );
}

const FALLBACK_DELETE_TARGETS = {
  notifications: {
    column: 'id',
    values: () =>
      seedNotificationTemplates.map((_, index) =>
        `00000000-0000-7000-8000-${String(index + 1).padStart(12, '0')}`
      ),
  },
  payments: {
    column: 'id',
    values: () =>
      seedOrderPlans.map((_, index) =>
        `00000000-0000-6000-8000-${String(index + 1).padStart(12, '0')}`
      ),
  },
  order_items: {
    column: 'id',
    values: orderItemIds,
  },
  orders: {
    column: 'id',
    values: () => seedOrderPlans.map((order) => order.id),
  },
  foods: {
    column: 'name',
    values: () => seedProducts.map((product) => product.name),
  },
  categories: {
    column: 'name',
    values: () => seedCategories.map((category) => category.name),
  },
  profiles: {
    column: 'email',
    values: () => getEnabledSeedUsers().map((user) => user.email).filter(Boolean),
    alternatives: [
      {
        column: 'username',
        values: () => getEnabledSeedUsers().map((user) => user.username).filter(Boolean),
      },
    ],
  },
};

async function deleteByFallback(table) {
  const target = FALLBACK_DELETE_TARGETS[table];
  if (!target) {
    logger.warn(`Table "${table}" has no seed metadata column and no deterministic fallback — skipping.`);
    return;
  }

  const values = target.values().filter(Boolean);
  if (!values.length) {
    logger.warn(`No fallback seed values configured for "${table}" — skipping.`);
    return;
  }

  const attempts = [target, ...(target.alternatives ?? [])];
  let lastError = null;

  for (const attempt of attempts) {
    const attemptValues = attempt.values().filter(Boolean);
    if (!attemptValues.length) continue;

    logger.warn(`Table "${table}" has no seed_tag column — clearing by deterministic seed ${attempt.column}.`);
    const { error, count } = await supabase
      .from(table)
      .delete({ count: 'exact' })
      .in(attempt.column, attemptValues);

    if (!error) {
      logger.success(`${table}: ${count ?? 0} fallback row(s) deleted`);
      return;
    }

    lastError = error;
    if (!error.message?.includes(`column ${table}.${attempt.column} does not exist`)) {
      break;
    }
  }

  throw new Error(`Could not clear "${table}" by fallback: ${lastError?.message ?? 'unknown error'}`);
}

// ─── Exported function ────────────────────────────────────────────────────────

/**
 * Delete all seed-tagged rows from every known table, then delete the two
 * seeded Auth users from Supabase Auth.
 *
 * Rows without seed_tag = 'default' are never touched.
 */
async function clearSeededData() {
  // ── 1. Database rows ────────────────────────────────────────────────────────
  for (const table of SEED_TAG_TABLES) {
    logger.step(`Clearing ${table} WHERE seed_tag = '${SEED_TAG}'…`);

    const { error, count } = await supabase
      .from(table)
      .delete({ count: 'exact' })
      .eq('seed_tag', SEED_TAG);

    if (error) {
      // A missing relation or schema-cache entry just means the table hasn't
      // been created (or exposed) yet — skip it rather than aborting the run.
      if (isMissingTableError(error, table)) {
        logger.warn(`Table "${table}" does not exist yet — skipping.`);
        continue;
      }
      if (isMissingSeedMetadataError(error)) {
        await deleteByFallback(table);
        continue;
      }
      throw new Error(`Could not clear "${table}": ${error.message}`);
    }

    logger.success(`${table}: ${count ?? 0} row(s) deleted`);
  }

  // ── 2. Auth users ───────────────────────────────────────────────────────────
  logger.step('Deleting seeded Auth users…');
  await deleteSeededAuthUsers();
  logger.success('Auth users deleted');
}

module.exports = { clearSeededData };
