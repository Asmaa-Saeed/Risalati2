"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, ArrowRight, Plus, X } from "lucide-react";
import { CoursesService, type UpdateCourseData, type CourseItem } from "@/actions/courses";
import { TracksService } from "@/actions/tracks";

// First define the schema without the type annotation
const courseFormSchema = z.object({
  code: z.string().min(1, "كود المادة مطلوب"),
  name: z.string().min(1, "اسم المادة مطلوب"),
  creditHours: z.number().int().min(0, "عدد الساعات غير صالح"),
  isOptional: z.boolean().default(false),
  semester: z.number().int().min(1, "الفصل الدراسي مطلوب"),
  msarId: z.number().int().min(1, "المسار مطلوب"),
  description: z.string().default(""),
  instructorNationalIds: z.array(z.string()).default([]),
  prerequisiteCourseIds: z.array(z.number()).default([]),
});

// Then infer the type from the schema
type CourseFormData = z.infer<typeof courseFormSchema>;

// Now we can use the schema with the type
const schema: z.ZodType<CourseFormData> = courseFormSchema;

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const courseId = Number(params?.id);

  const { 
    register, 
    handleSubmit: handleFormSubmit, 
    formState: { errors }, 
    setValue, 
    reset 
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema) as any,
    defaultValues: { 
      code: "", 
      name: "", 
      creditHours: 3, 
      isOptional: false, 
      semester: 0, 
      msarId: 0, 
      description: "", 
      instructorNationalIds: [], 
      prerequisiteCourseIds: []
    },
  });
  
  // Wrap handleSubmit to properly type the form data
  const handleSubmit = (onValid: (data: CourseFormData) => void) => {
    return handleFormSubmit((data) => {
      const formData: CourseFormData = {
        ...data,
        instructorNationalIds: data.instructorNationalIds || [],
        prerequisiteCourseIds: data.prerequisiteCourseIds || []
      };
      onValid(formData);
    });
  };

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [semesters, setSemesters] = useState<{ id: number; value: string }[]>([]);
  const [tracks, setTracks] = useState<{ id: number; value: string }[]>([]);
  const [instructors, setInstructors] = useState<{ id: string; name: string }[]>([]);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);

  const [instructorRows, setInstructorRows] = useState<string[]>([]);
  const [prereqRows, setPrereqRows] = useState<number[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [semRes, instrRes, trackRes, courseRes] = await Promise.all([
          CoursesService.getSemesters(),
          CoursesService.getInstructors(),
          TracksService.getTracks(),
          CoursesService.getCourses(),
        ]);
        if (semRes.success) setSemesters(semRes.data.map(s => ({ id: s.id, value: s.value })));
        if (instrRes.success) setInstructors(instrRes.data);
        if (trackRes.succeeded) setTracks(trackRes.data.map((t: any) => ({ id: t.id, value: t.name })));
        if (courseRes.success) setCourses(courseRes.data.map(c => ({ id: c.id, name: c.name })));

        // find the course to edit
        const theCourse = courseRes.success ? courseRes.data.find((c: CourseItem) => c.id === courseId) : undefined;
        if (!theCourse) {
          setError("المادة غير موجودة");
          return;
        }
        // Prefill form
        reset({
          code: theCourse.code,
          name: theCourse.name,
          creditHours: theCourse.creditHours,
          isOptional: Boolean(theCourse.isOptional),
          semester: Number(theCourse.semester) || 0,
          // msarId not available in listing; keep 0 and let admin choose (or infer later if available)
          msarId: 0,
          description: theCourse.description || "",
          instructorNationalIds: [],
          prerequisiteCourseIds: [],
        });
        setInstructorRows((theCourse.instructors || []).map((i: any) => String(i?.id || "")));
        setPrereqRows((theCourse.prerequisites || []).map((p: any) => Number(p?.id || 0)).filter(Boolean));
      } catch (e) {
        setError("فشل تحميل البيانات");
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [courseId, reset]);

  const onSubmit = async (formData: CourseFormData) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const payload: UpdateCourseData = {
        id: courseId,
        code: formData.code,
        name: formData.name,
        creditHours: formData.creditHours,
        isOptional: formData.isOptional,
        semester: formData.semester,
        msarId: formData.msarId,
        description: formData.description || "",
        instructorNationalIds: formData.instructorNationalIds || [],
        prerequisiteCourseIds: formData.prerequisiteCourseIds || [],
      };
      const res = await CoursesService.updateCourse(payload);
      if (res.success) {
        setMessage(res.message || "تم تحديث المادة بنجاح");
        setTimeout(() => router.push("/Settings/Courses"), 800);
      } else {
        setError(res.message || "حدث خطأ في تحديث المادة");
      }
    } catch (e) {
      setError("حدث خطأ في تحديث المادة");
    } finally {
      setLoading(false);
    }
  };

  const instructorsOptions = useMemo(() => instructors, [instructors]);
  const coursesOptions = useMemo(() => courses, [courses]);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">تعديل مادة</h1>
          <p className="text-gray-600">قم بتعديل بيانات المادة</p>
        </div>
        <button onClick={() => router.push("/Settings/Courses") } className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg">
          العودة للقائمة <ArrowRight size={18} />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-800">{error}</div>
      )}
      {message && (
        <div className="p-3 rounded-lg border border-green-200 bg-green-50 text-green-800">{message}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">كود المادة *</label>
            <input {...register("code")} className={`w-full px-4 py-2 border rounded-lg ${errors.code ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.code && <p className="text-red-600 text-sm mt-1">{errors.code.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المادة *</label>
            <input {...register("name")} className={`w-full px-4 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">عدد الساعات *</label>
            <input type="number" {...register("creditHours", { valueAsNumber: true })} className={`w-full px-4 py-2 border rounded-lg ${errors.creditHours ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.creditHours && <p className="text-red-600 text-sm mt-1">{errors.creditHours.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الحالة *</label>
            <select 
              {...register("isOptional")} 
              className="w-full px-4 py-2 border rounded-lg border-gray-300"
            >
              <option value="false">إجباري</option>
              <option value="true">اختياري</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الفصل الدراسي *</label>
            <select {...register("semester", { valueAsNumber: true })} className={`w-full px-4 py-2 border rounded-lg ${errors.semester ? 'border-red-500' : 'border-gray-300'}`}>
              <option value={0}>اختر الفصل الدراسي</option>
              {semesters.map(s => <option key={s.id} value={s.id}>{s.value}</option>)}
            </select>
            {errors.semester && <p className="text-red-600 text-sm mt-1">{errors.semester.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">المسار *</label>
            <select {...register("msarId", { valueAsNumber: true })} className={`w-full px-4 py-2 border rounded-lg ${errors.msarId ? 'border-red-500' : 'border-gray-300'}`}>
              <option value={0}>اختر المسار</option>
              {tracks.map(t => <option key={t.id} value={t.id}>{t.value}</option>)}
            </select>
            {errors.msarId && <p className="text-red-600 text-sm mt-1">{errors.msarId.message}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف (اختياري)</label>
            <textarea {...register("description")} rows={3} className="w-full px-4 py-2 border rounded-lg border-gray-300"></textarea>
          </div>
        </div>

        {/* Instructors */}
        <div className="bg-gray-50 rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">المحاضرون (Instructors)</label>
            <button type="button" className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded" onClick={() => setInstructorRows([...instructorRows, ""]) }>
              <Plus size={14} /> إضافة محاضر
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="px-3 py-2 text-gray-700">اسم المحاضر</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {instructorRows.length === 0 ? (
                  <tr><td className="px-3 py-3 text-gray-400 italic" colSpan={2}>لا يوجد محاضرون لهذا الكورس</td></tr>
                ) : instructorRows.map((val, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-2">
                      <select value={val} onChange={(e) => {
                        const next = [...instructorRows];
                        next[idx] = e.target.value;
                        setInstructorRows(next);
                        setValue("instructorNationalIds", next.filter(Boolean), { shouldDirty: true });
                      }} className="w-full border rounded px-3 py-2">
                        <option value="">اختر محاضر</option>
                        {instructorsOptions.map((ins) => (
                          <option key={ins.id} value={ins.id}>{ins.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <button type="button" className="w-8 h-8 inline-flex items-center justify-center rounded-full border text-red-600" onClick={() => {
                        const next = instructorRows.filter((_, i) => i !== idx);
                        setInstructorRows(next);
                        setValue("instructorNationalIds", next.filter(Boolean), { shouldDirty: true });
                      }}>
                        <X />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prerequisites */}
        <div className="bg-gray-50 rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">المقررات السابقة (Prerequisites)</label>
            <button type="button" className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded" onClick={() => setPrereqRows([...prereqRows, 0]) }>
              <Plus size={14} /> إضافة مقرر
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="px-3 py-2 text-gray-700">اسم المقرر</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {prereqRows.length === 0 ? (
                  <tr><td className="px-3 py-3 text-gray-400 italic" colSpan={2}>لا يوجد مقررات سابقة لهذا الكورس</td></tr>
                ) : prereqRows.map((val, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-2">
                      <select value={val || 0} onChange={(e) => {
                        const next = [...prereqRows];
                        next[idx] = Number(e.target.value) || 0;
                        setPrereqRows(next);
                        setValue("prerequisiteCourseIds", next.filter(Boolean), { shouldDirty: true });
                      }} className="w-full border rounded px-3 py-2">
                        <option value={0}>اختر مقرر</option>
                        {coursesOptions.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <button type="button" className="w-8 h-8 inline-flex items-center justify-center rounded-full border text-red-600" onClick={() => {
                        const next = prereqRows.filter((_, i) => i !== idx);
                        setPrereqRows(next);
                        setValue("prerequisiteCourseIds", next.filter(Boolean), { shouldDirty: true });
                      }}>
                        <X />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push("/Settings/Courses")} className="px-6 py-3 rounded-lg border">إلغاء</button>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-3 rounded-lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />} {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </form>
    </div>
  );
}
