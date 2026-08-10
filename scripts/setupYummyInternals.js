const { seedStorage: seedStorageAssetsImpl } = require('./lib/storage');
const logger = require('./lib/logger');

async function seedStorageAssets() {
  logger.section('Storage');
  await seedStorageAssetsImpl();
}

module.exports = { seedStorageAssets };
