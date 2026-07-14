import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen } from 'lucide-react';

import { getAllCourses } from '../../crud/course.crud';
import { getMyEnrollments } from '../../crud/enrollment.crud';
import { coursesPageSeo } from '../../seo/seo.courses.config';
import useAuthStore from '../../store/authStore';
import type { ICourse } from '../../types/course.types';
import { CourseCard, CourseCardSkeleton } from '../../components/ui/CourseCard';

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuthStore();

  // SEO
  useEffect(() => {
    document.title = coursesPageSeo.title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', coursesPageSeo.description);
  }, []);

  const { data: courses = [], isLoading, isError } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => (await getAllCourses()).data.data,
  });

  const { data: enrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: getMyEnrollments,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const enrolledCourseIds = useMemo(
    () => new Set((enrollments ?? []).map((e) => e.course._id)),
    [enrollments]
  );

  const filtered = useMemo(
    () =>
      courses.filter((c: ICourse) =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [courses, searchTerm]
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Header & Search ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-3xl font-semibold text-white tracking-tight">
              Explore Courses
            </h1>
            {!isLoading && (
              <p className="text-[#a3a3a3] text-sm font-['Inter'] mt-1">
                {filtered.length} course{filtered.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3] pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#131313] border border-[#262626] text-white font-['Inter'] text-sm rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#ff6b00] transition-colors placeholder-[#a3a3a3]"
            />
          </div>
        </div>

        {/* ── Skeleton ── */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#131313] border border-[#262626] flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-[#262626]" />
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-white text-xl font-semibold mb-2">
              Failed to load courses
            </h3>
            <p className="font-['Inter'] text-[#a3a3a3] text-sm">Please try again later.</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#131313] border border-[#262626] flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-[#262626]" />
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-white text-xl font-semibold mb-2">
              {searchTerm ? 'No courses match your search' : 'No courses yet'}
            </h3>
            <p className="font-['Inter'] text-[#a3a3a3] text-sm">
              {searchTerm
                ? 'Try a different keyword.'
                : 'Check back later for new premium courses.'}
            </p>
          </div>
        )}

        {/* ── Grid ── */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course: ICourse) => (
              <CourseCard
                key={course._id}
                course={course}
                isEnrolled={enrolledCourseIds.has(course._id)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
