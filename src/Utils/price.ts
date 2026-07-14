// Format paise to ₹ string
export const formatPrice = (paise: number): string => {
  if (paise === 0) return 'Free';
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
};

// Check if discount is still active
export const isDiscountActive = (discountPercent: number, expiresAt?: string | null): boolean => {
  if (!discountPercent) return false;
  if (!expiresAt) return true;
  return new Date(expiresAt) > new Date();
};

// Format countdown timer for discount expiry
export const getDiscountTimeLeft = (expiresAt: string): string => {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)} days left`;
  return `${hours}h ${mins}m left`;
};
