import { paymentsApi } from '../api/orders.js'
import { loadRazorpayScript } from './loadRazorpay.js'

/**
 * Opens the Razorpay checkout modal for an existing (pending-payment) order
 * and resolves once the payment is verified server-side, or rejects with a
 * user-facing message on cancellation/failure.
 */
export async function payOnline(order, prefill = {}) {
  await loadRazorpayScript()
  const intent = await paymentsApi.createOrder(order.id)

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: intent.data.keyId,
      amount: intent.data.amount,
      currency: intent.data.currency,
      order_id: intent.data.razorpayOrderId,
      name: intent.data.name,
      description: intent.data.description,
      prefill,
      theme: { color: '#6B1E3C' },
      handler: async (response) => {
        try {
          await paymentsApi.verify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          resolve()
        } catch (err) {
          reject(err)
        }
      },
      modal: {
        ondismiss: async () => {
          try {
            await paymentsApi.reportFailure({ razorpay_order_id: intent.data.razorpayOrderId, reason: 'user_cancelled' })
          } catch {
            // best-effort
          }
          reject(new Error('Payment was cancelled.'))
        },
      },
    })
    rzp.on('payment.failed', async (response) => {
      try {
        await paymentsApi.reportFailure({ razorpay_order_id: intent.data.razorpayOrderId, reason: response.error?.description })
      } catch {
        // best-effort
      }
      reject(new Error(response.error?.description || 'Payment failed.'))
    })
    rzp.open()
  })
}
