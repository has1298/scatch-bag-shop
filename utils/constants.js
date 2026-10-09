const COUNTRIES = [
  'Pakistan',
  'India',
  'Bangladesh',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'United Kingdom',
  'United States',
  'Canada',
];

const PAYMENT_METHODS = {
  cod: 'Cash on delivery',
};

const ORDER_STATUSES = ['placed', 'shipped', 'delivered', 'cancelled'];

const STATUS_LABELS = {
  placed: 'Placed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

module.exports = { COUNTRIES, PAYMENT_METHODS, ORDER_STATUSES, STATUS_LABELS };
