# Jhanvika Backend — Node.js + Express + MySQL API

A real, working REST API for the Jhanvika storefront: JWT auth, role-based
access control (customer / admin / superadmin), products, categories,
cart, wishlist, addresses, orders, real Razorpay payments, coupons,
reviews, banners, CMS pages, contact/newsletter, an admin dashboard with
reports, site settings, and an audit log.

## 1. Prerequisites

- Node.js 18+
- A running MySQL server (locally, via Docker, or a hosted instance)

## 2. Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set your real MySQL credentials:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=jhanvika_db
DB_USER=root
DB_PASSWORD=your_mysql_password
```

Create the database (the app will create all tables for you, but the
database itself must exist first):

```sql
CREATE DATABASE jhanvika_db CHARACTER SET utf8mb4;
```

## 3. Seed dummy data

This creates an admin account, a demo customer, 12 products across 6
categories, coupons, banners, and CMS pages:

```bash
npm run seed
```

This **drops and recreates all tables** (`force: true`) — safe to re-run
any time during development, but never point it at a database with real
data you want to keep.

Seeded logins:

| Role | Email | Password |
|---|---|---|
| Superadmin | `admin@jhanvika.example` | `Admin@12345` |
| Demo customer | `demo@jhanvika.example` | `Customer@123` |

Try coupon code **`JHANVIKA10`** at checkout for 10% off.

## 4. Run the API

```bash
npm run dev      # nodemon, auto-restarts on file changes
# or
npm start        # plain node
```

The API starts on **http://localhost:5000**. Health check:
`GET http://localhost:5000/api/health`

## 5. API overview

All responses follow `{ success, data, meta? }` or `{ success: false, message, errors? }`.

### Public
- `POST /api/auth/register`, `/login`, `/refresh`, `/logout`
- `GET /api/auth/sessions`, `DELETE /api/auth/sessions/:id` (list/revoke your active sessions — auth required)
- `GET /api/auth/verify-email/:token`, `POST /api/auth/resend-verification` (auth required)
- `POST /api/auth/forgot-password`, `/reset-password`, `/otp/request`, `/otp/verify`
- `GET /api/products` (filters: `category`, `minPrice`, `maxPrice`, `search`, `sort`, `page`, `limit`, `ids`)
- `GET /api/products/:slug`, `/api/products/:slug/related`
- `GET /api/categories`, `GET /api/search/trending`, `GET /api/settings` (storefront-safe settings)
- `POST /api/coupons/validate`
- `GET /api/banners`, `GET /api/pages/:slug`
- `POST /api/contact`, `POST /api/newsletter/subscribe`
- `GET /sitemap.xml`, `GET /robots.txt` (served at site root)

### Authenticated (customer)
- `GET/PUT /api/auth/me`, `PUT /api/auth/change-password`
- `GET/POST/PUT/DELETE /api/cart` + `/api/cart/items/:id`, `PUT .../save-for-later`, `PUT .../move-to-cart`, `POST /api/cart/merge`
- `GET/POST /api/wishlist`
- `GET/POST/PUT/DELETE /api/addresses`
- `POST /api/orders` (guest checkout also allowed), `GET /api/orders/mine`, `GET /api/orders/:id`, `PUT /api/orders/:id/cancel`
- `POST /api/payments/create-order`, `POST /api/payments/verify`, `POST /api/payments/failure` (real Razorpay integration — see docs/RAZORPAY_BREVO_INTEGRATION.md)
- `POST /api/products/:id/reviews`
- `GET/POST /api/recently-viewed`

### Admin (`role: admin` or `superadmin`, JWT required)
- `GET /api/admin/dashboard`, `/api/admin/reports/sales|inventory|customers`, `/api/admin/search-analytics`
- Full CRUD: `/api/admin/products` (+ image upload), `/categories`, `/coupons`, `/banners`, `/cms`
- `/api/admin/orders` (list + status updates), `/api/admin/customers`, `/api/admin/reviews` (moderation)
- `/api/admin/support/messages`, `/api/admin/support/newsletter`
- `/api/admin/settings`, `/api/admin/activity-logs`
- `/api/admin/staff` (superadmin only — create/manage other admins)

## 6. Auth & session model

Access tokens are short-lived JWTs (15 min default, `ACCESS_TOKEN_EXPIRES_IN`)
sent in the `Authorization: Bearer` header. Refresh tokens are opaque random
strings, stored **hashed** in the `refresh_tokens` table, and delivered as an
`httpOnly` cookie scoped to `/api/auth` — never readable by JS, never sent to
`/api/*` routes that don't need it. `POST /api/auth/refresh` rotates the
refresh token and issues a new access token; the frontend's axios client
does this automatically on a 401. Logging out, resetting your password, or
revoking a session via `DELETE /api/auth/sessions/:id` all invalidate the
underlying DB row immediately — there's no way to "un-revoke" a leaked
refresh token short of a DB restore.

Failed logins lock the account for 15 minutes after 5 consecutive failures
(`failed_login_attempts` / `lock_until` on the `users` table).

## 7. What's real vs. simulated

**Real:** database persistence, password hashing, JWT auth, RBAC,
server-side price/stock recalculation on checkout (never trusts the
client), coupon logic, order status workflow with audit history, file
uploads, rate limiting, input validation, audit logging, **Razorpay
payments** (real order creation + HMAC signature verification — see
`docs/RAZORPAY_BREVO_INTEGRATION.md`), and **Brevo transactional email**
(12 templates, logged to `email_logs`, real SMTP delivery once configured).

**Still simulated:**
- **SMS/OTP** (phone verification) — logged to the server console instead
  of sent via a real SMS gateway (see `authController.js`). Swappable for
  MSG91/Twilio the same way emailService was swapped for Brevo.
- **Shipping carriers** (Shiprocket/Delhivery/Blue Dart) — not integrated;
  `trackingNumber` is a generated placeholder string, though `courierName`
  and `trackingUrl` can now be set manually by an admin when marking an
  order shipped.

## 8. Not included in this pass

Full production infrastructure — CI/CD, SSL/domain setup, CDN, Redis
caching, automated test suites, WhatsApp Business API, AWS S3/Cloudinary,
Google Analytics/Search Console, PWA/mobile apps, AI recommendations —
requires real accounts/infra only you can provision, so it's intentionally
left out. The codebase is structured (config, controllers, routes,
middleware) so any of these can be added incrementally.
