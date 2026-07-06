import axiosInstance from '../lib/axios';
import type { IEnrollment, ICourseDetail } from '../types/course.types';

export const getMyEnrollments = async (): Promise<IEnrollment[]> => {
  try {
    const response = await axiosInstance.get('/api/enrollments/my');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const checkEnrollment = async (courseId: string): Promise<{ isEnrolled: boolean }> => {
  const response = await axiosInstance.get(`/api/enrollments/check/${courseId}`);
  return response.data;
};

export const getEnrolledCourseDetail = async (slug: string): Promise<ICourseDetail & { enrollment: IEnrollment }> => {
  const response = await axiosInstance.get(`/api/enrollments/course/${slug}`);
  return response.data;
};
