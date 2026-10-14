import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, X, RefreshCw, ShoppingBag } from 'lucide-react';
import { productService, categoryService, brandService } from '../services/api';
import ProductCard from '../components/common/ProductCard';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Filters state from URL
  const rawCategoryParam = searchParams.get('category_id') || searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand_id') || '';
  const selectedSort = searchParams.get('sort') || 'latest';
  const searchQuery = searchParams.get('search') || '';
  const featuredOnly = searchParams.get('is_featured') || '';

  // Match category by ID or name
  const matchedCategory = categories.find(
    (c) => String(c.id) === rawCategoryParam || c.name.toLowerCase() === rawCategoryParam.toLowerCase()
  );
  const selectedCategory = matchedCategory ? String(matchedCategory.id) : (Number(rawCategoryParam) ? rawCategoryParam : '');

  const [searchInput, setSearchInput] = useState(searchQuery);

  // Keep search input synced when URL query changes
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Load filter options (categories and brands) once
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.allSettled([
          categoryService.getCategories({ status: 1 }),
          brandService.getBrands({ status: 1 }),
        ]);
        if (catRes.status === 'fulfilled') {
          setCategories(catRes.value.data.data || []);
        }
        if (brandRes.status === 'fulfilled') {
          setBrands(brandRes.value.data.data || []);
        }
      } catch (err) {
        console.error('Error loading filter lists:', err);
      }
    };
    loadFilters();
  }, []);

  // Fetch products whenever searchParams or resolved category changes
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setFetchError(false);
      const params = {
        status: 1,
      };
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedBrand) params.brand_id = selectedBrand;
      if (selectedSort) params.sort = selectedSort;
      if (searchQuery) params.search = searchQuery;
      if (featuredOnly) params.is_featured = featuredOnly;

      const res = await productService.getProducts(params);
      const list = res.data.products || res.data.data || [];
      setProducts(list);
    } catch (err) {
      console.error('Error fetching products:', err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams, selectedCategory]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    // If setting category, clean both category and category_id params
    if (key === 'category_id' || key === 'category') {
      newParams.delete('category');
      newParams.delete('category_id');
      if (value) newParams.set('category_id', value);
    } else {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-blue-400">
            Official Storefront
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Explore All Creations
          </h1>
          <p className="text-sm text-slate-300">
            Browse our complete selection of premium footwear, electronics, luxury watches, and signature streetwear pieces.
          </p>
        </div>
      </div>

      {/* Main Catalog View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Filters & Search</span>
              </div>
              {(selectedCategory || selectedBrand || searchQuery || featuredOnly) && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Keyword search input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Keywords
              </label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Filter by title, sku..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </form>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Categories
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam('category_id', '')}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === ''
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParam('category_id', String(cat.id))}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg font-semibold transition-colors flex items-center justify-between ${
                      selectedCategory === String(cat.id)
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat.products_count !== undefined && (
                      <span className="text-[10px] text-slate-400 font-medium">({cat.products_count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Brands
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam('brand_id', '')}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg font-semibold transition-colors ${
                    selectedBrand === ''
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Brands
                </button>
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => updateParam('brand_id', String(b.id))}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg font-semibold transition-colors flex items-center justify-between ${
                      selectedBrand === String(b.id)
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{b.name}</span>
                    {b.products_count !== undefined && (
                      <span className="text-[10px] text-slate-400 font-medium">({b.products_count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Only Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={featuredOnly === 'yes'}
                  onChange={(e) => updateParam('is_featured', e.target.checked ? 'yes' : '')}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Featured items only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Catalog Grid */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Sort and Count Row */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-600">
              Showing <span className="text-slate-900 font-black">{products.length}</span> curated items
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-semibold">Sort by:</span>
              <select
                value={selectedSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="latest">Latest Releases</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="title_asc">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Grid or Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-slate-200/80 animate-pulse" />
              ))}
            </div>
          ) : fetchError ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Failed to load catalog products</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There was a problem communicating with the backend server. Please verify the connection and retry.
              </p>
              <button
                onClick={fetchProducts}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Now
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">No items match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try selecting a different category, clearing your search query, or resetting filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-blue-600 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
