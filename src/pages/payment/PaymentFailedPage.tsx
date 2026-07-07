import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function PaymentFailedPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const courseSlug = location.state?.courseSlug;

  // If no state: redirect to /courses
  useEffect(() => {
    if (!courseSlug) {
      navigate('/courses', { replace: true });
    }
  }, [courseSlug, navigate]);

  useEffect(() => {
    document.title = 'Payment Failed — VeoLMS';
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-24 h-24 rounded-full border-4 border-red-500 flex items-center justify-center mb-8"
      >
        <X className="w-12 h-12 text-red-500" strokeWidth={3} />
      </motion.div>

      <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-3xl md:text-4xl text-white mb-4 text-center">
        Payment Failed
      </h1>
      
      <p className="font-['Inter'] text-[#a3a3a3] text-lg mb-10 text-center max-w-md">
        Don't worry, you haven't been charged. Please check your payment details and try again.
      </p>

      <div className="flex flex-col w-full max-w-xs gap-4">
        {courseSlug ? (
          <button
            onClick={() => navigate(`/courses/${courseSlug}`)}
            className="w-full bg-[#ff6b00] hover:bg-[#e65a00] text-white font-['Plus_Jakarta_Sans'] font-semibold py-3.5 rounded-[8px] transition-colors flex items-center justify-center"
          >
            Try Again
          </button>
        ) : (
          <button
            onClick={() => navigate('/courses')}
            className="w-full bg-[#ff6b00] hover:bg-[#e65a00] text-white font-['Plus_Jakarta_Sans'] font-semibold py-3.5 rounded-[8px] transition-colors flex items-center justify-center"
          >
            Browse Courses
          </button>
        )}
        
        <button
          onClick={() => navigate('/')}
          className="w-full bg-transparent border border-[#262626] hover:bg-[#131313] hover:border-[#404040] text-white font-['Plus_Jakarta_Sans'] font-semibold py-3.5 rounded-[8px] transition-all flex items-center justify-center"
        >
          Go Home
        </button>
      </div>

      <div className="mt-12">
        <a 
          href="mailto:support@veolms.com"
          className="font-['Inter'] text-[#a3a3a3] hover:text-white transition-colors text-sm underline underline-offset-4"
        >
          Need help? Contact support
        </a>
      </div>
    </div>
  );
}
