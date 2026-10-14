import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Star, ShieldCheck, Truck, ArrowLeft, Check, Plus, Minus } from 'lucide-react';
import { productService, formatImageUrl, getCategoryFallbackImage } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/common/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productService.getProduct(id);
        const prod = res.data.product || res.data.data;
        if (!prod) {
          setProduct(null);
          return;
        }

        setProduct(prod);

        // Initial image with fallback normalization
        const catName = prod.category?.name || '';
        const primaryImg = prod.image_url || prod.image || (prod.product_images?.[0]?.image_url || prod.product_images?.[0]?.image);
        setSelectedImage(formatImageUrl(primaryImg, catName));

        // Initial size
        if (prod.sizes && prod.sizes.length > 0) {
          setSelectedSize(prod.sizes[0].name);
        }

        // Fetch related products in same category safely
        if (prod.category_id) {
          try {
            const relRes = await productService.getProducts({ category_id: prod.category_id, status: 1 });
            const relList = (relRes.data.products || relRes.data.data || []).filter((p) => p.id !== prod.id);
            setRelatedProducts(relList.slice(0, 3));
          } catch (relErr) {
            console.warn('Could not load related products:', relErr);
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedSize);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-bold text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-500">The product you are looking for does not exist or has been removed.</p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-blue-600 transition-colors"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const price = Number(product.price);
  const comparePrice = product.compare_price ? Number(product.compare_price) : null;
  const discountPercent = comparePrice && comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Back button */}
      <div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Main Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Image Showcase */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md relative">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-20 h-20" />
              </div>
            )}

            {/* Badges overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_featured === 'yes' && (
                <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-slate-900 text-amber-300 rounded-lg shadow-md">
                  Featured
                </span>
              )}
              {discountPercent && (
                <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-rose-600 text-white rounded-lg shadow-md">
                  Save {discountPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails row */}
          {product.product_images && product.product_images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.product_images.map((imgObj) => {
                const thumbUrl = imgObj.image_url || `http://localhost:8000/uploads/products/small/${imgObj.image}`;
                return (
                  <button
                    key={imgObj.id}
                    onClick={() => setSelectedImage(thumbUrl)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 shrink-0 transition-all ${
                      selectedImage === thumbUrl
                        ? 'border-blue-600 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={thumbUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Buying Decision Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span>{product.brand?.name || 'Exclusive Edition'}</span>
              <span className="text-slate-400 font-mono text-[11px]">SKU: {product.sku}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
              {product.title}
            </h1>

            {/* Star Rating */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">4.9 / 5.0</span>
              <span className="text-xs text-slate-400">(48 verified customer reviews)</span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-950">
              ${price.toFixed(2)}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-base text-slate-400 line-through font-semibold">
                ${comparePrice.toFixed(2)}
              </span>
            )}
            {discountPercent && (
              <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                Save ${(comparePrice - price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {product.short_description}
            </p>
          )}

          {/* Sizes Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 uppercase tracking-wider">
                <span>Select Size</span>
                <span className="text-blue-600 font-normal capitalize">Standard Fit</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(s.name)}
                    className={`min-w-12 h-11 px-3.5 rounded-xl text-xs font-black transition-all border ${
                      selectedSize === s.name
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart button */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              {/* Stepper */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-black text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-300" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Shopping Cart</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                In Stock ({product.qty || 25} available)
              </span>
              <span>Ships in 24 hours</span>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">Free Express Delivery</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">Authentic Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Full Description */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
          Product Details & Specification
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {product.description || product.short_description || 'No detailed description provided.'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
          <div>
            <span className="block text-xs text-slate-400 font-bold uppercase">Category</span>
            <span className="text-sm font-bold text-slate-800">{product.category?.name || 'General'}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-bold uppercase">Brand</span>
            <span className="text-sm font-bold text-slate-800">{product.brand?.name || 'Exclusive'}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-bold uppercase">Barcode</span>
            <span className="text-sm font-bold text-slate-800">{product.barcode || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-bold uppercase">SKU Code</span>
            <span className="text-sm font-mono font-bold text-slate-800">{product.sku}</span>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-xl font-black text-slate-900">You Might Also Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
