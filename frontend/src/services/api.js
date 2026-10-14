import axios from 'axios';

// Backend API Base URL and Host
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${BACKEND_URL}/api`;

// Category-specific fallback images when product images fail or are not provided
const CATEGORY_FALLBACKS = {
  footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  watches: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  apparel: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
};

export const getCategoryFallbackImage = (categoryName = '') => {
  const name = String(categoryName || '').toLowerCase();
  if (name.includes('foot') || name.includes('shoe') || name.includes('sneaker')) {
    return CATEGORY_FALLBACKS.footwear;
  }
  if (name.includes('elect') || name.includes('audio') || name.includes('headphone')) {
    return CATEGORY_FALLBACKS.electronics;
  }
  if (name.includes('watch') || name.includes('access')) {
    return CATEGORY_FALLBACKS.watches;
  }
  if (name.includes('apparel') || name.includes('cloth') || name.includes('fashion')) {
    return CATEGORY_FALLBACKS.apparel;
  }
  return CATEGORY_FALLBACKS.default;
};

/**
 * Normalizes any image URL or relative filename so it reliably resolves via IPv4 backend host
 */
export const formatImageUrl = (imageOrUrl, categoryName = '') => {
  if (!imageOrUrl) {
    return getCategoryFallbackImage(categoryName);
  }

  const str = String(imageOrUrl).trim();
  if (!str) {
    return getCategoryFallbackImage(categoryName);
  }

  // Replace localhost:8000 with 127.0.0.1:8000 to eliminate Windows IPv6 ::1 ECONNREFUSED issues
  if (str.startsWith('http://localhost:8000') || str.startsWith('https://localhost:8000')) {
    return str.replace('localhost:8000', '127.0.0.1:8000');
  }

  // Full external URL (Unsplash, CDN, etc.)
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:')) {
    return str;
  }

  // Relative path starting with /uploads
  if (str.startsWith('/uploads')) {
    return `${BACKEND_URL}${str}`;
  }

  // Just filename e.g. "1-sample-123.svg"
  return `${BACKEND_URL}/uploads/products/small/${str}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor to attach authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: Handle token expiry
    }
    return Promise.reject(error);
  }
);

// =================== AUTH SERVICES ===================
export const authService = {
  adminLogin: (credentials) => api.post('/admin/login', credentials),
  userLogin: (credentials) => api.post('/login', credentials),
  userRegister: (userData) => api.post('/register', userData),
  getMe: () => api.get('/user'),
  logout: () => api.post('/logout'),
};

// =================== PRODUCT SERVICES ===================
export const productService = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  deleteImage: (imageId) => api.delete(`/product-images/${imageId}`),
};

// =================== CATEGORY SERVICES ===================
export const categoryService = {
  getCategories: (params = {}) => api.get('/categories', { params }),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// =================== BRAND SERVICES ===================
export const brandService = {
  getBrands: (params = {}) => api.get('/brands', { params }),
  getBrand: (id) => api.get(`/brands/${id}`),
  createBrand: (data) => api.post('/brands', data),
  updateBrand: (id, data) => api.put(`/brands/${id}`, data),
  deleteBrand: (id) => api.delete(`/brands/${id}`),
};

// =================== SIZE SERVICES ===================
export const sizeService = {
  getSizes: () => api.get('/sizes'),
  createSize: (data) => api.post('/sizes', data),
  deleteSize: (id) => api.delete(`/sizes/${id}`),
};

// =================== TEMP IMAGE SERVICES ===================
export const imageService = {
  uploadTempImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/temp-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
