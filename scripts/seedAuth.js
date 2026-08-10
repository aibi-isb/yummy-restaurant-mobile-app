const { seedUsers } = require('./lib/users');
const logger = require('./lib/logger');

async function seedAuth() {
  console.log('👤 Seeding YUMMY users…');
  logger.section('Auth Users and Profiles');
  await seedUsers();
  console.log('\n✅ Users seeded\n');
}

module.exports = { seedAuth };

if (require.main === module) {
  seedAuth().catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
}
