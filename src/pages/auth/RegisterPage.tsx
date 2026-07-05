import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from '../../Utils/toast';
import { signup, checkUsername } from '../../crud/auth.crud';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { cn } from '../../Utils/helpers';
import { SeoHead } from '../../components/layout/SeoHead';
import { registerSeoConfig } from '../../seo/seo.auth.config';

import { signupSchema } from '../../validation/auth.validation';



export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      username: '',
      emailId: '',
      password: '',
    },
    validationSchema: signupSchema,
    onSubmit: async (values) => {
      try {
        const response = await signup(values);

        if (response.data.success) {
          sessionStorage.setItem('verifyEmail', values.emailId);
          toast.success('Account created! Please verify your email.');
          navigate('/verify-email');
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Registration failed. Please try again.';
        toast.error(message);
      }
    },
  });

  const username = formik.values.username;
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');

  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Checking availability...');

    const timer = setTimeout(async () => {
      try {
        const response = await checkUsername(username);
        if (response.data.available) {
          setUsernameStatus('available');
          setUsernameMessage('Username is available');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage('Username is already taken');
        }
      } catch (error: any) {
        setUsernameStatus('taken');
        setUsernameMessage(error.response?.data?.message || 'Error checking username');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans text-on-surface antialiased">
      <SeoHead config={registerSeoConfig as any} />

      {/* Cinematic Background Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-60">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center w-full relative z-10 px-margin-mobile md:px-margin-desktop py-20">
        <div className="glass-panel w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-surface-border/50 bg-surface-dim/80 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-display-lg text-on-surface font-bold tracking-tight mb-3">
              Welcome to VeoLMS
            </h2>
            <p className="font-body-md text-on-surface-variant text-lg">
              Create an account to start your learning journey.
            </p>
          </div>

          <form className="w-full relative z-10" onSubmit={formik.handleSubmit}>
            <div className="mb-4 flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <LabelInputContainer>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Tyler"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.firstName}
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="text-xs text-red-500">{formik.errors.firstName}</p>
                )}
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Durden"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.lastName}
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="text-xs text-red-500">{formik.errors.lastName}</p>
                )}
              </LabelInputContainer>
            </div>

            <LabelInputContainer className="mb-4">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="tyler_d"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-xs text-red-500">{formik.errors.username}</p>
              )}
              {(!formik.touched.username || !formik.errors.username) && usernameStatus === 'checking' && <p className="text-xs text-neutral-400">Checking availability...</p>}
              {(!formik.touched.username || !formik.errors.username) && usernameStatus === 'available' && <p className="text-xs text-green-500">{usernameMessage}</p>}
              {(!formik.touched.username || !formik.errors.username) && usernameStatus === 'taken' && <p className="text-xs text-red-500">{usernameMessage}</p>}
            </LabelInputContainer>

            <LabelInputContainer className="mb-4">
              <Label htmlFor="emailId">Email Address</Label>
              <Input
                id="emailId"
                name="emailId"
                placeholder="projectmayhem@fc.com"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.emailId}
              />
              {formik.touched.emailId && formik.errors.emailId && (
                <p className="text-xs text-red-500">{formik.errors.emailId}</p>
              )}
            </LabelInputContainer>

            <LabelInputContainer className="mb-8 relative">
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

              {/* Dynamic Password Strength Indicator (Inline) */}
              <p className="text-sm mt-2">
                <span className="text-on-surface-variant">Password must contain a </span>
                <span className={(formik.values.password || '').length >= 6 ? "text-green-500" : "text-red-500"}>minimum of 6 characters</span>
                <span className="text-on-surface-variant">, </span>
                <span className={/[A-Z]/.test(formik.values.password || '') ? "text-green-500" : "text-red-500"}>1 uppercase</span>
                <span className="text-on-surface-variant">, </span>
                <span className={/[a-z]/.test(formik.values.password || '') ? "text-green-500" : "text-red-500"}>1 lowercase</span>
                <span className="text-on-surface-variant">, </span>
                <span className={/\d/.test(formik.values.password || '') ? "text-green-500" : "text-red-500"}>1 number</span>
                <span className="text-on-surface-variant"> and </span>
                <span className={/[@$!%*?&]/.test(formik.values.password || '') ? "text-green-500" : "text-red-500"}>1 special character</span>
              </p>
            </LabelInputContainer>

            <button
              className="group/btn relative flex items-center justify-center w-full h-14 rounded-xl bg-primary-container font-label-md text-white shadow-[0_4px_12px_rgba(255,107,0,0.4)] hover:shadow-[0_0_24px_rgba(255,107,0,0.6)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden text-lg mt-4 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_12px_rgba(255,107,0,0.4)]"
              type="submit"
              disabled={formik.isSubmitting || usernameStatus === 'taken' || usernameStatus === 'checking'}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {formik.isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Signing up...</>
                ) : (
                  <>Sign up <span className="group-hover/btn:translate-x-1 transition-transform">&rarr;</span></>
                )}
              </span>
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </button>

            <div className="mt-8 text-center">
              <Link to="/login" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                Already have an account? <span className="text-primary hover:underline">Log in</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

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
