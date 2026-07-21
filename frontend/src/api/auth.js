import client from './client.js'

export const authApi = {
  register: (payload) => client.post('/auth/register', payload),
  login: (payload) => client.post('/auth/login', payload),
  refresh: () => client.post('/auth/refresh'),
  logout: () => client.post('/auth/logout'),
  me: () => client.get('/auth/me'),
  updateMe: (payload) => client.put('/auth/me', payload),
  changePassword: (payload) => client.put('/auth/change-password', payload),
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => client.post('/auth/reset-password', payload),
  verifyEmail: (token) => client.get(`/auth/verify-email/${token}`),
  resendVerification: () => client.post('/auth/resend-verification'),
  sessions: () => client.get('/auth/sessions'),
  revokeSession: (id) => client.delete(`/auth/sessions/${id}`),
}
