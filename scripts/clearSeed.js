const { clearSeededData } = require('./lib/clearData');
const { CATEGORY_BUCKET, removeSeedImages } = require('./lib/storage');
const { seedCategories } = require('./data/categories');
const { seedProducts } = require('./data/products');
const logger = require('./lib/logger');

async function clearSeed() {
  console.log('🗑️  Clearing seeded data…');

  logger.section('Storage objects (food-images)');
  await removeSeedImages(seedProducts.map((product) => product.bucketPath));

  logger.section('Storage objects (category-images)');
  await removeSeedImages(seedCategories.map((category) => category.bucketPath), CATEGORY_BUCKET);

  logger.section('Database rows (seed_tag = \'default\')');
  await clearSeededData();

  console.log('\n✅ Seeded data cleared\n');
}

module.exports = { clearSeed };

if (require.main === module) {
  clearSeed().catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
}
