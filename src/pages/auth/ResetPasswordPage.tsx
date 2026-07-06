import React, { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import { useNavigate, Navigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from '../../Utils/toast';
import { resetPassword, resendForgotPasswordOtp } from '../../crud/auth.crud';
import { SeoHead } from '../../components/layout/SeoHead';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { cn } from '../../Utils/helpers';
import * as Yup from 'yup';
import { resetPasswordSeoConfig } from '../../seo/seo.auth.config';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const emailId = sessionStorage.getItem('resetEmailId');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(intervalId);
    }
  }, [timer]);

  if (!emailId) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleResendOtp = async () => {
    if (timer > 0) return;
    try {
      await resendForgotPasswordOtp({ emailId });
      toast.success('A new OTP has been sent to your email.');
      setTimer(60);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    // We only validate passwords here now since OTP is external state
    validationSchema: Yup.object().shape({
      newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
          'Must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character'
        )
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), ''], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async (values) => {
      const otpValue = otp.join('');
      if (otpValue.length !== 6) {
        toast.error('Please enter the complete 6-digit OTP.');
        return;
      }
      try {
        const response = await resetPassword({ 
          emailId, 
          otp: otpValue, 
          newPassword: values.newPassword 
        });
        if (response.data.success || response.status === 200) {
          sessionStorage.removeItem('resetEmailId');
          toast.success('Password reset successful!');
          navigate('/login');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to reset password. Please try again.');
      }
    },
  });

  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some((char) => isNaN(Number(char)))) return;

    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans text-on-surface antialiased">
      <SeoHead config={resetPasswordSeoConfig} />
      
      {/* Cinematic Background Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-60">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center w-full relative z-10 px-margin-mobile md:px-margin-desktop py-20">
        <div className="glass-panel w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-surface-border/50 bg-surface-dim/80 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="mb-10 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-display-lg text-on-surface font-bold tracking-tight mb-3">
              Reset Password
            </h2>
            <p className="font-body-md text-on-surface-variant text-lg">
              Enter the 6-digit OTP sent to <span className="font-semibold text-primary">{emailId}</span> and your new password.
            </p>
          </div>

          <form className="w-full relative z-10" onSubmit={formik.handleSubmit}>
            
            <LabelInputContainer className="mb-6">
              <Label>One-Time Password (OTP)</Label>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    className={cn(
                      "flex h-12 w-12 text-center border-none bg-surface-dim text-on-surface rounded-md text-lg font-bold placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-primary-container disabled:cursor-not-allowed disabled:opacity-50 shadow-[0px_0px_1px_1px_#262626] transition duration-400"
                    )}
                  />
                ))}
              </div>
            </LabelInputContainer>

            <LabelInputContainer className="mb-4 relative">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative w-full">
                <Input 
                  id="newPassword" 
                  name="newPassword"
                  placeholder="••••••••" 
                  type={showPassword ? 'text' : 'password'} 
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.newPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <p className="text-xs text-red-500 mt-1">{formik.errors.newPassword}</p>
              )}
              
              <p className="text-sm mt-2 leading-tight">
                <span className="text-on-surface-variant">Must contain a </span>
                <span className={(formik.values.newPassword || '').length >= 8 ? "text-green-500" : "text-red-500"}>minimum of 8 characters</span>
                <span className="text-on-surface-variant">, </span>
                <span className={/[A-Z]/.test(formik.values.newPassword || '') ? "text-green-500" : "text-red-500"}>1 uppercase</span>
                <span className="text-on-surface-variant">, </span>
                <span className={/[a-z]/.test(formik.values.newPassword || '') ? "text-green-500" : "text-red-500"}>1 lowercase</span>
                <span className="text-on-surface-variant">, </span>
                <span className={/\d/.test(formik.values.newPassword || '') ? "text-green-500" : "text-red-500"}>1 number</span>
                <span className="text-on-surface-variant"> and </span>
                <span className={/[@$!%*?&]/.test(formik.values.newPassword || '') ? "text-green-500" : "text-red-500"}>1 special character</span>
              </p>
            </LabelInputContainer>

            <LabelInputContainer className="mb-8 relative">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative w-full">
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  placeholder="••••••••" 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-xs text-red-500">{formik.errors.confirmPassword}</p>
              )}
            </LabelInputContainer>

            <button
              className="group/btn relative flex items-center justify-center w-full h-14 rounded-xl bg-primary-container font-label-md text-white shadow-[0_4px_12px_rgba(255,107,0,0.4)] hover:shadow-[0_0_24px_rgba(255,107,0,0.6)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden text-lg mt-8 mb-6 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_12px_rgba(255,107,0,0.4)]"
              type="submit"
              disabled={formik.isSubmitting}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {formik.isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Resetting Password...</>
                ) : (
                  <>Reset Password <span className="group-hover/btn:translate-x-1 transition-transform">&rarr;</span></>
                )}
              </span>
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </button>

            <div className="text-center">
              <p className="text-sm text-on-surface-variant">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timer > 0}
                  className={cn(
                    "font-medium transition-colors",
                    timer > 0 ? "text-on-surface-variant opacity-50 cursor-not-allowed" : "text-primary hover:text-primary-fixed"
                  )}
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                </button>
              </p>
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

export default ResetPasswordPage;
