"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Trash2, Search, ChevronDown, ChevronUp } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import type { CourseItem } from "@/actions/courses";

interface Props {
  courses: CourseItem[];
  onViewInstructors: (course: CourseItem) => void;
  onViewPrerequisites: (course: CourseItem) => void;
  onEdit: (course: CourseItem) => void;
  onDelete: (course: CourseItem) => void;
}

export default function CoursesTable({ courses, onViewInstructors, onViewPrerequisites, onEdit, onDelete }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<CourseItem>[] = useMemo(() => ([
    {
      id: "serial",
      header: () => <div className="text-right font-semibold text-gray-900">#</div>,
      cell: ({ row }) => <div className="font-medium text-gray-900">{row.index + 1}</div>,
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          كود المادة {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
        </button>
      ),
      cell: ({ row }) => <span className="font-mono text-gray-900">{row.getValue("code")}</span>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          اسم المادة {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
        </button>
      ),
      cell: ({ row }) => <span className="text-gray-900 font-medium truncate inline-block max-w-[220px]">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "creditHours",
      header: ({ column }) => (
        <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          الساعات المعتمدة {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
        </button>
      ),
      cell: ({ row }) => <span className="text-gray-900">{row.getValue("creditHours")}</span>,
    },
    {
      accessorKey: "isOptional",
      header: ({ column }) => (
        <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          الحالة {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
        </button>
      ),
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded text-xs ${row.original.isOptional ? "bg-yellow-50 text-yellow-700 border border-yellow-200" : "bg-teal-50 text-teal-700 border border-teal-200"}`}>
          {row.original.isOptional ? "اختياري" : "إجباري"}
        </span>
      ),
    },
    {
      accessorKey: "semester",
      header: ({ column }) => (
        <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          الفصل الدراسي {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
        </button>
      ),
      cell: ({ row }) => <span className="text-gray-900">{row.getValue("semester")}</span>,
    },
    {
      accessorKey: "departmentName",
      header: () => <span className="font-semibold text-gray-900">القسم</span>,
      cell: ({ row }) => <span className="text-gray-900">{row.original.departmentName}</span>,
    },
    {
      accessorKey: "degreeName",
      header: () => <span className="font-semibold text-gray-900">الدرجة العلمية</span>,
      cell: ({ row }) => <span className="text-gray-900">{row.original.degreeName}</span>,
    },
    {
      accessorKey: "msarName",
      header: () => <span className="font-semibold text-gray-900">المسار</span>,
      cell: ({ row }) => <span className="text-gray-900">{row.original.msarName}</span>,
    },
    {
      id: "popups",
      header: () => <span className="font-semibold text-gray-900">تفاصيل</span>,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm bg-blue-50 border border-blue-200 text-blue-700 rounded hover:bg-blue-100" onClick={() => onViewInstructors(row.original)}>
            <Eye className="inline-block mr-1" size={14} /> المحاضرون
          </button>
          <button className="px-3 py-1.5 text-sm bg-purple-50 border border-purple-200 text-purple-700 rounded hover:bg-purple-100" onClick={() => onViewPrerequisites(row.original)}>
            <Eye className="inline-block mr-1" size={14} /> المقررات السابقة
          </button>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center font-semibold text-gray-900">الإجراءات</div>,
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 rounded hover:bg-teal-100" onClick={() => onEdit(row.original)}>
            <Pencil size={14} /> تعديل
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100" onClick={() => onDelete(row.original)}>
            <Trash2 size={14} /> حذف
          </button>
        </div>
      ),
    },
  ]), [onViewInstructors, onViewPrerequisites, onEdit, onDelete]);

  const table = useReactTable({
    data: courses,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters, globalFilter },
  });

  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(String(e.target.value))}
                placeholder="البحث في المواد..."
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th key={h.id} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد بيانات</h3>
              <p className="text-gray-500">لا توجد مواد متاحة حالياً</p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 text-right">
          <div className="font-medium">عرض {table.getFilteredRowModel().rows.length} من {courses.length} مادة</div>
        </div>
      </div>
    </div>
  );
}
