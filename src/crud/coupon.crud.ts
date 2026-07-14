import axiosInstance from '../lib/axios';
import type { ICoupon, ICouponValidateResponse } from '../types/course.types';

const ADMIN_COUPONS_URL = '/admin/coupons';

export const validateCoupon = (code: string, courseId: string) => {
  return axiosInstance.post<{ success: boolean; data: ICouponValidateResponse }>('/coupons/validate', { code, courseId });
};

export const adminGetAllCoupons = () => {
  return axiosInstance.get<{ success: boolean; data: ICoupon[] }>(ADMIN_COUPONS_URL);
};

export const adminCreateCoupon = (data: Partial<ICoupon>) => {
  return axiosInstance.post<{ success: boolean; data: ICoupon }>(ADMIN_COUPONS_URL, data);
};

export const adminUpdateCoupon = (id: string, data: Partial<ICoupon>) => {
  return axiosInstance.put<{ success: boolean; data: ICoupon }>(`${ADMIN_COUPONS_URL}/${id}`, data);
};

export const adminDeleteCoupon = (id: string) => {
  return axiosInstance.delete<{ success: boolean; data: ICoupon }>(`${ADMIN_COUPONS_URL}/${id}`);
};

export const adminToggleCoupon = (id: string) => {
  return axiosInstance.patch<{ success: boolean; data: ICoupon }>(`${ADMIN_COUPONS_URL}/${id}/toggle`);
};
