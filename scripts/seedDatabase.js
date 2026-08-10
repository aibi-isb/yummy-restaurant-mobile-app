const { seedProfiles } = require('./lib/users');
const { seedCategories } = require('./lib/categories');
const { seedFoods } = require('./lib/foods');
const { seedOrders } = require('./lib/orders');
const { seedPayments } = require('./lib/payments');
const { seedNotifications } = require('./lib/notifications');
const { seedPaymentConfig } = require('./lib/paymentConfig');
const {
  assertSeedCategoryImagesUploaded,
  assertSeedFoodImagesUploaded,
  assertSeedFoodsExist,
  assertSeedOrdersExist,
  assertSeedProfilesExist,
} = require('./lib/prerequisites');
const logger = require('./lib/logger');

const SEEDERS = {
  profiles: seedProfiles,
  categories: seedCategories,
  foods: seedFoods,
  orders: seedOrders,
  payments: seedPayments,
  notifications: seedNotifications,
  paymentConfig: seedPaymentConfig,
};

const DATABASE_ORDER = ['profiles', 'categories', 'foods', 'orders', 'payments', 'notifications', 'paymentConfig'];

function getOnlyArg(argv) {
  const onlyArg = argv.find((arg) => arg.startsWith('--only='));
  if (onlyArg) return onlyArg.slice('--only='.length);
  return argv.find((arg) => !arg.startsWith('--')) || 'all';
}

async function assertPrerequisites(name) {
  if (name === 'profiles') return;
  if (name === 'categories') {
    await assertSeedCategoryImagesUploaded();
    return;
  }
  if (name === 'foods') {
    await assertSeedFoodImagesUploaded();
    return;
  }
  if (name === 'orders') {
    await assertSeedProfilesExist();
    await assertSeedFoodsExist();
    return;
  }
  if (name === 'payments') {
    await assertSeedOrdersExist();
    return;
  }
  if (name === 'notifications') {
    await assertSeedProfilesExist();
  }
}

async function seedDatabase(target = 'all') {
  console.log(`🗄️  Seeding YUMMY database${target === 'all' ? '' : ` (${target})`}…`);

  const targets = target === 'all' ? DATABASE_ORDER : [target];
  for (const name of targets) {
    const seed = SEEDERS[name];
    if (!seed) {
      throw new Error(`Unknown database seed target "${name}". Use one of: ${DATABASE_ORDER.join(', ')}`);
    }

    logger.section(name);
    await assertPrerequisites(name);
    await seed();
  }

  console.log('\n✅ Database seeded\n');
}

module.exports = { DATABASE_ORDER, seedDatabase };

if (require.main === module) {
  seedDatabase(getOnlyArg(process.argv.slice(2))).catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
}
