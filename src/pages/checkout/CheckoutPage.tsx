import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ShieldCheck, Loader2 } from 'lucide-react';
import * as yup from 'yup';

import { getCourseBySlug } from '../../crud/course.crud';
import { checkEnrollment } from '../../crud/enrollment.crud';
import { validateCoupon } from '../../crud/coupon.crud';
import { createOrder, verifyPayment, handleFailedPayment } from '../../crud/payment.crud';
import { initiateRazorpayCheckout } from '../../Utils/razorpay';
import { toast } from '../../Utils/toast';
import { formatPrice, formatDuration } from '../../Utils/helpers';
import { getDiscountTimeLeft } from '../../Utils/price';
import useAuthStore from '../../store/authStore';
import type { ICoupon, IPriceBreakdown } from '../../types/course.types';

const phoneSchema = yup
  .string()
  .required('Please enter a valid 10-digit phone number')
  .matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number');

export default function CheckoutPage() {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<ICoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState<IPriceBreakdown | null>(null);

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Fetch Course
  const { data: courseData, isLoading: isCourseLoading } = useQuery({
    queryKey: ['checkout-course', courseSlug],
    queryFn: async () => {
      try {
        const res = await getCourseBySlug(courseSlug as string);
        const data = res.data.data;
        if (!data.course.isPublished) {
          navigate('/courses');
          return null;
        }
        setPriceBreakdown(data.priceBreakdown);
        return data.course;
      } catch {
        toast.error('Course not found');
        navigate('/courses');
        return null;
      }
    },
    enabled: !!courseSlug,
    retry: false,
  });

  // 2. Check Enrollment
  useQuery({
    queryKey: ['checkout-enrollment-check', courseData?._id],
    queryFn: async () => {
      const res = await checkEnrollment(courseData?._id as string);
      if (res.isEnrolled) {
        toast.error('You are already enrolled in this course');
        navigate(`/learn/${courseSlug}`);
      }
      return res;
    },
    enabled: !!courseData?._id,
    staleTime: 0,
  });

  const handleApplyCoupon = async () => {
    if (!couponCode || !courseData?._id) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await validateCoupon(couponCode, courseData._id);
      if (res.data.data.valid) {
        setAppliedCoupon(res.data.data.coupon);
        setPriceBreakdown(res.data.data.priceBreakdown);
        toast.success('Coupon applied successfully!');
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
      // Reset price breakdown if failed
      if (courseData?.priceBreakdown) {
        setPriceBreakdown(courseData.priceBreakdown);
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
    if (courseData?.priceBreakdown) {
      setPriceBreakdown(courseData.priceBreakdown);
    }
  };

  const handlePhoneBlur = async () => {
    try {
      await phoneSchema.validate(phone);
      setPhoneError(null);
    } catch (err: any) {
      setPhoneError(err.message);
    }
  };

  const handlePay = async () => {
    try {
      await phoneSchema.validate(phone);
      setPhoneError(null);
    } catch (err: any) {
      setPhoneError(err.message);
      return;
    }

    if (!courseData?._id || !user) return;
    setIsProcessing(true);

    try {
      const orderRes = await createOrder(courseData._id, appliedCoupon?.code);
      
      if (!orderRes.data) {
        throw new Error('Invalid response from server');
      }

      if (orderRes.data.priceBreakdown?.isFree || orderRes.data.amount === 0) {
        const verifyRes = await verifyPayment({
          razorpayOrderId: orderRes.data.orderId,
          razorpayPaymentId: 'FREE_COURSE_PAYMENT',
          razorpaySignature: 'NONE',
          courseId: courseData._id,
        });
        if (verifyRes.success) {
          queryClient.invalidateQueries({ queryKey: ['enrollment-check', courseData._id] });
          queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
          toast.success('Successfully enrolled in the free course!');
          navigate(`/learn/${courseSlug}`);
        }
        return;
      }

      initiateRazorpayCheckout({
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: 'INR',
        name: 'VeoLMS',
        description: courseData.title,
        order_id: orderRes.data.orderId,
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.emailId,
          contact: phone,
        },
        theme: { color: '#ff6b00' },
        handler: async (paymentResponse: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await verifyPayment({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
              courseId: courseData._id,
            });
            queryClient.invalidateQueries({ queryKey: ['enrollment-check', courseData._id] });
            queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
            navigate('/payment/success', {
              state: { courseSlug, courseName: courseData.title },
            });
          } catch {
            toast.error('Payment verification failed');
            navigate('/payment/failed');
          }
        },
        modal: {
          ondismiss: () => {
            handleFailedPayment(orderRes.data!.orderId);
            setIsProcessing(false);
            toast.error('Payment cancelled');
          },
        },
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  if (isCourseLoading || !courseData || !priceBreakdown) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b00]" />
      </div>
    );
  }

  const { isFree } = priceBreakdown;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Plus_Jakarta_Sans']">
      {/* Top Bar */}
      <div className="border-b border-[#262626] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={`/courses/${courseSlug}`} className="flex items-center text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Link>
          <div className="font-semibold text-lg flex items-center gap-2">
            Secure Checkout <ShieldCheck className="w-5 h-5 text-green-500" />
          </div>
          <div className="w-16" /> {/* Placeholder for balance */}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Course Info */}
            <div className="bg-[#131313] border border-[#262626] rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4">Order Details</h2>
              <div className="flex gap-4">
                <img
                  src={courseData.thumbnail}
                  alt={courseData.title}
                  className="w-[120px] h-[80px] rounded-lg object-cover"
                />
                <div className="flex flex-col justify-center">
                  <h3 className="font-semibold text-[16px] text-white leading-tight mb-1">{courseData.title}</h3>
                  <p className="text-[#a3a3a3] text-[13px] mb-2">{courseData.instructor.firstName} {courseData.instructor.lastName}</p>
                  <p className="text-[#737373] text-[12px]">
                    {courseData.totalLessons} lessons · {formatDuration(courseData.totalDuration)}
                  </p>
                </div>
              </div>
            </div>

            {/* Buyer Details */}
            <div className="bg-[#131313] border border-[#262626] rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4">Your Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                    readOnly
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-gray-300 cursor-not-allowed outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.emailId || ''}
                    readOnly
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-gray-300 cursor-not-allowed outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onBlur={handlePhoneBlur}
                    placeholder="10-digit mobile number"
                    className={`w-full bg-[#0a0a0a] border ${phoneError ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#ff6b00]'} rounded-lg px-4 py-2.5 text-white outline-none transition-colors`}
                  />
                  {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="bg-[#131313] border border-[#262626] rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4">Have a coupon?</h2>
              
              {!appliedCoupon ? (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className={`flex-1 bg-[#0a0a0a] border ${couponError ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#ff6b00]'} rounded-lg px-4 py-2.5 text-white outline-none transition-colors uppercase`}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode || couponLoading}
                      className="px-6 py-2.5 border border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00]/10 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                    >
                      {couponLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-green-400 font-medium">
                      ✓ Coupon {appliedCoupon.code} applied
                    </span>
                    <span className="text-sm text-green-500/80">
                      You save {formatPrice(priceBreakdown.couponDiscount)}
                    </span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-red-400 hover:text-red-300 text-sm font-medium underline">
                    Remove
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5">
            <div className="bg-[#131313] border border-[#262626] rounded-xl p-6 sticky top-8">
              <h2 className="text-[16px] font-semibold text-white mb-6">Price Summary</h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Original Price</span>
                  <span>{formatPrice(priceBreakdown.originalPrice)}</span>
                </div>
                
                {priceBreakdown.discountPercent > 0 && priceBreakdown.courseDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Course Discount (-{priceBreakdown.discountPercent}%)</span>
                    <span>- {formatPrice(priceBreakdown.courseDiscount)}</span>
                  </div>
                )}

                {priceBreakdown.discountExpiresAt && priceBreakdown.courseDiscount > 0 && (
                  <div className="text-[#ff6b00] text-xs flex items-center justify-end -mt-3 pb-2">
                    ⏱ Ends in {getDiscountTimeLeft(priceBreakdown.discountExpiresAt)}
                  </div>
                )}

                {(priceBreakdown.courseDiscount > 0 || appliedCoupon) && (
                  <div className="flex justify-between text-gray-300 pt-2 border-t border-[#262626]">
                    <span>Subtotal</span>
                    <span>{formatPrice(priceBreakdown.discountedPrice)}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>- {formatPrice(priceBreakdown.couponDiscount)}</span>
                  </div>
                )}

                {priceBreakdown.taxAmount > 0 && (
                  <>
                    <div className="flex justify-between text-gray-400">
                      <span>GST ({priceBreakdown.taxPercent}%)</span>
                      <span>+ {formatPrice(priceBreakdown.taxAmount)}</span>
                    </div>
                  </>
                )}
                
                <div className="pt-4 border-t-2 border-[#262626] flex justify-between items-center mt-4">
                  <span className="text-base font-semibold text-white">Total</span>
                  <span className="text-2xl font-bold text-[#ff6b00]">
                    {isFree ? 'FREE' : formatPrice(priceBreakdown.totalAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full mt-8 bg-[#ff6b00] hover:bg-[#e65a00] text-white font-semibold h-12 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  isFree ? 'Enroll Free' : 'Proceed to Pay'
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> 256-bit SSL</span>
                <span>|</span>
                <span>✓ Razorpay Secured</span>
                <span>|</span>
                <span>↩ Refund Policy</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
