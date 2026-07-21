import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-zari-gradient text-ivory mt-24">
      <div className="container-px py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <span className="font-wordmark text-3xl text-gold-light">Jhanvika</span>
          <p className="text-ivory/70 text-sm mt-4 leading-relaxed">
            A curated house of handwoven sarees — bringing India's weaving traditions to
            the modern woman's wardrobe, one drape at a time.
          </p>
          <div className="flex gap-4 mt-5">
            <a href="#" aria-label="Instagram" className="hover:text-gold-light"><Instagram size={20} /></a>
            <a href="#" aria-label="Facebook" className="hover:text-gold-light"><Facebook size={20} /></a>
            <a href="#" aria-label="Youtube" className="hover:text-gold-light"><Youtube size={20} /></a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-xl text-gold-light mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link className="hover:text-ivory" to="/shop?category=banarasi">Banarasi Silk</Link></li>
            <li><Link className="hover:text-ivory" to="/shop?category=kanjivaram">Kanjivaram</Link></li>
            <li><Link className="hover:text-ivory" to="/shop?category=chanderi">Chanderi</Link></li>
            <li><Link className="hover:text-ivory" to="/shop?category=linen">Linen &amp; Cotton</Link></li>
            <li><Link className="hover:text-ivory" to="/shop?category=bridal">Bridal Edit</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-xl text-gold-light mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link className="hover:text-ivory" to="/about">Our Story</Link></li>
            <li><Link className="hover:text-ivory" to="/contact">Contact Us</Link></li>
            <li><Link className="hover:text-ivory" to="/shop">Track Order</Link></li>
            <li><Link className="hover:text-ivory" to="/shop">Size &amp; Drape Guide</Link></li>
            <li><Link className="hover:text-ivory" to="/shop">Returns &amp; Exchanges</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-xl text-gold-light mb-4">Get in Touch</h4>
          <ul className="space-y-3 text-sm text-ivory/70">
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /> Banjara Hills, Hyderabad, Telangana, India</li>
            <li className="flex items-center gap-2"><Phone size={16} /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><Mail size={16} /> hello@jhanvika.example</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/15">
        <div className="container-px py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ivory/60">
          <span>© {new Date().getFullYear()} Jhanvika. All rights reserved.</span>
          <span>This is a demo storefront. All products, prices &amp; transactions are for illustration only.</span>
        </div>
      </div>
    </footer>
  )
}
