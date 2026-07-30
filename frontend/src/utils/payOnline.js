import { paymentsApi } from '../api/orders.js'
import { loadRazorpayScript } from './loadRazorpay.js'

/**
 * Opens the Razorpay checkout modal for an existing (pending-payment) order
 * and resolves once the payment is verified server-side, or rejects with a
 * user-facing message on cancellation/failure.
 */
export async function payOnline(order, prefill = {}) {
  try {
    await loadRazorpayScript()
  } catch (err) {
    throw new Error('Could not load Razorpay checkout. Please check your internet connection and try again.')
  }

  let intent
  try {
    intent = await paymentsApi.createOrder(order.id)
  } catch (err) {
    throw new Error(err.message || 'Could not initialize Razorpay payment. Please try again later.')
  }
console.log("Payment Intent:", intent.data);
console.log("Key ID:", intent.data.keyId);
  if (!intent?.data?.razorpayOrderId) {
    if (intent?.data?.razorpayOrderId) {
      await paymentsApi.reportFailure({ razorpay_order_id: intent.data.razorpayOrderId, reason: 'invalid_payment_session' }).catch(() => {})
    }
    throw new Error('Could not start payment session. Please try again later.')
  }

  async function reportRazorpayFailure(reason) {
    try {
      await paymentsApi.reportFailure({ razorpay_order_id: intent.data.razorpayOrderId, reason })
    } catch {
      // best-effort: don't mask the original payment error
    }
  }

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
        if (!response?.razorpay_order_id || !response?.razorpay_payment_id || !response?.razorpay_signature) {
          await reportRazorpayFailure('malformed_payment_response')
          return reject(new Error('Payment response was malformed. Please try again.'))
        }
        try {
          await paymentsApi.verify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          resolve()
        } catch (err) {
          await reportRazorpayFailure(err.message || 'payment_verification_failed')
          reject(new Error(err.message || 'Payment verification failed. Please try again.'))
        }
      },
      modal: {
        ondismiss: async () => {
          await reportRazorpayFailure('user_cancelled')
          reject(new Error('Payment was cancelled.'))
        },
      },
    })

    rzp.on('payment.failed', async (response) => {
      await reportRazorpayFailure(response.error?.description || 'payment_failed')
      reject(new Error(response.error?.description || 'Payment failed. Please try again.'))
    })

    try {
      rzp.open()
    } catch (err) {
      reportRazorpayFailure('checkout_open_failed')
      reject(new Error('Failed to open Razorpay checkout.'))
    }
  })
}


