import { create } from 'zustand';
import { GalleryItem, FormRecord } from '../types/gallery';
import { fetchGalleryApi, saveGalleryApi, deleteGalleryApi } from '../api/gallery';
import { detectFormType } from '../features/forms/FormRegistry';

interface GalleryState {
  items: GalleryItem[];
  selectedIndex: number;
  activeTabIndex: number;
  activeRecord: FormRecord | null;
  sidebarOpen: boolean;
  drawerOpen: boolean;
  splitRatio: number;
  searchQuery: string;
  isSaving: boolean;
  isDirty: boolean;
  externalUpdateTimestamp: number;

  fetchItems: () => Promise<void>;
  selectImage: (index: number) => void;
  selectTab: (index: number) => void;
  setSplitRatio: (ratio: number) => void;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setDrawerOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setSearchQuery: (query: string) => void;
  updateActiveFormData: (newData: Record<string, any>, isExternal?: boolean) => void;
  setActiveFormType: (type: string) => void;
  addFormRecord: (type: string, initialData?: Record<string, any>) => void;
  addFormRecords: (newRecords: FormRecord[]) => void;
  removeFormRecord: (index: number) => Promise<boolean>;
  deleteImage: (uuid: string) => Promise<boolean>;
  saveChanges: () => Promise<boolean>;
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  items: [],
  selectedIndex: -1,
  activeTabIndex: 0,
  activeRecord: null,
  sidebarOpen: true,
  drawerOpen: false,
  splitRatio: 50,
  searchQuery: '',
  isSaving: false,
  isDirty: false,
  externalUpdateTimestamp: 0,

  fetchItems: async () => {
    try {
      const data = await fetchGalleryApi();
      const rawList = (data as any)?.items || [];
      const currentSelectedUuid = get().items[get().selectedIndex]?.uuid;

      const items: GalleryItem[] = rawList.map((raw: any) => {
        const itemUuid = raw.uuid || raw.job_uuid || '';
        const jsons = Array.isArray(raw.jsons) ? raw.jsons : [];
        const records: FormRecord[] = raw.records && raw.records.length > 0
          ? raw.records
          : jsons.map((j: any) => ({
              type: detectFormType(j),
              data: j && typeof j === 'object' ? j : {},
            }));

        return {
          ...raw,
          uuid: itemUuid,
          job_uuid: itemUuid,
          records,
          jsons,
        };
      });

      set({ items });
      if (items.length > 0) {
        const prevIdx = currentSelectedUuid
          ? items.findIndex(it => (it.uuid || it.job_uuid) === currentSelectedUuid)
          : -1;
        const targetIdx = prevIdx !== -1 ? prevIdx : (get().selectedIndex === -1 ? 0 : Math.min(get().selectedIndex, items.length - 1));
        get().selectImage(targetIdx);
      } else {
        set({ selectedIndex: -1, activeRecord: null, activeTabIndex: 0 });
      }
    } catch (_) {}
  },

  selectImage: (index) => {
    const item = get().items[index];
    if (!item) {
      set({ selectedIndex: -1, activeRecord: null, activeTabIndex: 0, isDirty: false });
      return;
    }
    const records = item.records || [];
    set({
      selectedIndex: index,
      activeTabIndex: 0,
      activeRecord: records[0] ? { ...records[0] } : null,
      isDirty: false,
    });
  },

  selectTab: (index) => {
    const item = get().items[get().selectedIndex];
    if (!item) return;
    const records = item.records || [];
    if (records[index]) {
      set({
        activeTabIndex: index,
        activeRecord: { ...records[index] },
      });
    }
  },

