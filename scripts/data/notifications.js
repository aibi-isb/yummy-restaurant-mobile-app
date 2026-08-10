const seedNotificationTemplates = [
  { title: 'Payment received', message: 'We have received your payment for order {{orderId}}.', type: 'payment' },
  { title: 'Order confirmed', message: 'Your order {{orderId}} has been confirmed.', type: 'order' },
  { title: 'Preparing your meal', message: 'The kitchen is preparing order {{orderId}}.', type: 'order' },
  { title: 'Ready for pickup', message: 'Order {{orderId}} is ready.', type: 'order' },
  { title: 'Delivered', message: 'Order {{orderId}} has been delivered.', type: 'order' },
  { title: 'YUMMY promotion', message: 'Try today’s featured meals from the YUMMY menu.', type: 'system' },
];

module.exports = { seedNotificationTemplates };
