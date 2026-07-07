import axiosInstance from '../lib/axios';
import type { ICourseProgress, IProgress } from '../types/course.types';

export const getCourseProgress = async (courseId: string): Promise<ICourseProgress | null> => {
  try {
    const response = await axiosInstance.get(`/watch-record/${courseId}`);
    return response.data.data;
  } catch (err: any) {
    console.warn('[progress] Failed to fetch progress:', err?.response?.status);
    return null;
  }
};

export const updateProgress = async (
  lessonId: string,
  data: { watchedSeconds: number; completed?: boolean }
): Promise<IProgress | null> => {
  try {
    const response = await axiosInstance.patch(`/watch-record/${lessonId}`, data);
    return response.data.data;
  } catch (err: any) {
    // Silent fail — never interrupt video playback for progress errors
    console.warn('[progress] Failed to save progress:', err?.response?.status);
    return null;
  }
};

export const getLastWatchedLesson = async (
  courseId: string
): Promise<{ lessonId: string; watchedSeconds: number } | null> => {
  try {
    const response = await axiosInstance.get(`/watch-record/${courseId}/last-watched`);
    return response.data.data;
  } catch (err: any) {
    console.warn('[progress] Failed to fetch last watched lesson:', err?.response?.status);
    return null;
  }
};
