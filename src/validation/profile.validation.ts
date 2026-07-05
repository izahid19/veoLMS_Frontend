import * as Yup from 'yup';

export const updateProfileSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'Too long')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Too long')
    .required('Last name is required'),
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .matches(/^[a-z0-9_]+$/, 'Only lowercase, numbers, and underscores allowed')
    .required('Username is required'),
});

export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      'Must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character'
    )
    .required('New password is required'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), ''], 'Passwords must match')
    .required('Confirm new password is required'),
});
