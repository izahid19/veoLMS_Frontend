import { create } from 'zustand';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  emailId: string;
  role: string;
  avatar: string;
  isUserVerify: boolean;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, user: User) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (accessToken, user) => set({ accessToken, user, isAuthenticated: true }),
  
  clearAuth: () => set({ accessToken: null, user: null, isAuthenticated: false }),
  
  setUser: (user) => set({ user }),
}));

export default useAuthStore;
