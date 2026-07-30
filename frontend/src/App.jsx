import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { ProtectedRoute, AdminRoute } from './components/RouteGuards.jsx'

import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import Account from './pages/Account.jsx'
import NotFound from './pages/NotFound.jsx'

import AdminLogin from './admin/pages/AdminLogin.jsx'
import AdminLayout from './admin/components/AdminLayout.jsx'
import Dashboard from './admin/pages/Dashboard.jsx'
import AdminProducts from './admin/pages/Products.jsx'
import AdminCategories from './admin/pages/Categories.jsx'
import AdminOrders from './admin/pages/Orders.jsx'
import AdminPayments from './admin/pages/Payments.jsx'
import AdminEmailLogs from './admin/pages/EmailLogs.jsx'
import AdminCustomers from './admin/pages/Customers.jsx'
import AdminCoupons from './admin/pages/Coupons.jsx'
import AdminReviews from './admin/pages/Reviews.jsx'
import AdminBanners from './admin/pages/Banners.jsx'
import AdminCmsPages from './admin/pages/CmsPages.jsx'
import AdminSupport from './admin/pages/Support.jsx'
import AdminReports from './admin/pages/Reports.jsx'
import AdminSettings from './admin/pages/Settings.jsx'
import AdminStaff from './admin/pages/Staff.jsx'

function StorefrontLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Admin console — separate layout, no storefront chrome */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="email-logs" element={<AdminEmailLogs />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="cms" element={<AdminCmsPages />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="staff" element={<AdminStaff />} />
      </Route>

      {/* Storefront */}
      <Route path="/*" element={
        <StorefrontLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </StorefrontLayout>
      } />
    </Routes>
  )
}
