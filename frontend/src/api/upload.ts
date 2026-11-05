import { apiFetch } from './client';
import { JobItem } from '../types/upload';

export async function uploadImageApi(file: File): Promise<{ job_id: string }> {
  const form = new FormData();
  form.append('file', file);
  return apiFetch<{ job_id: string }>('/api/upload', {
    method: 'POST',
    body: form,
  });
}

export async function fetchJobsApi(jobIds: string[]): Promise<JobItem[]> {
  if (!jobIds.length) return [];
  return apiFetch<JobItem[]>(`/api/jobs?ids=${jobIds.join(',')}`);
}
