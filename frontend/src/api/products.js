import client from './client.js'

export const productsApi = {
  list: (params) => client.get('/products', { params }),
  getBySlug: (slug) => client.get(`/products/${slug}`),
  related: (slug) => client.get(`/products/${slug}/related`),
  addReview: (productId, payload) => client.post(`/products/${productId}/reviews`, payload),
}

export const categoriesApi = {
  list: () => client.get('/categories'),
}

export const bannersApi = {
  list: (position) => client.get('/banners', { params: position ? { position } : {} }),
}

export const pagesApi = {
  getBySlug: (slug) => client.get(`/pages/${slug}`),
}

export const couponsApi = {
  validate: (code, subtotal) => client.post('/coupons/validate', { code, subtotal }),
}

export const contactApi = {
  send: (payload) => client.post('/contact', payload),
  subscribe: (email) => client.post('/newsletter/subscribe', { email }),
}
