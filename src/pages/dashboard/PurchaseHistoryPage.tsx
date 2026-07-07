import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getMyPayments } from '../../crud/payment.crud';
import { formatPrice, formatDate } from '../../Utils/helpers';
import type { IPayment } from '../../types/course.types';

export default function PurchaseHistoryPage() {
  // Update SEO
  useEffect(() => {
    document.title = 'Purchase History — VeoLMS';
  }, []);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['myPayments'],
    queryFn: getMyPayments,
  });

  const payments = response?.data || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-[32px] text-white">
          Purchase History
        </h1>
        <p className="font-['Inter'] text-[#a3a3a3] mt-1">
          All your course purchases
        </p>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#131313] border border-[#262626] rounded-[12px] p-5 flex items-center animate-pulse gap-4"
            >
              <div className="w-[60px] h-[40px] bg-[#262626] rounded-[6px]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#262626] rounded w-1/3" />
                <div className="h-3 bg-[#262626] rounded w-1/4" />
              </div>
              <div className="w-[80px] h-6 bg-[#262626] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-12 bg-[#131313] border border-[#262626] rounded-[12px]">
          <p className="text-red-500 font-medium">Failed to load purchase history.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && payments.length === 0 && (
        <div className="text-center py-16 bg-[#131313] border border-[#262626] rounded-[12px]">
          <p className="font-['Plus_Jakarta_Sans'] text-white text-xl font-semibold mb-2">
            No purchases yet
          </p>
          <p className="font-['Inter'] text-[#a3a3a3] mb-6">
            Looks like you haven't bought any courses yet.
          </p>
          <Link
            to="/courses"
            className="inline-block bg-[#ff6b00] hover:bg-[#e65a00] text-white font-['Plus_Jakarta_Sans'] font-semibold py-2.5 px-6 rounded-[8px] transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      )}

      {/* Payments List */}
      {!isLoading && !isError && payments.length > 0 && (
        <div className="space-y-4">
          {payments.map((payment: IPayment) => (
            <div
              key={payment._id}
              className="bg-[#131313] border border-[#262626] rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:bg-[#1a1a1a] transition-colors"
            >
              {/* Left: Thumbnail */}
              <div className="flex-shrink-0">
                {payment.course.thumbnail ? (
                  <img
                    src={payment.course.thumbnail}
                    alt={payment.course.title}
                    className="w-[60px] h-[40px] object-cover rounded-[6px]"
                  />
                ) : (
                  <div className="w-[60px] h-[40px] bg-[#262626] rounded-[6px]" />
                )}
              </div>

              {/* Middle: Details */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/courses/${payment.course.slug}`}
                  className="font-['Plus_Jakarta_Sans'] text-white font-semibold text-[15px] truncate hover:text-[#ff6b00] transition-colors"
                >
                  {payment.course.title}
                </Link>
                <div className="flex items-center gap-3 mt-1 font-['Inter'] text-[#a3a3a3] text-[12px]">
                  <span className="font-mono bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                    #{payment.razorpayOrderId}
                  </span>
                  <span>{formatDate(payment.createdAt)}</span>
                </div>
              </div>

              {/* Right: Amount & Status */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-[#262626] sm:border-0 gap-2">
                <div className="font-['Plus_Jakarta_Sans'] font-semibold text-white text-[18px]">
                  {formatPrice(payment.amount)}
                </div>
                <div>
                  {payment.status === 'completed' && (
                    <span className="inline-block px-2.5 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[12px] font-medium">
                      Paid
                    </span>
                  )}
                  {payment.status === 'pending' && (
                    <span className="inline-block px-2.5 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-[12px] font-medium">
                      Pending
                    </span>
                  )}
                  {payment.status === 'failed' && (
                    <span className="inline-block px-2.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[12px] font-medium">
                      Failed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
