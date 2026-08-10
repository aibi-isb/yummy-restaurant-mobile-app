const { seedStorage: seedStorageAssets } = require('./lib/storage');
const logger = require('./lib/logger');

async function seedStorage() {
  console.log('🖼️  Seeding YUMMY storage…');
  logger.section('Storage');
  await seedStorageAssets();
  console.log('\n✅ Storage seeded\n');
}

module.exports = { seedStorage };

if (require.main === module) {
  seedStorage().catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
}
