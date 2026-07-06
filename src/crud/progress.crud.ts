import axiosInstance from '../lib/axios';
import type { ICourseProgress, IProgress } from '../types/course.types';

export const getCourseProgress = async (courseId: string): Promise<ICourseProgress> => {
  const response = await axiosInstance.get(`/api/progress/${courseId}`);
  return response.data;
};

export const updateProgress = async (
  lessonId: string,
  data: { watchedSeconds: number; completed: boolean }
): Promise<IProgress> => {
  const response = await axiosInstance.patch(`/api/progress/${lessonId}`, data);
  return response.data;
};

export const getLastWatchedLesson = async (
  courseId: string
): Promise<{ lessonId: string; watchedSeconds: number } | null> => {
  const response = await axiosInstance.get(`/api/progress/${courseId}/last-watched`);
  return response.data;
};
