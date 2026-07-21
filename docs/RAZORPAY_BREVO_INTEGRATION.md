# Razorpay + Brevo Integration — Implementation Notes

This document covers exactly what changed when Razorpay (payments) and
Brevo (transactional email) were integrated into the existing Jhanvika
codebase, per your request. Nothing was redesigned; every file below either
extends an existing model/controller/route or adds a new file that follows
the same conventions already in the project.

## 1. New environment variables

Add these to `backend/.env` (already scaffolded in `.env.example`):

```env
# Razorpay (Dashboard → Settings → API Keys; use Test Mode keys first)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Brevo SMTP (Brevo → SMTP & API → SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=hello@jhanvika.example
EMAIL_NAME=Jhanvika Sarees
```

If these are left blank, the app **does not crash** — `razorpayService`
logs a warning and online payments will fail with a clear error, and
`emailService` falls back to logging emails to the console (still recorded
in the `email_logs` table with a note that it was simulated). This makes it
safe to boot the app in a fresh clone before secrets are configured.

## 2. File changes

### New files
```
backend/src/config/razorpay.js          Razorpay SDK instance
backend/src/config/mailer.js            Nodemailer transporter (Brevo SMTP)
backend/src/services/razorpayService.js Order creation + signature verification
backend/src/services/paymentService.js  Payment business logic (orchestrates razorpayService + models)
backend/src/services/emailService.js    The ONE place that calls nodemailer; logs every attempt
backend/src/services/notificationService.js  Resolves order→recipient and calls emailService
backend/src/services/invoiceService.js  PDF invoice generation (pdfkit)
backend/src/emails/templates.js         HTML templates for all 12 email types
backend/src/models/EmailLog.js          Email delivery log (admin-visible)
backend/src/controllers/emailController.js  Admin email-log list + send-test-email
backend/src/routes/email.js             POST /api/email/send-test
backend/src/routes/admin/payments.js    Admin payment history routes
frontend/src/utils/loadRazorpay.js      Lazy-loads checkout.js once
frontend/src/utils/payOnline.js         Shared Razorpay-modal flow (checkout + retry)
frontend/src/admin/pages/Payments.jsx   Admin payment history screen
frontend/src/admin/pages/EmailLogs.jsx  Admin email log + test-send screen
```

### Modified files
```
backend/src/models/Payment.js           Extended: userId, razorpayOrderId,
                                         razorpayPaymentId, razorpaySignature,
                                         currency, paymentMethod, rawPayload;
                                         status enum now pending/paid/failed/refunded/cancelled
backend/src/models/Order.js             Added courierName, trackingUrl (for shipping emails)
backend/src/models/index.js             Payment↔User association; EmailLog↔Order association
backend/src/controllers/paymentController.js  Rewritten: real Razorpay create-order/verify/
                                         failure/history (was a fully simulated gateway)
backend/src/controllers/orderController.js    COD orders auto-confirm + send confirmation
                                         email; cancel/ship/deliver now notify via email;
                                         added downloadInvoice, resendOrderEmail
backend/src/controllers/authController.js     register/forgotPassword/resetPassword now
                                         send real emails via emailService (was console.log)
backend/src/controllers/contactController.js  contact + newsletter now send real emails
backend/src/routes/payments.js          New endpoint paths (see API section)
backend/src/routes/orders.js            + GET /:id/invoice
backend/src/routes/admin/orders.js      + POST /:id/resend-email
backend/src/routes/admin/system.js      + GET /email-logs
backend/src/app.js                      Mounted /api/email
backend/package.json                    + razorpay, nodemailer, pdfkit
backend/.env.example                    + Razorpay/Brevo vars
frontend/src/pages/Checkout.jsx         Real Razorpay Checkout.js modal replaces the
                                         simulated flow; card/UPI detail entry REMOVED
                                         (see Security note below)
frontend/src/pages/Account.jsx          + Payment History tab, invoice download,
                                         retry payment, cancel order
frontend/src/pages/OrderSuccess.jsx     + Download Invoice button
frontend/src/api/orders.js              paymentsApi endpoints updated; + downloadInvoice()
frontend/src/api/admin.js               + payments, emailLogs, sendTestEmail
frontend/src/admin/pages/Orders.jsx     + Resend Email action, courier prompt on "shipped"
frontend/src/admin/components/AdminLayout.jsx  + Payments, Email Logs nav items
frontend/src/App.jsx                    + /admin/payments, /admin/email-logs routes
frontend/package.json                   (no new deps — Razorpay Checkout.js loads via <script> tag)
```

