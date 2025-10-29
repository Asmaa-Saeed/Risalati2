"use client";

import { X } from "lucide-react";

export default function ItemsModal({ title, items, onClose }: { title: string; items: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-9 h-9 inline-flex items-center justify-center rounded-full hover:bg-gray-100">
            <X />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {(!items || items.length === 0) ? (
            <p className="text-gray-500 text-center">لا توجد بيانات</p>
          ) : (
            <ul className="space-y-2 list-disc pr-5">
              {items.map((it, idx) => (
                <li key={idx} className="text-gray-800">{it}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 border-t text-left">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300">إغلاق</button>
        </div>
      </div>
    </div>
  );
}
