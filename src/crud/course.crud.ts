import axiosInstance from '../lib/axios';
import type {
  ICourse,
  ICourseDetail,
  ISection,
  ILesson,
  CreateCoursePayload,
  UpdateCoursePayload,
  CreateSectionPayload,
  UpdateSectionPayload,
  CreateLessonPayload,
  UpdateLessonPayload,
  IPriceBreakdown,
} from '../types/course.types';

const COURSES_URL = '/courses';
const ADMIN_COURSES_URL = '/admin/courses';
const ADMIN_SECTIONS_URL = '/admin/sections';
const ADMIN_LESSONS_URL = '/admin/lessons';

// ─── Public Endpoints ─────────────────────────────────────────────────────────

/**
 * Fetch all published courses.
 */
export const getAllCourses = (params?: { isFeatured?: boolean }) => {
  return axiosInstance.get<{ success: boolean; data: ICourse[] }>(COURSES_URL, { params });
};

/**
 * Fetch a single course by slug, including its full curriculum (sections + lessons).
 */
export const getCourseBySlug = (slug: string) => {
  return axiosInstance.get<{ success: boolean; data: { course: ICourseDetail, sections: ISection[], priceBreakdown: IPriceBreakdown } }>(`${COURSES_URL}/${slug}`);
};

// ─── Admin — Courses ──────────────────────────────────────────────────────────

/**
 * Fetch all courses (published and unpublished). Requires admin role.
 */
export const adminGetAllCourses = () => {
  return axiosInstance.get<{ success: boolean; data: ICourse[] }>(ADMIN_COURSES_URL);
};

/**
 * Fetch a single course by ID with its full curriculum. Requires admin role.
 */
export const adminGetCourseById = (id: string) => {
  return axiosInstance.get<{ success: boolean; data: ICourseDetail }>(`${ADMIN_COURSES_URL}/${id}`);
};

export const adminGetAllInstructors = () => {
  return axiosInstance.get<{ success: boolean; data: any[] }>(`/admin/instructors`);
};

/**
 * Create a new course. Requires admin role.
 */
export const adminCreateCourse = (data: CreateCoursePayload) => {
  return axiosInstance.post<{ success: boolean; data: ICourse }>(ADMIN_COURSES_URL, data);
};

/**
 * Update an existing course by ID. Requires admin role.
 */
export const adminUpdateCourse = (id: string, data: UpdateCoursePayload) => {
  return axiosInstance.put<{ success: boolean; data: ICourse }>(`${ADMIN_COURSES_URL}/${id}`, data);
};

/**
 * Delete a course and all related data (sections, lessons, enrollments, etc.).
 */
export const adminDeleteCourse = (id: string) => {
  return axiosInstance.delete<{ success: boolean; message: string }>(`${ADMIN_COURSES_URL}/${id}`);
};

/**
 * Toggle the published status of a course.
 */
export const adminTogglePublish = (id: string) => {
  return axiosInstance.patch<{ success: boolean; data: ICourse }>(`${ADMIN_COURSES_URL}/${id}/publish`);
};

/**
 * Toggle the featured status of a course.
 */
export const adminToggleFeatured = (id: string) => {
  return axiosInstance.patch<{ success: boolean; data: ICourse }>(`${ADMIN_COURSES_URL}/${id}/featured`);
};

/**
 * Upload or replace the course thumbnail image.
 * Sends as multipart/form-data.
 */
export const adminUploadThumbnail = (id: string, file: File) => {
  const formData = new FormData();
  formData.append('thumbnail', file); // field name matches multer's uploadThumbnail config
  return axiosInstance.put<{ success: boolean; data: ICourse }>(
    `${ADMIN_COURSES_URL}/${id}/thumbnail`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
};

/**
 * Upload or replace the course trailer video.
 * Sends as multipart/form-data.
 */
export const adminUploadTrailer = (
  id: string,
  file: File,
  onProgress?: (event: { loaded: number; total?: number }) => void,
) => {
  const formData = new FormData();
  formData.append('video', file); // field name matches multer's uploadVideo config

  return axiosInstance.put<{ success: boolean; data: ICourse }>(
    `${ADMIN_COURSES_URL}/${id}/trailer`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          onProgress({ loaded: progressEvent.loaded, total: progressEvent.total });
        }
      },
    },
  );
};

// ─── Admin — Sections ─────────────────────────────────────────────────────────

/**
 * Create a new section inside a course.
 */
export const adminCreateSection = (courseId: string, data: CreateSectionPayload) => {
  return axiosInstance.post<{ success: boolean; data: ISection }>(
    `${ADMIN_COURSES_URL}/${courseId}/sections`,
    data,
  );
};

/**
 * Update a section by ID.
 */
export const adminUpdateSection = (id: string, data: UpdateSectionPayload) => {
  return axiosInstance.put<{ success: boolean; data: ISection }>(`${ADMIN_SECTIONS_URL}/${id}`, data);
};

/**
 * Delete a section and cascade-delete all its lessons.
 */
export const adminDeleteSection = (id: string) => {
  return axiosInstance.delete<{ success: boolean; message: string }>(`${ADMIN_SECTIONS_URL}/${id}`);
};

// ─── Admin — Lessons ──────────────────────────────────────────────────────────

/**
 * Create a new lesson inside a section.
 * courseId must be included in the payload.
 */
export const adminCreateLesson = (sectionId: string, data: CreateLessonPayload) => {
  return axiosInstance.post<{ success: boolean; data: ILesson }>(
    `${ADMIN_SECTIONS_URL}/${sectionId}/lessons`,
    data,
  );
};

/**
 * Update a lesson by ID.
 */
export const adminUpdateLesson = (id: string, data: UpdateLessonPayload) => {
  return axiosInstance.put<{ success: boolean; data: ILesson }>(`${ADMIN_LESSONS_URL}/${id}`, data);
};

/**
 * Delete a lesson and its associated Bunny Stream video.
 */
export const adminDeleteLesson = (id: string) => {
  return axiosInstance.delete<{ success: boolean; message: string }>(`${ADMIN_LESSONS_URL}/${id}`);
};

/**
 * Upload or replace the video for a lesson.
 * Accepts an optional onProgress callback that receives the raw AxiosProgressEvent
 * so callers can compute percentage, speed, and ETA themselves.
 */
export const adminUploadLessonVideo = (
  lessonId: string,
  file: File,
  onProgress?: (event: { loaded: number; total?: number }) => void,
) => {
  const formData = new FormData();
  formData.append('video', file); // field name matches multer's uploadVideo config

  return axiosInstance.put<{ success: boolean; data: ILesson }>(
    `${ADMIN_LESSONS_URL}/${lessonId}/video`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          onProgress({ loaded: progressEvent.loaded, total: progressEvent.total });
        }
      },
    },
  );
};

export const adminCreateInstructor = (data: {
  firstName: string;
  lastName: string;
  emailId: string;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    youtube?: string;
  };
}) => {
  return axiosInstance.post<{ success: boolean; data: any }>('/admin/instructors', data);
};

export const adminUpdateInstructor = (id: string, data: {
  firstName: string;
  lastName: string;
  emailId: string;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    youtube?: string;
  };
}) => {
  return axiosInstance.put<{ success: boolean; data: any }>(`/admin/instructors/${id}`, data);
};

export const adminDeleteInstructor = (id: string) => {
  return axiosInstance.delete<{ success: boolean; data: any }>(`/admin/instructors/${id}`);
};

export const adminUploadInstructorAvatar = (id: string, file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return axiosInstance.put<{ success: boolean; data: any }>(`/admin/instructors/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
