import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Tag, Percent, IndianRupee, X, Wand2 } from 'lucide-react';
import { AxiosError } from 'axios';

import {
  adminGetAllCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
} from '../../crud/coupon.crud';
import { adminGetAllCourses } from '../../crud/course.crud';
import { toast } from '../../Utils/toast';
import { cn } from '../../Utils/helpers';
import type { ICoupon, ICourse } from '../../types/course.types';

// ─── Validation ───────────────────────────────────────────────────────────────

const schema = Yup.object({
  code: Yup.string()
    .required('Coupon code is required')
    .min(3, 'At least 3 characters')
    .max(20, 'Max 20 characters')
    .matches(/^[A-Z0-9-]+$/, 'Only A–Z, 0–9 and hyphens'),
  discountType: Yup.string().oneOf(['percentage', 'flat']).required(),
  discountValue: Yup.number()
    .required('Required')
    .min(1, 'Must be at least 1')
    .when('discountType', {
      is: 'percentage',
      then: (s) => s.max(100, 'Cannot exceed 100%'),
    }),
  minOrderAmount: Yup.number().min(0, 'Cannot be negative'),
  maxUses: Yup.number().nullable().min(1, 'Must be at least 1').optional(),
  expiresAt: Yup.string()
    .nullable()
    .test('future', 'Must be a future date', (v) => !v || new Date(v) > new Date()),
  isActive: Yup.boolean(),
  applicableCourses: Yup.array().of(Yup.string()),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// ─── Design-system constants ──────────────────────────────────────────────────
// DESIGN.md tokens:
//   bg        #050505   surface  #131313   border  #262626
//   primary   #ff6b00   secondary #9333ea
//   card-shadow: 0 4px 12px rgba(0,0,0,0.5)
//   cta-glow:   0 0 20px rgba(255,107,0,0.15)
//   card: rounded-xl (12px)   button: rounded-lg (8px)

const card = 'bg-[#131313] border border-[#262626] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.5)]';
const inputCls = [
  'w-full bg-[#050505] border border-[#262626] rounded-lg px-4 py-3',
  'text-white text-sm placeholder-[#3a3939]',
  'focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]/20',
  'transition-colors',
].join(' ');
const sectionHeading = "text-xs font-semibold text-[#a3a3a3] uppercase tracking-[0.05em] font-['Inter'] mb-4";

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldWrap: React.FC<{
  label: string;
  name: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, name, hint, children }) => (
  <div>
    <label className="block text-sm font-semibold text-white mb-1.5 font-['Inter']">{label}</label>
    {children}
    <ErrorMessage name={name} component="p" className="text-red-400 text-xs mt-1" />
    {hint && <p className="text-[#a3a3a3] text-xs mt-1">{hint}</p>}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CouponFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading: loadingCoupons } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => (await adminGetAllCoupons()).data.data,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => (await adminGetAllCourses()).data.data,
  });

  const coupon: ICoupon | undefined = useMemo(
    () => (id ? coupons.find((c) => c._id === id) : undefined),
    [coupons, id]
  );

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = {
        ...values,
        discountValue:
          values.discountType === 'flat'
            ? Math.round(Number(values.discountValue) * 100)
            : Number(values.discountValue),
        minOrderAmount: Math.round(Number(values.minOrderAmount || 0) * 100),
        maxUses: values.maxUses ? Number(values.maxUses) : null,
        expiresAt: values.expiresAt || null,
      };
      return isEdit && id
        ? adminUpdateCoupon(id, payload)
        : adminCreateCoupon(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Coupon updated!' : 'Coupon created!');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      navigate('/admin/coupons');
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    },
  });

  const initialValues = {
    code: coupon?.code ?? '',
    discountType: coupon?.discountType ?? 'percentage',
    discountValue: coupon
      ? coupon.discountType === 'flat'
        ? coupon.discountValue / 100
        : coupon.discountValue
      : '',
    applicableCourses: coupon
      ? (coupon.applicableCourses as any[]).map((c) =>
          typeof c === 'string' ? c : c._id
        )
      : [],
    minOrderAmount: coupon ? coupon.minOrderAmount / 100 : 0,
    maxUses: coupon?.maxUses ?? '',
    expiresAt: coupon?.expiresAt
      ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
      : '',
    isActive: coupon?.isActive ?? true,
  };

  // ── Loading / not-found guards ─────────────────────────────────────────────
  if (isEdit && loadingCoupons) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-5 h-5 text-[#ff6b00] animate-spin" />
      </div>
    );
  }

  if (isEdit && !coupon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-[#a3a3a3] font-['Inter']">Coupon not found.</p>
        <button
          onClick={() => navigate('/admin/coupons')}
          className="text-[#ff6b00] underline text-sm font-['Inter']"
        >
          ← Back to coupons
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto pb-16">
      {/* ── Top progress bar ── */}
      <div className="fixed top-0 left-0 w-full h-0.5 z-50 bg-[#262626]">
        <div
          className={cn(
            'h-full bg-[#ff6b00] transition-all duration-500',
            saveMutation.isPending
              ? 'w-2/3 animate-pulse'
              : saveMutation.isSuccess
              ? 'w-full'
              : 'w-0'
          )}
        />
      </div>

      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8 pt-1">
        <button
          onClick={() => navigate('/admin/coupons')}
          className="p-2 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-[#131313] border border-transparent hover:border-[#262626] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold font-['Plus_Jakarta_Sans'] text-white tracking-tight">
            {isEdit ? `Edit ${coupon?.code}` : 'Create Coupon'}
          </h1>
          <p className="text-sm text-[#a3a3a3] mt-0.5 font-['Inter']">
            {isEdit
              ? 'Update discount code details'
              : 'Configure a new discount code for students'}
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={(v) => saveMutation.mutate(v)}
        enableReinitialize
      >
        {({ values, setFieldValue }) => (
          <Form>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* ── Section 1: Code ── */}
              <div className={cn(card, 'p-6')}>
                <p className={sectionHeading}>Coupon Code</p>
                <FieldWrap label="Code *" name="code">
                  <div className="flex gap-2">
                    <Field
                      name="code"
                      placeholder="e.g. SAVE50"
                      className={cn(inputCls, 'flex-1 font-mono uppercase tracking-widest')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFieldValue('code', e.target.value.toUpperCase())
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setFieldValue('code', generateCode())}
                      className="flex items-center gap-1.5 px-4 py-3 bg-[#131313] hover:bg-[#262626] border border-[#262626] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-[#ff6b00]" />
                      Generate
                    </button>
                  </div>
                </FieldWrap>
              </div>

              {/* ── Section 2: Discount ── */}
              <div className={cn(card, 'p-6 space-y-5')}>
                <p className={sectionHeading}>Discount</p>

                {/* Type cards — primary orange vs secondary purple */}
                <div className="grid grid-cols-2 gap-3">
                  {(['percentage', 'flat'] as const).map((type) => {
                    const active = values.discountType === type;
                    const accent = type === 'percentage' ? '#ff6b00' : '#9333ea';
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFieldValue('discountType', type)}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-xl border transition-all text-left',
                          active
                            ? type === 'percentage'
                              ? 'border-[#ff6b00] bg-[#ff6b00]/8'
                              : 'border-[#9333ea] bg-[#9333ea]/8'
                            : 'border-[#262626] bg-[#050505] hover:border-[#3a3939]'
                        )}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: active ? `${accent}18` : '#131313' }}
                        >
                          {type === 'percentage' ? (
                            <Percent className="w-4 h-4" style={{ color: active ? accent : '#a3a3a3' }} />
                          ) : (
                            <IndianRupee className="w-4 h-4" style={{ color: active ? accent : '#a3a3a3' }} />
                          )}
                        </div>
                        <div>
                          <p
                            className="font-semibold text-sm font-['Inter']"
                            style={{ color: active ? '#ffffff' : '#a3a3a3' }}
                          >
                            {type === 'percentage' ? 'Percentage' : 'Flat Amount'}
                          </p>
                          <p className="text-xs text-[#a3a3a3]">
                            {type === 'percentage' ? 'e.g. 20% off' : 'e.g. ₹200 off'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <FieldWrap
                  label={
                    values.discountType === 'percentage'
                      ? 'Discount Percentage *'
                      : 'Flat Discount Amount (₹) *'
                  }
                  name="discountValue"
                >
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3a3a3] text-sm font-bold">
                      {values.discountType === 'percentage' ? '%' : '₹'}
                    </span>
                    <Field
                      type="number"
                      name="discountValue"
                      min="1"
                      max={values.discountType === 'percentage' ? 100 : undefined}
                      placeholder={values.discountType === 'percentage' ? '20' : '200'}
                      className={cn(inputCls, 'pl-9')}
                    />
                  </div>
                </FieldWrap>
              </div>

              {/* ── Section 3: Restrictions ── */}
              <div className={cn(card, 'p-6 space-y-5')}>
                <p className={sectionHeading}>Restrictions</p>

                {/* Applicable Courses */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-white font-['Inter']">
                      Applicable Courses
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[#a3a3a3] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={values.applicableCourses.length === 0}
                        onChange={(e) => {
                          if (e.target.checked) setFieldValue('applicableCourses', []);
                        }}
                        className="accent-[#ff6b00] rounded"
                      />
                      All courses
                    </label>
                  </div>

                  {values.applicableCourses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {values.applicableCourses.map((cid: string) => {
                        const c = courses.find((x: ICourse) => x._id === cid);
                        if (!c) return null;
                        return (
                          <span
                            key={cid}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131313] border border-[#262626] text-xs text-white font-medium font-['Inter']"
                          >
                            <Tag className="w-3 h-3 text-[#ff6b00]" />
                            {c.title}
                            <button
                              type="button"
                              onClick={() =>
                                setFieldValue(
                                  'applicableCourses',
                                  values.applicableCourses.filter((x: string) => x !== cid)
                                )
                              }
                              className="ml-0.5 text-[#a3a3a3] hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <select
                    className={cn(inputCls, 'cursor-pointer')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !values.applicableCourses.includes(val)) {
                        setFieldValue('applicableCourses', [...values.applicableCourses, val]);
                      }
                      e.target.value = '';
                    }}
                  >
                    <option value="">+ Add a course restriction…</option>
                    {courses
                      .filter((c: ICourse) => !values.applicableCourses.includes(c._id))
                      .map((c: ICourse) => (
                        <option key={c._id} value={c._id}>
                          {c.title}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Min order & Max uses */}
                <div className="grid grid-cols-2 gap-4">
                  <FieldWrap label="Min Order Amount (₹)" name="minOrderAmount" hint="0 = no minimum">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3a3a3] text-sm">
                        ₹
                      </span>
                      <Field
                        type="number"
                        name="minOrderAmount"
                        min="0"
                        className={cn(inputCls, 'pl-9')}
                      />
                    </div>
                  </FieldWrap>
                  <FieldWrap label="Max Uses" name="maxUses" hint="Leave blank = unlimited">
                    <Field
                      type="number"
                      name="maxUses"
                      min="1"
                      placeholder="Unlimited"
                      className={inputCls}
                    />
                  </FieldWrap>
                </div>

                {/* Expiry */}
                <FieldWrap
                  label="Expiry Date & Time"
                  name="expiresAt"
                  hint="Leave blank for no expiry"
                >
                  <Field type="datetime-local" name="expiresAt" className={inputCls} />
                </FieldWrap>
              </div>

              {/* ── Section 4: Status ── */}
              <div className={cn(card, 'p-5 flex items-center justify-between')}>
                <div>
                  <p className="text-sm font-semibold text-white font-['Inter']">Active Status</p>
                  <p className="text-xs text-[#a3a3a3] mt-0.5">
                    Inactive coupons cannot be applied at checkout
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFieldValue('isActive', !values.isActive)}
                  className={cn(
                    'relative inline-flex h-6 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00]',
                    values.isActive ? 'bg-emerald-500' : 'bg-[#262626]'
                  )}
                  style={{ width: '44px' }}
                  aria-checked={values.isActive}
                  role="switch"
                  aria-label="Toggle coupon active status"
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                      values.isActive ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* ── Actions ── */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/admin/coupons')}
                  className="flex-1 py-3 bg-[#131313] hover:bg-[#262626] border border-[#262626] text-white font-semibold rounded-lg transition-colors font-['Inter']"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 py-3 bg-[#ff6b00] hover:bg-[#e65a00] disabled:opacity-50 text-white font-bold rounded-lg transition-colors font-['Inter'] shadow-[0_0_20px_rgba(255,107,0,0.15)] hover:shadow-[0_0_24px_rgba(255,107,0,0.25)] active:scale-[0.99]"
                >
                  {saveMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {isEdit ? 'Updating…' : 'Creating…'}
                    </span>
                  ) : isEdit ? (
                    'Update Coupon'
                  ) : (
                    'Create Coupon'
                  )}
                </button>
              </div>
            </motion.div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
