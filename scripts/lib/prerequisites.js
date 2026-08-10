const { supabase } = require('./supabase');
const { getEnabledSeedUsers } = require('../data/users');
const { seedOrderPlans } = require('../data/orders');
const { seedProducts } = require('../data/products');
const { seedCategories } = require('../data/categories');
const { CATEGORY_BUCKET, FOOD_BUCKET } = require('./storage');
const { SEED_TAG, isMissingSeedMetadataError } = require('./seedKeys');

async function assertSeedProfilesExist() {
  const expectedEmails = getEnabledSeedUsers().map((user) => user.email);
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .in('email', expectedEmails);

  if (error) {
    throw new Error(`Could not check seed profiles: ${error.message}`);
  }

  const foundEmails = new Set((data ?? []).map((profile) => profile.email));
  const missing = expectedEmails.filter((email) => !foundEmails.has(email));
  if (missing.length) {
    throw new Error(`Missing seed profiles: ${missing.join(', ')}. Run npm run seed:users first.`);
  }
}

async function assertSeedFoodImagesUploaded() {
  const missing = [];

  for (const product of seedProducts) {
    const { data, error } = await supabase.storage.from(FOOD_BUCKET).list('foods', {
      search: product.imageFile,
    });

    if (error) {
      throw new Error(`Could not check storage object for ${product.imageFile}: ${error.message}`);
    }

    if (!data?.some((item) => item.name === product.imageFile)) {
      missing.push(product.bucketPath);
    }
  }

  if (missing.length) {
    throw new Error(`Missing uploaded seed food images: ${missing.join(', ')}. Run npm run seed:storage first.`);
  }
}

async function assertSeedCategoryImagesUploaded() {
  const missing = [];

  for (const category of seedCategories) {
    const { data, error } = await supabase.storage.from(CATEGORY_BUCKET).list('categories', {
      search: category.bucketPath.split('/').pop(),
    });

    if (error) {
      throw new Error(`Could not check category image for ${category.name}: ${error.message}`);
    }

    const fileName = category.bucketPath.split('/').pop();
    if (!data?.some((item) => item.name === fileName)) missing.push(category.bucketPath);
  }

  if (missing.length) {
    throw new Error(`Missing uploaded seed category images: ${missing.join(', ')}. Run npm run seed:storage first.`);
  }
}

async function assertSeedFoodsExist() {
  const { count, error } = await supabase
    .from('foods')
    .select('*', { count: 'exact', head: true })
    .eq('seed_tag', SEED_TAG);

  if (error) {
    if (isMissingSeedMetadataError(error)) {
      const { count: fallbackCount, error: fallbackError } = await supabase
        .from('foods')
        .select('*', { count: 'exact', head: true })
        .in('id', seedProducts.map((product) => product.slug));

      if (fallbackError) {
        throw new Error(`Could not check seeded foods: ${fallbackError.message}`);
      }

      if (!fallbackCount) {
        throw new Error('No seeded foods found. Run npm run seed:foods first.');
      }
      return;
    }
    throw new Error(`Could not check seeded foods: ${error.message}`);
  }

  if (!count) {
    throw new Error('No seeded foods found. Run npm run seed:foods first.');
  }
}

async function assertSeedOrdersExist() {
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('seed_tag', SEED_TAG);

  if (error) {
    if (isMissingSeedMetadataError(error)) {
      const { count: fallbackCount, error: fallbackError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('id', seedOrderPlans.map((order) => order.id));

      if (fallbackError) {
        throw new Error(`Could not check seeded orders: ${fallbackError.message}`);
      }

      if (!fallbackCount) {
        throw new Error('No seeded orders found. Run npm run seed:orders first.');
      }
      return;
    }
    throw new Error(`Could not check seeded orders: ${error.message}`);
  }

  if (!count) {
    throw new Error('No seeded orders found. Run npm run seed:orders first.');
  }
}

module.exports = {
  assertSeedCategoryImagesUploaded,
  assertSeedFoodImagesUploaded,
  assertSeedFoodsExist,
  assertSeedOrdersExist,
  assertSeedProfilesExist,
};
