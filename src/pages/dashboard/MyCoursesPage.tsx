import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';

import { getMyEnrollments } from '../../crud/enrollment.crud';
import { getCourseProgress } from '../../crud/progress.crud';
import { myCoursesSeo } from '../../seo/seo.courses.config';
import type { IEnrollment, ICourseProgress } from '../../types/course.types';

export default function MyCoursesPage() {
  const navigate = useNavigate();

  // SEO Update
  useEffect(() => {
    document.title = myCoursesSeo.title;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', myCoursesSeo.description);
  }, []);

  // Fetch Enrollments
  const { data: enrollments, isLoading: isEnrollmentsLoading, isError: isEnrollmentsError } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: getMyEnrollments,
  });

  // Fetch Progress for each Enrollment
  const progressQueries = useQueries({
    queries: (enrollments || []).map((enr: IEnrollment) => ({
      queryKey: ['progress', enr.course._id],
      queryFn: () => getCourseProgress(enr.course._id),
      staleTime: 1000 * 60 * 5,
    }))
  });

  const isProgressLoading = progressQueries.some(q => q.isLoading);
  const isLoading = isEnrollmentsLoading || isProgressLoading;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse pb-12">
        <div>
          <div className="h-10 bg-[#131313] border border-[#262626] rounded-md w-48 mb-2"></div>
          <div className="h-5 bg-[#131313] border border-[#262626] rounded-md w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#131313] border border-[#262626] rounded-[12px] h-[350px]"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isEnrollmentsError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="font-['Plus_Jakarta_Sans'] text-white text-2xl font-bold mb-2">Failed to load courses</h2>
        <p className="font-['Inter'] text-[#a3a3a3]">Please try again later.</p>
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-[#131313] border border-[#262626] rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-[#a3a3a3]" />
        </div>
        <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-white text-[24px] mb-2">
          No courses yet
        </h2>
        <p className="font-['Inter'] text-[#a3a3a3] mb-8">
          Start learning today by exploring our premium catalog.
        </p>
        <button
          onClick={() => navigate('/courses')}
          className="bg-[#ff6b00] hover:bg-[#e65a00] text-white font-['Plus_Jakarta_Sans'] font-semibold px-8 py-3 rounded-[8px] transition-colors"
        >
          Browse Courses
        </button>
      </div>
    );
  }

  return (
    <div className="pb-16 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-[32px] text-white mb-1">
          My Courses
        </h1>
        <p className="font-['Inter'] text-[#a3a3a3]">
          {enrollments.length} {enrollments.length === 1 ? 'course' : 'courses'} enrolled
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {enrollments.map((enr: IEnrollment, idx: number) => {
          const progressData = progressQueries[idx]?.data as ICourseProgress | undefined;
          
          const percentage = progressData?.percentage || 0;
          const completedLessons = progressData?.completedLessons || 0;
          const totalLessons = progressData?.totalLessons || enr.course.totalLessons || 0;
          const lastLessonId = progressData?.lastWatchedLesson || 'last';

          const hasStarted = percentage > 0;

          return (
            <div 
              key={enr._id} 
              className="bg-[#131313] border border-[#262626] rounded-[12px] flex flex-col overflow-hidden hover:border-[#ff6b00]/30 transition-colors"
            >
              {/* Thumbnail */}
              <div className="aspect-video w-full relative">
                {enr.course.thumbnail ? (
                  <img 
                    src={enr.course.thumbnail} 
                    alt={enr.course.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#262626]" />
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[18px] text-white line-clamp-1 mb-1">
                  {enr.course.title}
                </h3>
                <p className="font-['Inter'] text-[14px] text-[#a3a3a3] mb-6">
                  {enr.course.instructor.firstName} {enr.course.instructor.lastName}
                </p>

                {/* Progress Details */}
                <div className="mt-auto space-y-2 mb-6">
                  <div className="flex items-center justify-between font-['Inter'] text-[13px]">
                    <span className="text-[#a3a3a3]">
                      {completedLessons} of {totalLessons} lessons completed
                    </span>
                    <span className="text-[#ff6b00] font-semibold">
                      {Math.round(percentage)}% complete
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-[#262626] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#ff6b00] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Button Row */}
                <button
                  onClick={() => navigate(`/dashboard/learn/${enr.course.slug}/${lastLessonId}`)}
                  className={`w-full py-2.5 rounded-[8px] font-['Plus_Jakarta_Sans'] font-semibold transition-colors ${
                    hasStarted
                      ? "bg-[#ff6b00] hover:bg-[#e65a00] text-white"
                      : "border border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00]/10 bg-transparent"
                  }`}
                >
                  {hasStarted ? 'Continue Learning' : 'Start Learning'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
