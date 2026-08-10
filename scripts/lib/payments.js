const { supabase } = require('./supabase');
const { seedOrderPlans } = require('../data/orders');
const { seedPaymentPlans } = require('../data/payments');
const { SEED_TAG, isMissingSeedMetadataError, seedKey, stripSeedMetadataRows } = require('./seedKeys');
const logger = require('./logger');

async function seedPayments() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id,user_id,total')
    .eq('seed_tag', SEED_TAG)
    .order('created_at', { ascending: false });

  if (error) {
    if (isMissingSeedMetadataError(error)) {
      logger.warn('orders seed_tag column is missing — loading seeded orders by deterministic IDs.');
      const { data: fallbackOrders, error: fallbackError } = await supabase
        .from('orders')
        .select('id,user_id,total')
        .in('id', seedOrderPlans.map((order) => order.id))
        .order('created_at', { ascending: false });

      if (fallbackError) {
        throw new Error(`Could not load seeded orders: ${fallbackError.message}`);
      }

      return seedPaymentRows(fallbackOrders ?? []);
    }
    throw new Error(`Could not load seeded orders: ${error.message}`);
  }

  return seedPaymentRows(orders ?? []);
}

async function seedPaymentRows(orders) {
  if (!orders?.length) {
    throw new Error('No seeded orders found. Run npm run seed:orders first.');
  }

  const rows = orders.map((order, index) => {
    const plan = seedPaymentPlans[index % seedPaymentPlans.length];
    return {
      id: `00000000-0000-6000-8000-${String(index + 1).padStart(12, '0')}`,
      order_id: order.id,
      user_id: order.user_id,
      amount: order.total,
      method: plan.method,
      provider: plan.provider,
      phone: plan.phone,
      card_last4: plan.cardLast4,
      status: plan.status,
      seed_tag: SEED_TAG,
      seed_key: seedKey('payment', order.id),
    };
  });

  logger.step('Upserting payments…');
  const { error: upsertError } = await supabase.from('payments').upsert(rows, { onConflict: 'id' });
  if (upsertError) {
    if (isMissingSeedMetadataError(upsertError)) {
      logger.warn('payments seed metadata columns are missing — retrying payment upsert without seed_tag/seed_key.');
      const { error: retryError } = await supabase
        .from('payments')
        .upsert(stripSeedMetadataRows(rows), { onConflict: 'id' });

      if (!retryError) {
        logger.success(`Payments seeded (${rows.length})`);
        return;
      }

      throw new Error(`Could not upsert payments: ${retryError.message}`);
    }
    throw new Error(`Could not upsert payments: ${upsertError.message}`);
  }

  logger.success(`Payments seeded (${rows.length})`);
}

module.exports = { seedPayments };
