import axiosInstance from '../lib/axios';
import type { IEnrollment, ICourseDetail, ILessonWatchResponse } from '../types/course.types';

export const getMyEnrollments = async (): Promise<IEnrollment[]> => {
  try {
    const response = await axiosInstance.get('/enrollments/my');
    // Backend returns [{ enrollment, progress }] - we extract the enrollment object
    return response.data.data.map((item: any) => item.enrollment || item);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const checkEnrollment = async (courseId: string): Promise<{ isEnrolled: boolean }> => {
  const response = await axiosInstance.get(`/enrollments/check/${courseId}`);
  return response.data.data;
};

export const getEnrolledCourseDetail = async (slug: string): Promise<ICourseDetail & { enrollment: IEnrollment }> => {
  const response = await axiosInstance.get(`/enrollments/course/${slug}`);
  return response.data.data;
};

export const getLessonForWatch = async (lessonId: string): Promise<ILessonWatchResponse> => {
  const response = await axiosInstance.get(`/lessons/${lessonId}/watch`);
  return response.data.data;
};
