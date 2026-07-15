import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle2, Star } from 'lucide-react';
import { formatPrice, formatDuration, cn } from '../../Utils/helpers';
import { isDiscountActive } from '../../Utils/price';
import type { ICourse } from '../../types/course.types';
import { CardSpotlight } from './CardSpotlight';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CourseCardProps {
  course: ICourse;
  isEnrolled?: boolean;
  /** Override click — defaults to navigate /courses/:slug */
  onClick?: () => void;
  className?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export const CourseCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl overflow-hidden animate-pulse shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
      className
    )}
  >
    <div className="aspect-video bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a]" />
    <div className="p-6 space-y-4">
      <div className="h-6 bg-[#1a1a1a] rounded w-3/4" />
      <div className="h-4 bg-[#1a1a1a] rounded w-1/2" />
      <div className="pt-5 flex justify-between border-t border-[#1f1f1f]">
        <div className="h-6 bg-[#1a1a1a] rounded w-1/4" />
        <div className="h-4 bg-[#1a1a1a] rounded w-1/4" />
      </div>
    </div>
  </div>
);

// ─── Card ─────────────────────────────────────────────────────────────────────

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isEnrolled = false,
  onClick,
  className,
}) => {
  const navigate = useNavigate();

  const hasDiscount = isDiscountActive(course.discountPercent, course.discountExpiresAt);
  const isFree = course.effectivePrice === 0 || course.price === 0;

  const handleClick = onClick ?? (() => navigate(`/courses/${course.slug}`));

  // Deterministic rating (e.g. 4.7 to 4.9) and review count based on course ID/title
  const rating = ((course._id.charCodeAt(course._id.length - 1) % 3) * 0.1 + 4.7).toFixed(1);
  const reviewsCount = (course._id.charCodeAt(0) % 80) + 120;

  return (
    <CardSpotlight className="h-full">
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        className={cn(
          'bg-[#0c0c0e]/95 border rounded-2xl overflow-hidden cursor-pointer group',
          'flex flex-col h-full transition-all duration-300 relative',
          'shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md',
          isEnrolled
            ? 'border-emerald-500/20 hover:border-emerald-500/60'
            : 'border-[#1e1e24] hover:border-[#ff6b00]/50 hover:shadow-[0_0_30px_rgba(255,107,0,0.15)]',
          className
        )}
      >
        {/* ── Thumbnail ── */}
        <div className="aspect-video relative overflow-hidden flex-shrink-0 bg-surface-dim">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0c0c0e] to-[#1e1e24] flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-[#303038]" />
            </div>
          )}

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-[#1e1e24] px-2.5 py-1 rounded-full flex items-center gap-1 z-10 shadow-md">
            <Star className="w-3.5 h-3.5 text-[#ff6b00] fill-[#ff6b00]" />
            <span className="text-[12px] font-bold text-white leading-none">{rating}</span>
            <span className="text-[10px] text-gray-400">({reviewsCount})</span>
          </div>

          {/* Enrolled badge */}
          {isEnrolled && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider font-['Inter']">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Enrolled
            </div>
          )}

          {/* Discount / Free badge */}
          {!isEnrolled && (
            isFree ? (
              <div className="absolute top-3 left-3 bg-[#ff6b00] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider font-['Inter']">
                Free
              </div>
            ) : hasDiscount ? (
              <div className="absolute top-3 left-3 bg-[#ff6b00] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider font-['Inter']">
                -{course.discountPercent}%
              </div>
            ) : null
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-6 flex flex-col flex-1">
          <h3
            className={cn(
              "font-['Plus_Jakarta_Sans'] font-semibold text-[17px] leading-snug line-clamp-2 mb-2 transition-colors duration-200",
              isEnrolled
                ? 'text-white group-hover:text-emerald-400'
                : 'text-white group-hover:text-[#ff6b00]'
            )}
          >
            {course.title}
          </h3>

          <p className="font-['Inter'] text-[#8e8e93] text-[13px] mb-5">
            By {course.instructor?.firstName} {course.instructor?.lastName}
          </p>

          {/* ── Footer ── */}
          <div className="mt-auto pt-4 border-t border-[#1e1e24] flex items-center justify-between">
            {/* Price section */}
            <div className="flex flex-col">
              {isEnrolled ? (
                <span className="flex items-center gap-1.5 font-['Plus_Jakarta_Sans'] font-semibold text-emerald-400 text-[14px]">
                  <CheckCircle2 className="w-4 h-4" />
                  Purchased
                </span>
              ) : isFree ? (
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-[#ff6b00] text-[17px]">
                  Free
                </span>
              ) : hasDiscount ? (
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[#ff6b00] text-[17px]">
                    {formatPrice(course.discountedPrice ?? course.effectivePrice!)}
                  </span>
                  <span className="font-['Inter'] text-[#8e8e93] text-[13px] line-through">
                    {formatPrice(course.price)}
                  </span>
                </div>
              ) : (
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-white text-[17px]">
                  {formatPrice(course.price)}
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-[#8e8e93] text-[13px] font-['Inter']">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-gray-500" />
                {course.totalLessons} {course.totalLessons === 1 ? 'lesson' : 'lessons'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-500" />
                {formatDuration(course.totalDuration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </CardSpotlight>
  );
};

export default CourseCard;
