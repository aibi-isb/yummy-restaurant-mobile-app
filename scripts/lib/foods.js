const { supabase } = require('./supabase');
const { seedProducts } = require('../data/products');
const { FOOD_BUCKET } = require('./storage');
const { assertSeedFoodImagesUploaded } = require('./prerequisites');
const { SEED_TAG, isMissingSeedMetadataError, seedKey, stripSeedMetadataRows } = require('./seedKeys');
const logger = require('./logger');

async function seedFoods() {
  await assertSeedFoodImagesUploaded();

  const rows = [];
  for (const product of seedProducts) {
    const { data } = supabase.storage.from(FOOD_BUCKET).getPublicUrl(product.bucketPath);
    rows.push({
      id: product.slug,
      name: product.name,
      description: product.description,
      category: product.category,
      categories: [product.category],
      price: product.price,
      image: data.publicUrl,
      featured: product.isFeatured,
      popular: product.isPopular,
      available: product.isAvailable,
      orders: 0,
      seed_tag: SEED_TAG,
      seed_key: seedKey('food', product.slug),
    });
  }

  logger.step('Upserting foods…');

  const { error } = await supabase.from('foods').upsert(rows, { onConflict: 'id' });

  if (error) {
    if (isMissingSeedMetadataError(error)) {
      logger.warn('foods seed metadata columns are missing — retrying food upsert without seed_tag/seed_key.');
      const { error: retryError } = await supabase
        .from('foods')
        .upsert(stripSeedMetadataRows(rows), { onConflict: 'id' });

      if (!retryError) {
        logger.success(`Foods seeded (${rows.length}): ${rows.map((f) => f.name).join(', ')}`);
        return;
      }

      throw new Error(`Could not upsert foods: ${retryError.message}`);
    }
    throw new Error(`Could not upsert foods: ${error.message}`);
  }

  logger.success(`Foods seeded (${rows.length}): ${rows.map((f) => f.name).join(', ')}`);
}

module.exports = { seedFoods };
