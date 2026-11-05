import React, { useRef, useState } from 'react';
import { useGalleryStore } from '../../stores/useGalleryStore';
import { uploadImageApi } from '../../api/upload';
import { useAuthStore } from '../../stores/useAuthStore';
import { notify } from '../../components/common/Toast';
import { UploadCloud, Trash2, Loader2, Plus, Image as ImageIcon } from 'lucide-react';

export const ImageSidebar: React.FC = () => {
  const {
    items,
    selectedIndex,
    selectImage,
    searchQuery,
    setSearchQuery,
    sidebarOpen,
    fetchItems,
    deleteImage,
  } = useGalleryStore();
  const { developerMode } = useAuthStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  if (!sidebarOpen) return null;

  const filtered = items.filter(it => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = it.image_name?.toLowerCase().includes(q);
    const uuidMatch = (it.uuid || it.job_uuid)?.toLowerCase().includes(q);
    return nameMatch || uuidMatch;
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let lastUploadedUuid: string | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const res = await uploadImageApi(file);
        if (res) {
          successCount++;
          if ((res as any).uuid) {
            lastUploadedUuid = (res as any).uuid;
          }
        }
      } catch (err: any) {
        notify(`上传失败: ${file.name} (${err.message || '网络错误'})`, 'error');
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (successCount > 0) {
      notify(`成功上传 ${successCount} 张图片`, 'success');
      await fetchItems();
      if (lastUploadedUuid) {
        const currentItems = useGalleryStore.getState().items;
        const newIdx = currentItems.findIndex(it => (it.uuid || it.job_uuid) === lastUploadedUuid);
        if (newIdx !== -1) {
          selectImage(newIdx);
        }
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const itemUuid = item.uuid || item.job_uuid;
    if (!itemUuid) return;

    const confirmMsg = `确定要删除图片 "${item.image_name}" 及其所有关联表单数据吗？此操作无法撤销。`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingUuid(itemUuid);
    const ok = await deleteImage(itemUuid);
    setDeletingUuid(null);

    if (ok) {
      notify('图片已成功删除', 'success');
    } else {
      notify('删除图片失败', 'error');
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-[#EAE6DF] flex flex-col h-full shrink-0 select-none z-10 image-sidebar">
      {/* Upload button and header */}
      <div className="p-3 border-b border-[#EAE6DF] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#262320] flex items-center gap-1.5">
            <ImageIcon size={14} className="text-gray-400" />
            <span>图片列表 ({items.length})</span>
          </span>

          {developerMode && (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#E25C1D] hover:bg-[#C74E13] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition shadow-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>上传中...</span>
                </>
              ) : (
                <>
                  <Plus size={12} />
                  <span>上传图片</span>
                </>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索图片名称或 UUID..."
          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg text-xs outline-none focus:border-[#E25C1D]"
        />
      </div>

      {/* Image list */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400 flex flex-col items-center gap-2">
            <UploadCloud size={24} className="text-gray-300" />
            <span>{items.length === 0 ? (developerMode ? '暂无图片，请点击上方按钮上传' : '暂无图片') : '暂无匹配的图片'}</span>
          </div>
        ) : (
          filtered.map((item) => {
            const itemUuid = item.uuid || item.job_uuid;
            const originalIndex = items.findIndex(it => (it.uuid || it.job_uuid) === itemUuid);
            const isSelected = originalIndex === selectedIndex;
            const isDeletingThis = deletingUuid === itemUuid;

            return (
              <div
                key={itemUuid || originalIndex}
                onClick={() => selectImage(originalIndex)}
                className={`group relative flex items-center gap-2.5 p-2 rounded-xl text-left transition border cursor-pointer
                  ${isSelected ? 'bg-orange-50 border-orange-200 text-[#E25C1D]' : 'bg-white hover:bg-gray-50 border-transparent text-gray-700'}`}
              >
                <img
                  src={item.image_url}
                  alt=""
                  className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0 bg-gray-100"
                />
                <div className="min-w-0 flex-1 pr-6">
                  <div className="text-xs font-semibold truncate leading-tight mb-1" title={item.image_name}>
                    {item.image_name}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="font-medium">
                      {item.records?.length || 0} 个表单
                    </span>
                    <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  title="删除此图片"
                  disabled={isDeletingThis}
                  onClick={(e) => handleDelete(e, item)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg text-gray-400 transition"
                >
                  {isDeletingThis ? (
                    <Loader2 size={13} className="animate-spin text-red-500" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
