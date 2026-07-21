import client from './client.js'

export const wishlistApi = {
  get: () => client.get('/wishlist'),
  toggle: (productId) => client.post('/wishlist/toggle', { productId }),
}

export const addressesApi = {
  list: () => client.get('/addresses'),
  create: (payload) => client.post('/addresses', payload),
  update: (id, payload) => client.put(`/addresses/${id}`, payload),
  remove: (id) => client.delete(`/addresses/${id}`),
}

export const ordersApi = {
  create: (payload) => client.post('/orders', payload),
  mine: () => client.get('/orders/mine'),
  getOne: (idOrNumber) => client.get(`/orders/${idOrNumber}`),
  cancel: (id) => client.put(`/orders/${id}/cancel`),
}

export const paymentsApi = {
  createOrder: (orderId) => client.post('/payments/create-order', { orderId }),
  verify: (payload) => client.post('/payments/verify', payload),
  reportFailure: (payload) => client.post('/payments/failure', payload),
  history: (params) => client.get('/payments/history', { params }),
}

// Invoice is a binary PDF. We fetch it via axios (so the auth header is
// attached) with responseType 'blob', then trigger a browser save — a plain
// <a href> pointing at the API wouldn't carry the Authorization header.
export async function downloadInvoice(orderId, orderNumber) {
  const blob = await client.get(`/orders/${orderId}/invoice`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${orderNumber || orderId}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
