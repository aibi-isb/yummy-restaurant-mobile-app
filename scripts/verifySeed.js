const { verifySeed } = require('./lib/verify');
const logger = require('./lib/logger');

async function runVerifySeed() {
  console.log('🔎 Verifying YUMMY seed…');
  logger.section('Seed Verification');
  await verifySeed();
  console.log('\n✅ Seed verification complete\n');
}

module.exports = { runVerifySeed };

if (require.main === module) {
  runVerifySeed().catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
}
