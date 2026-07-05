import axiosInstance from '../lib/axios';

const BASE_URL = '/auth';

export const login = (data: any) => {
  return axiosInstance.post(`${BASE_URL}/login`, data);
};

export const logout = () => {
  return axiosInstance.post(`${BASE_URL}/logout`);
};

export const signup = (data: any) => {
  return axiosInstance.post(`${BASE_URL}/signup`, data);
};

export const checkUsername = (username: string) => {
  return axiosInstance.get(`${BASE_URL}/check-username?username=${username}`);
};

export const verifyOtp = (data: { emailId: string; otp: string }) => {
  return axiosInstance.post(`${BASE_URL}/verify-otp`, data);
};

export const resendOtp = (data: { emailId: string }) => {
  return axiosInstance.post(`${BASE_URL}/resend-otp`, data);
};

export const forgotPassword = (data: { emailId: string }) => {
  return axiosInstance.post(`${BASE_URL}/forgot-password`, data);
};

export const resetPassword = (data: { emailId: string; otp: string; newPassword: string }) => {
  return axiosInstance.post(`${BASE_URL}/reset-password`, data);
};

export const resendForgotPasswordOtp = (data: { emailId: string }) => {
  return axiosInstance.post(`${BASE_URL}/resend-forgot-password-otp`, data);
};

export const updateProfile = (data: { firstName?: string; lastName?: string; username?: string }) => {
  return axiosInstance.put(`${BASE_URL}/me`, data);
};

export const updatePassword = (data: any) => {
  return axiosInstance.put(`${BASE_URL}/me/password`, data);
};

export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return axiosInstance.put(`${BASE_URL}/me/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
