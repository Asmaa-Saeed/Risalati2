"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2 } from "lucide-react";
import { CreateDegreeData, DegreesService } from "@/lib/degrees";

const degreeSchema = z.object({
  name: z.string().min(1, "اسم الدرجة العلمية مطلوب"),
  description: z.string().optional(),
  standardDurationYears: z.number().nullable().optional(),
  departmentId: z.number().min(1, "القسم مطلوب"),
  generalDegree: z.string().min(1, "نوع الدرجة مطلوب"),
});

interface AddDegreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    standardDurationYears?: number | null;
    departmentId: number;
    generalDegree: string;
  }) => Promise<void>;
  loading?: boolean;
}

const AddDegreeModal: React.FC<AddDegreeModalProps> = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<{
    name: string;
    description?: string;
    standardDurationYears?: number | null;
    departmentId: number;
    generalDegree: string;
  }>({
    resolver: zodResolver(degreeSchema),
    defaultValues: {
      standardDurationYears: null,
      generalDegree: '0',
    },
  });

  const departments = DegreesService.getDepartments();

  const handleFormSubmit = async (data: {
    name: string;
    description?: string;
    standardDurationYears?: number | null;
    departmentId: number;
    generalDegree: string;
  }) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 animate-backdrop-enter">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 transform transition-all duration-300 animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-teal-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-900">إضافة درجة علمية جديدة</h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 hover:animate-float"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Degree Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الدرجة العلمية *
              </label>
              <input
                {...register("name")}
                type="text"
                className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 text-lg ${
                  errors.name ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-gray-200 hover:border-gray-300"
                }`}
                placeholder="مثال: ماجستير العلوم في المحاسبة (عربي)"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف (اختياري)
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="وصف الدرجة العلمية..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                القسم *
              </label>
              <select
                {...register("departmentId", { valueAsNumber: true })}
                className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 text-lg ${
                  errors.departmentId ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <option value="">اختر القسم</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.departmentId.message}
                </p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مدة الدراسة (سنوات)
              </label>
              <input
                {...register("standardDurationYears", {
                  valueAsNumber: true,
                  setValueAs: (value) => value === "" ? null : Number(value)
                })}
                type="number"
                min="1"
                max="10"
                className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 text-lg ${
                  errors.standardDurationYears ? "border-red-500" : "border-gray-200 hover:border-gray-300"
                }`}
                placeholder="مثال: 2"
              />
              {errors.standardDurationYears && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.standardDurationYears.message}
                </p>
              )}
            </div>

            {/* General Degree Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الدرجة العلمية
              </label>
              <select
                {...register("generalDegree")}
                className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 text-lg ${
                  errors.generalDegree ? "border-red-500" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <option value="">اختر نوع الدرجة</option>
                <option value="1">البكالوريوس (درجة أساسية)</option>
                <option value="0">الماجستير/الدكتوراه (درجة عليا)</option>
              </select>
              {errors.generalDegree && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.generalDegree.message}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200/50 bg-gray-50/50 rounded-b-2xl p-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-8 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {loading ? "جاري الحفظ..." : "حفظ الدرجة العلمية"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDegreeModal;
