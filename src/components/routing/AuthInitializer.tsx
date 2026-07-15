import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import axiosInstance from '../../lib/axios';

import { AnimatePresence } from 'framer-motion';
import { SplashScreen } from '../layout/SplashScreen';

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
      // Start the timer immediately
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000));
      
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
        // Wait for the cinematic splash screen to finish, regardless of network speed or auth errors
        await minLoadTime;
        
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

  return (
    <>
      <AnimatePresence mode="wait">
        {isInitializing && <SplashScreen key="splash" />}
      </AnimatePresence>
      {!isInitializing && children}
    </>
  );
};
