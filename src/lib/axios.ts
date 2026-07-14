import axios from 'axios';
import useAuthStore from '../store/authStore';
import { API_BASE_URL } from '../config';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Needed for httpOnly cookies
});

// Store CSRF token in memory if cookie reading fails (due to cross-origin)
let cachedCsrfToken: string | null = null;

// Request Interceptor: Attach the access token and CSRF token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Extract CSRF token from cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const csrfToken = getCookie('csrfToken') || cachedCsrfToken;
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401s by transparently refreshing the token
axiosInstance.interceptors.response.use(
  (response) => {
    // Cache the CSRF token from headers if the backend sent it
    const token = response.headers['x-csrf-token'];
    if (token) {
      cachedCsrfToken = token;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Only attempt a token refresh when:
    //   1. The server returned 401 (not authenticated)
    //   2. We haven't already retried this exact request
    //   3. This is not the refresh-token or login endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/refresh-token') &&
      !originalRequest.url?.includes('/login')
    ) {
      originalRequest._retry = true;

      try {
        // ⚠️  Must use axiosInstance (not bare axios) so the request
        //     interceptor attaches the x-csrf-token header from the cookie.
        //     Using bare axios skips that interceptor → always 403 CSRF error
        //     → caught here → clearAuth → AuthInitializer re-fires → infinite loop.
        const refreshResponse = await axiosInstance.post(
          '/auth/refresh-token',
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.accessToken;

        if (refreshResponse.data?.success && newAccessToken) {
          // Update store with new token while preserving the existing user
          const currentUser = useAuthStore.getState().user;
          if (currentUser) {
            useAuthStore.getState().setAuth(newAccessToken, currentUser);
          }

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh genuinely failed (expired refresh token, revoked session, etc.)
        // Clear auth state and redirect once — do NOT loop.
        useAuthStore.getState().clearAuth();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
