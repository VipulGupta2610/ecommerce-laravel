import axios from 'axios';

// Backend API Base URL
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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
