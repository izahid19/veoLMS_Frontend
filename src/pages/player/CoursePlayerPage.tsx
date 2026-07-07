import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

import { getCourseBySlug } from '../../crud/course.crud';
import { getLessonForWatch, checkEnrollment } from '../../crud/enrollment.crud';
import { getCourseProgress } from '../../crud/progress.crud';
import useAuthStore from '../../store/authStore';
import { buildPlayerUrl } from '../../Utils/helpers';
import axiosInstance from '../../lib/axios';

import { PlayerHeader } from './components/PlayerHeader';
import { PlayerSidebar } from './components/PlayerSidebar';
import { VideoPlayer } from './components/VideoPlayer';

export default function CoursePlayerPage() {
  const { slug: courseSlug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('veolms_player_sidebar');
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 1024;
  });

  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Bootstrap auth from cookie on page load/refresh
  useEffect(() => {
    const bootstrap = async () => {
      if (isAuthenticated) {
        setIsAuthLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get('/auth/me');
        if (response.data.success) {
          setAuth(useAuthStore.getState().accessToken || '', response.data.data);
        }
      } catch {
        // Not logged in — that's fine, unenrolled/free content still works
      } finally {
        setIsAuthLoading(false);
      }
    };
    bootstrap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem('veolms_player_sidebar', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  // 1. Fetch Course Curriculum (always public, but wait for auth to settle first)
  const { data: courseData, isLoading: isCourseLoading, error: courseError } = useQuery({
    queryKey: ['course-curriculum', courseSlug],
    queryFn: async () => {
      const res = await getCourseBySlug(courseSlug as string);
      return res.data.data;
    },
    retry: false,
    enabled: !!courseSlug && !isAuthLoading,
  });

  const course = courseData;

  // 2. Check Enrollment (only if authenticated)
  const { data: enrollmentData } = useQuery({
    queryKey: ['enrollment-check', course?._id],
    queryFn: () => checkEnrollment(course?._id as string),
    enabled: !!course?._id && isAuthenticated,
    staleTime: 0,
  });

  const isEnrolled = enrollmentData?.isEnrolled ?? false;

  // 3. Fetch Progress (only if authenticated)
  const { data: progressData, isLoading: isProgressLoading } = useQuery({
    queryKey: ['course-progress', course?._id],
    queryFn: async () => {
      if (!course?._id) return null;
      return await getCourseProgress(course._id);
    },
    enabled: !!course?._id && isAuthenticated,
  });

  // 4. Fetch Lesson Access (smart endpoint) — wait for auth to settle
  const { data: watchData, isLoading: isWatchLoading, refetch: refetchWatchData } = useQuery({
    queryKey: ['lesson-watch', lessonId],
    queryFn: () => getLessonForWatch(lessonId as string),
    enabled: !!lessonId && !isAuthLoading,
    retry: false,
    staleTime: 50 * 60 * 1000,
    refetchInterval: 50 * 60 * 1000,
  });

  // Flatten lessons
  const flatLessons = useMemo(() => {
    if (!course?.sections) return [];
    return course.sections.flatMap((s: any) => s.lessons);
  }, [course]);

  // Sync completed lessons
  useEffect(() => {
    if (progressData?.progresses) {
      const completed = new Set(progressData.progresses.filter((p: any) => p.completed).map((p: any) => p.lesson));
      setCompletedLessons(completed as Set<string>);
    }
  }, [progressData]);

  // Derived state: Current Lesson
  const currentLessonIndex = lessonId ? flatLessons.findIndex((l: any) => l._id === lessonId) : -1;
  const currentLesson = currentLessonIndex !== -1 ? flatLessons[currentLessonIndex] : null;
  const prevLesson = currentLessonIndex > 0 ? flatLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < flatLessons.length - 1 ? flatLessons[currentLessonIndex + 1] : null;

  // Initial Route Fix
  useEffect(() => {
    if (course) {
      if (flatLessons.length === 0) return; // handled in render

      if (!lessonId || currentLessonIndex === -1) {
        const targetLesson = (isAuthenticated && progressData?.lastWatchedLesson?.lessonId) 
          ? progressData.lastWatchedLesson.lessonId 
          : flatLessons[0]?._id;
        
        if (targetLesson && targetLesson !== lessonId) {
          navigate(buildPlayerUrl(courseSlug as string, targetLesson), { replace: true });
        }
      }
    }
  }, [course, progressData, lessonId, currentLessonIndex, navigate, courseSlug, flatLessons, isAuthenticated]);

  const handleMarkComplete = (id: string) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const isLoading = isCourseLoading || isProgressLoading || (!currentLesson && flatLessons.length > 0);

  if (courseError) {
    const status = (courseError as any)?.response?.status;
    if (status === 404 || status === 400) {
      return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 text-center">
          <BookOpen className="w-16 h-16 text-[#262626] mb-6" />
          <h2 className="font-['Plus_Jakarta_Sans'] text-white text-3xl font-bold mb-4">Course not found</h2>
          <p className="text-[#a3a3a3] mb-8 max-w-md">The course you are trying to access does not exist or has been removed.</p>
          <button
            onClick={() => navigate('/courses', { replace: true })}
            className="bg-[#262626] text-white px-6 py-2.5 rounded-lg font-['Inter'] hover:bg-[#333] transition-colors"
          >
            Browse Courses
          </button>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#050505] overflow-hidden text-white font-['Inter']">
      <style>{`
        :root {
          --plyr-color-main: #ff6b00;
        }
      `}</style>
      
      {/* ─── TOP BAR ──────────────────────────────────────────────────────── */}
      <PlayerHeader courseTitle={course?.title || ''} />

      {/* ─── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* ─── LEFT SIDEBAR ────────────────────────────────────────────────── */}
        <PlayerSidebar 
          course={course!}
          courseSlug={courseSlug!}
          lessonId={lessonId}
          completedLessons={completedLessons}
          isSidebarOpen={isSidebarOpen}
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
          isEnrolled={isEnrolled}
        />

        {/* ─── SIDEBAR TOGGLE BUTTON ────────────────────────────────────────── */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-6 h-12 bg-[#131313] border border-[#262626] border-l-0 rounded-r-lg flex items-center justify-center text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] transition-colors hidden lg:flex"
          style={{ transform: `translate(${isSidebarOpen ? 280 : 0}px, -50%)`, transition: 'transform 0.3s ease-in-out' }}
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* ─── RIGHT MAIN AREA (PLAYER) ─────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#050505] relative custom-scrollbar">
          {isLoading || !currentLesson ? (
            <div className="max-w-[900px] mx-auto p-6 space-y-6 animate-pulse mt-8">
              <div className="w-full aspect-video bg-[#131313] rounded-[12px] border border-[#262626]" />
              <div className="w-2/3 h-10 bg-[#131313] rounded-lg" />
              <div className="w-1/3 h-5 bg-[#131313] rounded-lg" />
            </div>
          ) : flatLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <BookOpen className="w-12 h-12 text-[#262626] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No lessons available yet</h3>
              <p className="text-[#737373]">Check back soon for updates.</p>
            </div>
          ) : (
            <VideoPlayer 
              key={lessonId!}
              course={course!}
              courseSlug={courseSlug!}
              lessonId={lessonId!}
              currentLesson={currentLesson}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
              watchData={watchData as any}
              isAuthenticated={isAuthenticated}
              completedLessons={completedLessons}
              onMarkComplete={handleMarkComplete}
              refetchWatchData={refetchWatchData}
              progressData={progressData}
            />
          )}
        </main>

        {/* Mobile Sidebar Overlay Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
