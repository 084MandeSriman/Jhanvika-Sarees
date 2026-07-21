let loadPromise = null

// Loads https://checkout.razorpay.com/v1/checkout.js exactly once, however
// many times this is called, and resolves once window.Razorpay is ready.
export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true)
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Could not load the Razorpay checkout script. Check your internet connection.'))
    document.body.appendChild(script)
  })
  return loadPromise
}
