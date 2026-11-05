import { apiFetch } from './client';
import { GalleryItem } from '../types/gallery';

export async function fetchGalleryApi(): Promise<{ items: GalleryItem[] }> {
  return apiFetch<{ items: GalleryItem[] }>('/api/gallery');
}

export async function saveGalleryApi(uuid: string, jsons: any[]): Promise<{ status: string }> {
  return apiFetch<{ status: string }>('/api/gallery/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uuid, jsons }),
  });
}

export async function deleteGalleryApi(uuid: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/gallery/${encodeURIComponent(uuid)}`, {
    method: 'DELETE',
  });
}
