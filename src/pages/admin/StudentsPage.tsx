import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { getAllStudents, getStudentDetail } from '../../crud/admin.crud';
import { Modal } from '../../components/ui/modal';
import { formatDate, formatPrice } from '../../Utils/helpers';
import type { IStudentDetail, IStudentDetailResponse } from '../../types/admin.types';

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Fetch paginated students
  const { data: response, isLoading } = useQuery({
    queryKey: ['adminStudents', page],
    queryFn: () => getAllStudents(page, 10),
  });

  const students = response?.data || [];
  const totalStudents = response?.total || 0;
  const totalPages = response?.totalPages || 1;

  // Local filter
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.firstName.toLowerCase().includes(query) ||
        s.lastName.toLowerCase().includes(query) ||
        s.emailId.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  // Fetch student detail when modal opens
  const { data: studentDetailRes, isLoading: isDetailLoading } = useQuery({
    queryKey: ['adminStudentDetail', selectedStudentId],
    queryFn: () => getStudentDetail(selectedStudentId as string),
    enabled: !!selectedStudentId,
  });

  const studentDetail: IStudentDetailResponse | undefined = studentDetailRes?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-2xl text-white">
            Students
          </h1>
          <span className="bg-[#1a1a1a] text-[#ff6b00] text-sm font-semibold px-2.5 py-0.5 rounded-full border border-[#ff6b00]/20">
            {totalStudents} total
          </span>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131313] border border-[#262626] text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#404040] focus:ring-1 focus:ring-[#404040] transition-colors placeholder:text-[#737373]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#131313] border border-[#262626] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#0a0a0a] border-b border-[#262626]">
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Student</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Enrolled Courses</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Join Date</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3] text-right">Actions</th>
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
                    <td className="px-6 py-4"><div className="w-12 h-5 bg-[#262626] rounded-full" /></td>
                    <td className="px-6 py-4"><div className="w-24 h-4 bg-[#262626] rounded" /></td>
                    <td className="px-6 py-4 text-right"><div className="w-8 h-8 bg-[#262626] rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#a3a3a3]">
                    {searchQuery ? "No students match your search" : "No students registered yet"}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student: IStudentDetail, index: number) => (
                  <tr 
                    key={student._id} 
                    className={`border-b border-[#262626] hover:bg-[#1a1a1a] transition-colors ${
                      index % 2 === 0 ? 'bg-[#131313]' : 'bg-[#0d0d0d]'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.firstName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center">
                            <User className="w-5 h-5 text-[#a3a3a3]" />
                          </div>
                        )}
                        <div>
                          <div className="font-['Plus_Jakarta_Sans'] font-medium text-white">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-[#737373] mt-0.5">{student.emailId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-[#ff6b00]/10 text-[#ff6b00] rounded-full text-xs font-semibold border border-[#ff6b00]/20">
                        {student.enrollmentCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#a3a3a3]">
                      {formatDate(student.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedStudentId(student._id)}
                        className="p-2 hover:bg-[#262626] rounded-lg text-[#a3a3a3] hover:text-white transition-colors group"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
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

      {/* Student Detail Modal */}
      <Modal
        isOpen={!!selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
        title="Student Details"
      >
        {isDetailLoading ? (
          <div className="py-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#ff6b00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : studentDetail ? (
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="flex items-center gap-4 pb-6 border-b border-[#262626]">
              {studentDetail.user.avatar ? (
                <img src={studentDetail.user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#262626] flex items-center justify-center">
                  <User className="w-8 h-8 text-[#a3a3a3]" />
                </div>
              )}
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-xl text-white">
                  {studentDetail.user.firstName} {studentDetail.user.lastName}
                </h3>
                <p className="text-[#a3a3a3] text-sm">{studentDetail.user.emailId}</p>
                <p className="text-[#737373] text-xs mt-1">Joined: {formatDate(studentDetail.user.createdAt)}</p>
              </div>
            </div>

            {/* Enrollments List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-white">Enrollments</h4>
                <span className="text-sm font-medium text-[#ff6b00]">
                  Total Spent: {formatPrice(studentDetail.totalSpent)}
                </span>
              </div>
              
              {studentDetail.enrollments.length === 0 ? (
                <p className="text-[#737373] text-sm italic">No enrollments yet.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {studentDetail.enrollments.map((enr: any) => (
                    <div key={enr._id} className="bg-[#1a1a1a] rounded-lg p-3 flex gap-3 border border-[#262626]">
                      {enr.course?.thumbnail && (
                        <img src={enr.course.thumbnail} alt="" className="w-16 h-10 object-cover rounded bg-[#262626]" />
                      )}
                      <div>
                        <p className="font-['Plus_Jakarta_Sans'] font-medium text-sm text-white line-clamp-1">
                          {enr.course?.title}
                        </p>
                        <p className="text-xs text-[#737373] mt-1">
                          Enrolled: {formatDate(enr.enrolledAt || enr.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-red-500 py-4 text-center">Failed to load student details.</p>
        )}
      </Modal>
    </div>
  );
}
