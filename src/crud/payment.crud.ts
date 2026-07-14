import axiosInstance from '../lib/axios';
import type { ICreateOrderResponse, IPayment } from '../types/course.types';
import type { ApiResponse } from '../types/api.types';

export const createOrder = async (
  courseId: string,
  couponCode?: string
): Promise<ApiResponse<ICreateOrderResponse>> => {
  const response = await axiosInstance.post<ApiResponse<ICreateOrderResponse>>(
    '/payments/create-order',
    { courseId, couponCode }
  );
  return response.data;
};

export const verifyPayment = async (data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  courseId: string;
}): Promise<ApiResponse<{ success: boolean; courseSlug: string }>> => {
  const response = await axiosInstance.post<ApiResponse<{ success: boolean; courseSlug: string }>>(
    '/payments/verify',
    data
  );
  return response.data;
};

export const handleFailedPayment = async (
  razorpayOrderId: string
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post<ApiResponse<any>>('/payments/failed', {
    razorpayOrderId,
  });
  return response.data;
};

export const getMyPayments = async (): Promise<ApiResponse<IPayment[]>> => {
  const response = await axiosInstance.get<ApiResponse<IPayment[]>>('/payments/my');
  return response.data;
};
