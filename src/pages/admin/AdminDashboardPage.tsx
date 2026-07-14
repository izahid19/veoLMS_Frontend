import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  IndianRupee,
  Award,
  Plus,
  ArrowRight,
  TrendingUp,
  CreditCard,
  UserCheck,
  User,
} from 'lucide-react';

import { cn, formatPrice, formatDate } from '../../Utils/helpers';
import { getAdminStats } from '../../crud/admin.crud';
import type { IAdminEnrollment } from '../../types/admin.types';

// ─── Stat Card Component ──────────────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon, colorClass, delay }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-surface border border-surface-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    >
      <div className={cn('absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150', colorClass.replace('text-', 'bg-'))} />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center bg-background border border-surface-border', colorClass)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-on-surface-variant mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-on-surface">{value}</h3>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
  });

  const stats = data?.data;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-error font-semibold mb-2">Failed to load stats</p>
        <button onClick={() => window.location.reload()} className="text-primary-container hover:underline">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-on-surface">Dashboard</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Welcome back. Here's an overview of your academy.
        </p>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-surface-border rounded-2xl p-6 h-[104px] animate-pulse" />
          ))
        ) : stats ? (
          <>
            <StatCard
              title="Total Courses"
              value={stats.totalCourses.toLocaleString('en-IN')}
              icon={BookOpen}
              colorClass="text-purple-500"
              delay={0.1}
            />
            <StatCard
              title="Total Students"
              value={stats.totalStudents.toLocaleString('en-IN')}
              icon={Users}
              colorClass="text-blue-500"
              delay={0.2}
            />
            <StatCard
              title="Total Revenue"
              value={formatPrice(stats.totalRevenue * 100)}
              icon={IndianRupee}
              colorClass="text-emerald-500"
              delay={0.3}
            />
            <StatCard
              title="Total Enrollments"
              value={stats.totalEnrollments.toLocaleString('en-IN')}
              icon={Award}
              colorClass="text-orange-500"
              delay={0.4}
            />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Row 2: Recent Enrollments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="lg:col-span-2 bg-surface border border-surface-border rounded-2xl shadow-sm overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-surface-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-container" />
              Recent Enrollments
            </h2>
          </div>
          
          <div className="overflow-x-auto flex-1">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-4 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-surface-border" />
                    <div className="h-4 bg-surface-border rounded w-1/4" />
                    <div className="h-4 bg-surface-border rounded w-1/4 ml-auto" />
                  </div>
                ))}
              </div>
            ) : !stats || stats.recentEnrollments.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center h-full">
                <div className="w-16 h-16 rounded-full bg-surface-dim flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-on-surface-variant/50" />
                </div>
                <p className="font-semibold text-on-surface">No enrollments yet</p>
                <p className="text-sm text-on-surface-variant mt-1">When students enroll, they will appear here.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-dim/30 border-b border-surface-border">
                    <th className="px-6 py-4 text-left font-semibold text-on-surface-variant uppercase text-xs tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left font-semibold text-on-surface-variant uppercase text-xs tracking-wider">Course</th>
                    <th className="px-6 py-4 text-left font-semibold text-on-surface-variant uppercase text-xs tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left font-semibold text-on-surface-variant uppercase text-xs tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-on-surface-variant uppercase text-xs tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentEnrollments.map((enr: IAdminEnrollment) => (
                    <tr key={enr._id} className="border-b border-surface-border last:border-0 hover:bg-surface-dim/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-on-surface whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {enr.student?.avatar ? (
                            <img src={enr.student.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center">
                              <User className="w-4 h-4 text-on-surface-variant" />
                            </div>
                          )}
                          <div>
                            <div>{enr.student?.firstName} {enr.student?.lastName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {enr.course?.thumbnail ? (
                            <img src={enr.course.thumbnail} alt="" className="w-10 h-6 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-6 rounded bg-surface-dim" />
                          )}
                          <Link 
                            to={`/courses/${enr.course?.slug}`}
                            className="truncate max-w-[150px] hover:text-primary-container transition-colors" 
                            title={enr.course?.title}
                          >
                            {enr.course?.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-on-surface whitespace-nowrap">
                        {typeof enr.payment?.amount === 'number' && !isNaN(enr.payment.amount) 
                          ? formatPrice(enr.payment.amount) 
                          : formatPrice(enr.course?.price || 0)}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">
                        {formatDate(enr.enrolledAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {enr.payment?.status === 'completed' || !enr.payment ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 capitalize">
                            {enr.payment.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Row 3: Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-surface border border-surface-border rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-lg font-bold text-on-surface mb-6">Quick Actions</h2>
          <div className="space-y-4">
            
            <button
              onClick={() => navigate('/admin/courses/create')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-surface-border bg-background hover:border-primary-container/50 hover:bg-primary-container/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-container/10 text-primary-container flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-on-surface group-hover:text-primary-container transition-colors">Create New Course</p>
                  <p className="text-xs text-on-surface-variant">Publish a new learning track</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary-container group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => navigate('/admin/students')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-surface-border bg-background hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-on-surface group-hover:text-blue-500 transition-colors">View All Students</p>
                  <p className="text-xs text-on-surface-variant">Manage enrolled learners</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-on-surface-variant group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => navigate('/admin/payments')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-surface-border bg-background hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-on-surface group-hover:text-emerald-500 transition-colors">View Payments</p>
                  <p className="text-xs text-on-surface-variant">Check revenue & transactions</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-on-surface-variant group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </button>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
