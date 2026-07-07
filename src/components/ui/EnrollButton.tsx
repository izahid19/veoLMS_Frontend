import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Play, Loader2 } from 'lucide-react';

import { createOrder, verifyPayment, handleFailedPayment } from '../../crud/payment.crud';
import { getCourseBySlug } from '../../crud/course.crud';
import { initiateRazorpayCheckout } from '../../Utils/razorpay';
import { toast } from '../../Utils/toast';
import { formatPrice, buildPlayerUrl } from '../../Utils/helpers';

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
  const currentOrderIdRef = useRef<string | null>(null);

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

  // 2. If not logged in -> Redirect to login
  if (!isLoggedIn) {
    return (
      <button
        onClick={() => navigate('/login', { state: { from: `/courses/${courseSlug}` } })}
        className="w-full bg-[#ff6b00] hover:bg-[#e65a00] text-white font-['Plus_Jakarta_Sans'] font-semibold py-3.5 rounded-[8px] transition-colors mb-4 flex justify-center items-center"
      >
        Login to Enroll
      </button>
    );
  }

  // 3. Free Course vs Paid Course
  const handleEnrollClick = async () => {
    setIsLoading(true);
    try {
      if (price === 0) {
        // Free course flow
        const orderRes = await createOrder(courseId);
        if (orderRes.success && orderRes.data) {
          const verifyRes = await verifyPayment({
            razorpayOrderId: orderRes.data.orderId,
            razorpayPaymentId: 'FREE_COURSE_PAYMENT',
            razorpaySignature: 'FREE_COURSE_SIGNATURE',
            courseId,
          });
          if (verifyRes.success) {
            await queryClient.invalidateQueries({ queryKey: ['enrollment-check', courseId] });
            await queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
            await queryClient.invalidateQueries({ queryKey: ['enrolled-course', courseSlug] });
            queryClient.removeQueries({ queryKey: ['enrolled-course', courseSlug] });
            
            if (firstLessonId) {
              navigate(buildPlayerUrl(courseSlug, firstLessonId));
            } else {
              navigate(`/courses/${courseSlug}`);
            }
          }
        }
      } else {
        // Paid course flow (Razorpay)
        const orderRes = await createOrder(courseId);
        if (orderRes.success && orderRes.data) {
          const { keyId, amount, currency, courseName, orderId } = orderRes.data;
          currentOrderIdRef.current = orderId;

          await initiateRazorpayCheckout({
            key: keyId,
            amount: amount,
            currency: currency,
            name: 'VeoLMS',
            description: courseName,
            order_id: orderId,
            theme: { color: '#ff6b00' },
            handler: async (paymentResponse: any) => {
              try {
                setIsLoading(true);
                const verifyRes = await verifyPayment({
                  razorpayOrderId: paymentResponse.razorpay_order_id,
                  razorpayPaymentId: paymentResponse.razorpay_payment_id,
                  razorpaySignature: paymentResponse.razorpay_signature,
                  courseId,
                });
                
                if (verifyRes.success) {
                  await queryClient.invalidateQueries({ queryKey: ['enrollment-check', courseId] });
                  await queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
                  await queryClient.invalidateQueries({ queryKey: ['enrolled-course', courseSlug] });
                  queryClient.removeQueries({ queryKey: ['enrolled-course', courseSlug] });
                  
                  if (firstLessonId) {
                    navigate(buildPlayerUrl(courseSlug, firstLessonId));
                  } else {
                    navigate(`/courses/${courseSlug}`);
                  }
                  toast.success('Successfully enrolled!');
                }
              } catch (error: any) {
                console.error('Payment verification failed:', error);
                toast.error(error?.message || 'Payment verification failed.');
              } finally {
                setIsLoading(false);
              }
            },
            modal: {
              ondismiss: async () => {
                try {
                  if (currentOrderIdRef.current) {
                    await handleFailedPayment(currentOrderIdRef.current);
                  }
                } catch (e) {}
                setIsLoading(false);
                navigate('/payment/failed', { 
                  state: { courseSlug: courseSlug } 
                });
              },
            },
          });
          // Note: we don't set loading false here because the modal stays open.
        }
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Failed to initiate enrollment.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnrollClick}
      disabled={isLoading}
      className="w-full bg-[#ff6b00] hover:bg-[#e65a00] text-white font-['Plus_Jakarta_Sans'] font-semibold py-3.5 rounded-[8px] transition-colors mb-4 disabled:opacity-50 flex justify-center items-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : price === 0 ? (
        'Enroll Free'
      ) : (
        `Enroll Now — ${formatPrice(price)}`
      )}
    </button>
  );
}
