"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, AlertTriangle, Loader2, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CoursesService, type CourseItem } from "@/actions/courses";
import CoursesTable from "./CoursesTable";
import ItemsModal from "./ItemsModal";

export type ModalType = "items" | "delete" | null;

export default function CoursesManagement() {
  const router = useRouter();

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [itemsModal, setItemsModal] = useState<{ title: string; items: string[] } | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await CoursesService.getCourses();
      if (res.success) {
        setCourses(res.data);
      } else {
        setMessage({ type: "error", text: res.message || "حدث خطأ في تحميل المواد" });
      }
    } catch (e) {
      setMessage({ type: "error", text: "حدث خطأ في تحميل المواد" });
    } finally {
      setLoading(false);
    }
  };

  const openItems = (type: "instructors" | "prerequisites", course: CourseItem) => {
    const title = type === "instructors" ? "المحاضرون" : "المقررات السابقة";
    let items: string[] = [];
    if (type === "instructors") {
      items = (course.instructors || []).map((i: any) => i?.name || i?.id || "").filter(Boolean);
    } else {
      items = (course.prerequisites || []).map((p: any) => p?.name || p?.code || String(p?.id || "")).filter(Boolean);
    }
    setItemsModal({ title, items });
    setActiveModal("items");
  };

  const closeModal = () => {
    setActiveModal(null);
    setItemsModal(null);
    setSelectedCourse(null);
  };

  const goAdd = () => router.push("/Settings/Courses/Add");
  const goEdit = (id: number) => router.push(`/Settings/Courses/Edit/${id}`);

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    try {
      const res = await CoursesService.deleteCourse(selectedCourse.id);
      if (res.success) {
        setMessage({ type: "success", text: res.message || "تم حذف المادة بنجاح" });
        await loadCourses();
      } else {
        setMessage({ type: "error", text: res.message || "حدث خطأ في حذف المادة" });
      }
    } catch (e) {
      setMessage({ type: "error", text: "حدث خطأ في حذف المادة" });
    } finally {
      setSaving(false);
      setActiveModal(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const tableData = useMemo(() => courses, [courses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل المواد...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">إدارة المواد</h2>
            <p className="text-gray-600">إدارة وتنظيم جميع المواد في النظام الأكاديمي</p>
          </div>
          <div className="flex items-center gap-2 pr-2">
            <button
              onClick={() => router.push('/Settings')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 hover:bg-gray-50"
            >
              العودة إلى الصفحة الرئيسية
            </button>
            <button
              onClick={goAdd}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl shadow-sm"
            >
              <Plus size={18} /> إضافة مادة جديدة
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message.type === "success" ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        <CoursesTable
          courses={tableData}
          onViewInstructors={(c) => openItems("instructors", c)}
          onViewPrerequisites={(c) => openItems("prerequisites", c)}
          onEdit={(c) => goEdit(c.id)}
          onDelete={(c) => { setSelectedCourse(c); setActiveModal("delete"); }}
        />

        {/* Items modal */}
        {activeModal === "items" && itemsModal && (
          <ItemsModal
            title={itemsModal.title}
            items={itemsModal.items}
            onClose={closeModal}
          />
        )}

        {/* Delete confirm */}
        {activeModal === "delete" && selectedCourse && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold text-gray-900">تأكيد حذف المادة</h3>
                <p className="text-sm text-gray-600 mt-1">هل أنت متأكد من حذف المادة "{selectedCourse.name}"؟</p>
              </div>
              <div className="p-6 flex justify-end gap-3">
                <button onClick={closeModal} className="px-5 py-2 rounded-lg border border-gray-300">إلغاء</button>
                <button onClick={handleDeleteCourse} disabled={saving} className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />} حذف
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
