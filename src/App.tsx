import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';

import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Home
import Home from "./pages/Home";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Courses
import CoursesPage from "./pages/courses/CoursesPage";
import CourseDetailPage from "./pages/courses/CourseDetailPage";

// Payment
import PaymentSuccessPage from "./pages/payment/PaymentSuccessPage";
import PaymentFailedPage from "./pages/payment/PaymentFailedPage";

// Dashboard
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import MyCoursesPage from "./pages/dashboard/MyCoursesPage";
import CoursePlayerPage from "./pages/dashboard/CoursePlayerPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import PurchaseHistoryPage from "./pages/dashboard/PurchaseHistoryPage";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCoursesPage from "./pages/admin/AdminCoursesPage";
import CreateCoursePage from "./pages/admin/CreateCoursePage";
import EditCoursePage from "./pages/admin/EditCoursePage";
import StudentsPage from "./pages/admin/StudentsPage";
import EnrollmentsPage from "./pages/admin/EnrollmentsPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

// NotFound
import NotFoundPage from "./pages/NotFoundPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* Public Routes - Wrapped in PublicLayout (Shows Navbar & Footer) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:slug" element={<CourseDetailPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/failed" element={<PaymentFailedPage />} />
            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Auth Routes - No Navbar or Footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Student Routes - ProtectedRoute + DashboardLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/dashboard/my-courses" element={<MyCoursesPage />} />
              <Route path="/dashboard/learn/:courseSlug/:lessonId" element={<CoursePlayerPage />} />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
              <Route path="/dashboard/purchases" element={<PurchaseHistoryPage />} />
            </Route>
          </Route>

          {/* Admin Routes - AdminRoute + AdminLayout */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/courses/create" element={<CreateCoursePage />} />
              <Route path="/admin/courses/:id/edit" element={<EditCoursePage />} />
              <Route path="/admin/students" element={<StudentsPage />} />
              <Route path="/admin/enrollments" element={<EnrollmentsPage />} />
              <Route path="/admin/payments" element={<AdminPaymentsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
