import React, { useRef, useState } from 'react';
import { useFormik } from 'formik';
import { toast } from '../../Utils/toast';
import { Loader2, Camera, Eye, EyeOff, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { cn } from '../../Utils/helpers';
import useAuthStore from '../../store/authStore';
import { updateProfile, updatePassword, uploadAvatar } from '../../crud/auth.crud';
import { updateProfileSchema, changePasswordSchema } from '../../validation/profile.validation';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser, clearAuth } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' }
  ];

  // Avatar Upload Logic
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setIsUploading(true);

    try {
      const response = await uploadAvatar(file);
      if (response.data.success) {
        setUser(response.data.user);
        toast.success('Avatar updated successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
      setAvatarPreview(user?.avatar || null); // Revert on failure
    } finally {
      setIsUploading(false);
    }
  };

  // Profile Form Logic
  const profileForm = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
    },
    enableReinitialize: true,
    validationSchema: updateProfileSchema,
    onSubmit: async (values) => {
      try {
        const response = await updateProfile(values);
        if (response.data.success) {
          setUser(response.data.data);
          toast.success('Profile updated successfully');
          profileForm.resetForm({ values }); // Reset dirty state
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    },
  });

  // Password Form Logic
  const passwordForm = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validationSchema: changePasswordSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await updatePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        if (response.data.success) {
          toast.success('Password changed. You will be logged out.');
          resetForm();
          setTimeout(() => {
            clearAuth();
            navigate('/login');
          }, 2000);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to change password');
      }
    },
  });

  const getInitials = () => {
    return `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="w-full h-full pb-12 overflow-y-auto overflow-x-hidden font-sans antialiased text-on-surface">
      {/* 1. Cinematic Profile Header */}
      <div className="relative w-full h-48 md:h-64 rounded-b-[2.5rem] overflow-hidden mb-16 shadow-2xl border-b border-surface-border/30">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-container/80 via-purple-600/50 to-background" />
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        <div className="absolute bottom-0 inset-x-0 h-2/3 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 -mt-32">
        {/* 2. Floating Avatar & Pill Nav */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-12">
          
          <div className="flex flex-col items-center md:items-start gap-4">
            {/* Avatar */}
            <div 
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-surface-dim border-[6px] border-background shadow-[0_8px_32px_rgba(0,0,0,0.6)] group/avatar cursor-pointer transition-transform hover:scale-105"
              onClick={handleAvatarClick}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-container text-5xl font-bold text-white">
                  {getInitials()}
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-sm">
                <Camera className="w-8 h-8 text-white mb-2" />
              </div>

              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-display-md text-on-surface font-bold tracking-tight">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-primary font-label-md mt-1">@{user?.username || 'user'}</p>
            </div>
          </div>
          
          {/* Pill Navigation */}
          <div className="flex bg-surface-dim/80 backdrop-blur-xl p-1.5 rounded-full border border-surface-border shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'profile' | 'security')}
                className={cn(
                  "relative px-6 py-2.5 rounded-full text-sm font-label-md transition-colors outline-none",
                  activeTab === tab.id ? "text-white font-semibold" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 rounded-full bg-surface-border/80 shadow-sm border border-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Settings Cards */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
                accept="image/*" 
              />
              
              {/* Basic Info Card */}
              <div className="glass-panel p-6 md:p-10 rounded-3xl border border-surface-border/50 relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 right-0 p-8 text-primary/10 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                  <User className="w-32 h-32" />
                </div>
                
                <h2 className="text-2xl font-display-sm text-on-surface mb-8 relative z-10">
                  Basic Information
                </h2>
                
                <form id="profile-form" onSubmit={profileForm.handleSubmit} className="space-y-6 relative z-10 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <LabelInputContainer>
                      <Label htmlFor="firstName">First name</Label>
                      <Input 
                        id="firstName" 
                        name="firstName"
                        type="text" 
                        onChange={profileForm.handleChange}
                        onBlur={profileForm.handleBlur}
                        value={profileForm.values.firstName}
                      />
                      {profileForm.touched.firstName && profileForm.errors.firstName && (
                        <p className="text-xs text-error mt-1">{profileForm.errors.firstName}</p>
                      )}
                    </LabelInputContainer>
                    
                    <LabelInputContainer>
                      <Label htmlFor="lastName">Last name</Label>
                      <Input 
                        id="lastName" 
                        name="lastName"
                        type="text" 
                        onChange={profileForm.handleChange}
                        onBlur={profileForm.handleBlur}
                        value={profileForm.values.lastName}
                      />
                      {profileForm.touched.lastName && profileForm.errors.lastName && (
                        <p className="text-xs text-error mt-1">{profileForm.errors.lastName}</p>
                      )}
                    </LabelInputContainer>
                  </div>

                  <LabelInputContainer>
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      name="username"
                      type="text" 
                      onChange={profileForm.handleChange}
                      onBlur={profileForm.handleBlur}
                      value={profileForm.values.username}
                    />
                    {profileForm.touched.username && profileForm.errors.username && (
                      <p className="text-xs text-error mt-1">{profileForm.errors.username}</p>
                    )}
                  </LabelInputContainer>
                </form>
              </div>

              {/* Contact Info Card */}
              <div className="glass-panel p-6 md:p-10 rounded-3xl border border-surface-border/50 relative overflow-hidden shadow-lg">
                <h2 className="text-2xl font-display-sm text-on-surface mb-8 relative z-10">Contact Details</h2>
                <div className="max-w-2xl relative z-10">
                  <LabelInputContainer>
                    <Label htmlFor="emailId">Email Address</Label>
                    <Input 
                      id="emailId" 
                      type="email" 
                      value={user?.emailId || ''}
                      disabled
                      className="opacity-50 cursor-not-allowed bg-surface-dim"
                    />
                    <p className="text-xs text-on-surface-variant mt-2">Email addresses cannot be changed for security reasons.</p>
                  </LabelInputContainer>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  form="profile-form"
                  disabled={!profileForm.dirty || profileForm.isSubmitting}
                  className="group/btn relative flex items-center justify-center h-14 px-10 rounded-xl bg-primary-container font-label-md text-white shadow-[0_4px_12px_rgba(255,107,0,0.4)] hover:shadow-[0_0_24px_rgba(255,107,0,0.6)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden text-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_12px_rgba(255,107,0,0.4)]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {profileForm.isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    Save Changes
                  </span>
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                </button>
              </div>

            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6"
            >
              <div className="glass-panel p-6 md:p-10 rounded-3xl border border-surface-border/50 relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 right-0 p-8 text-purple-500/10 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                  <EyeOff className="w-32 h-32" />
                </div>
                <h2 className="text-2xl font-display-sm text-on-surface mb-2 relative z-10">Security Settings</h2>
                <p className="text-on-surface-variant mb-10 relative z-10 font-body-md max-w-2xl">Ensure your account is using a long, random password to stay secure.</p>
                
                <form id="password-form" onSubmit={passwordForm.handleSubmit} className="space-y-6 relative z-10 max-w-2xl">
                  <LabelInputContainer className="relative">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative w-full">
                      <Input 
                        id="currentPassword" 
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'} 
                        onChange={passwordForm.handleChange}
                        onBlur={passwordForm.handleBlur}
                        value={passwordForm.values.currentPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-white transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordForm.touched.currentPassword && passwordForm.errors.currentPassword && (
                      <p className="text-xs text-error mt-1">{passwordForm.errors.currentPassword}</p>
                    )}
                  </LabelInputContainer>

                  <LabelInputContainer className="relative">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative w-full">
                      <Input 
                        id="newPassword" 
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'} 
                        onChange={passwordForm.handleChange}
                        onBlur={passwordForm.handleBlur}
                        value={passwordForm.values.newPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-white transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordForm.touched.newPassword && passwordForm.errors.newPassword && (
                      <p className="text-xs text-error mt-1">{passwordForm.errors.newPassword}</p>
                    )}
                    
                    <div className="mt-4 p-5 bg-surface-dim/80 rounded-xl border border-surface-border text-sm leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-3 shadow-inner">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", (passwordForm.values.newPassword || '').length >= 8 ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-on-surface-variant")} />
                        <span className={(passwordForm.values.newPassword || '').length >= 8 ? "text-green-500 font-medium" : "text-on-surface-variant"}>Min 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", /[A-Z]/.test(passwordForm.values.newPassword || '') ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-on-surface-variant")} />
                        <span className={/[A-Z]/.test(passwordForm.values.newPassword || '') ? "text-green-500 font-medium" : "text-on-surface-variant"}>1 uppercase</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", /[a-z]/.test(passwordForm.values.newPassword || '') ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-on-surface-variant")} />
                        <span className={/[a-z]/.test(passwordForm.values.newPassword || '') ? "text-green-500 font-medium" : "text-on-surface-variant"}>1 lowercase</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", /\d/.test(passwordForm.values.newPassword || '') ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-on-surface-variant")} />
                        <span className={/\d/.test(passwordForm.values.newPassword || '') ? "text-green-500 font-medium" : "text-on-surface-variant"}>1 number</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-full">
                        <div className={cn("w-2 h-2 rounded-full", /[@$!%*?&]/.test(passwordForm.values.newPassword || '') ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-on-surface-variant")} />
                        <span className={/[@$!%*?&]/.test(passwordForm.values.newPassword || '') ? "text-green-500 font-medium" : "text-on-surface-variant"}>1 special character</span>
                      </div>
                    </div>
                  </LabelInputContainer>

                  <LabelInputContainer className="relative">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <div className="relative w-full">
                      <Input 
                        id="confirmNewPassword" 
                        name="confirmNewPassword"
                        type={showConfirmPassword ? 'text' : 'password'} 
                        onChange={passwordForm.handleChange}
                        onBlur={passwordForm.handleBlur}
                        value={passwordForm.values.confirmNewPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordForm.touched.confirmNewPassword && passwordForm.errors.confirmNewPassword && (
                      <p className="text-xs text-error mt-1">{passwordForm.errors.confirmNewPassword}</p>
                    )}
                  </LabelInputContainer>
                </form>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  form="password-form"
                  disabled={passwordForm.isSubmitting || !passwordForm.dirty}
                  className="group/btn relative flex items-center justify-center h-14 px-10 rounded-xl bg-purple-600 font-label-md text-white shadow-[0_4px_12px_rgba(147,51,234,0.4)] hover:shadow-[0_0_24px_rgba(147,51,234,0.6)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden text-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_12px_rgba(147,51,234,0.4)]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {passwordForm.isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    Update Password
                  </span>
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default ProfilePage;
