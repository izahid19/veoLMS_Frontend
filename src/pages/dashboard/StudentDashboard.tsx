import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { BookOpen, CheckCircle, Clock, PlayCircle, Loader2, Timer, Flame } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { useContinueLearning } from "../../hooks/useContinueLearning";
import { getMyEnrollments } from "../../crud/enrollment.crud";
import { getCourseProgress } from "../../crud/progress.crud";
import { studentDashboardSeo } from "../../seo/seo.courses.config";
import { timeAgo, buildPlayerUrl, formatHumanDuration, calcStreak } from "../../Utils/helpers";
import type { IEnrollment, ICourseProgress, IProgress } from "../../types/course.types";

// -- Circular Progress Ring SVG -------------------------------------------------
function ProgressRing({ percentage }: { percentage: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#262626" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke="#ff6b00" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-['Plus_Jakarta_Sans'] font-bold text-white text-lg leading-none">{Math.round(percentage)}%</span>
        <span className="font-['Inter'] text-[#a3a3a3] text-[9px] leading-none mt-0.5">overall</span>
      </div>
    </div>
  );
}

// -- Course Card ----------------------------------------------------------------
function DashboardCourseCard({
  enr,
  percentage,
  totalDuration,
  watchedSeconds,
}: {
  enr: IEnrollment;
  percentage: number;
  totalDuration: number;
  watchedSeconds: number;
}) {
  const navigate = useNavigate();
  const { handleContinue, isLoading } = useContinueLearning(enr.course._id, enr.course.slug, (enr.course as any).sections);

  const remaining = Math.max(0, totalDuration - watchedSeconds);
  const showRemaining = percentage < 100 && totalDuration > 0 && remaining > 60;

  return (
    <div className="bg-[#131313] border border-[#262626] rounded-[12px] p-5 flex flex-col sm:flex-row items-center gap-5">
      <div className="w-full sm:w-40 aspect-video rounded-[8px] overflow-hidden flex-shrink-0 relative">
        {enr.course.thumbnail ? (
          <img src={enr.course.thumbnail} alt={enr.course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#262626]" />
        )}
      </div>

      <div className="flex-1 w-full space-y-2">
        <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-white text-lg line-clamp-1">{enr.course.title}</h3>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-[#262626] rounded-full overflow-hidden">
            <div className="h-full bg-[#ff6b00] rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
          </div>
          <span className="font-['Inter'] text-sm text-[#a3a3a3] whitespace-nowrap">{Math.round(percentage)}% complete</span>
        </div>

        {showRemaining && (
          <div className="flex items-center gap-1.5 text-[#a3a3a3]">
            <Timer className="w-3.5 h-3.5" />
            <span className="font-['Inter'] text-xs">{formatHumanDuration(remaining)} remaining</span>
          </div>
        )}
      </div>

      <div className="w-full sm:w-auto mt-4 sm:mt-0">
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full sm:w-auto bg-[#262626] hover:bg-[#333] text-white font-['Inter'] font-medium px-5 py-2.5 rounded-[8px] transition-colors whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Continue
        </button>
      </div>
    </div>
  );
}

// -- Page ----------------------------------------------------------------------
export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    document.title = studentDashboardSeo.title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    meta.setAttribute("content", studentDashboardSeo.description);
  }, []);

  const { data: enrollments, isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: getMyEnrollments,
  });

  const progressQueries = useQueries({
    queries: (enrollments || []).map((enr: IEnrollment) => ({
      queryKey: ["progress", enr.course._id],
      queryFn: () => getCourseProgress(enr.course._id),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const isProgressLoading = progressQueries.some(q => q.isLoading);
  const isLoading = isEnrollmentsLoading || isProgressLoading;

  const {
    completedLessons,
    inProgressCourses,
    recentWatches,
    overallPercentage,
    totalWatchedHours,
    streak,
  } = useMemo(() => {
    if (!enrollments || progressQueries.some(q => !q.data)) {
      return { completedLessons: 0, inProgressCourses: 0, recentWatches: [], overallPercentage: 0, totalWatchedHours: 0, streak: 0 };
    }

    let completed = 0;
    let inProgress = 0;
    let totalPercent = 0;
    let totalWatchedSec = 0;
    const allProgresses: Array<IProgress & { courseTitle: string; courseSlug: string; lessonTitle: string }> = [];
    const allLastWatched: string[] = [];

    progressQueries.forEach((query, index) => {
      const data = query.data as ICourseProgress | undefined;
      const course = enrollments[index].course;

      if (data) {
        completed += data.completedLessons;
        totalPercent += data.percentage || 0;
        if (data.percentage > 0 && data.percentage < 100) inProgress++;

        (data.progresses || []).forEach((p: IProgress) => {
          totalWatchedSec += p.watchedSeconds || 0;
          if (p.lastWatchedAt) allLastWatched.push(p.lastWatchedAt as unknown as string);
          allProgresses.push({
            ...p,
            courseTitle: course.title,
            courseSlug: course.slug,
            lessonTitle: (p.lesson as any)?.title || "Lesson",
          });
        });
      }
    });

    const avgPercent = enrollments.length > 0 ? totalPercent / enrollments.length : 0;
    const hoursWatched = totalWatchedSec / 3600;
    const currentStreak = calcStreak(allLastWatched);

    const recent = allProgresses
      .filter(p => p.lastWatchedAt)
      .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
      .slice(0, 3);

    return {
      completedLessons: completed,
      inProgressCourses: inProgress,
      recentWatches: recent,
      overallPercentage: avgPercent,
      totalWatchedHours: hoursWatched,
      streak: currentStreak,
    };
  }, [enrollments, progressQueries]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-36 bg-[#131313] rounded-2xl w-full border border-[#262626]"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[#131313] rounded-xl border border-[#262626]"></div>)}
        </div>
        <div className="h-64 bg-[#131313] rounded-2xl w-full border border-[#262626]"></div>
      </div>
    );
  }

  const hasEnrollments = enrollments && enrollments.length > 0;

  return (
    <div className="space-y-10 pb-12">

      {/* 1. WELCOME BANNER */}
      <div className="bg-[#131313] border border-[#262626] rounded-[16px] p-8 lg:p-10 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#ff6b00] rounded-full blur-[120px] opacity-[0.08] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-[#9333ea] rounded-full blur-[80px] opacity-[0.06] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[28px] text-white mb-1">
              Welcome back, {user?.firstName} ??
            </h1>
            <p className="font-['Inter'] text-[#a3a3a3] text-base mb-3">
              {hasEnrollments ? "Pick up where you left off" : "Start your learning journey today"}
            </p>
            {streak >= 1 && (
              <div className="inline-flex items-center gap-2 bg-[#ff6b00]/10 border border-[#ff6b00]/20 px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-[#ff6b00]" />
                <span className="font-['Inter'] font-semibold text-[#ff6b00] text-sm">
                  {streak} day{streak !== 1 ? "s" : ""} streak
                </span>
              </div>
            )}
          </div>
          {hasEnrollments && <ProgressRing percentage={overallPercentage} />}
        </div>
      </div>

      {/* 2. STATS ROW — 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131313] border border-[#262626] rounded-[12px] p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#ff6b00]/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-[#ff6b00]" />
          </div>
          <div>
            <p className="font-['Inter'] text-[#a3a3a3] text-xs mb-1">Enrolled</p>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-white text-2xl">{enrollments?.length || 0}</p>
          </div>
        </div>

        <div className="bg-[#131313] border border-[#262626] rounded-[12px] p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="font-['Inter'] text-[#a3a3a3] text-xs mb-1">Completed</p>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-white text-2xl">{completedLessons}</p>
          </div>
        </div>

        <div className="bg-[#131313] border border-[#262626] rounded-[12px] p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-['Inter'] text-[#a3a3a3] text-xs mb-1">In Progress</p>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-white text-2xl">{inProgressCourses}</p>
          </div>
        </div>

        <div className="bg-[#131313] border border-[#262626] rounded-[12px] p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Timer className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-['Inter'] text-[#a3a3a3] text-xs mb-1">Hours Watched</p>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-white text-2xl">{totalWatchedHours.toFixed(1)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* 3. CONTINUE LEARNING */}
        <div className="xl:col-span-2 space-y-6">
          <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[22px] text-white">Continue Learning</h2>

          {!hasEnrollments ? (
            /* Premium empty state */
            <div className="relative bg-[#131313] border border-[#262626] rounded-[16px] p-12 flex flex-col items-center justify-center text-center overflow-hidden">
              {/* Decorative orbs */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#ff6b00] rounded-full blur-[80px] opacity-[0.07] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#9333ea] rounded-full blur-[60px] opacity-[0.06] pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ff6b00]/20 to-[#9333ea]/10 border border-[#262626] flex items-center justify-center mb-6">
                  <BookOpen className="w-10 h-10 text-[#ff6b00]" />
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-white text-2xl mb-2">
                  Your learning journey starts here
                </h3>
                <p className="font-['Inter'] text-[#a3a3a3] max-w-xs mb-8 leading-relaxed">
                  Explore our premium catalog and enroll in your first course to start tracking your progress.
                </p>
                <button
                  onClick={() => navigate("/courses")}
                  className="bg-[#ff6b00] hover:bg-[#e65a00] text-white font-['Plus_Jakarta_Sans'] font-semibold px-8 py-3 rounded-[8px] transition-all hover:shadow-[0_0_20px_rgba(255,107,0,0.3)] flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Browse Courses
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.slice(0, 3).map((enr: IEnrollment, idx: number) => {
                const progressData = progressQueries[idx]?.data as ICourseProgress | undefined;
                const percentage = progressData?.percentage || 0;
                const watchedSec = (progressData?.progresses || []).reduce((acc: number, p: IProgress) => acc + (p.watchedSeconds || 0), 0);
                const totalDuration = enr.course.totalDuration || 0;

                return (
                  <DashboardCourseCard
                    key={enr._id}
                    enr={enr}
                    percentage={percentage}
                    totalDuration={totalDuration}
                    watchedSeconds={watchedSec}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* 4. RECENTLY WATCHED */}
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
                    onClick={() => navigate(buildPlayerUrl(watch.courseSlug, (watch.lesson as any)._id || watch.lesson))}
                  >
                    <div className="mt-1 w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center flex-shrink-0 group-hover:bg-[#ff6b00]/20 transition-colors">
                      <PlayCircle className="w-4 h-4 text-[#a3a3a3] group-hover:text-[#ff6b00] transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-['Plus_Jakarta_Sans'] font-medium text-white text-[15px] group-hover:text-[#ff6b00] transition-colors line-clamp-2">{watch.lessonTitle}</h4>
                      <p className="font-['Inter'] text-sm text-[#a3a3a3] mt-1 line-clamp-1">{watch.courseTitle}</p>
                      <p className="font-['Inter'] text-xs text-[#a3a3a3] mt-1 opacity-70">{timeAgo(watch.lastWatchedAt)}</p>
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
