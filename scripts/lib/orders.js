const { supabase } = require('./supabase');
const { findUserByEmail } = require('./auth');
const { seedOrderPlans } = require('../data/orders');
const { seedProducts } = require('../data/products');
const { SEED_TAG, isMissingSeedMetadataError, seedKey, stripSeedMetadataRows } = require('./seedKeys');
const logger = require('./logger');

function getCreatedAt(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(11 + (daysAgo % 8), 15, 0, 0);
  return date.toISOString();
}

async function getSeedCustomer() {
  const user = await findUserByEmail('customer@yummy.com');
  if (!user) {
    throw new Error('Seed customer does not exist. Run npm run seed:users first.');
  }
  return user;
}

async function getSeedFoods() {
  const { data, error } = await supabase
    .from('foods')
    .select('id,name,price,image')
    .eq('seed_tag', SEED_TAG)
    .order('name', { ascending: true });

  if (error) {
    if (isMissingSeedMetadataError(error)) {
      logger.warn('foods seed_tag column is missing — loading seeded foods by deterministic IDs.');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('foods')
        .select('id,name,price,image')
        .in('id', seedProducts.map((product) => product.slug))
        .order('name', { ascending: true });

      if (fallbackError) {
        throw new Error(`Could not load seeded foods: ${fallbackError.message}`);
      }

      if (!fallbackData?.length) {
        throw new Error('No seeded foods found. Run npm run seed:foods first.');
      }

      return fallbackData;
    }
    throw new Error(`Could not load seeded foods: ${error.message}`);
  }

  if (!data?.length) {
    throw new Error('No seeded foods found. Run npm run seed:foods first.');
  }

  return data;
}

async function seedOrders() {
  const customer = await getSeedCustomer();
  const foods = await getSeedFoods();

  const orderRows = seedOrderPlans.map((plan, index) => {
    const items = Array.from({ length: plan.itemCount }, (_, itemIndex) => {
      const food = foods[(index + itemIndex) % foods.length];
      const quantity = 1 + ((index + itemIndex) % 2);
      return { food, quantity };
    });
    const subtotal = items.reduce((sum, item) => sum + Number(item.food.price) * item.quantity, 0);
    const deliveryFee = 15;
    const tax = 1;
    const total = subtotal + deliveryFee + tax;

    const createdAt = getCreatedAt(plan.daysAgo);
    const estimatedDelivery = new Date(createdAt);
    estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 30);

    return {
      id: plan.id,
      user_id: customer.id,
      customer_name: 'Demo Customer',
      phone: '+232 76 000 002',
      address: '15 Aberdeen Road, Freetown',
      subtotal,
      delivery_fee: deliveryFee,
      tax,
      total,
      status: plan.status,
      payment_status: plan.status === 'Pending' ? 'Unpaid' : 'Approved',
      estimated_delivery_at: estimatedDelivery.toISOString(),
      delivery_partner_name: 'Samuel Koroma',
      delivery_partner_phone: '+91 987654321',
      created_at: createdAt,
      updated_at: createdAt,
      seed_tag: SEED_TAG,
      seed_key: seedKey('order', plan.id),
    };
  });

  logger.step('Upserting orders…');
  const { error } = await supabase.from('orders').upsert(orderRows, { onConflict: 'id' });
  if (error) {
    if (isMissingSeedMetadataError(error)) {
      logger.warn('orders seed metadata columns are missing — retrying order upsert without seed_tag/seed_key.');
      const { error: retryError } = await supabase
        .from('orders')
        .upsert(stripSeedMetadataRows(orderRows), { onConflict: 'id' });

      if (retryError) {
        throw new Error(`Could not upsert orders: ${retryError.message}`);
      }
    } else {
      throw new Error(`Could not upsert orders: ${error.message}`);
    }
  }

  if (!error || isMissingSeedMetadataError(error)) {
    // Continue to order items after either the normal upsert or metadata fallback succeeds.
  } else {
    throw new Error(`Could not upsert orders: ${error.message}`);
  }

  const orderItems = seedOrderPlans.flatMap((plan, index) =>
    Array.from({ length: plan.itemCount }, (_, itemIndex) => {
      const food = foods[(index + itemIndex) % foods.length];
      const quantity = 1 + ((index + itemIndex) % 2);
      return {
        id: `00000000-0000-5000-8000-${String(index * 10 + itemIndex + 1).padStart(12, '0')}`,
        order_id: plan.id,
        food_id: food.id,
        food_name: food.name,
        price: Number(food.price),
        quantity,
        image: food.image,
        seed_tag: SEED_TAG,
        seed_key: seedKey('order_item', `${plan.id}_${itemIndex + 1}`),
      };
    })
  );

  logger.step('Upserting order items…');
  const { error: itemsError } = await supabase
    .from('order_items')
    .upsert(orderItems, { onConflict: 'id' });
  if (itemsError) {
    if (isMissingSeedMetadataError(itemsError)) {
      logger.warn('order_items seed metadata columns are missing — retrying order item upsert without seed_tag/seed_key.');
      const { error: retryError } = await supabase
        .from('order_items')
        .upsert(stripSeedMetadataRows(orderItems), { onConflict: 'id' });

      if (!retryError) {
        logger.success(`Orders seeded (${orderRows.length})`);
        return;
      }

      throw new Error(`Could not upsert order items: ${retryError.message}`);
    }
    throw new Error(`Could not upsert order items: ${itemsError.message}`);
  }

  logger.success(`Orders seeded (${orderRows.length})`);
}

module.exports = { seedOrders };
