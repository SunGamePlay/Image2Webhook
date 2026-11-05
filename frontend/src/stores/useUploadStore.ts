import { create } from 'zustand';
import { UploadItem, JobItem } from '../types/upload';
import { uploadImageApi, fetchJobsApi } from '../api/upload';

const MAX_BYTES = 20 * 1024 * 1024;
let uid = 0;

interface UploadState {
  items: UploadItem[];
  jobs: Record<string, JobItem>;
  batchJobIds: string[];
  isSending: boolean;
  statusMessage: string;
  addFiles: (files: File[]) => void;
  removeItem: (id: number) => void;
  clearAll: () => void;
  sendPending: () => Promise<void>;
  pollJobs: () => Promise<void>;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  items: [],
  jobs: {},
  batchJobIds: [],
  isSending: false,
  statusMessage: '',

  addFiles: (files) => {
    const newItems: UploadItem[] = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      newItems.push({
        id: ++uid,
        file: f,
        url: URL.createObjectURL(f),
        tooLarge: f.size > MAX_BYTES,
        state: 'idle',
      });
    }
    set({ items: [...get().items, ...newItems], statusMessage: '' });
  },

  removeItem: (id) => {
    const item = get().items.find(x => x.id === id);
    if (item) URL.revokeObjectURL(item.url);
    set({ items: get().items.filter(x => x.id !== id) });
  },

  clearAll: () => {
    get().items.forEach(x => URL.revokeObjectURL(x.url));
    set({ items: [], statusMessage: '' });
  },

  sendPending: async () => {
    const { items } = get();
    const pending = items.filter(x => !x.tooLarge && x.state !== 'sent');
    if (!pending.length) return;

    set({ isSending: true, statusMessage: '发送中...' });
    const newJobIds: string[] = [];
    const updatedJobs = { ...get().jobs };

    for (const item of pending) {
      item.state = 'sending';
      set({ items: [...get().items] });
      try {
        const { job_id } = await uploadImageApi(item.file);
        item.state = 'sent';
        item.jobId = job_id;
        newJobIds.push(job_id);
        updatedJobs[job_id] = {
          id: job_id,
          image_name: item.file.name,
          image_url: item.url,
          status: 'queued',
          created_at: new Date().toISOString(),
        };
      } catch (err: any) {
        item.state = 'failed';
        item.error = err.message;
      }
      set({ items: [...get().items] });
    }

    set({
      isSending: false,
      jobs: updatedJobs,
      batchJobIds: [...newJobIds, ...get().batchJobIds],
      statusMessage: `已提交 ${newJobIds.length} 张图片`,
    });
  },

  pollJobs: async () => {
    const { batchJobIds } = get();
    if (!batchJobIds.length) return;
    try {
      const jobs = await fetchJobsApi(batchJobIds);
      const jobsMap = { ...get().jobs };
      jobs.forEach(j => { jobsMap[j.id] = j; });
      set({ jobs: jobsMap });
    } catch (_) {}
  },
}));
