import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from '../../Utils/toast';
import { login } from '../../crud/auth.crud';
import useAuthStore from '../../store/authStore';
import { SeoHead } from '../../components/layout/SeoHead';
import { loginSeoConfig } from '../../seo/seo.auth.config';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { cn } from '../../Utils/helpers';

import { loginSchema } from '../../validation/auth.validation';



const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const formik = useFormik({
    initialValues: {
      identifier: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        const response = await login(values);

        if (response.data.success) {
          const { accessToken, data: user } = response.data;

          // Update Zustand store
          setAuth(accessToken, user);

          toast.success('Successfully logged in!');

          // Redirect based on role
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Login failed. Please try again.';
        toast.error(message);
      }
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans text-on-surface antialiased">
      <SeoHead config={loginSeoConfig as any} />

      {/* Cinematic Background Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-60">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-50">
        <Link to="/" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center w-full relative z-10 px-margin-mobile md:px-margin-desktop py-20">
        <div className="glass-panel w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-surface-border/50 bg-surface-dim/80 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-display-lg text-on-surface font-bold tracking-tight mb-3">
              Welcome back
            </h2>
            <p className="font-body-md text-on-surface-variant text-lg">
              Log in to continue your learning journey
            </p>
          </div>

          <form className="w-full relative z-10" onSubmit={formik.handleSubmit}>

            <LabelInputContainer className="mb-4">
              <Label htmlFor="identifier">Email or Username</Label>
              <Input
                id="identifier"
                name="identifier"
                placeholder="Enter your email or username"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.identifier}
              />
              {formik.touched.identifier && formik.errors.identifier && (
                <p className="text-xs text-red-500">{formik.errors.identifier}</p>
              )}
            </LabelInputContainer>

            <LabelInputContainer className="mb-4 relative">
              <Label htmlFor="password">Password</Label>
              <div className="relative w-full">
                <Input
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-red-500">{formik.errors.password}</p>
              )}
            </LabelInputContainer>

            <div className="flex items-center justify-end mb-8">
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary hover:text-primary-fixed transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              className="group/btn relative flex items-center justify-center w-full h-14 rounded-xl bg-primary-container font-label-md text-white shadow-[0_4px_12px_rgba(255,107,0,0.4)] hover:shadow-[0_0_24px_rgba(255,107,0,0.6)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden text-lg mt-4 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_12px_rgba(255,107,0,0.4)]"
              type="submit"
              disabled={formik.isSubmitting}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {formik.isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</>
                ) : (
                  <>Sign in <span className="group-hover/btn:translate-x-1 transition-transform">&rarr;</span></>
                )}
              </span>
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </button>

            <div className="mt-8 text-center">
              <Link to="/register" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                Don't have an account? <span className="text-primary hover:underline">Create one</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default LoginPage;
