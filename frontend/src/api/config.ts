import { apiFetch } from './client';

export interface AppConfig {
  developer_mode: boolean;
}

export async function fetchConfigApi(): Promise<AppConfig> {
  return apiFetch<AppConfig>('/api/config');
}