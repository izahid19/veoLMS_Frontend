import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle, ChevronLeft, ChevronRight, Loader2, FileText, Link2, ExternalLink, Lock, AlertCircle } from 'lucide-react';
import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';

import { updateProgress } from '../../../crud/progress.crud';
import { toast } from '../../../Utils/toast';
import type { ILesson, ICourseDetail, ILessonWatchResponse } from '../../../types/course.types';
import { formatPrice, buildPlayerUrl } from '../../../Utils/helpers';

interface VideoPlayerProps {
  course: ICourseDetail;
  courseSlug: string;
  lessonId: string;
  currentLesson: ILesson;
  prevLesson: ILesson | null;
  nextLesson: ILesson | null;
  watchData?: ILessonWatchResponse;
  isAuthenticated: boolean;
  completedLessons: Set<string>;
  onMarkComplete: (lessonId: string) => void;
  refetchWatchData: () => void;
  progressData: any;
}

export function VideoPlayer({
  course,
  courseSlug,
  lessonId,
  currentLesson,
  prevLesson,
  nextLesson,
  watchData,
  isAuthenticated,
  completedLessons,
  onMarkComplete,
  refetchWatchData,
  progressData
}: VideoPlayerProps) {
  const navigate = useNavigate();
  const playerRef = useRef<any>(null);
  const lastUpdateRef = useRef<number>(Date.now()); // init to now so we don't save on first load
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const canAccess = watchData?.canAccess || false;
  const videoUrl = watchData?.lesson?.videoUrl || currentLesson.videoUrl;
  const isCompleted = completedLessons.has(lessonId);

  // Refs for callbacks
  const lessonIdRef = useRef(lessonId);
  const nextLessonRef = useRef(nextLesson);
  const courseSlugRef = useRef(courseSlug);
  const progressDataRef = useRef(progressData);
  const isAuthenticatedRef = useRef(isAuthenticated);

  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const hasResumedRef = useRef(false);

  useEffect(() => {
    lessonIdRef.current = lessonId;
    nextLessonRef.current = nextLesson;
    courseSlugRef.current = courseSlug;
    progressDataRef.current = progressData;
    isAuthenticatedRef.current = isAuthenticated;
  }, [lessonId, nextLesson, courseSlug, progressData, isAuthenticated]);

  // Reset resume state when lesson changes
  useEffect(() => {
    hasResumedRef.current = false;
    setIsPlayerReady(false);
    return () => {
      // Clean up pause listener when lesson changes or component unmounts
      if (pauseCleanupRef.current) {
        pauseCleanupRef.current();
        pauseCleanupRef.current = null;
      }
    };
  }, [lessonId]);

  // Resume video when BOTH player is ready AND progressData has loaded
  useEffect(() => {
    if (!isAuthenticated || !isPlayerReady || hasResumedRef.current) return;
    const lessonProgress = progressData?.progresses?.find((p: any) => p.lesson === lessonId);
    if (lessonProgress && !lessonProgress.completed && lessonProgress.watchedSeconds > 10) {
      const player = playerRef.current?.plyr;
      if (player) {
        // Small delay to ensure player is fully initialized
        setTimeout(() => {
          player.currentTime = lessonProgress.watchedSeconds;
        }, 300);
      }
      hasResumedRef.current = true;
    } else if (progressData !== undefined) {
      // progressData loaded — mark lesson as "last visited" so Continue Learning works correctly
      // Only save a visit if there's no existing progress (don't overwrite saved seconds with 0)
      const existingSeconds = lessonProgress?.watchedSeconds || 0;
      updateProgress(lessonId, { watchedSeconds: existingSeconds }).catch(() => {});
      hasResumedRef.current = true;
    }
  }, [isAuthenticated, isPlayerReady, progressData, lessonId]);

  const handleTimeUpdate = useCallback((e: any) => {
    if (!isAuthenticatedRef.current) return;
    const player = playerRef.current?.plyr;
    const currentTime = player?.currentTime || 0;
    if (currentTime < 2) return; // Don't save at the very beginning
    const now = Date.now();
    // Save every 10 seconds of real time
    if (now - lastUpdateRef.current > 10000) {
      updateProgress(lessonIdRef.current, { watchedSeconds: Math.floor(currentTime) }).catch(console.warn);
      lastUpdateRef.current = now;
    }
  }, []);

  // pauseCleanupRef holds the cleanup fn so we can remove the listener on unmount/lesson change
  const pauseCleanupRef = useRef<(() => void) | null>(null);

  // Attach pause listener via Plyr's native 'ready' event — most reliable method
  useEffect(() => {
    // Small delay to ensure playerRef is populated after first render
    const timer = setTimeout(() => {
      const player = playerRef.current?.plyr;
      if (!player) return;

      const attachPauseListener = () => {
        const videoEl = player.media as HTMLVideoElement | null;
        if (!videoEl) return;
        if (pauseCleanupRef.current) pauseCleanupRef.current();

        const onPause = () => {
          if (!isAuthenticatedRef.current) return;
          const time = player.currentTime || 0;
          console.log('[VideoPlayer] pause, time:', time);
          if (time > 5) {
            updateProgress(lessonIdRef.current, { watchedSeconds: Math.floor(time) }).catch(console.warn);
            lastUpdateRef.current = Date.now();
          }
        };

        videoEl.addEventListener('pause', onPause);
        pauseCleanupRef.current = () => videoEl.removeEventListener('pause', onPause);
      };

      // Attach immediately if already ready, or on 'ready' event
      if ((player as any).ready) {
        attachPauseListener();
      } else {
        player.on('ready', attachPauseListener);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (pauseCleanupRef.current) {
        pauseCleanupRef.current();
        pauseCleanupRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save when user closes tab or navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isAuthenticatedRef.current) return;
      const player = playerRef.current?.plyr;
      const currentTime = player?.currentTime || 0;
      if (currentTime > 5) {
        // Use sendBeacon for reliable save on page unload
        const data = JSON.stringify({ watchedSeconds: Math.floor(currentTime) });
        navigator.sendBeacon?.(
          `/api/watch-record/${lessonIdRef.current}`,
          new Blob([data], { type: 'application/json' })
        );
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleEnded = useCallback((e: any) => {
    if (isAuthenticatedRef.current) {
      const player = playerRef.current?.plyr;
      const duration = player?.duration || 0;
      updateProgress(lessonIdRef.current, { watchedSeconds: Math.floor(duration), completed: true }).catch(console.warn);
    }
    onMarkComplete(lessonIdRef.current);
    
    if (nextLessonRef.current) {
      setShowNextOverlay(true);
      let count = 5;
      setCountdown(count);
      const timer = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(timer);
          if (nextLessonRef.current?._id) {
            navigate(buildPlayerUrl(courseSlugRef.current, nextLessonRef.current._id));
          }
          setShowNextOverlay(false);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      toast.success('Course completed! 🎉');
    }
  }, [navigate, onMarkComplete]);

  const handleLoadedMetadata = useCallback(() => {
    setHasError(false);
    setIsPlayerReady(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const handleMarkCompleteManual = async () => {
    if (!isAuthenticated) return;
    setIsUpdatingProgress(true);
    const player = playerRef.current?.plyr;
    const watchedSeconds = Math.floor(player?.currentTime || 0);
    
    // Optimistic
    onMarkComplete(lessonId);
    
    try {
      await updateProgress(lessonId, { watchedSeconds, completed: true });
    } catch (e) {
      console.warn(e);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const currentSection = course?.sections?.find((s) => s.lessons.some((l) => l._id === lessonId));

  return (
    <div className="max-w-[900px] mx-auto pb-24">
      {/* VIDEO CONTAINER */}
      <div className="p-4 sm:p-6 pb-0">
        <div className="w-full aspect-video rounded-[12px] overflow-hidden bg-[#131313] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#262626] relative">
          
          {canAccess && videoUrl ? (
            <div className="w-full h-full relative">
              <Plyr
                ref={playerRef}
                source={{
                  type: 'video',
                  sources: [{ src: videoUrl, provider: 'html5' }],
                }}
                options={{
                  controls: [
                    'play-large', 'play', 'rewind', 'fast-forward', 'progress',
                    'current-time', 'duration', 'mute', 'volume',
                    'settings', 'pip', 'fullscreen'
                  ],
                  settings: ['speed', 'quality'],
                  speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
                  keyboard: { global: true },
                  tooltips: { controls: true },
                }}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={handleLoadedMetadata}
                onError={handleError}
              />

              {hasError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-center p-6">
                  <AlertCircle className="w-12 h-12 text-[#ff6b00] mb-4" />
                  <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white mb-2">Video failed to load</h3>
                  <p className="text-[#a3a3a3] text-sm mb-6 max-w-sm">
                    The secure video link may have expired or there was a network issue.
                  </p>
                  <button
                    onClick={() => {
                      setHasError(false);
                      refetchWatchData();
                    }}
                    className="px-6 py-2.5 bg-[#ff6b00] hover:bg-[#ff8533] text-white font-bold rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {showNextOverlay && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-center p-6">
                  <h3 className="text-[#a3a3a3] font-medium text-lg mb-2">Up Next</h3>
                  <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-white mb-6 max-w-lg line-clamp-2">
                    {nextLesson?.title}
                  </h2>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setShowNextOverlay(false);
                        if (nextLesson?._id) navigate(buildPlayerUrl(courseSlug, nextLesson._id));
                      }}
                      className="px-6 py-2.5 bg-[#ff6b00] hover:bg-[#ff8533] text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Play Now
                    </button>
                    <button
                      onClick={() => setShowNextOverlay(false)}
                      className="px-6 py-2.5 bg-transparent border border-[#404040] hover:bg-[#262626] text-white font-medium rounded-lg transition-colors"
                    >
                      Cancel ({countdown})
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] text-center p-6 border border-[#262626]">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6 border border-[#262626]">
                <Lock className="w-8 h-8 text-[#a3a3a3]" />
              </div>
              
              {watchData?.reason === 'login_required' ? (
                <>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-white mb-2">Login to watch</h3>
                  <p className="text-[#a3a3a3] max-w-md mb-8">
                    Create an account or login to track your progress and access this lesson.
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate(`/login?redirect=${buildPlayerUrl(courseSlug, lessonId)}`)}
                      className="px-6 py-2.5 bg-[#ff6b00] hover:bg-[#ff8533] text-white font-bold rounded-lg transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => navigate(`/courses/${courseSlug}`)}
                      className="px-6 py-2.5 border border-[#404040] hover:bg-[#1a1a1a] text-white font-bold rounded-lg transition-colors"
                    >
                      Back to Course
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="bg-[#ff6b00]/10 text-[#ff6b00] text-[10px] font-bold tracking-widest uppercase rounded-full px-3 py-1 mb-4">
                    Premium Content
                  </span>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-white mb-2">This lesson is locked</h3>
                  <p className="text-[#a3a3a3] max-w-md mb-8">
                    Enroll in this course to access all lessons and resources.
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate(`/courses/${courseSlug}`)}
                      className="px-8 py-3 bg-[#ff6b00] hover:bg-[#ff8533] text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      Enroll Now — {course.price > 0 ? formatPrice(course.price) : 'Free'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* LESSON INFO SECTION */}
      <div className="p-4 sm:p-6 space-y-8 mt-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="font-['Inter'] text-[13px] text-[#a3a3a3] mb-2 flex items-center gap-2">
              {course.title} <ChevronRight className="w-3 h-3" /> {currentSection?.title}
            </span>
            <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[28px] text-white leading-tight">
              {currentLesson.title}
            </h1>
          </div>

          <div className="h-px w-full bg-[#262626]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              {canAccess && !isCompleted && isAuthenticated && (
                <button
                  onClick={handleMarkCompleteManual}
                  disabled={isUpdatingProgress}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-[#ff6b00] hover:bg-[#ff6b00]/10 text-[#ff6b00] rounded-lg font-medium text-sm transition-all duration-300 disabled:opacity-50"
                >
                  {isUpdatingProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Mark as Complete
                </button>
              )}
              {isCompleted && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] rounded-lg font-medium text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </div>
              )}
              {!isAuthenticated && canAccess && (
                <span className="text-[#a3a3a3] text-sm flex items-center gap-2">
                  <button onClick={() => navigate(`/login?redirect=${buildPlayerUrl(courseSlug, lessonId)}`)} className="text-[#ff6b00] hover:underline">Login</button> to track progress
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => prevLesson && navigate(buildPlayerUrl(courseSlug, prevLesson._id))}
                disabled={!prevLesson}
                title={prevLesson?.title}
                className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-[#404040] hover:border-white text-white rounded-lg font-medium text-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <button
                onClick={() => nextLesson && navigate(buildPlayerUrl(courseSlug, nextLesson._id))}
                disabled={!nextLesson}
                title={nextLesson?.title}
                className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-[#404040] hover:border-white text-white rounded-lg font-medium text-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* DESCRIPTION & RESOURCES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          <div className="lg:col-span-2 space-y-8">
            {currentLesson.content && (
              <div className="p-6 bg-[#0a0a0a] rounded-[12px] border border-[#1a1a1a]">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[18px] text-white mb-6 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#ff6b00]" />
                  Lesson Details
                </h3>
                <div 
                  className="prose prose-invert max-w-none prose-p:text-[#a3a3a3] prose-p:leading-relaxed prose-headings:text-white prose-a:text-[#ff6b00] prose-strong:text-white prose-li:text-[#a3a3a3]"
                  dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            {currentLesson.resources && currentLesson.resources.length > 0 && (
              <div className="p-6 bg-[#0a0a0a] rounded-[12px] border border-[#1a1a1a]">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[18px] text-white mb-6 flex items-center gap-3">
                  <Link2 className="w-5 h-5 text-[#ff6b00]" />
                  Resources
                </h3>
                <div className="space-y-3">
                  {currentLesson.resources.map((res, idx) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-1.5 p-4 bg-[#131313] hover:bg-[#1a1a1a] border border-[#262626] hover:border-[#404040] rounded-xl transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold text-white group-hover:text-[#ff6b00] transition-colors line-clamp-2">
                          {res.title}
                        </span>
                        <ExternalLink className="w-4 h-4 text-[#737373] group-hover:text-[#ff6b00] shrink-0 transition-colors mt-0.5" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
