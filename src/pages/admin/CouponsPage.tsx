import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Tag,
  Zap,
  Calendar,
  Copy,
  Check,
} from 'lucide-react';

import {
  adminGetAllCoupons,
  adminDeleteCoupon,
  adminToggleCoupon,
} from '../../crud/coupon.crud';
import { toast } from '../../Utils/toast';
import { formatPrice, cn } from '../../Utils/helpers';
import type { ICoupon } from '../../types/course.types';
import { Modal } from '../../components/ui/modal';

// ─── Design tokens ────────────────────────────────────────────────────────────
// bg: #050505  surface: #131313  border: #262626
// primary: #ff6b00  secondary: #9333ea
// card-shadow: 0 4px 12px rgba(0,0,0,0.5)
// card: rounded-xl (12px)   button: rounded-lg (8px)

const card = 'bg-[#131313] border border-[#262626] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.5)]';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className={cn(card, 'p-5 animate-pulse space-y-4')}>
    <div className="flex items-start justify-between">
      <div className="h-8 w-32 bg-[#262626] rounded-lg" />
      <div className="h-6 w-16 bg-[#262626] rounded-full" />
    </div>
    <div className="flex gap-2">
      <div className="h-5 w-20 bg-[#262626] rounded-full" />
      <div className="h-5 w-24 bg-[#262626] rounded-full" />
    </div>
    <div className="h-1.5 w-full bg-[#262626] rounded-full" />
    <div className="h-4 w-28 bg-[#262626] rounded" />
    <div className="flex justify-between pt-1 border-t border-[#262626]">
      <div className="h-6 w-11 bg-[#262626] rounded-full" />
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-[#262626] rounded-lg" />
        <div className="h-8 w-8 bg-[#262626] rounded-lg" />
      </div>
    </div>
  </div>
);

// ─── Coupon Card ──────────────────────────────────────────────────────────────

interface CouponCardProps {
  coupon: ICoupon;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  isToggling: boolean;
}

