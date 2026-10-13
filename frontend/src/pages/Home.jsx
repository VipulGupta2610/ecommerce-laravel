import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Flame, ShieldCheck, Zap, Star } from 'lucide-react';
import { productService, categoryService } from '../services/api';
import ProductCard from '../components/common/ProductCard';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          productService.getProducts({ is_featured: 'yes' }),
          categoryService.getCategories({ status: 1 }),
        ]);

        const products = prodRes.data.products || prodRes.data.data || [];
        setFeaturedProducts(products);

        const cats = catRes.data.data || [];
        setCategories(cats);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-2xl">
        {/* Glow ambient background effects */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-20 md:py-28 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-sky-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Curated Lifestyle 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
              Elevate Your Everyday with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                Precision Design.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              Discover verified premium streetwear, studio-grade acoustics, and refined everyday luxury essentials tailored for modern tastemakers.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="px-7 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center gap-2 group"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop?is_featured=yes"
                className="px-7 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-200 border border-slate-800 font-bold text-sm transition-all flex items-center gap-2"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Featured Drops</span>
              </Link>
            </div>

            {/* Micro stats banner */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <span className="block text-2xl font-black text-white">100%</span>
                <span className="text-xs text-slate-400 font-medium">Verified Authentic</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">2-Day</span>
                <span className="text-xs text-slate-400 font-medium">Express Dispatch</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">4.9/5</span>
                <span className="text-xs text-slate-400 font-medium">Client Rating</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card Showcase */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative group">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-blue-600/30 text-blue-300 text-xs font-bold border border-blue-500/30">
                  New Arrival
                </span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-bold text-white">Top Rated</span>
                </div>
              </div>

              <div className="my-auto py-8 text-center space-y-3">
                <div className="w-36 h-36 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 shadow-inner">
                  <Zap className="w-16 h-16 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-white">Nike Air Max Pulse</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Engineered with point-loaded cushioning and iconic London-inspired aesthetic.
                </p>
                <div className="text-xl font-black text-blue-400">$149.99</div>
              </div>

              <Link
                to="/shop"
                className="w-full py-3 bg-white text-slate-950 font-bold text-xs rounded-xl text-center hover:bg-slate-100 transition-colors"
              >
                View Selected Piece
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Explore by Category</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Curated Collections</h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1 group"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              to={`/shop?category_id=${cat.id}`}
              className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center text-slate-700 font-black text-sm mb-4">
                0{i + 1}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {cat.products_count ? `${cat.products_count} Items` : 'Available'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Trending Spotlight</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Featured Releases</h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1 group"
          >
            <span>Browse Full Store</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No featured products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
