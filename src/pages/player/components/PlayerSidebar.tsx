import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle, Circle, PlayCircle, Lock } from 'lucide-react';
import { cn, formatDuration, buildPlayerUrl } from '../../../Utils/helpers';
import type { ICourseDetail, ILesson } from '../../../types/course.types';
import { toast } from '../../../Utils/toast';
import { Modal } from '../../../components/ui/modal';
import EnrollButton from '../../../components/ui/EnrollButton';

interface PlayerSidebarProps {
  course: ICourseDetail;
  courseSlug: string;
  lessonId?: string;
  completedLessons: Set<string>;
  isSidebarOpen: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEnrolled: boolean;
}

export function PlayerSidebar({
  course,
  courseSlug,
  lessonId,
  completedLessons,
  isSidebarOpen,
  isLoading,
  isAuthenticated,
  isEnrolled
}: PlayerSidebarProps) {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  useEffect(() => {
    if (course?.sections) {
      const initialExpanded: Record<string, boolean> = {};
      course.sections.forEach(s => {
        initialExpanded[s._id] = true;
      });
      setExpandedSections(prev => {
        if (Object.keys(prev).length === 0) return initialExpanded;
        return prev;
      });
    }
  }, [course]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleLessonClick = (lesson: ILesson) => {
    if (lesson.isFree || isEnrolled) {
      navigate(buildPlayerUrl(courseSlug, lesson._id), { replace: true });
    } else {
      if (!isAuthenticated) {
        toast.error('Login to enroll and access this lesson');
      } else {
        setIsEnrollModalOpen(true);
      }
    }
  };

  const totalLessonsCount = course?.sections?.reduce((acc, sec) => acc + sec.lessons.length, 0) || 0;
  const completedCount = completedLessons.size;
  const progressPercentage = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  return (
    <>
    <AnimatePresence initial={false}>
      {isSidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex-shrink-0 bg-[#0d0d0d] border-r border-[#262626] overflow-hidden flex flex-col z-10"
        >
          <div className="w-[280px] flex flex-col h-full">
            <div className="p-4 border-b border-[#262626]">
              <h2 className="uppercase font-semibold text-[11px] text-[#a3a3a3] tracking-wider mb-3">
                Course Content
              </h2>
              {isEnrolled && (
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1.5 text-[11px] font-medium text-[#737373]">
                    <span>{completedCount} of {totalLessonsCount} completed</span>
                    <span className="text-white">{progressPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#262626] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#ff6b00] rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${progressPercentage}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-[#1a1a1a] rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                course?.sections?.map((section) => (
                  <div key={section._id} className="border-b border-[#262626]">
                    <button
                      onClick={() => toggleSection(section._id)}
                      className="w-full text-left px-4 py-3 bg-[#131313] hover:bg-[#1a1a1a] transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {expandedSections[section._id] ? (
                          <ChevronLeft className="w-4 h-4 text-[#a3a3a3] transform -rotate-90 shrink-0" />
                        ) : (
                          <ChevronLeft className="w-4 h-4 text-[#a3a3a3] transform rotate-180 shrink-0" />
                        )}
                        <span className="font-semibold text-[13px] line-clamp-2">
                          {section.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#737373] shrink-0 ml-2 font-medium">
                        {section.lessons.length}
                      </span>
                    </button>
                    
                    {expandedSections[section._id] && (
                      <div className="bg-[#0d0d0d]">
                        {section.lessons.map((lesson) => {
                          const isActive = lesson._id === lessonId;
                          const isLessonCompleted = completedLessons.has(lesson._id);
                          const canAccess = lesson.isFree || isEnrolled;
                          
                          return (
                            <div
                              key={lesson._id}
                              onClick={() => handleLessonClick(lesson)}
                              className={cn(
                                "w-full text-left px-4 pl-9 py-2.5 flex items-start gap-3 transition-colors border-l-4",
                                isActive ? "bg-[#1a1a1a] border-[#ff6b00]" : "border-transparent",
                                canAccess ? "hover:bg-[#131313] cursor-pointer" : "opacity-60 cursor-not-allowed hover:bg-transparent"
                              )}
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                {isActive ? (
                                  <Circle className="w-4 h-4 text-[#ff6b00]" fill="#ff6b00" />
                                ) : isLessonCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-[#ff6b00]" />
                                ) : lesson.isFree ? (
                                  <PlayCircle className="w-4 h-4 text-[#ff6b00]" />
                                ) : canAccess ? (
                                  <Circle className="w-4 h-4 text-[#404040]" />
                                ) : (
                                  <Lock className="w-4 h-4 text-[#525252]" />
                                )}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <h4 className={cn(
                                  "text-[13px] leading-tight mb-1",
                                  isActive ? "text-white font-medium" : "text-[#a3a3a3]"
                                )}>
                                  {lesson.title}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[11px] text-[#737373]">
                                  <span>{formatDuration(lesson.duration)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
      {course && (
        <Modal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          title={<span className="text-xl font-bold text-white">Enrollment Required</span>}
        >
          <div className="flex flex-col gap-6 items-center text-center p-4">
            <p className="text-base text-gray-300">
              you have not erroled in thisd course , if you really like this course click on enrool button to enroll and watch other videos
            </p>
            <div className="w-full">
              <EnrollButton
                courseId={course._id}
                courseSlug={course.slug}
                price={course.price}
                isEnrolled={isEnrolled}
                isLoggedIn={isAuthenticated}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
