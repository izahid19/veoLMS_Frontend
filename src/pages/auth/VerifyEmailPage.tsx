import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../Utils/toast';
import { Loader2 } from 'lucide-react';
import { verifyOtp, resendOtp } from '../../crud/auth.crud';
import { SeoHead } from '../../components/layout/SeoHead';
import { verifyEmailSeoConfig } from '../../seo/seo.auth.config';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [emailId, setEmailId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verifyEmail');
    if (!storedEmail) {
      toast.error('Session expired. Please register or login again.');
      navigate('/register');
    } else {
      setEmailId(storedEmail);
    }
  }, [navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await verifyOtp({ emailId, otp: otpValue });
      if (response.data.success) {
        toast.success('Email verified successfully! Please log in.');
        sessionStorage.removeItem('verifyEmail');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    try {
      const response = await resendOtp({ emailId });
      if (response.data.success) {
        toast.success('OTP has been resent to your email.');
        setCountdown(60);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans text-on-surface antialiased">
      <SeoHead config={verifyEmailSeoConfig as any} />
      
      {/* Cinematic Background Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-60">
        <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[20%] w-[800px] h-[800px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center w-full relative z-10 px-margin-mobile md:px-margin-desktop py-20">
        <div className="glass-panel w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-surface-border/50 bg-surface-dim/80 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="text-center mb-10 relative z-10">
            <h2 className="text-3xl md:text-4xl font-display-lg text-on-surface font-bold tracking-tight mb-3">
              Check your email
            </h2>
            <p className="mt-2 font-body-md text-on-surface-variant">
              We've sent a 6-digit verification code to
              <br />
              <span className="font-semibold text-primary">{emailId}</span>
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-surface rounded-lg border border-surface-border text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              ))}
            </div>

            <button
              className="group/btn relative flex items-center justify-center w-full h-14 rounded-xl bg-primary-container font-label-md text-white shadow-[0_4px_12px_rgba(255,107,0,0.4)] hover:shadow-[0_0_24px_rgba(255,107,0,0.6)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden text-lg mt-8 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_12px_rgba(255,107,0,0.4)]"
              type="submit"
              disabled={isSubmitting || otp.join('').length !== 6}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                ) : (
                  <>Verify Email <span className="group-hover/btn:translate-x-1 transition-transform">&rarr;</span></>
                )}
              </span>
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-on-surface-variant relative z-10">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || isResending}
              className="text-primary hover:text-primary-fixed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Resending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};
