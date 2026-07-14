import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import axiosInstance from '../../lib/axios';

/**
 * AuthInitializer
 *
 * Runs once on every page load to restore auth state from the httpOnly cookie.
 * Calls GET /auth/me which uses the refresh-token cookie to re-issue an access
 * token if needed (handled by the axios response interceptor), then hydrates
 * the Zustand store. All child routes are blocked until this completes, so
 * no route ever renders with a stale (empty) auth state.
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setAuth, clearAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const response = await axiosInstance.get('/auth/me');
        if (isMounted) {
          if (response.data?.success && response.data?.data) {
            // Keep any accessToken that was re-issued by the interceptor;
            // fall back to whatever is already in the store.
            const currentToken = useAuthStore.getState().accessToken || '';
            setAuth(currentToken, response.data.data);
          } else {
            clearAuth();
          }
        }
      } catch {
        // Session invalid or network error – clear any stale state
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [setAuth, clearAuth]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#ff6b00]" />
          <p className="text-sm text-gray-400 font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
