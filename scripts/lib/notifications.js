const { supabase } = require('./supabase');
const { seedNotificationTemplates } = require('../data/notifications');
const { seedOrderPlans } = require('../data/orders');
const { SEED_TAG, isMissingSeedMetadataError, seedKey, stripSeedMetadataRows } = require('./seedKeys');
const logger = require('./logger');

async function seedNotifications() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id,user_id')
    .eq('seed_tag', SEED_TAG)
    .order('created_at', { ascending: false });

  if (error) {
    if (isMissingSeedMetadataError(error)) {
      logger.warn('orders seed_tag column is missing — loading seeded orders by deterministic IDs for notifications.');
      const { data: fallbackOrders, error: fallbackError } = await supabase
        .from('orders')
        .select('id,user_id')
        .in('id', seedOrderPlans.map((order) => order.id))
        .order('created_at', { ascending: false });

      if (fallbackError) {
        throw new Error(`Could not load seeded orders for notifications: ${fallbackError.message}`);
      }

      return seedNotificationRows(fallbackOrders ?? []);
    }
    throw new Error(`Could not load seeded orders for notifications: ${error.message}`);
  }

  return seedNotificationRows(orders ?? []);
}

async function seedNotificationRows(orders) {
  const sourceOrders = orders?.length ? orders : [{ id: null, user_id: 'all' }];
  const rows = seedNotificationTemplates.map((template, index) => {
    const order = sourceOrders[index % sourceOrders.length];
    const orderId = order.id;
    return {
      id: `00000000-0000-7000-8000-${String(index + 1).padStart(12, '0')}`,
      user_id: order.user_id ?? 'all',
      title: template.title,
      message: template.message.replace('{{orderId}}', orderId ?? 'your latest order'),
      type: template.type,
      order_id: orderId,
      read: index % 3 === 0,
      seed_tag: SEED_TAG,
      seed_key: seedKey('notification', `${template.type}_${index + 1}`),
    };
  });

  logger.step('Upserting notifications…');
  const { error: upsertError } = await supabase
    .from('notifications')
    .upsert(rows, { onConflict: 'id' });
  if (upsertError) {
    if (isMissingSeedMetadataError(upsertError)) {
      logger.warn('notifications seed metadata columns are missing — retrying notification upsert without seed_tag/seed_key.');
      const { error: retryError } = await supabase
        .from('notifications')
        .upsert(stripSeedMetadataRows(rows), { onConflict: 'id' });

      if (!retryError) {
        logger.success(`Notifications seeded (${rows.length})`);
        return;
      }

      throw new Error(`Could not upsert notifications: ${retryError.message}`);
    }
    throw new Error(`Could not upsert notifications: ${upsertError.message}`);
  }

  logger.success(`Notifications seeded (${rows.length})`);
}

module.exports = { seedNotifications };
