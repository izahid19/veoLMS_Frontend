import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import axiosInstance from '../../lib/axios';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const validateSession = async () => {
      try {
        const response = await axiosInstance.get('/auth/me');
        if (isMounted) {
          if (response.data.success) {
            // Re-hydrate the user into the store but we don't have the new accessToken,
            // so we'll just update the user object.
            setAuth(useAuthStore.getState().accessToken || '', response.data.data);
            setIsValidating(false);
          } else {
            clearAuth();
            setIsValidating(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          clearAuth();
          setIsValidating(false);
        }
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [clearAuth, setAuth]);

  if (isValidating) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-on-surface-variant font-medium animate-pulse">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
