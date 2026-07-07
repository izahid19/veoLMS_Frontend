import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, User, Copy, Check } from 'lucide-react';
import { getAllPayments, getAdminStats } from '../../crud/admin.crud';
import { formatDate, formatPrice } from '../../Utils/helpers';
import type { IAdminPayment } from '../../types/admin.types';

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'All' | 'completed' | 'pending' | 'failed'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch paginated payments
  const { data: response, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ['adminPayments', page],
    queryFn: () => getAllPayments(page, 10),
  });

  // Fetch stats for the top row
  const { data: statsResponse, isLoading: isStatsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
  });

  const payments = response?.data || [];
  const totalTransactions = response?.total || 0;
  const totalPages = response?.totalPages || 1;
  const totalRevenue = statsResponse?.data?.totalRevenue || 0;

  // Local filter for the tabs
  const filteredPayments = useMemo(() => {
    if (activeTab === 'All') return payments;
    return payments.filter((p: IAdminPayment) => p.status === activeTab);
  }, [payments, activeTab]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tabs = ['All', 'completed', 'pending', 'failed'] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-2xl text-white">
          Payments
        </h1>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="bg-[#131313] border border-[#262626] rounded-xl p-5">
          <p className="text-[#a3a3a3] text-sm font-medium mb-1">Total Revenue</p>
          {isStatsLoading ? (
            <div className="h-8 w-32 bg-[#262626] animate-pulse rounded mt-2" />
          ) : (
            <h3 className="font-['Plus_Jakarta_Sans'] text-2xl font-semibold text-white">
              {formatPrice(totalRevenue * 100)} {/* Assuming stats returns INR, but formatPrice expects paise */}
            </h3>
          )}
        </div>
        
        {/* Total Transactions */}
        <div className="bg-[#131313] border border-[#262626] rounded-xl p-5">
          <p className="text-[#a3a3a3] text-sm font-medium mb-1">Total Transactions</p>
          {isPaymentsLoading ? (
            <div className="h-8 w-24 bg-[#262626] animate-pulse rounded mt-2" />
          ) : (
            <h3 className="font-['Plus_Jakarta_Sans'] text-2xl font-semibold text-white">
              {totalTransactions}
            </h3>
          )}
        </div>
        
        {/* Failed Payments (Current Page) */}
        <div className="bg-[#131313] border border-[#262626] rounded-xl p-5">
          <p className="text-[#a3a3a3] text-sm font-medium mb-1">Failed Payments (This Page)</p>
          {isPaymentsLoading ? (
            <div className="h-8 w-16 bg-[#262626] animate-pulse rounded mt-2" />
          ) : (
            <h3 className="font-['Plus_Jakarta_Sans'] text-2xl font-semibold text-red-500">
              {payments.filter((p: IAdminPayment) => p.status === 'failed').length}
            </h3>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262626] overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium capitalize whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-[#ff6b00] text-white'
                : 'border-transparent text-[#737373] hover:text-[#a3a3a3] hover:border-[#404040]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#131313] border border-[#262626] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#0a0a0a] border-b border-[#262626]">
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Order ID</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Student</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Course</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Amount</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Status</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Date</th>
              </tr>
            </thead>
            <tbody>
              {isPaymentsLoading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-[#262626] animate-pulse">
                    <td className="px-6 py-4"><div className="w-32 h-4 bg-[#262626] rounded" /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#262626] rounded-full" />
                        <div className="w-24 h-4 bg-[#262626] rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="w-32 h-4 bg-[#262626] rounded" /></td>
                    <td className="px-6 py-4"><div className="w-16 h-4 bg-[#262626] rounded" /></td>
                    <td className="px-6 py-4"><div className="w-16 h-6 bg-[#262626] rounded-full" /></td>
                    <td className="px-6 py-4"><div className="w-24 h-4 bg-[#262626] rounded" /></td>
                  </tr>
                ))
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#a3a3a3]">
                    {payments.length === 0 ? "No payments found." : `No ${activeTab} payments.`}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment: IAdminPayment, index: number) => (
                  <tr 
                    key={payment._id} 
                    className={`border-b border-[#262626] hover:bg-[#1a1a1a] transition-colors ${
                      index % 2 === 0 ? 'bg-[#131313]' : 'bg-[#0d0d0d]'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-[#a3a3a3] max-w-[120px] truncate" title={payment.razorpayOrderId}>
                          {payment.razorpayOrderId}
                        </span>
                        <button
                          onClick={() => handleCopy(payment.razorpayOrderId)}
                          className="p-1 hover:bg-[#262626] rounded text-[#737373] hover:text-white transition-colors"
                          title="Copy Order ID"
                        >
                          {copiedId === payment.razorpayOrderId ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {payment.student?.avatar ? (
                          <img src={payment.student.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center">
                            <User className="w-4 h-4 text-[#a3a3a3]" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-white line-clamp-1">
                            {payment.student?.firstName} {payment.student?.lastName}
                          </div>
                          <div className="text-xs text-[#737373] line-clamp-1">
                            {payment.student?.emailId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white max-w-[200px] truncate" title={payment.course?.title}>
                        {payment.course?.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {formatPrice(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'completed' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                          Completed
                        </span>
                      )}
                      {payment.status === 'pending' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                          Pending
                        </span>
                      )}
                      {payment.status === 'failed' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#a3a3a3]">
                      {formatDate(payment.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isPaymentsLoading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#262626] flex items-center justify-between">
            <span className="text-sm text-[#737373]">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-[#1a1a1a] hover:bg-[#262626] disabled:opacity-50 disabled:hover:bg-[#1a1a1a] text-white rounded-lg transition-colors border border-[#262626]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-[#1a1a1a] hover:bg-[#262626] disabled:opacity-50 disabled:hover:bg-[#1a1a1a] text-white rounded-lg transition-colors border border-[#262626]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
