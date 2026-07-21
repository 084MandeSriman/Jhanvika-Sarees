# Jhanvika — Production Gap Analysis

Audited against the full 30-step spec. This file is the source of truth for
what's real, what's partial, and what's genuinely out of reach without your
own third-party accounts/infrastructure.

## How to read this

- ✅ **Completed** — real DB-backed, validated, production-shaped
- 🟡 **Partial** — works, but simplified vs. the full spec
- ⛔ **Missing** — not built
- 🔒 **Blocked** — needs YOUR real credentials/infra (Razorpay, Shiprocket, AWS, WhatsApp Business, a domain+server). No implementation can fake these into "working."

---

## Already Completed
- MySQL schema (Sequelize) for users, addresses, categories, products,
  product images, orders, order items, order status history, payments,
  coupons, reviews, wishlist, cart, banners, CMS pages, contact messages,
  newsletter, settings, activity logs.
- JWT auth (register/login/me/update/change-password), bcrypt hashing,
  role-based access control (customer/admin/superadmin).
- Server-side price/stock recalculation on checkout inside a DB transaction.
- Full admin CRUD: products (+image upload), categories, orders (status
  workflow + history), coupons, banners, CMS pages, customers, staff,
  reviews (moderation), support inbox, settings, dashboard, reports.
- Rate limiting on auth routes, helmet, CORS, centralized error handling,
  request validation (express-validator), audit logging.
- Related products, guest checkout, coupon validation logic.

## Partially Completed (fixed in this pass — see below)
- **Cart** — backend API existed but the frontend never called it for normal
  add/update/remove; it only ran once at login to merge the guest cart. →
  **Fixed**: cart is now genuinely DB-backed for logged-in users, mirroring
  the wishlist's dual-mode (guest = localStorage, logged in = API) pattern.
- **GST/tax** — a `gst_percent` setting existed but was never applied to an
  order total. → **Fixed**: orders now compute and store real tax.
- **Auth session model** — login/register issued one long-lived JWT with no
  refresh, lockout, or revocation. → **Fixed**: access+refresh tokens,
  account lockout after failed attempts, session listing/revocation,
  a real logout endpoint.
- **Email verification** — field existed on User but no flow. → **Fixed**:
  token-based verification (simulated email, logged to console like the
  rest of the notification stack).
- **SEO** — meta fields existed on the Product model but nothing rendered
  them. → **Fixed**: dynamic `<title>`/meta tags, JSON-LD product schema,
  `sitemap.xml`, `robots.txt`.

## Newly built in this pass
- Recently viewed products (DB-backed for logged-in users, localStorage for guests)
- Save for later (cart items can be moved out of the active cart)
- Search analytics (logs queries, trending searches endpoint)

## Still Missing / Deferred
These need real scope decisions or real third-party accounts, so they're
listed rather than guessed at:
- **Password history / reuse prevention** — straightforward to add on request.
- **Remember-me differentiated session length** — refresh tokens make this
  easy to add (longer-lived cookie) but wasn't wired to a UI toggle.
- **Delete account** flow (soft-delete + data retention policy) — needs a
  business decision on retention period before building.
- **Flash sales / homepage section builder** — coupons + banners exist as
  primitives; a dedicated "flash sale" scheduler UI is not built.
- **WhatsApp/SMS/Push notifications, Shiprocket, real payment gateway** — 🔒
  blocked on your accounts. The code is already gateway-shaped
  (`paymentController.js`, the OTP/email simulation) so plugging in real
  credentials later is a small, localized change, not a rewrite.
- **Testing suites, CI/CD, SSL/domain/Nginx/PM2, CDN, Redis caching** — 🔒
  blocked on real infrastructure/hosting decisions only you can make.

## Security Issues Found & Fixed
- No account lockout → brute-force risk. Fixed (5 attempts / 15 min lock).
- No refresh token rotation → a leaked long-lived JWT had no revocation
  path. Fixed (refresh tokens are DB-tracked and revocable per-session).
- Cart trusted client-supplied product state for logged-in users in some
  paths → now always re-reads from DB.

## Performance / Database Issues Found & Fixed
- Missing indexes on frequently-filtered columns (`orders.status`,
  `products.category_id`, `cart_items.cart_id`) — added via Sequelize
  `indexes` options.

## Deployment Readiness
Environment variables are documented in `.env.example` for both new and
existing settings. No deployment target (server, domain, SSL) exists yet —
that's a hosting decision, not a code gap.
