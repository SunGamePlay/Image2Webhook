import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useUploadStore } from '../../stores/useUploadStore';

interface JobProgressProps {
  onGoToStudio: () => void;
}

export const JobProgress: React.FC<JobProgressProps> = ({ onGoToStudio }) => {
  const { batchJobIds, jobs, pollJobs } = useUploadStore();

  useEffect(() => {
    if (!batchJobIds.length) return;
    const interval = setInterval(pollJobs, 1200);
    return () => clearInterval(interval);
  }, [batchJobIds, pollJobs]);

  if (!batchJobIds.length) return null;

  const currentJobs = batchJobIds.map(id => jobs[id]).filter(Boolean);
  const total = currentJobs.length;
  const finished = currentJobs.filter(j => j.status === 'done' || j.status === 'failed').length;
  const pct = total ? Math.round((finished / total) * 100) : 0;
  const hasDone = currentJobs.some(j => j.status === 'done');

  const statusLabel = (s: string) => ({ queued: '排队中', processing: '处理中', done: '已完成', failed: '失败' })[s] || s;

  return (
    <div className="mt-8 bg-white border border-[#EAE6DF] rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-[#262320]">处理进度</h3>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-[#7C7670]">{finished} / {total} 已完成</span>
          {hasDone && (
            <button
              type="button"
              onClick={onGoToStudio}
              className="flex items-center gap-1.5 text-xs font-bold text-[#E25C1D] hover:underline"
            >
              <span>去比对编辑器</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="w-full h-2.5 bg-[#FAF8F5] border border-[#EAE6DF] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#E25C1D] to-[#F08A4B] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-5 flex flex-col gap-2 max-h-60 overflow-y-auto">
        {currentJobs.map(job => (
          <li key={job.id} className="flex items-center justify-between p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE6DF]">
            <div className="flex items-center gap-3 min-w-0">
              {job.image_url ? (
                <img src={job.image_url} alt="" className="w-10 h-10 object-cover rounded-lg border shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-xs">📄</div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#262320] truncate">{job.image_name}</div>
                <div className="text-[11px] text-[#7C7670]">{statusLabel(job.status)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full
                ${job.status === 'done' ? 'bg-emerald-100 text-emerald-800' :
                  job.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}
              >
                {statusLabel(job.status)}
              </span>
              {job.status === 'done' && (
                <button
                  type="button"
                  onClick={onGoToStudio}
                  className="text-xs font-bold text-[#E25C1D] hover:underline"
                >
                  查看
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
