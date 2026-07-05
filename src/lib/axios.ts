import axios from 'axios';
import useAuthStore from '../store/authStore';
import { API_BASE_URL } from '../config';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Needed for httpOnly cookies
});

// Request Interceptor: Attach the access token and CSRF token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Extract CSRF token from cookie and attach to header
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const csrfToken = getCookie('csrfToken');
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401, not a retry already, and NOT the refresh token or login endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/refresh-token') &&
      !originalRequest.url?.includes('/login')
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to get a new access token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.accessToken;

        if (refreshResponse.data?.success && newAccessToken) {
          // Keep the existing user in the state, just update the token
          const currentUser = useAuthStore.getState().user;
          if (currentUser) {
            useAuthStore.getState().setAuth(newAccessToken, currentUser);
          }

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear the auth state and redirect to login
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
