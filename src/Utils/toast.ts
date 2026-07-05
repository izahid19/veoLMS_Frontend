import { toast as reactToastifyToast, type ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'dark',
};

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    reactToastifyToast.success(message, { ...defaultOptions, ...options });
  },
  error: (message: string, options?: ToastOptions) => {
    reactToastifyToast.error(message, { ...defaultOptions, ...options });
  },
  info: (message: string, options?: ToastOptions) => {
    reactToastifyToast.info(message, { ...defaultOptions, ...options });
  },
  warning: (message: string, options?: ToastOptions) => {
    reactToastifyToast.warn(message, { ...defaultOptions, ...options });
  },
};
