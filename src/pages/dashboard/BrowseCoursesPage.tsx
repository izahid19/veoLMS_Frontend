import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, SlidersHorizontal } from 'lucide-react';

import { getAllCourses } from '../../crud/course.crud';
import { getMyEnrollments } from '../../crud/enrollment.crud';
import { CourseCard, CourseCardSkeleton } from '../../components/ui/CourseCard';
import type { ICourse } from '../../types/course.types';
import { isDiscountActive } from '../../Utils/price';
import { cn } from '../../Utils/helpers';

// ─── Filter types ─────────────────────────────────────────────────────────────

type Filter = 'all' | 'sale' | 'new' | 'enrolled' | 'free';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',      label: 'All Courses' },
  { id: 'new',      label: 'New'         },
  { id: 'sale',     label: 'On Sale'     },
  { id: 'free',     label: 'Free'        },
  { id: 'enrolled', label: 'Enrolled'    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrowseCoursesPage() {
  const navigate = useNavigate();
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<Filter>('all');

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => (await getAllCourses()).data.data,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: getMyEnrollments,
    staleTime: 30_000,
  });

  const enrolledIds = useMemo(
    () => new Set(enrollments.map((e) => e.course._id)),
    [enrollments]
  );

  // ── Filtered list ──────────────────────────────────────────────────────────
  const visible = useMemo(() => {
    let list: ICourse[] = [...courses];

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q));
    }

    // filter tab
    switch (filter) {
      case 'sale':
        list = list.filter((c) => isDiscountActive(c.discountPercent, c.discountExpiresAt));
        break;
      case 'new':
        list = [...list].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 12);
        break;
      case 'free':
        list = list.filter((c) => c.effectivePrice === 0 || c.price === 0);
        break;
      case 'enrolled':
        list = list.filter((c) => enrolledIds.has(c._id));
        break;
      default:
        break;
    }

    return list;
  }, [courses, search, filter, enrolledIds]);

  // ── Badge counts ───────────────────────────────────────────────────────────
  const counts: Record<Filter, number> = useMemo(() => ({
    all:      courses.length,
    new:      Math.min(courses.length, 12),
    sale:     courses.filter((c) => isDiscountActive(c.discountPercent, c.discountExpiresAt)).length,
    free:     courses.filter((c) => c.effectivePrice === 0 || c.price === 0).length,
    enrolled: enrolledIds.size,
  }), [courses, enrolledIds]);

  return (
    <div className="pb-16 space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-2xl text-white tracking-tight">
          All Courses
        </h1>
        <p className="text-[#a3a3a3] text-sm font-['Inter'] mt-1">
          {isLoading ? 'Loading…' : `${courses.length} course${courses.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* ── Toolbar: search + filters ── */}
      <div className="flex flex-col gap-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            className="w-full bg-[#131313] border border-[#262626] text-white text-sm font-['Inter'] rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#ff6b00] transition-colors placeholder-[#a3a3a3]"
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#a3a3a3] flex-shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-["Inter"] transition-colors border',
                filter === f.id
                  ? 'bg-[#ff6b00] text-white border-[#ff6b00]'
                  : 'bg-[#131313] text-[#a3a3a3] border-[#262626] hover:border-[#ff6b00]/40 hover:text-white'
              )}
            >
              {f.label}
              {!isLoading && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-md text-[10px] font-bold',
                    filter === f.id ? 'bg-white/20 text-white' : 'bg-[#262626] text-[#a3a3a3]'
                  )}
                >
                  {counts[f.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-[#131313] border border-[#262626] rounded-xl p-14 flex flex-col items-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <div className="w-14 h-14 rounded-xl bg-[#050505] border border-[#262626] flex items-center justify-center mb-4">
            <BookOpen className="w-7 h-7 text-[#262626]" />
          </div>
          <p className="font-['Plus_Jakarta_Sans'] text-white font-semibold mb-1">
            {search ? 'No courses match your search' : `No ${filter === 'all' ? '' : filter + ' '}courses yet`}
          </p>
          <p className="text-[#a3a3a3] text-sm font-['Inter'] mb-5">
            {search ? 'Try a different keyword.' : 'Check back soon for new content.'}
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => { setFilter('all'); setSearch(''); }}
              className="text-xs font-semibold text-[#ff6b00] hover:underline font-['Inter']"
            >
              View all courses
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-[#a3a3a3] font-['Inter']">
            Showing {visible.length} course{visible.length !== 1 ? 's' : ''}
            {filter !== 'all' && ` · ${FILTERS.find(f => f.id === filter)?.label}`}
            {search && ` · "${search}"`}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visible.map((c: ICourse) => (
              <CourseCard
                key={c._id}
                course={c}
                isEnrolled={enrolledIds.has(c._id)}
              />
            ))}
          </div>
        </>
      )}

    </div>
  );
}
