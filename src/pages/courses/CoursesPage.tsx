import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { getAllCourses } from '../../crud/course.crud';
import { formatPrice, formatDuration } from '../../Utils/helpers';
import { coursesPageSeo } from '../../seo/seo.courses.config';
import type { ICourse } from '../../types/course.types';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // SEO Update
  useEffect(() => {
    document.title = coursesPageSeo.title;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', coursesPageSeo.description);
  }, []);

  const { data: courses, isLoading, isError } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await getAllCourses();
      return res.data.data;
    },
  });

  const filteredCourses = React.useMemo(() => {
    if (!courses) return [];
    return courses.filter((course: ICourse) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <h1 className="font-['Plus_Jakarta_Sans'] text-[32px] font-bold text-white">
            Explore Courses
          </h1>
          
          <div className="relative w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#a3a3a3]" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#131313] border border-[#262626] text-white font-['Inter'] rounded-[8px] py-3 pl-11 pr-4 focus:outline-none focus:border-[#ff6b00] transition-colors placeholder-[#a3a3a3]"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#131313] border border-[#262626] rounded-[12px] overflow-hidden animate-pulse">
                <div className="aspect-video bg-gradient-to-br from-[#131313] to-[#262626]" />
                <div className="p-5 space-y-4">
                  <div className="h-6 bg-[#262626] rounded w-3/4" />
                  <div className="h-4 bg-[#262626] rounded w-1/2" />
                  <div className="pt-4 flex justify-between">
                    <div className="h-6 bg-[#262626] rounded w-1/4" />
                    <div className="h-6 bg-[#262626] rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-[#ff6b00] mb-4" />
            <p className="font-['Plus_Jakarta_Sans'] text-white text-xl font-semibold mb-2">Failed to load courses</p>
            <p className="font-['Inter'] text-[#a3a3a3]">Please try again later.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen className="w-16 h-16 text-[#a3a3a3] mb-6" />
            <h3 className="font-['Plus_Jakarta_Sans'] text-white text-2xl font-semibold mb-2">
              No courses available yet
            </h3>
            <p className="font-['Inter'] text-[#a3a3a3]">
              {searchTerm ? "We couldn't find any courses matching your search." : "Check back later for new premium courses."}
            </p>
          </div>
        )}

        {/* Course Grid */}
        {!isLoading && !isError && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course: ICourse) => (
              <div
                key={course._id}
                onClick={() => navigate(`/courses/${course.slug}`)}
                className="bg-[#131313] border border-[#262626] rounded-[12px] overflow-hidden cursor-pointer group hover:border-[#ff6b00]/50 transition-colors flex flex-col h-full"
              >
                {/* Thumbnail */}
                <div className="aspect-video relative overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#131313] to-[#262626]" />
                  )}
                  {course.price === 0 && (
                    <div className="absolute top-3 right-3 bg-[#ff6b00] text-white text-[12px] font-bold px-2.5 py-1 rounded-[8px] uppercase tracking-wider">
                      Free
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-white text-[18px] leading-tight line-clamp-2 mb-2 group-hover:text-[#ff6b00] transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="font-['Inter'] text-[#a3a3a3] text-[14px] mb-4">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </p>

                  <div className="mt-auto pt-4 border-t border-[#262626] flex items-center justify-between">
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-white text-[18px]">
                      {course.price > 0 ? formatPrice(course.price) : 'Free'}
                    </span>
                    
                    <div className="flex items-center gap-3 text-[#a3a3a3] text-[14px] font-['Inter']">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.totalLessons}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(course.totalDuration)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
