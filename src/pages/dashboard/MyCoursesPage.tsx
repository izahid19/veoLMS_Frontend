import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { BookOpen, Loader2 } from 'lucide-react';
import { useContinueLearning } from '../../hooks/useContinueLearning';

import { getMyEnrollments } from '../../crud/enrollment.crud';
import { getCourseProgress } from '../../crud/progress.crud';
import { myCoursesSeo } from '../../seo/seo.courses.config';
import type { IEnrollment, ICourseProgress } from '../../types/course.types';

import { Play } from 'lucide-react'; // Need to make sure Play is imported, but it's not. I'll use PlayCircle or just text.

function CourseCard({ enr, progressData, hasStarted, completedLessons, totalLessons, percentage }: any) {
  const navigate = useNavigate();
  const { handleContinue, isLoading } = useContinueLearning(enr.course._id, enr.course.slug, (enr.course as any).sections);

  const handleNavigate = () => {
    handleContinue();
  };

  return (
    <div className="group bg-[#131313] border border-[#262626] rounded-[12px] flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#404040] hover:shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
      {/* Thumbnail with hover scale */}
      <div className="aspect-video w-full relative overflow-hidden bg-[#1a1a1a]">
        {enr.course.thumbnail ? (
          <img 
            src={enr.course.thumbnail} 
            alt={enr.course.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#262626]" />
        )}
        {/* Subtle overlay gradient to blend with the card background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent opacity-80" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 relative z-10 -mt-2">
        <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[17px] leading-snug text-white line-clamp-2 mb-1 group-hover:text-[#ff6b00] transition-colors">
          {enr.course.title}
        </h3>
        <p className="font-['Inter'] text-[13px] text-[#737373] mb-6">
          {enr.course.instructor?.firstName} {enr.course.instructor?.lastName}
        </p>

        {/* Progress & Action */}
        <div className="mt-auto">
          <div className="flex items-center justify-between font-['Inter'] text-[12px] mb-2">
            <span className="text-[#a3a3a3] font-medium tracking-wide">
              {completedLessons} / {totalLessons} LESSONS
            </span>
            <span className="text-white font-semibold">
              {Math.round(percentage)}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#262626] rounded-full overflow-hidden mb-5">
            <div 
              className="h-full bg-gradient-to-r from-[#ff6b00] to-[#ff8c33] rounded-full transition-all duration-700 ease-out relative"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20" />
            </div>
          </div>

          <button
            onClick={handleNavigate}
            disabled={isLoading}
            className={`w-full py-2.5 rounded-[8px] font-['Plus_Jakarta_Sans'] font-semibold text-[14px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
              hasStarted
                ? "bg-[#262626] hover:bg-[#333333] text-white border border-transparent hover:border-[#404040]"
                : "bg-transparent border border-[#ff6b00]/50 text-[#ff6b00] hover:bg-[#ff6b00]/10 hover:border-[#ff6b00]"
            }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {hasStarted ? 'Continue Learning' : 'Start Learning'}
          </button>
        </div>
      </div>
    </div>
  );
}

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {enrollments.map((enr: IEnrollment, idx: number) => {
          const progressData = progressQueries[idx]?.data as ICourseProgress | undefined;
          
          const percentage = progressData?.percentage || 0;
          const completedLessons = progressData?.completedLessons || 0;
          const totalLessons = progressData?.totalLessons || enr.course.totalLessons || 0;
          const hasStarted = percentage > 0;

          return (
            <CourseCard
              key={enr._id}
              enr={enr}
              progressData={progressData}
              hasStarted={hasStarted}
              completedLessons={completedLessons}
              totalLessons={totalLessons}
              percentage={percentage}
            />
          );
        })}
      </div>
    </div>
  );
}
