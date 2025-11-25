"use client";

import Link from "next/link";
import { 
  ShoppingBag, 
  Truck, 
  Store, 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";
import { designSystem } from "@/lib/design-system";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className={`${designSystem.container.maxWidth} mx-auto ${designSystem.container.padding} py-10`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <Link href="/" className={`flex items-center gap-2 ${designSystem.typography.h3} hover:text-primary transition-colors duration-200`}>
              <ShoppingBag className="h-5 w-5" />
              <span>Online Store</span>
            </Link>
            <p className={`text-slate-300 ${designSystem.typography.small} leading-relaxed`}>
              Your trusted marketplace for quality products. Shop with confidence from verified sellers.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className={`p-2 rounded-full bg-slate-700 hover:bg-primary ${designSystem.button.base} ${designSystem.button.hover}`}
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className={`p-2 rounded-full bg-slate-700 hover:bg-primary ${designSystem.button.base} ${designSystem.button.hover}`}
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className={`p-2 rounded-full bg-slate-700 hover:bg-primary ${designSystem.button.base} ${designSystem.button.hover}`}
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className={`p-2 rounded-full bg-slate-700 hover:bg-primary ${designSystem.button.base} ${designSystem.button.hover}`}
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-300 hover:text-primary transition-colors text-sm flex items-center gap-2">
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-slate-300 hover:text-primary transition-colors text-sm flex items-center gap-2">
                  <span>Products</span>
                </Link>
              </li>
              <li>
                <Link href="/seller/register" className="text-slate-300 hover:text-primary transition-colors text-sm flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  <span>Become a Seller</span>
                </Link>
              </li>
              <li>
                <Link href="/deliverer/register" className="text-slate-300 hover:text-primary transition-colors text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Join as Deliverer</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Customer Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/customer/orders" className="text-slate-300 hover:text-primary transition-colors text-sm flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>My Orders</span>
                </Link>
              </li>
              <li>
                <Link href="/customer/profile" className="text-slate-300 hover:text-primary transition-colors text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-primary transition-colors text-sm flex items-center gap-2">
                  <span>Help Center</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-primary transition-colors text-sm flex items-center gap-2">
                  <span>Contact Us</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-300 text-sm">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>123 Commerce Street, Business City, BC 12345</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <a href="tel:+1234567890" className="hover:text-primary transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <a href="mailto:support@onlinestore.com" className="hover:text-primary transition-colors">
                  support@onlinestore.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {currentYear} Online Store. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-slate-400 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-slate-400 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-slate-400 hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

