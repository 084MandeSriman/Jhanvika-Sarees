import React from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tags, ShoppingCart, Users, Ticket, Star,
  Image, FileText, Mail, Settings as SettingsIcon, ScrollText, LogOut, ExternalLink, UserCog, CreditCard,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const navGroups = [
  {
    label: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/categories', label: 'Categories', icon: Tags },
      { to: '/admin/reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    label: 'Sales',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/admin/payments', label: 'Payments', icon: CreditCard },
      { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
      { to: '/admin/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'Marketing & CMS',
    items: [
      { to: '/admin/banners', label: 'Banners', icon: Image },
      { to: '/admin/cms', label: 'CMS Pages', icon: FileText },
      { to: '/admin/support', label: 'Support Inbox', icon: Mail },
      { to: '/admin/email-logs', label: 'Email Logs', icon: Mail },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/reports', label: 'Reports', icon: ScrollText },
      { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
      { to: '/admin/staff', label: 'Staff Users', icon: UserCog },
    ],
  },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex bg-[#F7F4EF] font-body">
      <aside className="w-64 shrink-0 bg-ink text-ivory/90 flex flex-col">
        <div className="px-6 py-6 border-b border-ivory/10">
          <span className="font-wordmark text-2xl text-gold-light">Jhanvika</span>
          <p className="text-[10px] tracking-[0.3em] uppercase text-ivory/40 mt-1">Admin Console</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="px-6 text-[10px] tracking-widest uppercase text-ivory/35 mb-2">{group.label}</p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                      isActive ? 'bg-maroon/40 text-gold-light border-r-2 border-gold' : 'text-ivory/70 hover:bg-ivory/5 hover:text-ivory'
                    }`
                  }
                >
                  <item.icon size={16} /> {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-ivory/10">
          <Link to="/" className="flex items-center gap-2 text-xs text-ivory/50 hover:text-ivory mb-3">
            <ExternalLink size={13} /> View storefront
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ivory">{user?.name}</p>
              <p className="text-[10px] text-ivory/40 capitalize">{user?.role}</p>
            </div>
            <button onClick={logout} aria-label="Sign out" className="text-ivory/50 hover:text-gold-light">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
