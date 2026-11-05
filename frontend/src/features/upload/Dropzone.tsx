import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { useUploadStore } from '../../stores/useUploadStore';

export const Dropzone: React.FC = () => {
  const { addFiles } = useUploadStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className="border-2 border-dashed border-[#EAE6DF] hover:border-[#E25C1D] rounded-3xl p-10 text-center cursor-pointer transition-all bg-white hover:bg-[#FAF8F5] group"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
      />
      <div className="w-14 h-14 rounded-2xl bg-[#FBECE3] text-[#E25C1D] flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
        <UploadCloud size={28} />
      </div>
      <div className="text-base font-bold text-[#262320] mb-1">拖放图片到此处</div>
      <div className="text-xs text-[#7C7670] mb-4">PNG、JPG 或 WEBP · 可多选 · 单张最大 20 MB</div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
        className="px-5 py-2 border border-[#EAE6DF] rounded-xl text-xs font-semibold text-[#262320] hover:bg-white shadow-sm"
      >
        浏览文件
      </button>
    </div>
  );
};
