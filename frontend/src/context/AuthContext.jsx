import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_token') || null);

  const [customerUser, setCustomerUser] = useState(() => {
    const saved = localStorage.getItem('customer_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem('auth_token') || null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify stored tokens on initial load
    setLoading(false);
  }, []);

  const loginAdmin = async (email, password) => {
    try {
      const response = await authService.adminLogin({ email, password });
      const data = response.data;
      if (data.status === 200 && data.token) {
        setAdminToken(data.token);
        const userObj = { id: data.id, name: data.name, email: data.email, role: data.role };
        setAdminUser(userObj);
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(userObj));
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Authentication error',
        errors: err.response?.data?.errors,
      };
    }
  };

  const logoutAdmin = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // ignore
    } finally {
      setAdminToken(null);
      setAdminUser(null);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  };

  const loginCustomer = async (email, password) => {
    try {
      const response = await authService.userLogin({ email, password });
      const data = response.data;
      if (data.status === 200 && data.token) {
        setCustomerToken(data.token);
        setCustomerUser(data.user);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('customer_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed',
      };
    }
  };

  const registerCustomer = async (name, email, password) => {
    try {
      const response = await authService.userRegister({ name, email, password });
      const data = response.data;
      if (data.status === 201 && data.token) {
        setCustomerToken(data.token);
        setCustomerUser(data.user);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('customer_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed',
        errors: err.response?.data?.errors,
      };
    }
  };

  const logoutCustomer = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // ignore
    } finally {
      setCustomerToken(null);
      setCustomerUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('customer_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        adminToken,
        isAdminAuthenticated: Boolean(adminToken),
        loginAdmin,
        logoutAdmin,
        customerUser,
        customerToken,
        isCustomerAuthenticated: Boolean(customerToken),
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
