import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Play, Lock, BookOpen, Clock, Users, ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import Plyr from "plyr";
import Hls from "hls.js";
import "plyr/dist/plyr.css";

import { getCourseBySlug } from "../../crud/course.crud";
import { checkEnrollment } from "../../crud/enrollment.crud";
import { formatPrice, formatDuration, cn, buildPlayerUrl } from "../../Utils/helpers";
import { isDiscountActive, getDiscountTimeLeft } from "../../Utils/price";
import { courseDetailSeo } from "../../seo/seo.courses.config";
import useAuthStore from "../../store/authStore";
import type { ICourseDetail, ISection, ILesson } from "../../types/course.types";
import EnrollButton from "../../components/ui/EnrollButton";

// -- Inline mini video preview component

function FreeLessonPreview({ videoUrl, thumbnail }: { videoUrl: string; thumbnail: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const plyrRef = useRef<Plyr | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;
    const video = videoRef.current;
    const isHls = videoUrl.includes(".m3u8");

    const player = new Plyr(video, {
      controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "fullscreen"],
    });
    plyrRef.current = player;

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({ startLevel: -1 });
      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setIsReady(true));
    } else if (isHls && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      setIsReady(true);
    } else {
      video.src = videoUrl;
      setIsReady(true);
    }

    return () => {
      hlsRef.current?.destroy();
      plyrRef.current?.destroy();
    };
  }, [videoUrl]);

  return (
    <div className="aspect-video relative overflow-hidden rounded-xl mb-8 border-[3px] border-[#ff6b00]/70 shadow-2xl bg-black">
      <style>{`:root { --plyr-color-main: #ff6b00; }`}</style>
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-[#ff6b00] text-white text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">
        <PlayCircle className="w-3.5 h-3.5" /> Free Preview
      </div>
      <video ref={videoRef} poster={thumbnail} className="w-full h-full" playsInline />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
          <div className="w-14 h-14 rounded-full border-2 border-[#262626] border-t-[#ff6b00] animate-spin" />
        </div>
      )}
    </div>
  );
}

