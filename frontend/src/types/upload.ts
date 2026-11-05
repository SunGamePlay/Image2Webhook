export interface UploadItem {
  id: number;
  file: File;
  url: string;
  tooLarge: boolean;
  state: 'idle' | 'sending' | 'sent' | 'failed';
  error?: string;
  jobId?: string | null;
}

export interface JobItem {
  id: string;
  image_name: string;
  image_url?: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  created_at?: string;
  started_at?: string | null;
  finished_at?: string | null;
  result_id?: number | null;
  error?: string | null;
  duration_ms?: number | null;
}
