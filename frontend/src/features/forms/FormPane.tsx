import React, { useEffect, useRef, useState } from 'react';
import { useGalleryStore } from '../../stores/useGalleryStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { FORMS_META, detectFormType } from './FormRegistry';
import { FORM_REGISTRY } from './modules/registry.js';
import { Lock, Plus, Trash2, FileText, Check, X, ArrowUp, Folder } from 'lucide-react';
import { notify } from '../../components/common/Toast';
import { FormRecord } from '../../types/gallery';

export const FormPane: React.FC = () => {
  const {
    items,
    selectedIndex,
    activeTabIndex,
    activeRecord,
    selectTab,
    addFormRecord,
    addFormRecords,
    removeFormRecord,
    updateActiveFormData,
    isDirty,
    externalUpdateTimestamp,
  } = useGalleryStore();
  const { developerMode } = useAuthStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const modalJsonFileInputRef = useRef<HTMLInputElement>(null);

  // Modal state (when user clicks "+ 新建表单" in topbar)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'blank' | 'file' | 'paste'>('blank');

  // Blank form type
  const [blankType, setBlankType] = useState('fixed_simple');

  // Paste JSON inputs
  const [pastedJsonText, setPastedJsonText] = useState('');
  const [modalPastedJsonText, setModalPastedJsonText] = useState('');

  // Drag over state
  const [isDragOver, setIsDragOver] = useState(false);

  const currentItem = items[selectedIndex];
  const records = currentItem?.records || [];
  const activeType = activeRecord?.type || 'fixed_simple';
  const activeData = activeRecord?.data || {};
  const activeMeta = FORMS_META[activeType] || FORMS_META.fixed_simple;

  // Mount and populate form module into container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!activeRecord || records.length === 0) {
      el.innerHTML = '';
      el.className = '';
      return;
    }

    const formMod = (FORM_REGISTRY as any)[activeType] || (FORM_REGISTRY as any).fixed_simple;
    if (!formMod) return;

    // Apply exact CSS classes required by forms-common.css and forms-studio.css
    try {
      el.className = `form-host active-form form-${activeType.replace('_', '-')}`;
      el.innerHTML = formMod.render ? formMod.render() : '';
      if (formMod.populate) {
        formMod.populate(el, activeData);
      }

      if (formMod.init) {
        formMod.init(el, () => {
          if (formMod.extract) {
            try {
              const extracted = formMod.extract(el);
              updateActiveFormData(extracted);
            } catch (err) {
              console.error(`Error extracting form data [${activeType}]:`, err);
            }
          }
        });
      }
    } catch (err) {
      console.error(`Error mounting form module [${activeType}]:`, err);
    }

    // Cleanup: always clear innerHTML and classes when unmounting or switching
    return () => {
      el.innerHTML = '';
      el.className = '';
    };
  }, [selectedIndex, activeTabIndex, activeType, records.length, Boolean(activeRecord)]);

  // When activeData is updated externally (e.g. from JSON drawer), re-populate
  const populateData = () => {
    const el = containerRef.current;
    if (!el || !activeRecord) return;
    const formMod = (FORM_REGISTRY as any)[activeType] || (FORM_REGISTRY as any).fixed_simple;
    if (formMod?.populate) {
      try {
        formMod.populate(el, activeRecord.data || {});
      } catch (err) {
        console.error(`Error populating form module [${activeType}]:`, err);
      }
    }
  };

  useEffect(() => {
    if (externalUpdateTimestamp > 0) {
      populateData();
    }
  }, [externalUpdateTimestamp]);

  // Helper to parse JSON payload (single object, array, or { jsons: [...] })
  const parseJsonToRecords = (parsed: any): FormRecord[] => {
    let list: any[] = [];
    if (Array.isArray(parsed)) {
      list = parsed;
    } else if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.jsons)) {
        list = parsed.jsons;
      } else {
        list = [parsed];
      }
    }

    const results: FormRecord[] = [];
    for (const item of list) {
      if (item && typeof item === 'object') {
        const detected = detectFormType(item);
        results.push({ type: detected, data: item });
      }
    }
    return results;
  };

  // Creation Action 1: Create Blank Form
  const handleCreateBlank = (typeToUse: string) => {
    if (!currentItem) {
      notify('请先选择或上传一张图片', 'error');
      return;
    }
    addFormRecord(typeToUse, {});
    setIsCreateModalOpen(false);
    notify(`已创建空白表单 (${FORMS_META[typeToUse]?.label || typeToUse})`, 'success');
  };

  // Creation Action 2: Process JSON Files
  const handleJsonFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!currentItem) {
      notify('请先选择或上传一张图片', 'error');
      return;
    }

    const newRecords: FormRecord[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const extracted = parseJsonToRecords(parsed);
        newRecords.push(...extracted);
      } catch (err: any) {
        notify(`解析失败: ${file.name} (不是合法的 JSON)`, 'error');
      }
    }

    if (newRecords.length > 0) {
      addFormRecords(newRecords);
      setIsCreateModalOpen(false);
      notify(`已成功从 JSON 文件导入 ${newRecords.length} 个表单`, 'success');
    }
  };

  // Creation Action 3: Process Pasted JSON
  const handleCreateFromPaste = (textToParse: string) => {
    if (!currentItem) {
      notify('请先选择或上传一张图片', 'error');
      return;
    }
    if (!textToParse.trim()) {
      notify('请先粘贴 JSON 内容', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(textToParse);
      const extracted = parseJsonToRecords(parsed);
      if (extracted.length === 0) {
        notify('未能在 JSON 中检测到有效的表单数据', 'error');
        return;
      }
      addFormRecords(extracted);
      setPastedJsonText('');
      setModalPastedJsonText('');
      setIsCreateModalOpen(false);
      notify(`已成功从粘贴的 JSON 生成 ${extracted.length} 个表单`, 'success');
    } catch {
      notify('粘贴的内容不是合法的 JSON 格式，请检查语法', 'error');
    }
  };

  const handleDeleteActiveForm = async () => {
    if (!activeRecord || records.length === 0) return;
    const confirmMsg = `确定要删除此表单 (#${activeTabIndex + 1} ${activeMeta.label}) 吗？`;
    if (!window.confirm(confirmMsg)) return;

    await removeFormRecord(activeTabIndex);
    notify('已删除该表单，请点击右上角保存修改', 'info');
  };

  return (
    <section className="flex-1 flex flex-col h-full bg-[#E5E2DC] overflow-hidden relative form-pane-section">
      {/* Top bar with tabs & locked template indicator */}
      <div className="h-11 bg-white border-b border-[#EAE6DF] px-4 flex items-center justify-between shrink-0 select-none z-10 form-tabs-header">
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 pr-2">
          {records.length === 0 ? (
            <span className="text-xs text-[#7C7670] font-medium">暂无提取的表单数据</span>
          ) : (
            records.map((rec, i) => {
              const meta = FORMS_META[rec.type] || FORMS_META.fixed_simple;
              const isActive = i === activeTabIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectTab(i)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition
                    ${isActive ? 'bg-[#FAF8F5] text-[#E25C1D] border border-[#EAE6DF] shadow-xs' : 'text-[#7C7670] hover:bg-[#FAF8F5]'}`}
                >
                  <span className="opacity-60 font-mono">#{i + 1}</span>
                  <span className="truncate max-w-[140px]">{meta.label}</span>
                </button>
              );
            })
          )}

          {/* Add form button (developer mode only) */}
          {developerMode && currentItem && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              title="新建或导入表单"
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-[#E25C1D] bg-orange-50 hover:bg-orange-100 border border-orange-200 transition shrink-0 ml-1"
            >
              <Plus size={13} />
              <span>新建表单</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Locked Form Type Display (developer mode only) */}
          {developerMode && (
            <div className="flex items-center gap-1.5 text-xs text-[#7C7670]">
              <span className="font-medium">模板:</span>
              {records.length > 0 && activeRecord ? (
                <span
                  title="表单类型已锁定，如需其他类型请点击「新建表单」"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] border border-[#EAE6DF] rounded-md text-xs font-semibold text-[#262320]"
                >
                  <Lock size={11} className="text-gray-400" />
                  <span>{activeMeta.label}</span>
                </span>
              ) : (
                <span className="text-gray-400 italic">未选定</span>
              )}
            </div>
          )}

          {/* Remove active form button (developer mode only) */}
          {developerMode && records.length > 0 && activeRecord && (
            <button
              type="button"
              onClick={handleDeleteActiveForm}
              title="删除当前表单"
              className="px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md text-xs font-medium flex items-center gap-1 transition"
            >
              <Trash2 size={12} />
              <span>删除表单</span>
            </button>
          )}

          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
            ${isDirty ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}
          >
            {isDirty ? '● 未保存' : '● 已同步'}
          </span>
        </div>
      </div>

      {/* Main Canvas Viewport: Empty Workspace View OR Active Form Sheet */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start form-sheet-viewport">
        {records.length === 0 || !activeRecord ? (
          /* =========================================================================
             EMPTY WORKSPACE VIEW (Simplified Chinese, no file name field, clean theme)
             ========================================================================= */
          <div key="empty-workspace" className="w-full max-w-5xl my-auto py-6 px-2 flex flex-col items-center animate-in fade-in duration-150">
            {/* Header Banner */}
            <div className="text-center mb-8 max-w-lg">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-orange-100 text-[#E25C1D] items-center justify-center text-2xl mb-3 shadow-xs">
                🦷
              </div>
              <h2 className="text-xl font-extrabold text-[#262320] mb-1.5">
                当前图片暂无提取的表单数据
              </h2>
              <p className="text-xs text-[#7C7670] leading-relaxed">
                当前图片 <span className="font-semibold text-[#262320]">{currentItem?.image_name || '未选图片'}</span> 尚未关联任何表单。
                {developerMode ? '请选择下方 3 种方式之一创建并绑定表单：' : '表单数据由系统自动提取，暂无法手动创建。'}
              </p>
            </div>

            {/* 3 Action Cards Grid (developer mode only) */}
            {developerMode && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {/* Option 1: 创建空白表单 */}
              <div className="bg-white rounded-2xl border border-[#EAE6DF] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-4">
                    📝
                  </div>
                  <h3 className="text-base font-bold text-[#262320] mb-1">创建空白表单</h3>
                  <p className="text-xs text-[#7C7670] leading-relaxed mb-5">
                    选择牙科技工单模板创建干净的空白表单。创建后模板类型将被锁定并绑定至当前图片。
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-auto">
                  <div>
                    <label className="block text-[11px] font-bold text-[#7C7670] uppercase tracking-wider mb-1.5">
                      模板类型
                    </label>
                    <select
                      value={blankType}
                      onChange={(e) => setBlankType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-xs font-medium text-[#262320] outline-none focus:border-[#E25C1D]"
                    >
                      {Object.values(FORMS_META).map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCreateBlank(blankType)}
                    className="w-full py-2.5 bg-[#E25C1D] hover:bg-[#C74E13] text-white rounded-xl text-xs font-bold transition shadow-xs mt-1"
                  >
                    创建空白表单
                  </button>
                </div>
              </div>

              {/* Option 2: 从 JSON 文件导入 */}
              <div className="bg-white rounded-2xl border border-[#EAE6DF] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-4">
                    📁
                  </div>
                  <h3 className="text-base font-bold text-[#262320] mb-1">从 JSON 文件导入</h3>
                  <p className="text-xs text-[#7C7670] leading-relaxed mb-5">
                    从本地设备加载一个或多个 <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">.json</code> 文件。系统自动识别并锁定对应模板。
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-auto">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      handleJsonFiles(e.dataTransfer.files);
                    }}
                    onClick={() => jsonFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5
                      ${isDragOver ? 'border-[#E25C1D] bg-orange-50/50' : 'border-[#EAE6DF] bg-[#FAF8F5] hover:border-[#E25C1D]'}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#EAE6DF] flex items-center justify-center text-gray-500 shadow-2xs">
                      <ArrowUp size={16} />
                    </div>
                    <div className="text-xs font-semibold text-[#262320]">点击选择文件</div>
                    <div className="text-[11px] text-[#7C7670]">或将 JSON 文件拖拽至此处</div>
                  </div>

                  <input
                    ref={jsonFileInputRef}
                    type="file"
                    accept=".json,application/json"
                    multiple
                    onChange={(e) => handleJsonFiles(e.target.files)}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => jsonFileInputRef.current?.click()}
                    className="w-full py-2.5 bg-white hover:bg-gray-50 border border-[#EAE6DF] text-[#262320] rounded-xl text-xs font-semibold transition mt-1"
                  >
                    选择 JSON 文件...
                  </button>
                </div>
              </div>

              {/* Option 3: 从粘贴的 JSON 创建 */}
              <div className="bg-white rounded-2xl border border-[#EAE6DF] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-4">
                    📋
                  </div>
                  <h3 className="text-base font-bold text-[#262320] mb-1">从粘贴的 JSON 创建</h3>
                  <p className="text-xs text-[#7C7670] leading-relaxed mb-5">
                    在下方粘贴原始 JSON 文本，系统将自动识别表单类型并立即生成填充好的表单。
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-auto">
                  <textarea
                    value={pastedJsonText}
                    onChange={(e) => setPastedJsonText(e.target.value)}
                    placeholder='在此粘贴 JSON 文本，例如 {"orderInfo": ...} 或 [{"...": ...}]'
                    className="w-full h-32 p-3 font-mono text-[11px] bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl outline-none resize-none focus:border-[#E25C1D] text-[#262320]"
                  />

                  <button
                    type="button"
                    onClick={() => handleCreateFromPaste(pastedJsonText)}
                    className="w-full py-2.5 bg-white hover:bg-gray-50 border border-[#EAE6DF] text-[#262320] rounded-xl text-xs font-semibold transition mt-1"
                  >
                    从粘贴的 JSON 创建
                  </button>
                </div>
              </div>
            </div>
            )}
          </div>
        ) : (
          /* Active Form Sheet (Rendered with unique key and proper cleanup) */
          <div
            key={`active-form-sheet-${selectedIndex}-${activeTabIndex}-${activeType}`}
            ref={containerRef}
            id="activeFormSheetContainer"
            className="transition-all"
          />
        )}
      </div>

      {/* Modal: Create or Import Form (When "+ 新建表单" is clicked, developer mode only) */}
      {developerMode && isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-xl bg-white rounded-2xl border border-[#EAE6DF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#EAE6DF] flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#E25C1D] flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <h3 className="text-sm font-bold text-[#262320]">为当前图片新建或导入表单</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#EAE6DF] bg-gray-50 px-5 pt-2 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalTab('blank')}
                className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5
                  ${modalTab === 'blank' ? 'border-[#E25C1D] text-[#E25C1D]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                <span>📝 空白模板</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('file')}
                className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5
                  ${modalTab === 'file' ? 'border-[#E25C1D] text-[#E25C1D]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                <span>📁 JSON 文件</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('paste')}
                className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5
                  ${modalTab === 'paste' ? 'border-[#E25C1D] text-[#E25C1D]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                <span>📋 粘贴 JSON</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {modalTab === 'blank' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#262320] mb-2">
                      选择表单模板类型 (创建后模板类型将被锁定)
                    </label>
                    <select
                      value={blankType}
                      onChange={(e) => setBlankType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-xs font-medium text-[#262320] outline-none focus:border-[#E25C1D]"
                    >
                      {Object.values(FORMS_META).map(m => (
                        <option key={m.id} value={m.id}>
                          {m.label} ({m.fullName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#EAE6DF]">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateBlank(blankType)}
                      className="px-4 py-2 bg-[#E25C1D] hover:bg-[#C74E13] text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      <span>确认创建空白表单</span>
                    </button>
                  </div>
                </div>
              )}

              {modalTab === 'file' && (
                <div className="flex flex-col gap-4">
                  <div
                    onClick={() => modalJsonFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#EAE6DF] hover:border-[#E25C1D] bg-[#FAF8F5] rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Folder size={20} />
                    </div>
                    <div className="text-xs font-bold text-[#262320]">选择要导入的 .json 文件</div>
                    <div className="text-[11px] text-[#7C7670]">支持一次选择单个或多个 JSON 文件，系统自动识别类型</div>
                  </div>

                  <input
                    ref={modalJsonFileInputRef}
                    type="file"
                    accept=".json,application/json"
                    multiple
                    onChange={(e) => handleJsonFiles(e.target.files)}
                    className="hidden"
                  />

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE6DF]">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={() => modalJsonFileInputRef.current?.click()}
                      className="px-4 py-2 bg-[#E25C1D] hover:bg-[#C74E13] text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                    >
                      <span>选择文件并导入...</span>
                    </button>
                  </div>
                </div>
              )}

              {modalTab === 'paste' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#262320] mb-2">
                      粘贴 JSON 内容 (自动识别类型)
                    </label>
                    <textarea
                      value={modalPastedJsonText}
                      onChange={(e) => setModalPastedJsonText(e.target.value)}
                      placeholder='在此粘贴 JSON 文本，例如 {"orderInfo": ...} 或 [{"...": ...}]'
                      className="w-full h-36 p-3 font-mono text-[11px] bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl outline-none resize-none focus:border-[#E25C1D] text-[#262320]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE6DF]">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateFromPaste(modalPastedJsonText)}
                      className="px-4 py-2 bg-[#E25C1D] hover:bg-[#C74E13] text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      <span>确认生成表单</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
