import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Request queue for token refresh
let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedRequestsQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  
  failedRequestsQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    // Add build version header
    config.headers['X-Build-Version'] = import.meta.env.VITE_APP_VERSION || '1.0.0';
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor with request queue
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const authStore = useAuthStore();
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't retry refresh on login/auth endpoints
    const isLoginEndpoint = originalRequest.url?.includes('/auth/login') ||
                           (originalRequest.url?.endsWith('/auth') && originalRequest.method === 'post') ||
                           originalRequest.url?.includes('/auth/refresh-token') ||
                           originalRequest.url?.includes('/auth/check-health');
    const isAuthEndpoint = isLoginEndpoint;

    // Handle 401 Unauthorized (but not on login endpoints)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Token refresh already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        await authStore.refreshAccessToken();
        const newToken = authStore.token;
        
        // Process queued requests
        processQueue(null, newToken);
        
        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, process queue with error
        processQueue(refreshError, null);
        
        // Logout user
        authStore.logout();
        router.push({ name: 'Login' });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Permission denied');
      // Optionally redirect to an unauthorized page
    }

    // Handle 426 Upgrade Required (outdated app version)
    if (error.response?.status === 426) {
      console.error('App version outdated, update required');
      // Show update notification to user
      // You can emit an event or show a dialog here
    }

    return Promise.reject(error);
  }
);

export default api;
