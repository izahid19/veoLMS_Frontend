export interface IAdminStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  totalEnrollments: number;
  recentEnrollments: any[];
}

export interface IStudentDetail {
  _id: string;
  firstName: string;
  lastName: string;
  emailId: string;
  avatar?: string;
  createdAt: string;
  enrollmentCount?: number;
}

export interface IStudentDetailResponse {
  user: IStudentDetail;
  enrollments: any[];
  totalSpent: number;
}

export interface IAdminEnrollment {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    emailId: string;
    avatar?: string;
  };
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    price: number;
  };
  payment?: {
    amount: number;
    status: string;
    createdAt: string;
  };
  enrolledAt: string;
}

export interface IAdminPayment {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    emailId: string;
    avatar?: string;
  };
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    price: number;
  };
  amount: number;
  status: string;
  razorpayOrderId: string;
  createdAt: string;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data?: any; // Just in case
  students?: T[];
  enrollments?: T[];
  payments?: T[];
  total: number;
  page: number;
  totalPages: number;
}
