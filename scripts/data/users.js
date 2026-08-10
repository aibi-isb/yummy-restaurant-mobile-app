const seedUsers = [
  {
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
    role: 'super_admin',
    fullName: 'YUMMY Super Admin',
    username: process.env.SEED_ADMIN_USERNAME,
    phone: '+232 76 000 001',
    address: 'YUMMY Restaurant HQ',
    seedKey: 'seed_user_super_admin',
    enabled: true,
  },
  {
    email: process.env.SEED_CUSTOMER_EMAIL,
    password: process.env.SEED_CUSTOMER_PASSWORD,
    role: 'customer',
    fullName: 'Demo Customer',
    username: process.env.SEED_CUSTOMER_USERNAME,
    phone: '+232 76 000 002',
    address: '15 Aberdeen Road, Freetown',
    seedKey: 'seed_user_customer',
    enabled: true,
  },
  {
    email: 'manager@yummy.com',
    password: process.env.SEED_MANAGER_PASSWORD,
    role: 'restaurant_manager',
    fullName: 'Demo Restaurant Manager',
    username: 'demo_manager',
    phone: '+232 76 000 003',
    address: 'YUMMY Restaurant HQ',
    seedKey: 'seed_user_restaurant_manager',
    enabled: false,
  },
  {
    email: 'rider@yummy.com',
    password: process.env.SEED_RIDER_PASSWORD,
    role: 'delivery_rider',
    fullName: 'Demo Delivery Rider',
    username: 'demo_rider',
    phone: '+232 76 000 004',
    address: 'YUMMY Delivery Hub',
    seedKey: 'seed_user_delivery_rider',
    enabled: false,
  },
];

function getEnabledSeedUsers() {
  return seedUsers.filter((user) => user.enabled);
}

function validateSeedUsers(users = getEnabledSeedUsers()) {
  const missing = [];

  for (const user of users) {
    if (!user.email) missing.push(`${user.role}: email`);
    if (!user.username) missing.push(`${user.role}: username`);
    if (!user.password) missing.push(`${user.role}: password`);
  }

  if (missing.length) {
    throw new Error(
      `Missing seed user environment values: ${missing.join(', ')}. See .env.example.`
    );
  }
}

module.exports = { getEnabledSeedUsers, seedUsers, validateSeedUsers };
