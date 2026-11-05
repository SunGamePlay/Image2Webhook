export interface FormRecord {
  type: string;
  data: Record<string, any>;
}

export interface GalleryItem {
  id?: number;
  uuid?: string;
  job_uuid: string;
  image_name: string;
  image_url: string;
  created_at: string;
  status?: string;
  json_count?: number;
  jsons?: any[];
  records: FormRecord[];
}
