import { toast } from './toast';

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    
    const timeout = setTimeout(() => {
      resolve(false);
      script.remove();
    }, 10000);

    script.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    script.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const initiateRazorpayCheckout = async (options: any): Promise<void> => {
  const isLoaded = await loadRazorpay();

  if (!isLoaded) {
    toast.error('Payment gateway failed to load. Please check your internet connection.');
    return;
  }

  try {
    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      console.error('Payment failed:', response.error);
      if (options.modal && options.modal.ondismiss) {
        // Automatically dismiss if a handler is provided or handle failure
      }
    });
    rzp.open();
  } catch (error) {
    console.error('Error initiating Razorpay checkout:', error);
    toast.error('Failed to initialize payment gateway.');
  }
};
