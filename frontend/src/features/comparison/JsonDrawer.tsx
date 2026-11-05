import React, { useState, useEffect } from 'react';
import { useGalleryStore } from '../../stores/useGalleryStore';
import { notify } from '../../components/common/Toast';

export const JsonDrawer: React.FC = () => {
  const { drawerOpen, setDrawerOpen, activeRecord, updateActiveFormData } = useGalleryStore();
  const [text, setText] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (activeRecord?.data) {
      setText(JSON.stringify(activeRecord.data, null, 2));
      setIsValid(true);
    }
  }, [activeRecord]);

  if (!drawerOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    try {
      JSON.parse(val);
      setIsValid(true);
    } catch {
      setIsValid(false);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(text);
      setText(JSON.stringify(parsed, null, 2));
      setIsValid(true);
    } catch {
      notify('JSON 格式有误，无法格式化', 'error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    notify('已复制 JSON 到剪贴板', 'success');
  };

  const handleApply = () => {
    try {
      const parsed = JSON.parse(text);
      updateActiveFormData(parsed, true);
      notify('已应用 JSON 修改到表单', 'success');
    } catch {
      notify('JSON 格式有误，无法应用', 'error');
    }
  };

  return (
    <aside className="w-96 bg-white border-l border-[#EAE6DF] flex flex-col h-full shrink-0 shadow-2xl z-30 select-none">
      <div className="h-12 border-b border-[#EAE6DF] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-xs text-[#262320]">实时 JSON 编辑器</h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
            ${isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
          >
            {isValid ? '● 有效 JSON' : '● 语法错误'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          className="text-gray-400 hover:text-gray-700 text-sm font-bold"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 p-3 flex flex-col">
        <textarea
          value={text}
          onChange={handleChange}
          spellCheck={false}
          className="flex-1 w-full p-3 font-mono text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl outline-none resize-none focus:border-[#E25C1D] text-[#262320]"
        />

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EAE6DF]">
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleFormat} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700">格式化</button>
            <button type="button" onClick={handleCopy} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700">复制</button>
          </div>
          <button
            type="button"
            onClick={handleApply}
            disabled={!isValid}
            className="px-4 py-1.5 bg-[#E25C1D] hover:bg-[#C74E13] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition shadow"
          >
            应用到表单
          </button>
        </div>
      </div>
    </aside>
  );
};
