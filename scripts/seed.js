const { setupYummy } = require('./setupYummy');
const logger = require('./lib/logger');

async function seed() {
  await setupYummy();
}

module.exports = { seed };

if (require.main === module) {
  seed().catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
}
