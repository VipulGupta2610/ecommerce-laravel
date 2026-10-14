import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, UploadCloud, X, Check, Trash2, AlertCircle } from 'lucide-react';
import { productService, categoryService, brandService, sizeService, imageService, formatImageUrl } from '../../services/api';

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    compare_price: '',
    category_id: '',
    brand_id: '',
    sku: '',
    barcode: '',
    qty: '10',
    status: 1,
    is_featured: 'no',
    short_description: '',
    description: '',
  });

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [uploadedGallery, setUploadedGallery] = useState([]); // [{ id: tempId, url: string, name: string }]
  const [existingImages, setExistingImages] = useState([]); // [{ id, image, image_url }]

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [catRes, brandRes, sizeRes] = await Promise.allSettled([
          categoryService.getCategories(),
          brandService.getBrands(),
          sizeService.getSizes(),
        ]);
        if (catRes.status === 'fulfilled') setCategories(catRes.value.data.data || []);
        if (brandRes.status === 'fulfilled') setBrands(brandRes.value.data.data || []);
        if (sizeRes.status === 'fulfilled') setAvailableSizes(sizeRes.value.data.data || []);

        if (isEdit) {
          const prodRes = await productService.getProduct(id);
          const p = prodRes.data.product || prodRes.data.data;
          setFormData({
            title: p.title || '',
            price: p.price || '',
            compare_price: p.compare_price || '',
            category_id: p.category_id || '',
            brand_id: p.brand_id || '',
            sku: p.sku || '',
            barcode: p.barcode || '',
            qty: p.qty !== null ? String(p.qty) : '10',
            status: p.status !== undefined ? p.status : 1,
            is_featured: p.is_featured || 'no',
            short_description: p.short_description || '',
            description: p.description || '',
          });

          if (p.sizes && Array.isArray(p.sizes)) {
            setSelectedSizes(p.sizes.map((s) => s.id));
          }

          if (p.product_images && Array.isArray(p.product_images)) {
            setExistingImages(p.product_images);
          }
        }
      } catch (err) {
        console.error('Error loading form data:', err);
      }
    };

    loadDropdownData();
  }, [id, isEdit]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : '') : value,
    }));
  };

  const handleSizeToggle = (sizeId) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeId) ? prev.filter((s) => s !== sizeId) : [...prev, sizeId]
    );
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingImage(true);
    for (const file of files) {
      try {
        const res = await imageService.uploadTempImage(file);
        const temp = res.data.data;
        setUploadedGallery((prev) => [
          ...prev,
          {
            id: temp.id,
            name: temp.name,
            url: formatImageUrl(temp.image_url || `/uploads/temp/thumb/${temp.name}`),
          },
        ]);
      } catch (err) {
        alert('Image upload failed: ' + (err.response?.data?.message || err.message));
      }
    }
    setUploadingImage(false);
  };

  const handleRemoveTempImage = (tempId) => {
    setUploadedGallery((prev) => prev.filter((item) => item.id !== tempId));
  };

  const handleDeleteExistingImage = async (imageId) => {
    if (!window.confirm('Delete this image permanently?')) return;
    try {
      await productService.deleteImage(imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      alert('Failed to delete image: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.category_id || Number(formData.category_id) === 0) {
      setErrors({ category_id: ['Please select a valid category for the product.'] });
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      status: Number(formData.status),
      price: Number(formData.price),
      compare_price: formData.compare_price ? Number(formData.compare_price) : null,
      category_id: Number(formData.category_id),
      brand_id: formData.brand_id ? Number(formData.brand_id) : null,
      qty: Number(formData.qty || 0),
      sizes: selectedSizes,
      gallery: uploadedGallery.map((item) => item.id),
    };

    try {
      if (isEdit) {
        await productService.updateProduct(id, payload);
      } else {
        await productService.createProduct(payload);
      }
      navigate('/admin/products');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Failed to save product');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <span className="text-xs font-bold text-slate-400">
          {isEdit ? `Editing Product #${id}` : 'Drafting New Product'}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 mb-6">
          {isEdit ? 'Update Product Information' : 'Create New Product'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Basic info */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
              1. General Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Nike Air Max Pulse 2026"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
              {errors.title && <p className="text-[11px] text-rose-600 mt-1">{errors.title[0]}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  SKU (Unique Identifier) *
                </label>
                <input
                  type="text"
                  required
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="e.g. NK-AMP-001"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                {errors.sku && <p className="text-[11px] text-rose-600 mt-1">{errors.sku[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Barcode (Optional)
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder="e.g. 1942738910"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  required
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="">Select a Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-[11px] text-rose-600 mt-1">{errors.category_id[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brand (Optional)
                </label>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleInputChange}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="">Select a Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Pricing & Inventory */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
              2. Pricing & Stock
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="149.99"
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white"
                />
                {errors.price && <p className="text-[11px] text-rose-600 mt-1">{errors.price[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Compare Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="compare_price"
                  value={formData.compare_price}
                  onChange={handleInputChange}
                  placeholder="189.99"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Stock Units (Qty)
                </label>
                <input
                  type="number"
                  name="qty"
                  value={formData.qty}
                  onChange={handleInputChange}
                  placeholder="25"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Listing Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-semibold"
                >
                  <option value={1}>Active (Visible on Storefront)</option>
                  <option value={0}>Inactive (Hidden)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Featured Product? *
                </label>
                <select
                  name="is_featured"
                  value={formData.is_featured}
                  onChange={handleInputChange}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes (Spotlight on Homepage)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Sizes Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
              3. Available Sizes
            </h3>
            <p className="text-xs text-slate-500">Check all sizes that apply for this product:</p>
            <div className="flex flex-wrap gap-3">
              {availableSizes.map((size) => {
                const isSelected = selectedSizes.includes(size.id);
                return (
                  <button
                    type="button"
                    key={size.id}
                    onClick={() => handleSizeToggle(size.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {size.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Image Gallery Upload */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
              4. Media Gallery
            </h3>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">
                {uploadingImage ? 'Uploading & generating thumbnails...' : 'Click or drag images to upload'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports JPEG, PNG, WEBP up to 5MB. Resized automatically.
              </p>
            </div>

            {/* Existing Images (Edit mode) */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500">Current Product Images:</span>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group">
                      <img
                        src={formatImageUrl(img.image_url || img.image)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img.id)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Newly Uploaded Temp Images */}
            {uploadedGallery.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-600">New Images Pending Save:</span>
                <div className="flex flex-wrap gap-3">
                  {uploadedGallery.map((item) => (
                    <div key={item.id} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-blue-500 group shadow-sm">
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveTempImage(item.id)}
                        className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded-md hover:bg-rose-600 transition-colors"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: Descriptions */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
              5. Descriptions
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Short Catchphrase / Highlight
              </label>
              <input
                type="text"
                name="short_description"
                value={formData.short_description}
                onChange={handleInputChange}
                placeholder="Brief summary visible on preview cards"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Description & Specifications
              </label>
              <textarea
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Comprehensive details, styling notes, material composition..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-blue-500 focus:bg-white leading-relaxed"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/admin/products"
              className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEdit ? 'Save Changes' : 'Publish Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
