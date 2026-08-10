const seedPaymentPlans = [
  { method: 'mobile_money', provider: 'Orange Money', phone: '+23276000002', status: 'Approved' },
  { method: 'mobile_money', provider: 'Afrimoney', phone: '+23277000002', status: 'Pending Verification' },
  { method: 'credit_card', provider: 'Visa', cardLast4: '4242', status: 'Approved' },
  { method: 'credit_card', provider: 'Mastercard', cardLast4: '5555', status: 'Rejected' },
  { method: 'cash', provider: 'Cash on Delivery', status: 'Pending Verification' },
];

module.exports = { seedPaymentPlans };
