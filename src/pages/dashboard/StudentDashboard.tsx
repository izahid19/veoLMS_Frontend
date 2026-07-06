import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { BookOpen, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getMyEnrollments } from '../../crud/enrollment.crud';
import { getCourseProgress } from '../../crud/progress.crud';
import { studentDashboardSeo } from '../../seo/seo.courses.config';
import { timeAgo } from '../../Utils/helpers';
import type { IEnrollment, ICourseProgress, IProgress } from '../../types/course.types';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // SEO
  useEffect(() => {
    document.title = studentDashboardSeo.title;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', studentDashboardSeo.description);
  }, []);

  const { data: enrollments, isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: getMyEnrollments,
  });

  const progressQueries = useQueries({
    queries: (enrollments || []).map((enr: IEnrollment) => ({
      queryKey: ['progress', enr.course._id],
      queryFn: () => getCourseProgress(enr.course._id),
      staleTime: 1000 * 60 * 5,
    }))
  });

  const isProgressLoading = progressQueries.some(q => q.isLoading);
  const isLoading = isEnrollmentsLoading || isProgressLoading;

  const { completedLessons, inProgressCourses, recentWatches } = useMemo(() => {
    if (!enrollments || progressQueries.some(q => !q.data)) {
      return { completedLessons: 0, inProgressCourses: 0, recentWatches: [] };
    }

    let completed = 0;
    let inProgress = 0;
    const allProgresses: Array<IProgress & { courseTitle: string; courseSlug: string; lessonTitle: string }> = [];

    progressQueries.forEach((query, index) => {
      const data = query.data as ICourseProgress | undefined;
      const course = enrollments[index].course;

      if (data) {
        completed += data.completedLessons;
        if (data.percentage > 0 && data.percentage < 100) {
          inProgress++;
        }
        
        data.progresses.forEach(p => {
          allProgresses.push({
            ...p,
            courseTitle: course.title,
            courseSlug: course.slug,
            // Fallback in case lesson is just an ID or not populated
            lessonTitle: (p.lesson as any)?.title || 'Lesson',
          });
        });
      }
    });

    const recent = allProgresses
      .filter(p => p.lastWatchedAt)
      .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
      .slice(0, 3);

    return { completedLessons: completed, inProgressCourses: inProgress, recentWatches: recent };
  }, [enrollments, progressQueries]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 bg-[#131313] rounded-2xl w-full border border-[#262626]"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-24 bg-[#131313] rounded-xl border border-[#262626]"></div>
          <div className="h-24 bg-[#131313] rounded-xl border border-[#262626]"></div>
          <div className="h-24 bg-[#131313] rounded-xl border border-[#262626]"></div>
        </div>
        <div className="h-64 bg-[#131313] rounded-2xl w-full border border-[#262626]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      
      {/* 1. WELCOME BANNER */}
      <div className="bg-[#131313] border border-[#262626] rounded-[16px] p-8 lg:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b00] rounded-full blur-[100px] opacity-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[28px] text-white mb-2">
            Welcome back, {user?.firstName} 👋
          </h1>
          <p className="font-['Inter'] text-[#a3a3a3] text-lg">
            Pick up where you left off
          </p>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#131313] border border-[#262626] rounded-[12px] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#ff6b00]/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[#ff6b00]" />
          </div>
          <div>
            <p className="font-['Inter'] text-[#a3a3a3] text-sm mb-1">Enrolled Courses</p>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-white text-2xl">
              {enrollments?.length || 0}
            </p>
          </div>
        </div>
        <div className="bg-[#131313] border border-[#262626] rounded-[12px] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="font-['Inter'] text-[#a3a3a3] text-sm mb-1">Completed Lessons</p>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-white text-2xl">
              {completedLessons}
            </p>
          </div>
        </div>
        <div className="bg-[#131313] border border-[#262626] rounded-[12px] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-['Inter'] text-[#a3a3a3] text-sm mb-1">In Progress</p>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-white text-2xl">
              {inProgressCourses}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* 3. CONTINUE LEARNING (Left Column, span 2) */}
        <div className="xl:col-span-2 space-y-6">
          <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[22px] text-white">Continue Learning</h2>
          
          {!enrollments || enrollments.length === 0 ? (
            <div className="bg-[#131313] border border-[#262626] rounded-[12px] p-10 flex flex-col items-center justify-center text-center">
              <BookOpen className="w-12 h-12 text-[#a3a3a3] mb-4" />
              <p className="font-['Plus_Jakarta_Sans'] font-semibold text-white text-xl mb-2">
                You haven't enrolled in any courses yet
              </p>
              <button
                onClick={() => navigate('/courses')}
                className="mt-4 bg-[#ff6b00] hover:bg-[#e65a00] text-white font-['Inter'] font-medium px-6 py-2.5 rounded-[8px] transition-colors"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.slice(0, 3).map((enr, idx) => {
                const progressData = progressQueries[idx]?.data as ICourseProgress | undefined;
                const percentage = progressData?.percentage || 0;
                const lastLessonId = progressData?.lastWatchedLesson || 'last';

                return (
                  <div key={enr._id} className="bg-[#131313] border border-[#262626] rounded-[12px] p-5 flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-full sm:w-40 aspect-video rounded-[8px] overflow-hidden flex-shrink-0 relative">
                      {enr.course.thumbnail ? (
                        <img src={enr.course.thumbnail} alt={enr.course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#262626]" />
                      )}
                    </div>
                    
                    <div className="flex-1 w-full space-y-3">
                      <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-white text-lg line-clamp-1">
                        {enr.course.title}
                      </h3>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-[#262626] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#ff6b00] rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="font-['Inter'] text-sm text-[#a3a3a3] whitespace-nowrap">
                          {Math.round(percentage)}% complete
                        </span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto mt-4 sm:mt-0">
                      <button
                        onClick={() => navigate(`/dashboard/learn/${enr.course.slug}/${lastLessonId}`)}
                        className="w-full sm:w-auto bg-[#262626] hover:bg-[#333] text-white font-['Inter'] font-medium px-5 py-2.5 rounded-[8px] transition-colors whitespace-nowrap"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. RECENTLY WATCHED (Right Column, span 1) */}
        <div className="space-y-6">
          <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[22px] text-white">Recently Watched</h2>
          
          <div className="bg-[#131313] border border-[#262626] rounded-[12px] p-5">
            {recentWatches.length === 0 ? (
              <div className="text-center py-8">
                <PlayCircle className="w-10 h-10 text-[#262626] mx-auto mb-3" />
                <p className="font-['Inter'] text-[#a3a3a3] text-sm">No recently watched lessons.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {recentWatches.map((watch, i) => (
                  <div 
                    key={i} 
                    className="group cursor-pointer flex gap-4 items-start"
                    onClick={() => navigate(`/dashboard/learn/${watch.courseSlug}/${watch.lesson._id || watch.lesson}`)}
                  >
                    <div className="mt-1 w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center flex-shrink-0 group-hover:bg-[#ff6b00]/20 transition-colors">
                      <PlayCircle className="w-4 h-4 text-[#a3a3a3] group-hover:text-[#ff6b00] transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-['Plus_Jakarta_Sans'] font-medium text-white text-[15px] group-hover:text-[#ff6b00] transition-colors line-clamp-2">
                        {watch.lessonTitle}
                      </h4>
                      <p className="font-['Inter'] text-sm text-[#a3a3a3] mt-1 line-clamp-1">
                        {watch.courseTitle}
                      </p>
                      <p className="font-['Inter'] text-xs text-[#a3a3a3] mt-1 opacity-70">
                        {timeAgo(watch.lastWatchedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
