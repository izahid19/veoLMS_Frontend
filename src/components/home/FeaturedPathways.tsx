import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getAllCourses } from '../../crud/course.crud';
import { CourseCard, CourseCardSkeleton } from '../ui/CourseCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 60, damping: 15 } }
};

export const FeaturedPathways = () => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['featuredCourses'],
    queryFn: async () => {
      const res = await getAllCourses({ isFeatured: true });
      return res.data.data;
    }
  });

  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-padding">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="font-display-lg text-4xl md:text-5xl text-on-surface font-bold tracking-tight mb-4">Featured Pathways</h2>
        <p className="font-body-lg text-on-surface-variant text-lg">Accelerate your career with our top-rated curriculum.</p>
      </motion.div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </div>
      ) : courses && courses.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {courses.map((course) => (
            <motion.div key={course._id} variants={itemVariants}>
              <CourseCard course={course} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center py-16 px-6 glass-panel rounded-2xl bg-[#0c0c0e]/80 border border-[#1e1e24] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <div className="max-w-md mx-auto space-y-4">
            <p className="text-on-surface text-lg font-semibold font-['Plus_Jakarta_Sans']">No pathways are currently featured</p>
            <p className="text-sm text-[#8e8e93] font-['Inter']">
              To feature courses here, go to the Admin Panel, edit a course, toggle **"Featured Course"** to on, and save changes.
            </p>
          </div>
        </motion.div>
      )}
    </section>
  );
};
