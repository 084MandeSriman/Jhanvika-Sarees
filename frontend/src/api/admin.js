import client from './client.js'

export const adminApi = {
  dashboard: () => client.get('/admin/dashboard'),
  reports: {
    sales: (params) => client.get('/admin/reports/sales', { params }),
    inventory: () => client.get('/admin/reports/inventory'),
    customers: () => client.get('/admin/reports/customers'),
  },

  products: {
    list: (params) => client.get('/admin/products', { params }),
    create: (payload) => client.post('/admin/products', payload),
    update: (id, payload) => client.put(`/admin/products/${id}`, payload),
    remove: (id) => client.delete(`/admin/products/${id}`),
    restore: (id) => client.post(`/admin/products/${id}/restore`),
    uploadImage: (id, file, altText) => {
      const form = new FormData()
      form.append('image', file)
      if (altText) form.append('altText', altText)
      // Don't set Content-Type manually — the browser needs to add its own
      // multipart boundary parameter, which a hardcoded header would break.
      return client.post(`/admin/products/${id}/images`, form)
    },
    deleteImage: (id, imageId) => client.delete(`/admin/products/${id}/images/${imageId}`),
  },

  categories: {
    create: (payload) => client.post('/admin/categories', payload),
    update: (id, payload) => client.put(`/admin/categories/${id}`, payload),
    uploadImage: (id, file) => {
      const form = new FormData()
      form.append('image', file)
      return client.post(`/admin/categories/${id}/image`, form)
    },
    remove: (id) => client.delete(`/admin/categories/${id}`),
  },

  orders: {
    list: (params) => client.get('/admin/orders', { params }),
    updateStatus: (id, payload) => client.put(`/admin/orders/${id}/status`, payload),
    resendEmail: (id) => client.post(`/admin/orders/${id}/resend-email`),
  },

  payments: {
    list: (params) => client.get('/admin/payments', { params }),
    get: (id) => client.get(`/admin/payments/${id}`),
  },

  emailLogs: (params) => client.get('/admin/email-logs', { params }),
  sendTestEmail: (to) => client.post('/email/send-test', { to }),

  customers: {
    list: (params) => client.get('/admin/customers', { params }),
    get: (id) => client.get(`/admin/customers/${id}`),
    toggleActive: (id) => client.put(`/admin/customers/${id}/toggle-active`),
  },

  staff: {
    list: () => client.get('/admin/staff'),
    create: (payload) => client.post('/admin/staff', payload),
    toggleActive: (id) => client.put(`/admin/staff/${id}/toggle-active`),
  },

  coupons: {
    list: () => client.get('/admin/coupons'),
    create: (payload) => client.post('/admin/coupons', payload),
    update: (id, payload) => client.put(`/admin/coupons/${id}`, payload),
    remove: (id) => client.delete(`/admin/coupons/${id}`),
  },

  reviews: {
    list: (params) => client.get('/admin/reviews', { params }),
    approve: (id) => client.put(`/admin/reviews/${id}/approve`),
    remove: (id) => client.delete(`/admin/reviews/${id}`),
  },

  banners: {
    list: () => client.get('/admin/banners'),
    create: (payload) => client.post('/admin/banners', payload),
    update: (id, payload) => client.put(`/admin/banners/${id}`, payload),
    remove: (id) => client.delete(`/admin/banners/${id}`),
  },

  cms: {
    list: () => client.get('/admin/cms'),
    create: (payload) => client.post('/admin/cms', payload),
    update: (id, payload) => client.put(`/admin/cms/${id}`, payload),
    remove: (id) => client.delete(`/admin/cms/${id}`),
  },

  support: {
    messages: () => client.get('/admin/support/messages'),
    resolveMessage: (id) => client.put(`/admin/support/messages/${id}/resolve`),
    newsletter: () => client.get('/admin/support/newsletter'),
  },

  settings: {
    get: (group) => client.get('/admin/settings', { params: group ? { group } : {} }),
    update: (group, values) => client.put('/admin/settings', { group, values }),
  },

  activityLogs: (params) => client.get('/admin/activity-logs', { params }),
  searchAnalytics: () => client.get('/admin/search-analytics'),
}
