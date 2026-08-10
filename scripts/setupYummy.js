const { seedStorageAssets } = require('./setupYummyInternals');
const { seedAuth } = require('./seedAuth');
const { seedDatabase } = require('./seedDatabase');
const { runVerifySeed } = require('./verifySeed');
const logger = require('./lib/logger');

async function setupYummy() {
  console.log('🍽️  Setting up YUMMY demo data…');

  await seedStorageAssets();
  await seedAuth();
  await seedDatabase();
  await runVerifySeed();

  console.log('✅ YUMMY setup complete\n');
}

module.exports = { setupYummy };

if (require.main === module) {
  setupYummy().catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
}