// -- Page

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { data: course, isLoading: isCourseLoading, isError: isCourseError } = useQuery<ICourseDetail>({
    queryKey: ["course", slug],
    queryFn: async () => {
      const res = await getCourseBySlug(slug as string);
      const data = res.data.data;
      return { ...data.course, sections: data.sections, priceBreakdown: data.priceBreakdown };
    },
    enabled: !!slug,
  });

  const { data: enrollmentData } = useQuery({
    queryKey: ["enrollment-check", course?._id],
    queryFn: () => checkEnrollment(course?._id as string),
    enabled: !!course?._id && isAuthenticated,
    staleTime: 0,
  });

  const isEnrolled = enrollmentData?.isEnrolled ?? false;

  useEffect(() => {
    if (course) {
      const seo = courseDetailSeo(course.title, course.description);
      document.title = seo.title;
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
      meta.setAttribute("content", seo.description);
    }
  }, [course]);

  const firstFreeLesson = course?.sections?.flatMap((s: ISection) => s.lessons).find((l: ILesson) => l.isFree && l.videoUrl);

  if (isCourseLoading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[70%] space-y-6 animate-pulse">
            <div className="h-10 bg-[#131313] border border-[#262626] rounded-md w-3/4"></div>
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#131313] border border-[#262626]"></div><div className="h-5 bg-[#131313] border border-[#262626] rounded-md w-40"></div></div>
            <div className="h-20 bg-[#131313] border border-[#262626] rounded-md w-full"></div>
            <div className="h-64 bg-[#131313] border border-[#262626] rounded-xl w-full"></div>
          </div>
          <div className="w-full lg:w-[30%] animate-pulse"><div className="h-[400px] bg-[#131313] border border-[#262626] rounded-xl w-full"></div></div>
        </div>
      </div>
    );
  }

  if (isCourseError || !course) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center pt-24 pb-16 px-4">
        <h2 className="font-['Plus_Jakarta_Sans'] text-white text-3xl font-bold mb-4">Course not found</h2>
        <button onClick={() => navigate("/courses")} className="bg-[#262626] text-white px-6 py-2 rounded-lg font-['Inter'] hover:bg-[#333] transition-colors">Back to Courses</button>
      </div>
    );
  }

  const toggleSection = (id: string) => setExpandedSection(prev => prev === id ? null : id);
  const handleLessonPlay = (lesson: ILesson) => { if (lesson.isFree || isEnrolled) navigate(buildPlayerUrl(slug as string, lesson._id)); };

  const instructorName = `${course.instructor?.firstName || ""} ${course.instructor?.lastName || ""}`.trim();
  const instructorInitials = `${course.instructor?.firstName?.[0] || ""}${course.instructor?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 relative">

        {/* LEFT COLUMN */}
        <div className="w-full lg:w-[70%]">
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[36px] text-white leading-tight mb-4">{course.title}</h1>

          {/* Instructor Card */}
          {course.instructor && (
            <div className="flex items-center gap-3 mb-6 p-3 bg-[#131313] border border-[#262626] rounded-xl w-fit">
              {course.instructor.avatar ? (
                <img src={course.instructor.avatar} alt={instructorName} className="w-9 h-9 rounded-full object-cover border border-[#262626] flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#ff6b00]/20 border border-[#ff6b00]/30 flex items-center justify-center flex-shrink-0">
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[#ff6b00] text-[12px]">{instructorInitials}</span>
                </div>
              )}
              <div>
                <p className="font-['Plus_Jakarta_Sans'] font-semibold text-white text-[14px] leading-tight">{instructorName}</p>
                <p className="font-['Inter'] text-[#a3a3a3] text-[12px]">Course Instructor</p>
              </div>
            </div>
          )}

          {/* Preview Video or Thumbnail */}
          {firstFreeLesson?.videoUrl ? (
            <FreeLessonPreview key={firstFreeLesson._id} videoUrl={firstFreeLesson.videoUrl} thumbnail={course.thumbnail} />
          ) : (
            <div className="aspect-video relative overflow-hidden rounded-xl mb-8 border-[5px] border-[#ff6b00]/80 shadow-2xl">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#262626]" />
              )}
            </div>
          )}

          {/* Description */}
          <div className="font-['Inter'] text-[#a3a3a3] text-[16px] mb-8 leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-6 mb-12">
            <div className="flex items-center gap-2 text-white font-['Inter']"><BookOpen className="w-5 h-5 text-[#ff6b00]" /><span>{course.totalLessons} Lessons</span></div>
            <div className="flex items-center gap-2 text-white font-['Inter']"><Clock className="w-5 h-5 text-[#ff6b00]" /><span>{formatDuration(course.totalDuration)}</span></div>
            <div className="flex items-center gap-2 text-white font-['Inter']">
              <Users className="w-5 h-5 text-[#ff6b00]" />
              <span>{(course as any).enrollmentCount > 0 ? `${(course as any).enrollmentCount.toLocaleString()} Students Enrolled` : "Students Enrolled"}</span>
            </div>
          </div>

          {/* Curriculum */}
          <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl text-white mb-6">Course Curriculum</h2>
          <div className="space-y-4">
            {course.sections.map((section: ISection, sIdx: number) => (
              <div key={section._id} className="bg-[#131313] border border-[#262626] rounded-[12px] overflow-hidden">
                <button onClick={() => toggleSection(section._id)} className="w-full flex items-center justify-between p-5 hover:bg-[#1a1a1a] transition-colors focus:outline-none">
                  <span className="font-['Plus_Jakarta_Sans'] text-white font-semibold text-lg text-left">Section {sIdx + 1}: {section.title}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-['Inter'] text-[#a3a3a3] text-sm hidden sm:block">{section.lessons.length} lessons • {formatDuration(section.lessons.reduce((acc: number, l: ILesson) => acc + (l.duration || 0), 0))}</span>
                    {expandedSection === section._id ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
                  </div>
                </button>
                {expandedSection === section._id && (
                  <div className="border-t border-[#262626] bg-[#0a0a0a]">
                    {section.lessons.map((lesson: ILesson, lIdx: number) => {
                      const isAccessible = lesson.isFree || isEnrolled;
                      return (
                        <div key={lesson._id} className="flex flex-col border-b border-[#262626] last:border-0">
                          <div className={cn("flex items-center justify-between p-4 group transition-colors", isAccessible ? "hover:bg-[#131313] cursor-pointer" : "opacity-75 cursor-default")} onClick={() => handleLessonPlay(lesson)} title={!isAccessible ? "Enroll to access" : undefined}>
                            <div className="flex items-center gap-3">
                              {isAccessible ? <Play className="w-4 h-4 text-[#ff6b00]" /> : <Lock className="w-4 h-4 text-gray-500" />}
                              <span className={cn("font-['Inter'] text-[15px]", isAccessible ? "text-gray-200 group-hover:text-white" : "text-gray-500")}>{lIdx + 1}. {lesson.title}</span>
                              {lesson.isFree && !isEnrolled && <span className="bg-[#ff6b00] text-black text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-2">Preview</span>}
                            </div>
                            <span className="font-['Inter'] text-[#a3a3a3] text-sm">{formatDuration(lesson.duration)}</span>
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

        {/* RIGHT COLUMN - Sticky */}
        <div className="w-full lg:w-[30%]">
          <div className="bg-[#131313] border border-[#262626] rounded-[12px] p-6 lg:sticky lg:top-24 shadow-2xl">
            {/* Price */}
            <div className="mb-6 flex flex-col">
              {course.priceBreakdown?.isFree || course.price === 0 ? (
                <div className="font-['Plus_Jakarta_Sans'] font-bold text-[#ff6b00] text-[32px]">Free</div>
              ) : isDiscountActive(course.discountPercent, course.discountExpiresAt) ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-[#ff6b00] text-[32px]">{formatPrice(course.priceBreakdown?.discountedPrice || 0)}</span>
                    <span className="font-['Plus_Jakarta_Sans'] text-[#a3a3a3] text-[20px] line-through">{formatPrice(course.price)}</span>
                    <span className="bg-[#ff6b00] text-white text-[12px] font-bold px-2.5 py-1 rounded-[8px] uppercase tracking-wider">-{course.discountPercent}% OFF</span>
                  </div>
                  {course.discountExpiresAt && <div className="text-[#ff6b00] text-sm mt-1">? Offer ends in {getDiscountTimeLeft(course.discountExpiresAt)}</div>}
                </>
              ) : (
                <div className="font-['Plus_Jakarta_Sans'] font-bold text-white text-[32px]">{formatPrice(course.price)}</div>
              )}
              {course.price > 0 && course.taxPercent > 0 && <p className="text-[#a3a3a3] text-[12px] mt-2">Price inclusive of {course.taxPercent}% GST</p>}
            </div>

            <EnrollButton courseId={course._id} courseSlug={course.slug} price={course.price} isEnrolled={isEnrolled} isLoggedIn={isAuthenticated} firstLessonId={course.sections?.[0]?.lessons?.[0]?._id} />
            <div className="mt-3 flex items-center justify-center text-[#a3a3a3] text-[12px]">? 30-day money-back guarantee</div>

            <div className="mt-8 border-t border-[#262626] pt-6">
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-white text-lg mb-4">This course includes:</h3>
              <ul className="space-y-3 font-['Inter'] text-[#a3a3a3] text-sm">
                <li className="flex items-center gap-3"><Play className="w-4 h-4 text-[#ff6b00]" /><span>{formatDuration(course.totalDuration)} on-demand video</span></li>
                <li className="flex items-center gap-3"><BookOpen className="w-4 h-4 text-[#ff6b00]" /><span>{course.totalLessons} comprehensive lessons</span></li>
                <li className="flex items-center gap-3"><Lock className="w-4 h-4 text-[#ff6b00]" /><span>Full lifetime access</span></li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