  setSplitRatio: (splitRatio) => set({ splitRatio }),
  setSidebarOpen: (val) => set(s => ({ sidebarOpen: typeof val === 'function' ? val(s.sidebarOpen) : val })),
  setDrawerOpen: (val) => set(s => ({ drawerOpen: typeof val === 'function' ? val(s.drawerOpen) : val })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  updateActiveFormData: (newData, isExternal = false) => {
    const { activeRecord, items, selectedIndex, activeTabIndex } = get();
    if (!activeRecord || selectedIndex === -1) return;
    const updatedRecord = { ...activeRecord, data: { ...newData } };
    const updatedItems = [...items];
    const currentItem = { ...updatedItems[selectedIndex] };
    const updatedRecords = [...(currentItem.records || [])];
    updatedRecords[activeTabIndex] = updatedRecord;
    currentItem.records = updatedRecords;
    updatedItems[selectedIndex] = currentItem;

    set({
      activeRecord: updatedRecord,
      items: updatedItems,
      isDirty: true,
      externalUpdateTimestamp: isExternal ? Date.now() : get().externalUpdateTimestamp,
    });
  },

  setActiveFormType: (type) => {
    const { activeRecord, items, selectedIndex, activeTabIndex } = get();
    if (!activeRecord || selectedIndex === -1) return;
    const updatedRecord = { ...activeRecord, type };
    const updatedItems = [...items];
    const currentItem = { ...updatedItems[selectedIndex] };
    const updatedRecords = [...(currentItem.records || [])];
    updatedRecords[activeTabIndex] = updatedRecord;
    currentItem.records = updatedRecords;
    updatedItems[selectedIndex] = currentItem;

    set({
      activeRecord: updatedRecord,
      items: updatedItems,
      isDirty: true,
    });
  },

  addFormRecord: (type, initialData) => {
    const { items, selectedIndex } = get();
    if (selectedIndex === -1 || !items[selectedIndex]) return;

    const newRecord: FormRecord = { type, data: initialData || {} };
    const updatedItems = [...items];
    const currentItem = { ...updatedItems[selectedIndex] };
    const updatedRecords = [...(currentItem.records || []), newRecord];
    currentItem.records = updatedRecords;
    updatedItems[selectedIndex] = currentItem;

    const newTabIndex = updatedRecords.length - 1;
    set({
      items: updatedItems,
      activeTabIndex: newTabIndex,
      activeRecord: { ...newRecord },
      isDirty: true,
    });
  },

  addFormRecords: (newRecords) => {
    const { items, selectedIndex } = get();
    if (selectedIndex === -1 || !items[selectedIndex] || !newRecords.length) return;

    const updatedItems = [...items];
    const currentItem = { ...updatedItems[selectedIndex] };
    const existing = currentItem.records || [];
    const updatedRecords = [...existing, ...newRecords];
    currentItem.records = updatedRecords;
    updatedItems[selectedIndex] = currentItem;

    const newTabIndex = updatedRecords.length - 1;
    set({
      items: updatedItems,
      activeTabIndex: newTabIndex,
      activeRecord: { ...newRecords[0] },
      isDirty: true,
    });
  },

  removeFormRecord: async (index) => {
    const { items, selectedIndex, activeTabIndex } = get();
    if (selectedIndex === -1 || !items[selectedIndex]) return false;

    const updatedItems = [...items];
    const currentItem = { ...updatedItems[selectedIndex] };
    const updatedRecords = (currentItem.records || []).filter((_, i) => i !== index);
    currentItem.records = updatedRecords;
    updatedItems[selectedIndex] = currentItem;

    const newTabIndex = updatedRecords.length === 0
      ? 0
      : (activeTabIndex >= updatedRecords.length ? updatedRecords.length - 1 : (index === activeTabIndex ? Math.max(0, index - 1) : activeTabIndex));
    const newActiveRecord = updatedRecords.length > 0 ? { ...updatedRecords[newTabIndex] } : null;

    set({
      items: updatedItems,
      activeTabIndex: newTabIndex,
      activeRecord: newActiveRecord,
      isDirty: true,
    });
    return true;
  },

  deleteImage: async (uuid) => {
    try {
      await deleteGalleryApi(uuid);
      const { items, selectedIndex } = get();
      const updatedItems = items.filter(it => (it.uuid || it.job_uuid) !== uuid);
      let newIdx = selectedIndex;
      if (newIdx >= updatedItems.length) {
        newIdx = updatedItems.length - 1;
      }
      set({ items: updatedItems });
      if (newIdx >= 0) {
        get().selectImage(newIdx);
      } else {
        set({ selectedIndex: -1, activeRecord: null, activeTabIndex: 0 });
      }
      return true;
    } catch (_) {
      return false;
    }
  },

  saveChanges: async () => {
    const { items, selectedIndex } = get();
    const item = items[selectedIndex];
    if (!item) return false;

    set({ isSaving: true });
    try {
      const jsons = (item.records || []).map(r => r.data);
      const uuid = item.uuid || item.job_uuid;
      await saveGalleryApi(uuid, jsons);
      set({ isSaving: false, isDirty: false });
      return true;
    } catch (err) {
      set({ isSaving: false });
      return false;
    }
  },
}));
