import React from 'react';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import { useUploadStore } from '../../stores/useUploadStore';

export const FileList: React.FC = () => {
  const { items, removeItem, clearAll, sendPending, isSending, statusMessage } = useUploadStore();
  if (!items.length) return null;

  const pendingCount = items.filter(x => !x.tooLarge && x.state !== 'sent').length;

  return (
    <div className="mt-6 bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-sm">
      <ul className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
        {items.map(item => (
          <li key={item.id} className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EAE6DF]">
            <div className="flex items-center gap-3 min-w-0">
              <img src={item.url} alt="" className="w-12 h-12 object-cover rounded-lg border border-[#EAE6DF] shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#262320] truncate">{item.file.name}</div>
                <div className="text-[11px] text-[#7C7670]">
                  {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {item.tooLarge && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">过大</span>}
              {item.state === 'sending' && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">发送中</span>}
              {item.state === 'sent' && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">已发送</span>}
              {item.state === 'failed' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">失败</span>}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                disabled={isSending}
                className="text-[#7C7670] hover:text-red-600 transition"
              >
                <X size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#EAE6DF]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={sendPending}
            disabled={isSending || pendingCount === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E25C1D] hover:bg-[#C74E13] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition shadow"
          >
            {isSending ? <Loader2 size={15} className="animate-spin" /> : null}
            <span>{isSending ? '发送中...' : `发送 ${pendingCount} 张`}</span>
            {!isSending && <ArrowRight size={14} />}
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={isSending}
            className="px-4 py-2 text-xs font-medium text-[#7C7670] hover:text-[#262320]"
          >
            清空列表
          </button>
        </div>
        {statusMessage && <span className="text-xs text-[#7C7670]">{statusMessage}</span>}
      </div>
    </div>
  );
};
