export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const CURRENCY = 'USD'

export const PAYMENT_METHODS = {
  CARD: 'card',
  PAYPAL: 'paypal',
}

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Garden',
  'Sports',
  'Toys',
  'Beauty',
  'Automotive',
]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rating' },
  { value: 'popular', label: 'Most Popular' },
]