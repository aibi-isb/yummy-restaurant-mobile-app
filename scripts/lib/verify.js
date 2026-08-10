const { supabase } = require('./supabase');
const { getEnabledSeedUsers } = require('../data/users');
const { seedCategories } = require('../data/categories');
const { seedNotificationTemplates } = require('../data/notifications');
const { seedOrderPlans } = require('../data/orders');
const { seedProducts } = require('../data/products');
const { SEED_TAG, isMissingSeedMetadataError } = require('./seedKeys');
const logger = require('./logger');

const FALLBACK_COUNTS = {
  categories: { column: 'id', values: () => seedCategories.map((category) => category.id) },
  foods: { column: 'id', values: () => seedProducts.map((product) => product.slug) },
  orders: { column: 'id', values: () => seedOrderPlans.map((order) => order.id) },
  payments: {
    column: 'id',
    values: () =>
      seedOrderPlans.map((_, index) =>
        `00000000-0000-6000-8000-${String(index + 1).padStart(12, '0')}`
      ),
  },
  notifications: {
    column: 'id',
    values: () =>
      seedNotificationTemplates.map((_, index) =>
        `00000000-0000-7000-8000-${String(index + 1).padStart(12, '0')}`
      ),
  },
  order_items: {
    column: 'order_id',
    values: () => seedOrderPlans.map((order) => order.id),
  },
};

async function countRows(table) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq('seed_tag', SEED_TAG);

  if (error) {
    if (isMissingSeedMetadataError(error) && FALLBACK_COUNTS[table]) {
      const fallback = FALLBACK_COUNTS[table];
      const { count: fallbackCount, error: fallbackError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .in(fallback.column, fallback.values());

      if (fallbackError) {
        throw new Error(`Could not verify ${table}: ${fallbackError.message}`);
      }

      return fallbackCount ?? 0;
    }
    throw new Error(`Could not verify ${table}: ${error.message}`);
  }

  return count ?? 0;
}

async function verifySeed() {
  logger.step('Verifying seeded auth profiles…');
  const expectedUsers = getEnabledSeedUsers();
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('email')
    .in('email', expectedUsers.map((user) => user.email));

  if (profilesError) {
    throw new Error(`Could not verify profiles: ${profilesError.message}`);
  }

  const foundEmails = new Set((profiles ?? []).map((profile) => profile.email));
  for (const user of expectedUsers) {
    if (!foundEmails.has(user.email)) {
      throw new Error(`Missing seeded profile: ${user.email}`);
    }
  }

  const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });
  if (authError) {
    throw new Error(`Could not verify Auth users: ${authError.message}`);
  }

  for (const expected of expectedUsers) {
    const authUser = authData.users.find(
      (user) => user.email?.toLowerCase() === expected.email.toLowerCase()
    );
    if (!authUser) {
      throw new Error(`Missing seeded Auth user: ${expected.email}`);
    }
    if (authUser.app_metadata?.role !== expected.role) {
      throw new Error(
        `Auth role mismatch for ${expected.email}: expected ${expected.role}, found ${authUser.app_metadata?.role ?? 'none'}`
      );
    }
  }

  const categories = await countRows('categories');
  const foods = await countRows('foods');
  const orders = await countRows('orders');
  const orderItems = await countRows('order_items');
  const payments = await countRows('payments');
  const notifications = await countRows('notifications');

  if (foods < seedProducts.length) {
    throw new Error(`Expected at least ${seedProducts.length} foods, found ${foods}`);
  }

  const { data: foodRows, error: foodRowsError } = await supabase
    .from("foods")
    .select("id, image")
    .in("id", seedProducts.map((p) => p.slug));

  if (foodRowsError) {
    throw new Error(`Could not verify food images: ${foodRowsError.message}`);
  }

  const emptyImageFoods = (foodRows ?? []).filter((row) => !row.image);
  if (emptyImageFoods.length > 0) {
    throw new Error(
      `${emptyImageFoods.length} food(s) have empty image: ${emptyImageFoods.map((f) => f.id).join(", ")}`
    );
  }

  const { data: categoryRows, error: categoryRowsError } = await supabase
    .from("categories")
    .select("id, image")
    .in("id", seedCategories.map((category) => category.id));

  if (categoryRowsError) {
    throw new Error(`Could not verify category images: ${categoryRowsError.message}`);
  }

  const emptyImageCategories = (categoryRows ?? []).filter((row) => !row.image);
  if (emptyImageCategories.length > 0) {
    throw new Error(
      `${emptyImageCategories.length} category image(s) are empty: ${emptyImageCategories.map((category) => category.id).join(", ")}`
    );
  }

  logger.success(
    `Verified seed: categories=${categories}, foods=${foods}, orders=${orders}, order_items=${orderItems}, payments=${payments}, notifications=${notifications}`
  );
}

module.exports = { verifySeed };