### A necessary, explicitly-flagged UI change
The old checkout had "UPI" and "Card" tabs with **raw input fields for a UPI
ID, card number, expiry, and CVV**, which fed a simulated payment. That
approach cannot be reused with real Razorpay: collecting raw card/CVV data
yourself is a PCI-DSS violation, and Razorpay's own hosted Checkout.js modal
is what's supposed to collect that data instead. So those two tabs became
one **"Pay Online"** tab that opens Razorpay's secure modal (where UPI,
card, netbanking, and wallet all live as options), plus the unchanged "Cash
on Delivery" tab. This is the only UI change made, and it was required for
correctness/security, not preference.

## 3. Database schema changes

```sql
-- payments table (extended)
ALTER TABLE payments
  ADD COLUMN user_id INT NULL,
  ADD COLUMN razorpay_order_id VARCHAR(255) UNIQUE NULL,
  ADD COLUMN razorpay_payment_id VARCHAR(255) NULL,
  ADD COLUMN razorpay_signature VARCHAR(255) NULL,
  ADD COLUMN currency VARCHAR(10) DEFAULT 'INR',
  ADD COLUMN payment_method VARCHAR(50) NULL,
  MODIFY COLUMN status ENUM('pending','paid','failed','refunded','cancelled') DEFAULT 'pending';

-- orders table (extended)
ALTER TABLE orders
  ADD COLUMN courier_name VARCHAR(255) NULL,
  ADD COLUMN tracking_url VARCHAR(255) NULL;

-- new table
CREATE TABLE email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  status ENUM('sent','failed') NOT NULL,
  error TEXT NULL,
  order_id INT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX (type), INDEX (status)
);
```

In development, `npm run seed` (which does `sequelize.sync({ force: true })`)
applies all of this automatically — you don't need to run the SQL above by
hand unless you're migrating a live database with data you need to keep, in
which case use `sequelize-cli` migrations instead of the blunt `seed`
script.

## 4. API documentation

### Payments
| Method | Path | Auth | Body / Notes |
|---|---|---|---|
| POST | `/api/payments/create-order` | optional (guest checkout OK) | `{ orderId }` → `{ razorpayOrderId, amount, currency, keyId, orderNumber }` |
| POST | `/api/payments/verify` | optional | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` → `{ order, payment }` |
| POST | `/api/payments/failure` | optional | `{ razorpay_order_id, reason }` — call when the Razorpay modal is dismissed or reports `payment.failed` |
| GET | `/api/payments/history` | required | paginated list of the logged-in user's payments |
| GET | `/api/admin/payments` | admin | `?status=` filter, paginated |
| GET | `/api/admin/payments/:id` | admin | full payment + order detail |

### Orders (additions)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/orders/:id/invoice` | optional (ownership-checked) | streams a PDF; `:id` accepts either the numeric id or the order number |
| POST | `/api/admin/orders/:id/resend-email` | admin | resends the order confirmation email |

### Email
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/email/send-test` | admin | `{ to }` — sends a one-off test email through the live SMTP config |
| GET | `/api/admin/email-logs` | admin | paginated, filterable by `status`/`type` |

### Existing, unchanged
`POST /api/contact`, `POST /api/newsletter/subscribe`, `POST /api/auth/forgot-password`,
`POST /api/auth/reset-password` — all now trigger real emails but the
request/response shape is exactly as before.

## 5. The order → payment → email flow, end to end

```
Cart → Checkout (address, then payment method)
  │
  ├─ COD ─────────────────────────────────────────────────────────┐
  │   POST /api/orders (paymentMethod: 'cod')                      │
  │   → order.status = 'confirmed' immediately                     │
  │   → Payment row created (method: cod, status: pending)         │
  │   → Order Confirmation email sent                              │
  │   → Order Success page                                         │
  │                                                                 │
  └─ Online ────────────────────────────────────────────────────── ┘
      POST /api/orders (paymentMethod: 'online')  → order.status = 'pending'
      POST /api/payments/create-order {orderId}   → Razorpay order created,
                                                      Payment row (status: pending)
      [Razorpay Checkout.js modal opens in the browser]
        success → POST /api/payments/verify {razorpay_order_id, razorpay_payment_id, razorpay_signature}
                    → signature verified server-side (HMAC-SHA256, never trust the client)
                    → Payment.status = 'paid', Order.status = 'confirmed', Order.paymentStatus = 'paid'
                    → Order Confirmation + Payment Success emails sent
                    → Order Success page
        dismissed/failed → POST /api/payments/failure {razorpay_order_id, reason}
                    → Payment.status = 'failed', Order.paymentStatus = 'failed'
                    → Payment Failed email sent
                    → user can Retry Payment from My Account (re-runs create-order → modal)