const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onEdit,
  onDelete,
  onToggle,
  isToggling,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      toast.success(`Copied "${coupon.code}" to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const isExpired = coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;
  const isExhausted = coupon.maxUses !== null && coupon.usedCount >= (coupon.maxUses ?? Infinity);
  const usagePercent = coupon.maxUses
    ? Math.min((coupon.usedCount / coupon.maxUses) * 100, 100)
    : 0;

  const statusLabel = isExpired
    ? 'Expired'
    : isExhausted
    ? 'Exhausted'
    : coupon.isActive
    ? 'Active'
    : 'Inactive';

  const statusCls = isExpired || isExhausted
    ? 'bg-red-500/10 text-red-400 border-red-500/20'
    : coupon.isActive
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : 'bg-[#262626] text-[#a3a3a3] border-[#262626]';

  // Usage bar color — red when nearly full, purple secondary for midrange
  const barColor =
    usagePercent >= 90
      ? 'bg-red-500'
      : usagePercent >= 60
      ? 'bg-[#9333ea]'
      : 'bg-[#ff6b00]';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className={cn(
        card,
        'p-5 flex flex-col gap-4 hover:border-[#ff6b00]/30 transition-colors duration-200'
      )}
    >
      {/* ── Top: code + status ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-mono font-bold text-base text-[#ff6b00] tracking-widest bg-[#ff6b00]/10 px-3 py-1 rounded-lg inline-block">
            {coupon.code}
          </span>
          <p className="text-xs text-[#a3a3a3] mt-1.5 font-['Inter']">
            {coupon.discountType === 'percentage'
              ? `${coupon.discountValue}% off`
              : `${formatPrice(coupon.discountValue)} flat off`}
          </p>
        </div>
        <span
          className={cn(
            'text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap font-["Inter"]',
            statusCls
          )}
        >
          {statusLabel}
        </span>
      </div>

      {/* ── Badges ── */}
      <div className="flex flex-wrap gap-1.5">
        {/* Discount type — orange for percentage, purple for flat */}
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium font-["Inter"]',
            coupon.discountType === 'percentage'
              ? 'bg-[#ff6b00]/10 text-[#ff6b00] border-[#ff6b00]/20'
              : 'bg-[#9333ea]/10 text-[#9333ea] border-[#9333ea]/20'
          )}
        >
          {coupon.discountType === 'percentage' ? '%' : '₹'}{' '}
          {coupon.discountType === 'percentage' ? 'Percentage' : 'Flat'}
        </span>
        {/* Applicable courses */}
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium font-['Inter'] bg-[#131313] text-[#a3a3a3] border-[#262626]">
          <Zap className="w-2.5 h-2.5" />
          {(coupon.applicableCourses as any[]).length === 0
            ? 'All Courses'
            : `${(coupon.applicableCourses as any[]).length} Course${
                (coupon.applicableCourses as any[]).length !== 1 ? 's' : ''
              }`}
        </span>
        {coupon.minOrderAmount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium font-['Inter'] bg-[#131313] text-[#a3a3a3] border-[#262626]">
            <Tag className="w-2.5 h-2.5" />
            Min {formatPrice(coupon.minOrderAmount)}
          </span>
        )}
      </div>

      {/* ── Usage bar ── */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-[#a3a3a3] font-['Inter']">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Usage
          </span>
          <span>
            {coupon.usedCount} / {coupon.maxUses !== null ? coupon.maxUses : '∞'}
          </span>
        </div>
        <div className="h-1 w-full bg-[#262626] rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor)}
            style={{ width: coupon.maxUses ? `${usagePercent}%` : '0%' }}
          />
        </div>
      </div>

      {/* ── Expiry ── */}
      <div className="flex items-center gap-1.5 text-xs text-[#a3a3a3] font-['Inter']">
        <Calendar className="w-3 h-3" />
        {coupon.expiresAt ? (
          <span className={isExpired ? 'text-red-400' : ''}>
            Expires{' '}
            {new Date(coupon.expiresAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ) : (
          'No expiry'
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
        <button
          onClick={onToggle}
          disabled={isToggling || isExpired || isExhausted}
          role="switch"
          aria-checked={coupon.isActive}
          aria-label="Toggle coupon active status"
          className={cn(
            'relative inline-flex h-6 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00] disabled:opacity-40',
            coupon.isActive ? 'bg-emerald-500' : 'bg-[#262626]'
          )}
          style={{ width: '44px' }}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
              coupon.isActive ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            title="Copy coupon code"
            className={cn(
              'p-2 border rounded-lg transition-colors',
              copied
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-[#a3a3a3] hover:text-white bg-[#131313] hover:bg-[#262626] border-[#262626]'
            )}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onEdit}
            title="Edit coupon"
            className="p-2 text-[#a3a3a3] hover:text-white bg-[#131313] hover:bg-[#262626] border border-[#262626] rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            title="Delete coupon"
            className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<ICoupon | null>(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => (await adminGetAllCoupons()).data.data,
  });

  const toggleMutation = useMutation({
    mutationFn: adminToggleCoupon,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['admin-coupons'] });
      const prev = queryClient.getQueryData<ICoupon[]>(['admin-coupons']);
      if (prev) {
        queryClient.setQueryData<ICoupon[]>(
          ['admin-coupons'],
          prev.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c))
        );
      }
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['admin-coupons'], ctx.prev);
      toast.error('Failed to toggle status');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteCoupon,
    onSuccess: () => {
      toast.success('Coupon deleted');
      setDeleteModalOpen(false);
      setCouponToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: () => toast.error('Failed to delete coupon'),
  });

  // ── Computed stats ─────────────────────────────────────────────────────────
  const now = new Date();
  const activeCoupons = coupons.filter(
    (c) => c.isActive && !(c.expiresAt && new Date(c.expiresAt) < now)
  ).length;
  const totalUses = coupons.reduce((s, c) => s + c.usedCount, 0);
  const expiredCount = coupons.filter((c) => c.expiresAt && new Date(c.expiresAt) < now).length;

  const stats = [
    { label: 'Total',   value: coupons.length, icon: Ticket,       accent: '#ff6b00' },
    { label: 'Active',  value: activeCoupons,   icon: CheckCircle2, accent: '#10b981' },
    { label: 'Uses',    value: totalUses,        icon: TrendingUp,   accent: '#9333ea' },
    { label: 'Expired', value: expiredCount,     icon: XCircle,      accent: '#ef4444' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-['Inter'] space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff6b00]/10 flex items-center justify-center flex-shrink-0">
            <Ticket className="w-5 h-5 text-[#ff6b00]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold font-['Plus_Jakarta_Sans'] text-white tracking-tight">
              Coupons
            </h1>
            <p className="text-sm text-[#a3a3a3]">Manage discount codes &amp; promo offers</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/coupons/create')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#ff6b00] hover:bg-[#e65a00] text-white rounded-lg font-semibold transition-colors shadow-[0_0_20px_rgba(255,107,0,0.15)] hover:shadow-[0_0_24px_rgba(255,107,0,0.25)] active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={cn(card, 'p-4 flex items-center gap-3')}>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${s.accent}18` }}
            >
              <s.icon className="w-4 h-4" style={{ color: s.accent }} />
            </div>
            <div>
              <p className="text-lg font-bold text-white leading-none">
                {isLoading ? '—' : s.value}
              </p>
              <p className="text-xs text-[#a3a3a3] mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className={cn(
              card,
              'w-20 h-20 flex items-center justify-center mb-5 rounded-2xl'
            )}
          >
            <Ticket className="w-9 h-9 text-[#262626]" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2 font-['Plus_Jakarta_Sans']">
            No coupons yet
          </h3>
          <p className="text-[#a3a3a3] text-sm mb-6 max-w-xs">
            Create your first discount coupon to start rewarding students.
          </p>
          <button
            onClick={() => navigate('/admin/coupons/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#ff6b00] hover:bg-[#e65a00] text-white rounded-lg font-semibold transition-colors shadow-[0_0_20px_rgba(255,107,0,0.15)]"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
                onEdit={() => navigate(`/admin/coupons/${coupon._id}/edit`)}
                onDelete={() => {
                  setCouponToDelete(coupon);
                  setDeleteModalOpen(true);
                }}
                onToggle={() => toggleMutation.mutate(coupon._id)}
                isToggling={toggleMutation.isPending}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* ── Delete confirmation modal ── */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="p-6">
          <div className="w-11 h-11 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1.5 font-['Plus_Jakarta_Sans']">
            Delete "{couponToDelete?.code}"?
          </h3>
          <p className="text-sm text-[#a3a3a3] mb-6">
            This is permanent. Students who saved this code won't be able to use it.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 bg-[#131313] hover:bg-[#262626] border border-[#262626] text-white rounded-lg transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => couponToDelete && deleteMutation.mutate(couponToDelete._id)}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete Coupon'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
