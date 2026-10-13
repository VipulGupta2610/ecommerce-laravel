import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Layers, Tag, Ruler, Plus, ArrowRight, ExternalLink } from 'lucide-react';
import { productService, categoryService, brandService, sizeService } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    brands: 0,
    sizes: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes, brandRes, sizeRes] = await Promise.all([
          productService.getProducts(),
          categoryService.getCategories(),
          brandService.getBrands(),
          sizeService.getSizes(),
        ]);

        const prods = prodRes.data.products || prodRes.data.data || [];
        const cats = catRes.data.data || [];
        const brs = brandRes.data.data || [];
        const szs = sizeRes.data.data || [];

        setStats({
          products: prods.length,
          categories: cats.length,
          brands: brs.length,
          sizes: szs.length,
        });

        setRecentProducts(prods.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Products', count: stats.products, icon: Package, color: 'from-blue-600 to-indigo-600', link: '/admin/products' },
    { label: 'Categories', count: stats.categories, icon: Layers, color: 'from-emerald-600 to-teal-600', link: '/admin/categories' },
    { label: 'Brands', count: stats.brands, icon: Tag, color: 'from-violet-600 to-purple-600', link: '/admin/brands' },
    { label: 'Sizes', count: stats.sizes, icon: Ruler, color: 'from-amber-500 to-orange-600', link: '/admin/sizes' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-black uppercase tracking-widest text-blue-400">
            Control Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Catalog & Inventory Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitor product listings, update categories, control brands, and configure size attributes.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900">
                {loading ? '...' : card.count}
              </div>
              <span className="block text-[11px] text-slate-400 font-semibold mt-1 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                Manage collection <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Recent Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Recently Updated Products</h3>
            <p className="text-xs text-slate-500">Latest active items in your store database</p>
          </div>
          <Link
            to="/admin/products"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-6">SKU</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Price</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {recentProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No products added yet.
                  </td>
                </tr>
              ) : (
                recentProducts.map((p) => {
                  const img = p.image_url || (p.image ? `http://localhost:8000/uploads/products/small/${p.image}` : null);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80';
                            }}
                          />
                          <span className="font-bold text-slate-900 line-clamp-1">{p.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 font-mono text-[11px] text-slate-500">{p.sku}</td>
                      <td className="py-3 px-6">{p.category?.name || '-'}</td>
                      <td className="py-3 px-6 font-bold text-slate-900">${Number(p.price).toFixed(2)}</td>
                      <td className="py-3 px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 1
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.status === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <Link
                          to={`/admin/products/edit/${p.id}`}
                          className="font-bold text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