```

Admin marking an order **shipped** → Order Shipped email (with tracking
number/courier/link). Marking **delivered** → Order Delivered email.
Marking/customer-cancelling → Order Cancelled email, and any `paid` Payment
tied to that order is flagged `refunded` (the actual money movement in
Razorpay's dashboard is still a manual step — see Security notes).

## 6. Security

- **Signature verification is server-side only** (`razorpayService.verifyPaymentSignature`,
  HMAC-SHA256 of `order_id|payment_id` with `RAZORPAY_KEY_SECRET`). The
  client-reported "success" callback is never trusted by itself.
- **No card/CVV/UPI data ever reaches the Jhanvika backend** — Razorpay's
  hosted Checkout.js collects it directly (see the UI-change note above).
- `RAZORPAY_KEY_SECRET` and `SMTP_PASS` are read only from `process.env`,
  never logged, never sent to the frontend (`RAZORPAY_KEY_ID` — the
  *public* key — is the only Razorpay value returned to the client, exactly
  as Razorpay's own docs require).
- All new endpoints inherit the existing `helmet`, CORS, and `apiLimiter`
  (600 req/15min) middleware already applied to `/api/*`; auth-sensitive
  routes (`/api/email/send-test`) additionally require `admin`/`superadmin` role.
- Every email send is wrapped in try/catch and logged to `email_logs` —
  a Brevo outage degrades to "email didn't send" (visible in admin), never
  to a broken checkout or registration.

## 7. Testing steps

**Razorpay (test mode):**
1. Set `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` to your **Test Mode** keys.
2. Add a saree to cart → Checkout → Pay Online → place order.
3. In the Razorpay modal, use their [test card](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
   `4111 1111 1111 1111`, any future expiry, any CVV → should redirect to
   Order Success, and the order should show `paymentStatus: paid` in
   `/admin/payments` and `/admin/orders`.
4. Repeat but close the modal instead of paying → order should show
   `paymentStatus: failed`; go to My Account → Retry Payment → pay again
   with the test card → should now succeed.
5. Test COD separately — order should confirm immediately with no Razorpay modal.

**Email (Brevo):**
1. Set the `SMTP_*` vars from Brevo's SMTP settings page.
2. `/admin/email-logs` → send a test email to your own inbox → confirm delivery and that the log shows `status: sent`.
3. Register a new account → check inbox for Welcome + Verify Email.
4. Use "Forgot password" → check inbox for the reset link → reset → check inbox for the success email.
5. Place an order (both COD and online) → check inbox for Order Confirmation (+ Payment Success for online).
6. In `/admin/orders`, mark an order Shipped, then Delivered → check inbox for both emails.
7. Cancel an order → check inbox for Order Cancelled.
8. Submit the `/contact` form and subscribe to the newsletter → check inbox for both auto-replies.
9. If `SMTP_*` is left blank, confirm the app still works end-to-end and `/admin/email-logs` shows entries marked as simulated.

## 8. Production deployment notes

- Switch Razorpay keys from Test Mode to Live Mode only after you've
  completed Razorpay's KYC/activation — Live keys reject test cards.
- Brevo's free tier has a daily sending cap; monitor `/admin/email-logs`
  for `failed` entries once you're past it, or upgrade the plan.
- Consider adding a Razorpay **webhook** (Dashboard → Settings → Webhooks)
  as a second confirmation path in addition to the client-side verify call
  — `razorpayService.verifyWebhookSignature` is already written for this,
  it just isn't wired to a route yet, since webhooks need a publicly
  reachable HTTPS URL that only exists once you deploy.
- Refunds are recorded in the `payments`/`orders` tables when an order is
  cancelled, but the actual money transfer back to the customer still
  needs to be triggered from the Razorpay dashboard (or via
  `razorpay.payments.refund()`, which isn't wired up yet — a natural next
  step once you decide on a refund policy/authorization flow).
- `EMAIL_FROM` should be a domain you've verified in Brevo (SPF/DKIM) or
  mail will land in spam regardless of template quality.
