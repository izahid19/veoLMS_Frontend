import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Loader2 } from 'lucide-react';
import { toast } from '../../Utils/toast';
import { buildPlayerUrl } from '../../Utils/helpers';
import { getCourseBySlug } from '../../crud/course.crud';
import { createOrder, verifyPayment } from '../../crud/payment.crud';
import { useQueryClient } from '@tanstack/react-query';

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  price: number;
  isEnrolled: boolean;
  isLoggedIn: boolean;
  firstLessonId?: string;
}

export default function EnrollButton({
  courseId,
  courseSlug,
  price,
  isEnrolled,
  isLoggedIn,
  firstLessonId,
}: EnrollButtonProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // 1. If enrolled -> Continue Learning
  const handleContinueLearning = async () => {
    setIsLoading(true);
    try {
      const { getCourseProgress } = await import('../../crud/progress.crud');
      const [progRes, courseRes] = await Promise.allSettled([
        getCourseProgress(courseId),
        getCourseBySlug(courseSlug)
      ]);
      
      let targetLessonId = null;
      if (progRes.status === 'fulfilled' && progRes.value?.lastWatchedLesson?.lessonId) {
        targetLessonId = progRes.value.lastWatchedLesson.lessonId;
      } else if (firstLessonId) {
        targetLessonId = firstLessonId;
      } else if (courseRes.status === 'fulfilled') {
        targetLessonId = courseRes.value.data.data.sections?.[0]?.lessons?.[0]?._id;
      }

      if (targetLessonId) {
        navigate(buildPlayerUrl(courseSlug, targetLessonId));
      } else {
        toast.error('Course has no lessons yet');
        navigate('/dashboard/my-courses');
      }
    } catch (error) {
      navigate('/dashboard/my-courses');
    }
    setIsLoading(false);
  };

  if (isEnrolled) {
    return (
      <button
        onClick={handleContinueLearning}
        disabled={isLoading}
        className="w-full bg-[#9333ea] hover:bg-[#7e22ce] text-white font-['Plus_Jakarta_Sans'] font-semibold py-3.5 rounded-[8px] transition-colors mb-4 flex justify-center items-center gap-2 disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
        Continue Learning →
      </button>
    );
  }

  // 2. If not logged in -> Redirect to login with checkout redirect
  if (!isLoggedIn) {
    return (
      <button
        onClick={() => navigate(`/login?redirect=/checkout/${courseSlug}`)}
        className="w-full bg-[#ff6b00] hover:bg-[#e65a00] text-white font-['Plus_Jakarta_Sans'] font-semibold py-3.5 rounded-[8px] transition-colors mb-4 flex justify-center items-center"
      >
        Login to Enroll
      </button>
    );
  }

  const handleEnrollClick = async () => {
    if (price === 0) {
      setIsLoading(true);
      try {
        const orderRes = await createOrder(courseId);
        if (orderRes.data?.orderId) {
          const verifyRes = await verifyPayment({
            razorpayOrderId: orderRes.data.orderId,
            razorpayPaymentId: 'FREE_COURSE_PAYMENT',
            razorpaySignature: 'NONE',
            courseId: courseId,
          });
          if (verifyRes.success) {
            queryClient.invalidateQueries({ queryKey: ['enrollment-check', courseId] });
            queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
            toast.success('Successfully enrolled in the free course!');
            navigate(`/learn/${courseSlug}`);
            return;
          }
        }
        toast.error('Failed to enroll in free course');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Enrollment failed');
      }
      setIsLoading(false);
    } else {
      navigate(`/checkout/${courseSlug}`);
    }
  };

  // 3. Logged in and not enrolled -> Go to checkout or enroll directly if free
  return (
    <button
      onClick={handleEnrollClick}
      disabled={isLoading}
      className="w-full bg-[#ff6b00] hover:bg-[#e65a00] text-white font-['Plus_Jakarta_Sans'] font-semibold py-3.5 rounded-[8px] transition-colors mb-4 flex justify-center items-center disabled:opacity-50 gap-2"
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {price === 0 ? (isLoading ? 'Enrolling...' : 'Enroll Free') : 'Enroll Now'}
    </button>
  );
}
