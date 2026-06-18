const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Helper to make API requests with Authorization header
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, clear token and redirect/reload
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw new Error(data.error || 'Terjadi kesalahan sistem');
    }

    return data;
  } catch (error) {
    console.error(`API Error in ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    login: (username, password) => 
      request('/auth/login', {
        method: 'POST',
        body: { username, password }
      }),
    register: (name, username, password, role) => 
      request('/auth/register', {
        method: 'POST',
        body: { name, username, password, role }
      }),
    me: () => request('/auth/me')
  },

  // Menus
  menus: {
    getAll: () => request('/menus'),
    create: (menuData) => 
      request('/menus', {
        method: 'POST',
        body: menuData
      }),
    update: (id, menuData) => 
      request(`/menus/${id}`, {
        method: 'PUT',
        body: menuData
      }),
    delete: (id) => 
      request(`/menus/${id}`, {
        method: 'DELETE'
      })
  },

  // Transactions
  transactions: {
    getAll: () => request('/transactions'),
    create: (txData) => 
      request('/transactions', {
        method: 'POST',
        body: txData
      }),
    delete: (id) => 
      request(`/transactions/${id}`, {
        method: 'DELETE'
      })
  },

  // Dashboard Stats
  dashboard: {
    getStats: () => request('/dashboard/stats')
  },

  // Users (Admin Validation)
  users: {
    getAll: () => request('/users'),
    verify: (id, isVerified) => 
      request(`/users/${id}/verify`, {
        method: 'PUT',
        body: { is_verified: isVerified }
      })
  }
};
