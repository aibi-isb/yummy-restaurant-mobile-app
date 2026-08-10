const seedOrderStatuses = ['Pending', 'Payment Received', 'Preparing', 'Ready', 'Delivered'];

const seedOrderPlans = Array.from({ length: 25 }, (_, index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  status: seedOrderStatuses[index % seedOrderStatuses.length],
  daysAgo: index,
  itemCount: 1 + (index % 3),
}));

module.exports = { seedOrderPlans, seedOrderStatuses };
