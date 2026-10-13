import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-1">Global Free Shipping</h4>
              <p className="text-sm text-slate-400">Complimentary express delivery on all qualified orders over $150.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-1">100% Authentic Guarantee</h4>
              <p className="text-sm text-slate-400">Directly sourced from verified brands and verified makers.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-1">Hassle-Free 30-Day Returns</h4>
              <p className="text-sm text-slate-400">Simple, prepaid return labels included with every dispatch.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black text-white">LUMINA.</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 mb-4">
              Curated precision streetwear, advanced personal electronics, and luxury lifestyle essentials.
            </p>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Catalog</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=Footwear" className="hover:text-white transition-colors">Footwear</Link></li>
              <li><Link to="/shop?category=Electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/shop?is_featured=yes" className="hover:text-white transition-colors">Featured Drops</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Management</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
              <li><Link to="/admin/products" className="hover:text-white transition-colors">Product Catalog</Link></li>
              <li><Link to="/admin/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/admin/brands" className="hover:text-white transition-colors">Brands Management</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Stay Connected</h5>
            <p className="text-xs mb-3 text-slate-400">Receive private drop alerts and early VIP sales access.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email address"
                className="bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none focus:border-blue-500 flex-1"
              />
              <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} LUMINA Studio Commerce. Powered by React, Tailwind CSS & Laravel Sanctum.</p>
          <div className="flex items-center gap-1">
            <span>Engineered with excellence</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
