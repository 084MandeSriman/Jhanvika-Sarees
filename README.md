# Jhanvika — Full-Stack Saree E-Commerce Platform

A real, end-to-end saree e-commerce application: a **React + Vite storefront**
and a **Node.js/Express + MySQL backend** with JWT auth, role-based access
control, and a full admin console — covering the majority of the checklist
you shared, with a few clearly-marked exceptions (see below).

```
jhanvika-sarees/
├── frontend/     React + Vite storefront + admin console (localhost:5173)
└── backend/      Node.js + Express + MySQL REST API (localhost:5000)
```

## Quick start

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env        # then edit DB_PASSWORD etc.
npm run seed                 # creates admin user + 12 dummy products
npm run dev                  # starts API on :5000
```

**2. Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev                  # starts storefront on :5173
```

Open **http://localhost:5173**. The frontend needs the backend running to
load any data — products, categories, etc. are no longer hardcoded, they
come from MySQL. See `backend/README.md` for full API docs.

## Logins (from `npm run seed`)

| Role | URL | Email | Password |
|---|---|---|---|
| Customer | `/login` | `demo@jhanvika.example` | `Customer@123` |
| Admin console | `/admin/login` | `admin@jhanvika.example` | `Admin@12345` |

Coupon code **`JHANVIKA10`** works at checkout (10% off).

## What's real in this build

- **Database** — MySQL via Sequelize, 19 related tables including sessions,
  email verification, recently-viewed, and search logs.
- **Auth** — real JWT access+refresh token pair (15-min access token, 30-day
  httpOnly-cookie refresh token, rotated on every use), bcrypt hashing,
  RBAC, account lockout after 5 failed logins, email verification,
  per-device session listing/revocation. See `docs/GAP_ANALYSIS.md` for the
  full before/after audit.
- **Cart** — genuinely DB-backed for logged-in users (not just merged at
  login) with a working "save for later" flow; guests still get a fast
  localStorage cart that merges into their account on login/registration.
- **Checkout** — prices, stock, shipping fee, and **GST** are recalculated
  server-side from live Settings/Product data inside a DB transaction.
- **SEO** — dynamic per-page meta tags + Open Graph/Twitter cards (react-helmet-async),
  JSON-LD Product + Breadcrumb schema, a live `sitemap.xml`, and `robots.txt`.
- **Search** — trending searches (logged + surfaced in the nav), an admin
  search-analytics report (top terms, no-result terms).
- **Recently viewed** — DB-backed for logged-in users, localStorage for guests.
- **Admin console** (`/admin`) — dashboard, full CRUD for products (+image
  upload), categories, coupons, banners, CMS pages; order status workflow +
  history; customer management; review moderation; contact/newsletter
  inbox; settings; audit log; superadmin-only staff management; payment
  history; email logs.
- **Payments** — real Razorpay integration (order creation, HMAC signature
  verification, payment history, retry-on-failure). Works in Test Mode the
  moment you drop in your own Razorpay test keys — see
  `docs/RAZORPAY_BREVO_INTEGRATION.md`.
- **Transactional email** — real Brevo SMTP delivery via Nodemailer, 12
  responsive HTML templates (welcome, verification, order confirmation,
  payment success/failed, shipped/delivered, newsletter, contact
  auto-reply, etc.), every send logged to an admin-visible Email Log.

## What's intentionally simulated (and why)

Some checklist items need real third-party accounts/infrastructure that
only you can provision — no AI can fabricate a working AWS S3 bucket, a
WhatsApp Business API approval, or a live domain with SSL. These are
implemented with the **same code shape** a real integration would use, so
swapping in real credentials later is a small, localized change:

- **SMS/OTP** (phone verification) — logged to the backend console instead
  of sent via a real SMS gateway.
- **Shipping carriers** (Shiprocket/Delhivery/Blue Dart) — not integrated;
  tracking numbers are generated placeholders, though courier name/tracking
  URL can be set manually by an admin.

## Not included in this pass

CI/CD, SSL/domain/production deployment, CDN, Redis caching, automated test
suites, WhatsApp Business API, AWS S3/Cloudinary, Google Analytics/Search
Console integration, PWA/native mobile apps, and AI-driven recommendations
are out of scope for a from-scratch build without real credentials/infra —
the codebase is organized (clear config/controllers/routes/middleware
layers) so each can be added incrementally without a rewrite.

See `backend/README.md` for the full API reference, `docs/GAP_ANALYSIS.md`
for the detailed production-readiness audit, and
`docs/RAZORPAY_BREVO_INTEGRATION.md` for the payments/email integration
details, DB schema changes, and testing steps.
