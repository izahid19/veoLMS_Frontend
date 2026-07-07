import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { getAllEnrollments } from '../../crud/admin.crud';
import { formatDate, formatPrice } from '../../Utils/helpers';
import type { IAdminEnrollment } from '../../types/admin.types';

export default function EnrollmentsPage() {
  const [page, setPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<string>('All');

  // Fetch paginated enrollments
  const { data: response, isLoading } = useQuery({
    queryKey: ['adminEnrollments', page],
    queryFn: () => getAllEnrollments(page, 10),
  });

  const enrollments = response?.data || [];
  const totalEnrollments = response?.total || 0;
  const totalPages = response?.totalPages || 1;

  // Extract unique courses for filter dropdown
  const uniqueCourses = useMemo(() => {
    const courses = new Set<string>();
    enrollments.forEach((e: IAdminEnrollment) => {
      if (e.course?.title) courses.add(e.course.title);
    });
    return Array.from(courses);
  }, [enrollments]);

  // Apply filter
  const filteredEnrollments = useMemo(() => {
    if (selectedCourse === 'All') return enrollments;
    return enrollments.filter((e: IAdminEnrollment) => e.course?.title === selectedCourse);
  }, [enrollments, selectedCourse]);

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-2xl text-white">
            Enrollments
          </h1>
          <span className="bg-[#1a1a1a] text-[#ff6b00] text-sm font-semibold px-2.5 py-0.5 rounded-full border border-[#ff6b00]/20">
            {totalEnrollments} total
          </span>
        </div>

        {/* Course Filter */}
        <div className="relative w-full sm:w-64">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full bg-[#131313] border border-[#262626] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#404040] transition-colors appearance-none"
          >
            <option value="All">All Courses</option>
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#131313] border border-[#262626] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#0a0a0a] border-b border-[#262626]">
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Student</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Course</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Enrolled Date</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Amount Paid</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-[#262626] animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#262626] rounded-full" />
                        <div className="space-y-2">
                          <div className="w-24 h-4 bg-[#262626] rounded" />
                          <div className="w-32 h-3 bg-[#262626] rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-[#262626] rounded" />
                        <div className="w-32 h-4 bg-[#262626] rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="w-24 h-4 bg-[#262626] rounded" /></td>
                    <td className="px-6 py-4"><div className="w-20 h-4 bg-[#262626] rounded" /></td>
                    <td className="px-6 py-4"><div className="w-16 h-6 bg-[#262626] rounded-full" /></td>
                  </tr>
                ))
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#a3a3a3]">
                    {enrollments.length === 0 ? "No enrollments found." : "No enrollments match this course."}
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enr: IAdminEnrollment, index: number) => (
                  <tr 
                    key={enr._id} 
                    className={`border-b border-[#262626] hover:bg-[#1a1a1a] transition-colors ${
                      index % 2 === 0 ? 'bg-[#131313]' : 'bg-[#0d0d0d]'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {enr.student?.avatar ? (
                          <img src={enr.student.avatar} alt={enr.student.firstName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center">
                            <User className="w-5 h-5 text-[#a3a3a3]" />
                          </div>
                        )}
                        <div>
                          <div className="font-['Plus_Jakarta_Sans'] font-medium text-white">
                            {enr.student?.firstName} {enr.student?.lastName}
                          </div>
                          <div className="text-sm text-[#737373] mt-0.5">{enr.student?.emailId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {enr.course?.thumbnail ? (
                          <img src={enr.course.thumbnail} alt="" className="w-12 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-8 rounded bg-[#262626]" />
                        )}
                        <span className="font-medium text-white truncate max-w-[200px]" title={enr.course?.title}>
                          {enr.course?.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#a3a3a3]">
                      {formatDate(enr.enrolledAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {enr.payment ? formatPrice(enr.payment.amount) : formatPrice(enr.course?.price || 0)}
                    </td>
                    <td className="px-6 py-4">
                      {enr.payment?.status === 'completed' || !enr.payment ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                          {enr.payment.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
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
