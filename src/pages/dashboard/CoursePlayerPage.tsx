import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CheckCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Plyr } from 'plyr-react';
import type { APITypes } from 'plyr-react';
import 'plyr/dist/plyr.css';

import { getEnrolledCourseDetail } from '../../crud/enrollment.crud';
import { getCourseProgress, updateProgress, getLastWatchedLesson } from '../../crud/progress.crud';
import { coursePlayerSeo } from '../../seo/seo.courses.config';
import { cn, formatDuration } from '../../Utils/helpers';
import { toast } from '../../Utils/toast';
import type { ISection, ILesson } from '../../types/course.types';

export default function CoursePlayerPage() {
  const { courseSlug, lessonId } = useParams<{ courseSlug: string; lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const playerRef = useRef<APITypes>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // 1. Fetch Course Detail
  const { data: course, isLoading: isCourseLoading, isError: isCourseError } = useQuery({
    queryKey: ['enrolled-course', courseSlug],
    queryFn: () => getEnrolledCourseDetail(courseSlug!),
    retry: false
  });

  // 2. Fetch Progress
  const { data: progressData } = useQuery({
    queryKey: ['course-progress', course?._id],
    queryFn: () => getCourseProgress(course!._id),
    enabled: !!course?._id
  });

  // 3. Resolve 'last' lesson if needed
  const { data: lastWatched } = useQuery({
    queryKey: ['last-watched', course?._id],
    queryFn: () => getLastWatchedLesson(course!._id),
    enabled: !!course?._id && lessonId === 'last'
  });

  useEffect(() => {
    if (lessonId === 'last' && course) {
      if (lastWatched?.lessonId) {
        navigate(`/dashboard/learn/${courseSlug}/${lastWatched.lessonId}`, { replace: true });
      } else if (lastWatched === null) {
        // No progress at all, start with first lesson
        const firstLesson = course.sections[0]?.lessons[0];
        if (firstLesson) {
          navigate(`/dashboard/learn/${courseSlug}/${firstLesson._id}`, { replace: true });
        }
      }
    }
  }, [lessonId, lastWatched, course, courseSlug, navigate]);

  // Handle errors / not enrolled
  useEffect(() => {
    if (isCourseError) {
      toast.error('You are not enrolled in this course or it does not exist.');
      navigate(`/courses/${courseSlug}`);
    }
  }, [isCourseError, courseSlug, navigate]);

  // Compute current lesson data
  const { currentLesson, currentSection, nextLesson, prevLesson, allLessons } = useMemo(() => {
    if (!course || !lessonId || lessonId === 'last') {
      return { currentLesson: null, currentSection: null, nextLesson: null, prevLesson: null, allLessons: [] };
    }
    const flat = course.sections.flatMap(s => s.lessons.map(l => ({ lesson: l, section: s })));
    const idx = flat.findIndex(x => x.lesson._id === lessonId);
    if (idx === -1) {
      return { currentLesson: null, currentSection: null, nextLesson: null, prevLesson: null, allLessons: flat };
    }
    return {
      allLessons: flat,
      currentLesson: flat[idx].lesson,
      currentSection: flat[idx].section,
      prevLesson: flat[idx - 1]?.lesson || null,
      nextLesson: flat[idx + 1]?.lesson || null,
    };
  }, [course, lessonId]);

  // Auto-expand the section of the current lesson
  useEffect(() => {
    if (currentSection) {
      setExpandedSections(prev => ({ ...prev, [currentSection._id]: true }));
    }
  }, [currentSection]);

  // SEO
  useEffect(() => {
    if (currentLesson) {
      const seo = coursePlayerSeo(currentLesson.title);
      document.title = seo.title;
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', seo.description);
    }
  }, [currentLesson]);

  // Update Progress Mutation
  const updateProgressMutation = useMutation({
    mutationFn: (data: { watchedSeconds: number; completed: boolean }) => 
      updateProgress(currentLesson!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', course?._id] });
    }
  });

  // Plyr events
  useEffect(() => {
    const player = playerRef.current?.plyr;
    if (!player || !currentLesson) return;

    let debounceTimer: ReturnType<typeof setTimeout>;
    let lastTime = 0;

    const handleTimeUpdate = () => {
      const currentTime = player.currentTime;
      // avoid firing if time barely changed
      if (Math.abs(currentTime - lastTime) < 1) return;
      lastTime = currentTime;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!player.ended) {
          updateProgressMutation.mutate({ watchedSeconds: player.currentTime, completed: false });
        }
      }, 10000);
    };

    const handleEnded = () => {
      clearTimeout(debounceTimer);
      updateProgressMutation.mutate({ watchedSeconds: player.duration || currentLesson.duration, completed: true });
    };

    const handleReady = () => {
      // Seek to last watched time if not completed
      if (progressData) {
        const lessonProgress = progressData.progresses.find(p => p.lesson === currentLesson._id);
        if (lessonProgress && !lessonProgress.completed && lessonProgress.watchedSeconds > 0) {
          player.currentTime = lessonProgress.watchedSeconds;
        }
      }
    };

    player.on('timeupdate', handleTimeUpdate);
    player.on('ended', handleEnded);
    player.on('ready', handleReady);

    return () => {
      clearTimeout(debounceTimer);
      player.off('timeupdate', handleTimeUpdate);
      player.off('ended', handleEnded);
      player.off('ready', handleReady);
    };
  }, [currentLesson, progressData, updateProgressMutation]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const markAsComplete = () => {
    if (!currentLesson) return;
    const player = playerRef.current?.plyr;
    updateProgressMutation.mutate(
      { watchedSeconds: player?.currentTime || 0, completed: true },
      { onSuccess: () => toast.success('Lesson marked as complete!') }
    );
  };

  if (isCourseLoading || !course || !currentLesson) {
    return (
      <div className="flex h-screen bg-[#050505] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6b00]"></div>
      </div>
    );
  }

  const plyrProps = {
    source: {
      type: 'video' as const,
      sources: [
        {
          src: currentLesson.videoUrl || '',
          type: 'video/mp4',
        }
      ]
    },
    options: {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen', 'settings'],
      settings: ['speed'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] }
    }
  };

  const isCurrentCompleted = progressData?.progresses.find(p => p.lesson === currentLesson._id)?.completed;

  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden">
      
      {/* --- CSS Override for Plyr Accent --- */}
      <style>{`.plyr { --plyr-color-main: #ff6b00; }`}</style>

      {/* --- LEFT SIDEBAR --- */}
      <div 
        className={cn(
          "flex-shrink-0 bg-[#131313] border-r border-[#262626] flex flex-col transition-all duration-300",
          isSidebarOpen ? "w-[300px]" : "w-0 overflow-hidden"
        )}
      >
        <div className="p-4 border-b border-[#262626]">
          <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-white text-[14px] truncate">
            {course.title}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.sections.map((section: ISection) => {
            const isExpanded = expandedSections[section._id];
            return (
              <div key={section._id} className="border-b border-[#262626]">
                <button
                  onClick={() => toggleSection(section._id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#262626]/50 transition-colors"
                >
                  <span className="font-['Inter'] font-semibold text-[13px] text-[#a3a3a3] uppercase tracking-wider text-left">
                    {section.title}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#a3a3a3]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#a3a3a3]" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="flex flex-col">
                    {section.lessons.map((lesson: ILesson) => {
                      const isActive = lesson._id === currentLesson._id;
                      const isCompleted = progressData?.progresses.find(p => p.lesson === lesson._id)?.completed;
                      
                      return (
                        <Link
                          key={lesson._id}
                          to={`/dashboard/learn/${courseSlug}/${lesson._id}`}
                          className={cn(
                            "flex items-center gap-3 p-4 border-l-2 transition-colors",
                            isActive 
                              ? "border-[#ff6b00] bg-[#262626]/40" 
                              : "border-transparent hover:bg-[#262626]/20"
                          )}
                        >
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-[#ff6b00]" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-[#3a3939]" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className={cn(
                              "font-['Inter'] text-[14px] truncate",
                              isActive ? "text-white font-medium" : "text-[#a3a3a3]"
                            )}>
                              {lesson.title}
                            </span>
                            <span className="font-['Inter'] text-[12px] text-[#a3a3a3]">
                              {formatDuration(lesson.duration)}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Summary */}
        <div className="p-4 border-t border-[#262626] bg-[#131313]">
          <p className="font-['Inter'] text-[13px] text-[#a3a3a3]">
            {progressData?.completedLessons || 0} of {progressData?.totalLessons || allLessons.length} lessons complete
          </p>
        </div>
      </div>

      {/* --- RIGHT MAIN AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Bar */}
        <div className="h-16 flex-shrink-0 border-b border-[#262626] bg-[#050505] flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#262626] rounded-md text-[#a3a3a3] hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#ff6b00] rounded-lg flex items-center justify-center font-['Plus_Jakarta_Sans'] font-bold text-white text-lg">
                V
              </div>
              <span className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-white hidden sm:block">
                veoLMS
              </span>
            </Link>
          </div>
          
          <h1 className="font-['Inter'] text-[15px] font-medium text-white truncate px-4 max-w-[50%]">
            {currentLesson.title}
          </h1>

          <Link 
            to="/dashboard/my-courses"
            className="p-2 hover:bg-[#262626] rounded-md text-[#a3a3a3] hover:text-white transition-colors flex items-center gap-2"
          >
            <span className="text-sm font-medium hidden sm:block">Exit</span>
            <X className="w-5 h-5" />
          </Link>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-[#050505]">
          <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col h-full">
            
            {/* Video Player */}
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-[#262626]">
              {currentLesson.videoUrl ? (
                <Plyr ref={playerRef} {...plyrProps} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#a3a3a3]">
                  <p>No video available for this lesson.</p>
                </div>
              )}
            </div>

            {/* Lesson Info */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div>
                <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-white text-[24px] sm:text-[28px] mb-2">
                  {currentLesson.title}
                </h1>
                {currentSection && (
                  <p className="font-['Inter'] text-[#a3a3a3] text-[14px]">
                    Section: {currentSection.title}
                  </p>
                )}
              </div>

              {!isCurrentCompleted && (
                <button
                  onClick={markAsComplete}
                  disabled={updateProgressMutation.isPending}
                  className="flex-shrink-0 px-6 py-2.5 rounded-lg border border-[#ff6b00] text-[#ff6b00] font-['Plus_Jakarta_Sans'] font-semibold hover:bg-[#ff6b00]/10 transition-colors disabled:opacity-50"
                >
                  Mark as Complete
                </button>
              )}
            </div>

            {/* Prev / Next Navigation */}
            <div className="mt-auto pt-12 pb-8 flex items-center justify-between border-t border-[#262626]">
              {prevLesson ? (
                <Link
                  to={`/dashboard/learn/${courseSlug}/${prevLesson._id}`}
                  className="flex items-center gap-2 text-[#a3a3a3] hover:text-white transition-colors group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-['Inter'] font-medium">Previous Lesson</span>
                </Link>
              ) : (
                <div /> /* Spacer */
              )}

              {nextLesson ? (
                <Link
                  to={`/dashboard/learn/${courseSlug}/${nextLesson._id}`}
                  className="flex items-center gap-2 text-[#a3a3a3] hover:text-white transition-colors group"
                >
                  <span className="font-['Inter'] font-medium">Next Lesson</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <div />
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
