import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourseProgress } from '../crud/progress.crud';
import { getCourseBySlug } from '../crud/course.crud';
import { buildPlayerUrl } from '../Utils/helpers';
import { toast } from '../Utils/toast';

export const useContinueLearning = (courseId: string, courseSlug: string, sections: any[]) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const [progRes, courseRes] = await Promise.allSettled([
        getCourseProgress(courseId),
        (!sections || sections.length === 0) ? getCourseBySlug(courseSlug) : Promise.resolve(null)
      ]);

      let targetLessonId = null;
      let loadedSections = sections;

      if (courseRes.status === 'fulfilled' && courseRes.value) {
        loadedSections = courseRes.value.data.data.sections;
      }

      const progress = progRes.status === 'fulfilled' ? progRes.value : null;

      if (progress && progress.lastWatchedLesson?.lessonId) {
        targetLessonId = progress.lastWatchedLesson.lessonId;
      } else if (loadedSections && loadedSections.length > 0 && loadedSections[0].lessons?.length > 0) {
        targetLessonId = loadedSections[0].lessons[0]._id;
      }

      if (targetLessonId) {
        navigate(buildPlayerUrl(courseSlug, targetLessonId));
      } else {
        toast.error('Course has no lessons yet');
      }
    } catch (error) {
      console.warn('Failed to fetch progress for continue learning', error);
      // Fallback to first lesson if progress fails
      if (sections && sections.length > 0 && sections[0].lessons?.length > 0) {
        navigate(buildPlayerUrl(courseSlug, sections[0].lessons[0]._id));
      } else {
        toast.error('Course has no lessons yet');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleContinue, isLoading };
};
