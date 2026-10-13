import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const price = Number(product.price);
  const comparePrice = product.compare_price ? Number(product.compare_price) : null;
  const discountPercent = comparePrice && comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : null;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes && product.sizes.length > 0 ? product.sizes[0].name : null);
  };

  const imageUrl = product.image_url || (product.image ? `http://localhost:8000/uploads/products/small/${product.image}` : null);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col">
      {/* Thumbnail Container */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-400">
            <ShoppingBag className="w-12 h-12 stroke-[1.2] mb-2" />
            <span className="text-xs font-semibold uppercase tracking-wider">{product.title}</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.is_featured === 'yes' && (
            <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-slate-900 text-amber-300 rounded-md shadow-sm">
              Featured
            </span>
          )}
          {discountPercent && (
            <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white rounded-md shadow-sm">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Quick View Hover Button */}
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-4">
          <span className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 hover:bg-slate-50 transition-colors">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>
      </Link>

      {/* Product Metadata */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category row */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            <span>{product.brand?.name || 'Exclusive'}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-slate-700 text-xs font-bold">4.9</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {product.title}
            </h3>
          </Link>

          {/* Short description */}
          {product.short_description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Price and Cart Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-slate-950">
              ${price.toFixed(2)}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-xs text-slate-400 line-through font-medium">
                ${comparePrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-blue-600 active:scale-95 transition-all shadow-sm flex items-center justify-center group/btn"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
