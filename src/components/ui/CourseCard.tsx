import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { formatPrice, formatDuration, cn } from '../../Utils/helpers';
import { isDiscountActive } from '../../Utils/price';
import type { ICourse } from '../../types/course.types';

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
      'bg-[#131313] border border-[#262626] rounded-xl overflow-hidden animate-pulse shadow-[0_4px_12px_rgba(0,0,0,0.5)]',
      className
    )}
  >
    <div className="aspect-video bg-gradient-to-br from-[#131313] to-[#262626]" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-[#262626] rounded w-3/4" />
      <div className="h-4 bg-[#262626] rounded w-1/2" />
      <div className="pt-4 flex justify-between border-t border-[#262626]">
        <div className="h-5 bg-[#262626] rounded w-1/4" />
        <div className="h-4 bg-[#262626] rounded w-1/4" />
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

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={cn(
        'bg-[#131313] border rounded-xl overflow-hidden cursor-pointer group',
        'flex flex-col h-full transition-colors duration-200',
        'shadow-[0_4px_12px_rgba(0,0,0,0.5)]',
        isEnrolled
          ? 'border-emerald-500/30 hover:border-emerald-500/60'
          : 'border-[#262626] hover:border-[#ff6b00]/40',
        className
      )}
    >
      {/* ── Thumbnail ── */}
      <div className="aspect-video relative overflow-hidden flex-shrink-0">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#131313] to-[#262626] flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-[#262626]" />
          </div>
        )}

        {/* Enrolled badge */}
        {isEnrolled && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider font-['Inter']">
            <CheckCircle2 className="w-3 h-3" />
            Enrolled
          </div>
        )}

        {/* Discount / Free badge */}
        {!isEnrolled && (
          isFree ? (
            <div className="absolute top-3 right-3 bg-[#ff6b00] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider font-['Inter']">
              Free
            </div>
          ) : hasDiscount ? (
            <div className="absolute top-3 right-3 bg-[#ff6b00] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider font-['Inter']">
              -{course.discountPercent}%
            </div>
          ) : null
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col flex-1">
        <h3
          className={cn(
            "font-['Plus_Jakarta_Sans'] font-semibold text-[17px] leading-snug line-clamp-2 mb-1.5 transition-colors",
            isEnrolled
              ? 'text-white group-hover:text-emerald-400'
              : 'text-white group-hover:text-[#ff6b00]'
          )}
        >
          {course.title}
        </h3>

        <p className="font-['Inter'] text-[#a3a3a3] text-[13px] mb-4">
          {course.instructor.firstName} {course.instructor.lastName}
        </p>

        {/* ── Footer ── */}
        <div className="mt-auto pt-4 border-t border-[#262626] flex items-center justify-between">
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
                <span className="font-['Inter'] text-[#a3a3a3] text-[13px] line-through">
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
          <div className="flex items-center gap-3 text-[#a3a3a3] text-[13px] font-['Inter']">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {course.totalLessons}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(course.totalDuration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
