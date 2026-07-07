import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Lock, BookOpen, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';

import { getCourseBySlug } from '../../crud/course.crud';
import { checkEnrollment } from '../../crud/enrollment.crud';
import { formatPrice, formatDuration, cn, buildPlayerUrl } from '../../Utils/helpers';
import { courseDetailSeo } from '../../seo/seo.courses.config';
import useAuthStore from '../../store/authStore';
import type { ICourseDetail, ISection, ILesson } from '../../types/course.types';
import EnrollButton from '../../components/ui/EnrollButton';

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // 1. Fetch Course by slug
  const { data: course, isLoading: isCourseLoading, isError: isCourseError } = useQuery<ICourseDetail>({
    queryKey: ['course', slug],
    queryFn: async () => {
      const res = await getCourseBySlug(slug as string);
      return res.data.data;
    },
    enabled: !!slug,
  });

  // 2. Check Enrollment (only if authenticated and course is loaded)
  const { data: enrollmentData, isLoading: isEnrollmentLoading, refetch: refetchEnrollment } = useQuery({
    queryKey: ['enrollment-check', course?._id],
    queryFn: () => checkEnrollment(course?._id as string),
    enabled: !!course?._id && isAuthenticated,
    staleTime: 0,
  });

  const isEnrolled = enrollmentData?.isEnrolled ?? false;

  // SEO Update
  useEffect(() => {
    if (course) {
      const seo = courseDetailSeo(course.title, course.description);
      document.title = seo.title;
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', seo.description);
    }
  }, [course]);

  if (isCourseLoading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Left Skeleton */}
          <div className="w-full lg:w-[70%] space-y-6 animate-pulse">
            <div className="h-10 bg-[#131313] border border-[#262626] rounded-md w-3/4"></div>
            <div className="h-20 bg-[#131313] border border-[#262626] rounded-md w-full"></div>
            <div className="h-12 bg-[#131313] border border-[#262626] rounded-md w-1/2"></div>
            <div className="h-64 bg-[#131313] border border-[#262626] rounded-xl w-full"></div>
          </div>
          {/* Right Skeleton */}
          <div className="w-full lg:w-[30%] animate-pulse">
            <div className="h-[400px] bg-[#131313] border border-[#262626] rounded-xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isCourseError || !course) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center pt-24 pb-16 px-4">
        <h2 className="font-['Plus_Jakarta_Sans'] text-white text-3xl font-bold mb-4">Course not found</h2>
        <button
          onClick={() => navigate('/courses')}
          className="bg-[#262626] text-white px-6 py-2 rounded-lg font-['Inter'] hover:bg-[#333] transition-colors"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  // Actions are now handled inside EnrollButton

  const toggleSection = (sectionId: string) => {
    setExpandedSection(prev => (prev === sectionId ? null : sectionId));
  };

  const handleLessonPlay = (lesson: ILesson) => {
    if (lesson.isFree || isEnrolled) {
      navigate(buildPlayerUrl(slug as string, lesson._id));
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
        
        {/* LEFT COLUMN (70%) */}
        <div className="w-full lg:w-[70%]">
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[36px] text-white leading-tight mb-6">
            {course.title}
          </h1>

          {/* Thumbnail Preview */}
          <div className="aspect-video relative overflow-hidden rounded-xl mb-8 border-[5px] border-[#ff6b00]/80 shadow-2xl">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#262626]" />
            )}
          </div>
          
          {/* Description (rendered safely if it contains HTML, but for now we assume plain text or use dangerouslySetInnerHTML if rich text) */}
          <div 
            className="font-['Inter'] text-[#a3a3a3] text-[16px] mb-8 leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-6 mb-12">
            <div className="flex items-center gap-2 text-white font-['Inter']">
              <BookOpen className="w-5 h-5 text-[#ff6b00]" />
              <span>{course.totalLessons} Lessons</span>
            </div>
            <div className="flex items-center gap-2 text-white font-['Inter']">
              <Clock className="w-5 h-5 text-[#ff6b00]" />
              <span>{formatDuration(course.totalDuration)}</span>
            </div>
            <div className="flex items-center gap-2 text-white font-['Inter']">
              <Users className="w-5 h-5 text-[#ff6b00]" />
              <span>Students Enrolled</span>
            </div>
          </div>

          {/* Curriculum Accordion */}
          <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl text-white mb-6">Course Curriculum</h2>
          <div className="space-y-4">
            {course.sections.map((section: ISection, sIdx: number) => (
              <div key={section._id} className="bg-[#131313] border border-[#262626] rounded-[12px] overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section._id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-[#1a1a1a] transition-colors focus:outline-none"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-['Plus_Jakarta_Sans'] text-white font-semibold text-lg text-left">
                      Section {sIdx + 1}: {section.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-['Inter'] text-[#a3a3a3] text-sm hidden sm:block">
                      {section.lessons.length} lessons • {formatDuration(section.lessons.reduce((acc: number, l: ILesson) => acc + (l.duration || 0), 0))}
                    </span>
                    {expandedSection === section._id ? (
                      <ChevronUp className="w-5 h-5 text-white" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white" />
                    )}
                  </div>
                </button>

                {/* Section Content (Lessons) */}
                {expandedSection === section._id && (
                  <div className="border-t border-[#262626] bg-[#0a0a0a]">
                    {section.lessons.map((lesson: ILesson, lIdx: number) => {
                      const isAccessible = lesson.isFree || isEnrolled;
                      return (
                        <div key={lesson._id} className="flex flex-col border-b border-[#262626] last:border-0">
                          <div 
                            className={cn(
                              "flex items-center justify-between p-4 group transition-colors",
                              isAccessible ? "hover:bg-[#131313] cursor-pointer" : "opacity-75 cursor-default"
                            )}
                            onClick={() => handleLessonPlay(lesson)}
                            title={!isAccessible ? "Enroll to access" : undefined}
                          >
                            <div className="flex items-center gap-3">
                              {isAccessible ? (
                                <Play className="w-4 h-4 text-[#ff6b00]" />
                              ) : (
                                <Lock className="w-4 h-4 text-gray-500" />
                              )}
                              <span className={cn(
                                "font-['Inter'] text-[15px]",
                                isAccessible ? "text-gray-200 group-hover:text-white" : "text-gray-500"
                              )}>
                                {lIdx + 1}. {lesson.title}
                              </span>
                              {lesson.isFree && !isEnrolled && (
                                <span className="bg-[#ff6b00] text-black text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-2">
                                  Preview
                                </span>
                              )}
                            </div>
                            <span className="font-['Inter'] text-[#a3a3a3] text-sm">
                              {formatDuration(lesson.duration)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN (30%) - Sticky */}
        <div className="w-full lg:w-[30%]">
          <div className="bg-[#131313] border border-[#262626] rounded-[12px] p-6 lg:sticky lg:top-24 shadow-2xl">


            {/* Price */}
            <div className="mb-6">
              <div className="font-['Plus_Jakarta_Sans'] font-bold text-white text-[28px]">
                {course.price > 0 ? formatPrice(course.price) : <span className="text-[#ff6b00]">Free</span>}
              </div>
            </div>

            {/* Actions */}
            <EnrollButton
              courseId={course._id}
              courseSlug={course.slug}
              price={course.price}
              isEnrolled={isEnrolled}
              isLoggedIn={isAuthenticated}
              firstLessonId={course.sections?.[0]?.lessons?.[0]?._id}
            />

            {/* Bullet Points */}
            <div className="mt-8 border-t border-[#262626] pt-6">
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-white text-lg mb-4">This course includes:</h3>
              <ul className="space-y-3 font-['Inter'] text-[#a3a3a3] text-sm">
                <li className="flex items-center gap-3">
                  <Play className="w-4 h-4 text-[#ff6b00]" />
                  <span>{formatDuration(course.totalDuration)} on-demand video</span>
                </li>
                <li className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-[#ff6b00]" />
                  <span>{course.totalLessons} comprehensive lessons</span>
                </li>
                <li className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-[#ff6b00]" />
                  <span>Full lifetime access</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
