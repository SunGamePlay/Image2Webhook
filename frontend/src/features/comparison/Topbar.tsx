import React from 'react';
import { useGalleryStore } from '../../stores/useGalleryStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useFormExport } from '../../hooks/useFormExport';
import { deriveFallbackName } from '../forms/FormRegistry';
import { notify } from '../../components/common/Toast';

export const Topbar: React.FC = () => {
  const {
    items,
    selectedIndex,
    activeRecord,
    sidebarOpen,
    setSidebarOpen,
    drawerOpen,
    setDrawerOpen,
    splitRatio,
    setSplitRatio,
    isSaving,
    isDirty,
    saveChanges,
    fetchItems,
  } = useGalleryStore();

  const { exportJson, printForm, exportPdf, exportPng } = useFormExport();
  const { developerMode } = useAuthStore();
  const currentItem = items[selectedIndex];
  const fileName = deriveFallbackName(activeRecord?.type || '', activeRecord?.data);

  const handleSave = async () => {
    const ok = await saveChanges();
    if (ok) notify('已保存修改到服务器', 'success');
    else notify('保存失败', 'error');
  };

  const getFormElement = () => {
    const container = document.getElementById('activeFormSheetContainer');
    if (!container) return null;
    return (container.querySelector('.form-sheet') as HTMLElement) || container;
  };

  return (
    <header className="h-14 bg-white border-b border-[#EAE6DF] px-4 flex items-center justify-between shrink-0 select-none z-20 topbar-header">
      <div className="flex items-center gap-3">
        <h1 className="font-bold text-sm text-[#262320]">比对编辑器</h1>

        <div className="h-4 w-px bg-gray-200 mx-1" />

        <button
          type="button"
          onClick={() => setSidebarOpen(o => !o)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition
            ${sidebarOpen ? 'bg-orange-50 text-[#E25C1D] border-orange-200' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
        >
          🗂️ 图片列表 ({items.length})
        </button>

        <span className="text-xs font-medium text-gray-500 max-w-[200px] truncate" title={currentItem?.image_name}>
          {currentItem ? currentItem.image_name : '未选择图片'}
        </span>
      </div>

      {/* Ratio presets */}
      <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
        {[
          { label: '50:50', val: 50 },
          { label: '图宽', val: 65 },
          { label: '表单宽', val: 35 },
          { label: '仅图', val: 100 },
          { label: '仅表', val: 0 },
        ].map(r => (
          <button
            key={r.val}
            type="button"
            onClick={() => setSplitRatio(r.val)}
            className={`px-2.5 py-1 rounded font-medium transition
              ${splitRatio === r.val ? 'bg-white text-[#E25C1D] shadow-xs' : 'text-gray-600 hover:text-black'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="px-3.5 py-1.5 bg-[#E25C1D] hover:bg-[#C74E13] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5"
        >
          💾 <span>{isSaving ? '保存中...' : '保存修改'}</span>
        </button>

        <button
          type="button"
          onClick={() => printForm(fileName)}
          className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition"
        >
          🖨️ 打印
        </button>

        <button
          type="button"
          onClick={() => exportPdf(getFormElement(), fileName)}
          className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition"
        >
          📄 PDF
        </button>

        <button
          type="button"
          onClick={() => exportPng(getFormElement(), fileName)}
          className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition"
        >
          🖼️ PNG
        </button>

        {developerMode && (
          <button
            type="button"
            onClick={() => exportJson(activeRecord?.data, fileName)}
            className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition"
          >
            📦 JSON
          </button>
        )}

        {developerMode && (
          <button
            type="button"
            onClick={() => setDrawerOpen(o => !o)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition
              ${drawerOpen ? 'bg-orange-50 text-[#E25C1D] border-orange-200' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
          >
            {'{ }'} JSON
          </button>
        )}

        <button
          type="button"
          onClick={() => fetchItems()}
          title="重新刷新"
          className="p-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-700 transition"
        >
          🔄
        </button>
      </div>
    </header>
  );
};
