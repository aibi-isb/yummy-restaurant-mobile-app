// ─── Category Seeding ─────────────────────────────────────────────────────────
// Upserts the configured category source of truth.

const { supabase } = require('./supabase');
const { CATEGORY_BUCKET } = require('./storage');
const { seedCategories: seedCategoryData } = require('../data/categories');
const { SEED_TAG, isMissingSeedMetadataError, seedKey, stripSeedMetadataRows } = require('./seedKeys');
const logger = require('./logger');

function getSeedCategories() {
  return seedCategoryData;
}

async function seedCategories() {
  logger.step('Upserting categories…');

  const rows = getSeedCategories().map((category) => ({
    image: supabase.storage.from(CATEGORY_BUCKET).getPublicUrl(category.bucketPath).data.publicUrl,
    id: category.id,
    name: category.name,
    seed_tag: SEED_TAG,
    seed_key: seedKey('category', category.slug),
  }));

  const { error } = await supabase
    .from('categories')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    if (isMissingSeedMetadataError(error)) {
      logger.warn('categories seed metadata columns are missing — retrying category upsert without seed_tag/seed_key.');
      const { error: retryError } = await supabase
        .from('categories')
        .upsert(stripSeedMetadataRows(rows), { onConflict: 'id' });

      if (!retryError) {
        const categories = getSeedCategories().map((category) => category.name);
        logger.success(`Categories seeded (${categories.length}): ${categories.join(', ')}`);
        return;
      }

      throw new Error(`Could not upsert categories: ${retryError.message}`);
    }
    throw new Error(`Could not upsert categories: ${error.message}`);
  }

  const categories = getSeedCategories().map((category) => category.name);
  logger.success(`Categories seeded (${categories.length}): ${categories.join(', ')}`);
}

module.exports = { seedCategories, getSeedCategories };
