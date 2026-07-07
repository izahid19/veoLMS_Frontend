// ─── Lesson ───────────────────────────────────────────────────────────────────

export interface ILesson {
  _id: string;
  title: string;
  order: number;
  isFree: boolean;
  duration: number;
  videoUrl?: string; // only returned if enrolled or isFree
  videoPublicId?: string;
  content?: string;
  resources?: { title: string; url: string }[];
}

export interface ILessonWatchResponse {
  canAccess: boolean;
  lesson?: ILesson & { videoUrl: string };
  isFree?: boolean;
  reason?: 'login_required' | 'not_enrolled';
  courseSlug?: string;
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
  content?: string;
  resources?: { title: string; url: string }[];
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
  lastWatchedLesson: { lessonId: string; watchedSeconds: number } | null;
  progresses: IProgress[];
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface IPayment {
  _id: string;
  student: { _id: string; firstName: string; lastName: string; emailId: string };
  course: ICourse;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface ICreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  courseName: string;
  courseId: string;
  keyId: string;
}
