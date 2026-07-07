import React from 'react';
import { useFormik } from 'formik';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from '../../Utils/toast';
import { forgotPassword } from '../../crud/auth.crud';
import { SeoHead } from '../../components/layout/SeoHead';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { cn } from '../../Utils/helpers';
import { forgotPasswordSchema } from '../../validation/auth.validation';
import { forgotPasswordSeoConfig } from '../../seo/seo.auth.config';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      emailId: '',
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      try {
        const response = await forgotPassword({ emailId: values.emailId });
        if (response.data.success || response.status === 200) {
          sessionStorage.setItem('resetEmailId', values.emailId);
          toast.success('OTP sent to your email');
          navigate('/reset-password');
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to send OTP. Please try again.';
        toast.error(message);
      }
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans text-on-surface antialiased">
      <SeoHead config={forgotPasswordSeoConfig} />
      
      {/* Cinematic Background Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-60">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-50">
        <Link to="/login" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center w-full relative z-10 px-margin-mobile md:px-margin-desktop py-20">
        <div className="glass-panel w-full max-w-[400px] p-8 md:p-10 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-surface-border/50 bg-surface-dim/80 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="mb-8 text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-display-lg text-on-surface font-bold tracking-tight mb-2">
              Forgot Password
            </h2>
            <p className="font-body-md text-on-surface-variant text-sm">
              Enter your email address to receive a password reset OTP.
            </p>
          </div>

          <form className="w-full relative z-10" onSubmit={formik.handleSubmit}>
            
            <LabelInputContainer className="mb-8">
              <Label htmlFor="emailId">Email Address</Label>
              <Input 
                id="emailId" 
                name="emailId"
                placeholder="Enter your email" 
                type="email" 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.emailId}
              />
              {formik.touched.emailId && formik.errors.emailId && (
                <p className="text-xs text-red-500 mt-1">{formik.errors.emailId}</p>
              )}
            </LabelInputContainer>

            <button
              className="group/btn relative flex items-center justify-center w-full h-12 rounded-xl bg-primary-container font-label-md text-white shadow-[0_4px_12px_rgba(255,107,0,0.4)] hover:shadow-[0_0_24px_rgba(255,107,0,0.6)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden text-[15px] font-semibold mt-4 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_12px_rgba(255,107,0,0.4)]"
              type="submit"
              disabled={formik.isSubmitting}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {formik.isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                ) : (
                  <>Send Reset OTP <span className="group-hover/btn:translate-x-1 transition-transform">&rarr;</span></>
                )}
              </span>
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </button>
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

export default ForgotPasswordPage;
