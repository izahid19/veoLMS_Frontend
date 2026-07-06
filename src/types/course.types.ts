// ─── Lesson ───────────────────────────────────────────────────────────────────

export interface ILesson {
  _id: string;
  title: string;
  order: number;
  isFree: boolean;
  duration: number;
  videoUrl?: string; // only returned if enrolled or isFree
  videoPublicId?: string;
}

// ─── Section ──────────────────────────────────────────────────────────────────

export interface ISection {
  _id: string;
  title: string;
  order: number;
  lessons: ILesson[];
}

// ─── Course (list view) ───────────────────────────────────────────────────────

export interface ICourse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  price: number;
  isPublished: boolean;
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  totalLessons: number;
  totalDuration: number;
  createdAt: string;
}

// ─── Course Detail (with curriculum) ─────────────────────────────────────────

export interface ICourseDetail extends ICourse {
  sections: ISection[];
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface CreateCoursePayload {
  title: string;
  description: string;
  price: number;
  isPublished?: boolean;
}

export interface UpdateCoursePayload {
  title?: string;
  description?: string;
  price?: number;
  isPublished?: boolean;
}

export interface CreateSectionPayload {
  title: string;
  order?: number;
}

export interface UpdateSectionPayload {
  title?: string;
  order?: number;
}

export interface CreateLessonPayload {
  title: string;
  courseId: string;
  order?: number;
  isFree?: boolean;
}

export interface UpdateLessonPayload {
  title?: string;
  order?: number;
  isFree?: boolean;
  videoUrl?: string;
  videoPublicId?: string;
}

// ─── Enrollment ───────────────────────────────────────────────────────────────

export interface IEnrollment {
  _id: string;
  student: string;
  course: ICourse;
  enrolledAt: string;
  completedAt: string | null;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface IProgress {
  _id: string;
  student: string;
  course: string;
  lesson: string;
  watchedSeconds: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface ICourseProgress {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  lastWatchedLesson: string | null;
  progresses: IProgress[];
}
