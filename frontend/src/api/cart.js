import client from './client.js'

// Cart, recently-viewed, search, and public-settings services are grouped
// here since they're all small, related storefront-session concerns.

export const cartApi = {
  get: () => client.get('/cart'),
  addItem: (productId, qty = 1) => client.post('/cart/items', { productId, qty }),
  updateItem: (itemId, qty) => client.put(`/cart/items/${itemId}`, { qty }),
  removeItem: (itemId) => client.delete(`/cart/items/${itemId}`),
  saveForLater: (itemId) => client.put(`/cart/items/${itemId}/save-for-later`),
  moveToCart: (itemId) => client.put(`/cart/items/${itemId}/move-to-cart`),
  merge: (items) => client.post('/cart/merge', { items }),
  clear: () => client.delete('/cart'),
}

export const recentlyViewedApi = {
  track: (productId) => client.post('/recently-viewed', { productId }),
  list: () => client.get('/recently-viewed'),
}

export const searchApi = {
  trending: () => client.get('/search/trending'),
}

export const settingsApi = {
  getPublic: () => client.get('/settings'),
}
