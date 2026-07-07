import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

import { buildPlayerUrl } from '../../Utils/helpers';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);

  const courseSlug = location.state?.courseSlug;
  const courseName = location.state?.courseName;

  // If no state (user navigated directly): redirect to /dashboard
  useEffect(() => {
    if (!courseSlug) {
      navigate('/dashboard', { replace: true });
    }
  }, [courseSlug, navigate]);

  useEffect(() => {
    document.title = 'Payment Successful — VeoLMS';

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard/my-courses');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const [isNavigating, setIsNavigating] = useState(false);

  const handleStartLearning = async () => {
    if (!courseSlug) return;
    setIsNavigating(true);
    try {
      const { getCourseBySlug } = await import('../../crud/course.crud');
      const courseRes = await getCourseBySlug(courseSlug);
      const firstLessonId = courseRes.data.data.sections?.[0]?.lessons?.[0]?._id;
      if (firstLessonId) {
        navigate(buildPlayerUrl(courseSlug, firstLessonId));
      } else {
        navigate('/dashboard/my-courses');
      }
    } catch (e) {
      navigate('/dashboard/my-courses');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-24 h-24 rounded-full border-4 border-[#ff6b00] flex items-center justify-center mb-8"
      >
        <Check className="w-12 h-12 text-[#ff6b00]" strokeWidth={3} />
      </motion.div>

      <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-3xl md:text-4xl text-white mb-4 text-center">
        Enrollment Successful! 🎉
      </h1>
      
      <p className="font-['Inter'] text-[#a3a3a3] text-lg mb-10 text-center max-w-md">
        You now have full access to the course. Get ready to level up your skills!
      </p>

      <div className="flex flex-col w-full max-w-xs gap-4">
        {courseSlug && (
          <button
            onClick={handleStartLearning}
            disabled={isNavigating}
            className="w-full bg-[#ff6b00] hover:bg-[#e65a00] text-white font-['Plus_Jakarta_Sans'] font-semibold py-3.5 rounded-[8px] transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isNavigating ? 'Loading...' : 'Start Learning Now'}
          </button>
        )}
        
        <button
          onClick={() => navigate('/dashboard/my-courses')}
          className="w-full bg-transparent border border-[#262626] hover:bg-[#131313] hover:border-[#404040] text-white font-['Plus_Jakarta_Sans'] font-semibold py-3.5 rounded-[8px] transition-all flex items-center justify-center"
        >
          Go to My Courses
        </button>
      </div>

      <p className="font-['Inter'] text-[#525252] text-sm mt-12 animate-pulse">
        Redirecting in {countdown} seconds...
      </p>
    </div>
  );
}
