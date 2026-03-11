import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000',  // Port backend kamu
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor untuk menambahkan token ke setiap request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Token ditambahkan ke request: ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk handle error response
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout');
    }
    
    if (error.response) {
      console.error(`❌ Error ${error.response.status}:`, error.response.data);
      
      if (error.response.status === 401) {
        console.log('🔒 Token expired, redirect ke login');
        localStorage.clear();
        window.location.href = '/login';
      }
      
      if (error.response.status === 403) {
        console.log('🚫 Forbidden - role tidak memiliki akses');
      }
    } else if (error.request) {
      console.error('📡 No response from server');
    } else {
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default instance;