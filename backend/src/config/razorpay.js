// const Razorpay = require('razorpay')
// require('dotenv').config()

// if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//   // eslint-disable-next-line no-console
//   console.warn(
//     '⚠️  RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. ' +
//     'Online payments will fail until backend/.env is configured — see backend/README.md.'
//   )
// }

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// })

// module.exports = razorpay


const Razorpay = require("razorpay");

let razorpay = null;

if (
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET
) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  console.log("✅ Razorpay initialized");
} else {
  console.log("❌ Razorpay keys missing");
}

module.exports = razorpay;