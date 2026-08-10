const { supabase } = require('./supabase');
const { SEED_TAG, seedKey } = require('./seedKeys');
const logger = require('./logger');

async function seedPaymentConfig() {
  const row = {
    id: 'default',
    payment_methods: [
      { id: 'mobile_money', label: 'Mobile Money', icon: 'phone-portrait-outline', iconColor: '#2E7D32', isRecommended: true, recommendedLabel: 'Recommended' },
      { id: 'credit_card', label: 'Card', icon: 'card-outline', iconColor: '#E65100', isRecommended: false },
    ],
    mobile_networks: ['Orange Money', 'Afrimoney', 'QMoney', 'Other'],
    info_text: '',
    security_badge_text: 'Secure Payment',
    progress_steps: ['Cart', 'Checkout', 'Payment', 'Confirmation'],
    tracking_step_labels: [
      { label: 'Order accepted', statuses: ['Pending', 'Payment Received'] },
      { label: 'Preparing', statuses: ['Preparing', 'Ready'] },
      { label: 'Delivered', statuses: ['Delivered'] },
    ],
    demo_origin: { latitude: 8.484, longitude: -13.234 },
    demo_destination: { latitude: 8.464, longitude: -13.244 },
    tracking_toast_message: 'Your Order is being tracked',
    seed_tag: SEED_TAG,
    seed_key: seedKey('paymentConfig', 'default'),
  };

  logger.step('Upserting payment config…');
  const { error } = await supabase.from('payment_config').upsert(row, { onConflict: 'id' });
  if (error) throw new Error(`Could not upsert payment config: ${error.message}`);
  logger.success('Payment config seeded');
}

module.exports = { seedPaymentConfig };
