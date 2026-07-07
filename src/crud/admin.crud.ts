import axiosInstance from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { 
  IAdminStats, 
  IPaginatedResponse, 
  IStudentDetail, 
  IStudentDetailResponse,
  IAdminEnrollment,
  IAdminPayment
} from '../types/admin.types';

export const getAdminStats = async (): Promise<ApiResponse<IAdminStats>> => {
  const response = await axiosInstance.get<ApiResponse<IAdminStats>>('/admin/stats');
  return response.data;
};

export const getAllStudents = async (
  page: number = 1,
  limit: number = 10
): Promise<IPaginatedResponse<IStudentDetail>> => {
  const response = await axiosInstance.get<IPaginatedResponse<IStudentDetail>>(
    `/admin/students?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getStudentDetail = async (
  id: string
): Promise<ApiResponse<IStudentDetailResponse>> => {
  const response = await axiosInstance.get<ApiResponse<IStudentDetailResponse>>(
    `/admin/students/${id}`
  );
  return response.data;
};

export const getAllEnrollments = async (
  page: number = 1,
  limit: number = 10
): Promise<IPaginatedResponse<IAdminEnrollment>> => {
  const response = await axiosInstance.get<IPaginatedResponse<IAdminEnrollment>>(
    `/admin/enrollments?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getAllPayments = async (
  page: number = 1,
  limit: number = 10
): Promise<IPaginatedResponse<IAdminPayment>> => {
  const response = await axiosInstance.get<IPaginatedResponse<IAdminPayment>>(
    `/admin/payments?page=${page}&limit=${limit}`
  );
  return response.data;
};
