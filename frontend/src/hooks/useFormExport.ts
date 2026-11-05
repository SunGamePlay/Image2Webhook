import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { notify } from '../components/common/Toast';

export function useFormExport() {
  const exportJson = useCallback((data: any, fileName = 'dental-form') => {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      downloadBlob(blob, `${fileName}.json`);
      notify('已成功导出 JSON 文件', 'success');
    } catch (err: any) {
      console.error('Error exporting JSON:', err);
      notify(`导出 JSON 失败: ${err.message || '未知错误'}`, 'error');
    }
  }, []);

  const printForm = useCallback((fileName = 'dental-form') => {
    try {
      const originalTitle = document.title;
      document.title = fileName;
      window.print();
      setTimeout(() => { document.title = originalTitle; }, 500);
    } catch (err: any) {
      console.error('Error triggering print:', err);
      notify(`打印调用失败: ${err.message || '未知错误'}`, 'error');
    }
  }, []);

  const exportPng = useCallback(async (element: HTMLElement | null, fileName = 'dental-form') => {
    if (!element) {
      notify('未找到可导出的表单内容', 'error');
      return;
    }
    try {
      const canvas = await renderElementToCanvas(element);
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `${fileName}.png`);
          notify('已成功导出 PNG 图片', 'success');
        } else {
          notify('导出 PNG 失败', 'error');
        }
      }, 'image/png');
    } catch (err: any) {
      console.error('Error exporting PNG:', err);
      notify(`导出 PNG 失败: ${err.message || '未知错误'}`, 'error');
    }
  }, []);

  const exportPdf = useCallback(async (element: HTMLElement | null, fileName = 'dental-form') => {
    if (!element) {
      notify('未找到可导出的表单内容', 'error');
      return;
    }
    try {
      const canvas = await renderElementToCanvas(element);
      const imgData = canvas.toDataURL('image/png');
      const w = Math.max(1, Math.round(canvas.width / 2));
      const h = Math.max(1, Math.round(canvas.height / 2));
      const orientation = w > h ? 'l' : 'p';
      const pdf = new jsPDF({ orientation, unit: 'pt', format: [w, h], compress: true });
      pdf.addImage(imgData, 'PNG', 0, 0, w, h, undefined, 'FAST');
      pdf.save(`${fileName}.pdf`);
      notify('已成功导出 PDF 文件', 'success');
    } catch (err: any) {
      console.error('Error exporting PDF:', err);
      notify(`导出 PDF 失败: ${err.message || '未知错误'}`, 'error');
    }
  }, []);

  return { exportJson, printForm, exportPng, exportPdf };
}

async function renderElementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: 1600,
    windowHeight: Math.max(element.scrollHeight || 0, 1600),
    onclone: (clonedDoc, clonedEl) => {
      // 1. Convert live input, textarea, and checkbox values into visible DOM text in the clone.
      // In html2canvas, native <input> elements suffer from baseline miscalculation and internal
      // padding-box clipping (which clips off the top of large header texts like "BO" and "Z"),
      // and checkboxes lose their custom CSS ::after checkmarks. Replacing them with styled
      // spans/divs reproduces the exact typography and appearance of browser printing (as in Fixed.html).
      const liveInputs = Array.from(element.querySelectorAll('input, textarea, select')) as (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[];
      const cloneInputs = Array.from(clonedEl.querySelectorAll('input, textarea, select')) as (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[];

      cloneInputs.forEach((cEl, idx) => {
        const lEl = liveInputs[idx];
        if (!lEl) return;

        if (lEl.tagName === 'SELECT') {
          const sEl = lEl as HTMLSelectElement;
          const span = clonedDoc.createElement('span');
          span.className = cEl.className;
          span.textContent = sEl.options[sEl.selectedIndex]?.text || '';
          span.style.cssText = window.getComputedStyle(lEl).cssText;
          span.style.display = 'inline-flex';
          span.style.alignItems = 'center';
          cEl.replaceWith(span);
        } else if ((lEl as HTMLInputElement).type === 'checkbox' || (lEl as HTMLInputElement).type === 'radio') {
          const chk = lEl as HTMLInputElement;
          const span = clonedDoc.createElement('span');
          span.className = cEl.className;
          const computed = window.getComputedStyle(lEl);
          span.style.cssText = computed.cssText;
          span.style.display = 'inline-flex';
          span.style.alignItems = 'center';
          span.style.justifyContent = 'center';
          span.style.boxSizing = 'border-box';
          if (chk.checked) {
            span.textContent = '✓';
            span.style.backgroundColor = '#1b3b8c';
            span.style.borderColor = '#1b3b8c';
            span.style.color = '#ffffff';
            span.style.fontSize = '11px';
            span.style.fontWeight = 'bold';
            span.style.lineHeight = '1';
          } else {
            span.textContent = '';
            span.style.backgroundColor = 'transparent';
            span.style.borderColor = '#2c3e50';
          }
          cEl.replaceWith(span);
        } else if (lEl.tagName === 'TEXTAREA') {
          const div = clonedDoc.createElement('div');
          div.className = cEl.className;
          div.textContent = (lEl as HTMLTextAreaElement).value || '';
          div.style.cssText = window.getComputedStyle(lEl).cssText;
          div.style.whiteSpace = 'pre-wrap';
          div.style.wordBreak = 'break-word';
          div.style.height = 'auto';
          div.style.overflow = 'visible';
          cEl.replaceWith(div);
        } else {
          const span = clonedDoc.createElement('span');
          span.className = cEl.className;
          span.textContent = (lEl as HTMLInputElement).value || '';
          const computed = window.getComputedStyle(lEl);
          span.style.cssText = computed.cssText;
          span.style.display = 'inline-flex';
          span.style.alignItems = 'center';
          span.style.justifyContent = computed.textAlign === 'center' ? 'center' : (computed.textAlign === 'right' ? 'flex-end' : 'flex-start');
          span.style.overflow = 'visible';
          span.style.lineHeight = 'normal';
          cEl.replaceWith(span);
        }
      });

      // 2. Remove any orphaned pseudo-elements on remaining input elements to avoid parser EOF errors
      clonedDoc.querySelectorAll('input html2canvaspseudoelement').forEach(el => el.remove());

      // 3. Reset all scroll positions in the cloned document so no ancestor or viewport scroll
      // offsets shift the element bounds and cause the top of the canvas to be cut off.
      clonedDoc.defaultView?.scrollTo(0, 0);
      clonedDoc.querySelectorAll('*').forEach((el: any) => {
        if (el.scrollTop) el.scrollTop = 0;
        if (el.scrollLeft) el.scrollLeft = 0;
      });

      // 4. Remove height and overflow constraints on document root and body in the clone
      if (clonedDoc.documentElement) {
        clonedDoc.documentElement.style.overflow = 'visible';
        clonedDoc.documentElement.style.height = 'auto';
      }
      if (clonedDoc.body) {
        clonedDoc.body.style.overflow = 'visible';
        clonedDoc.body.style.height = 'auto';
        clonedDoc.body.style.minHeight = 'auto';
      }

      // 5. Unconstrain ancestor elements so the form sheet retains its natural author-defined
      // width and height, is not squished by the comparison editor's splitRatio container,
      // and is not offset or clipped by ancestor scrolling / flex constraints.
      let parent = clonedEl ? clonedEl.parentElement : null;
      while (parent && parent !== clonedDoc.body) {
        parent.style.width = 'max-content';
        parent.style.maxWidth = 'none';
        parent.style.height = 'auto';
        parent.style.maxHeight = 'none';
        parent.style.overflow = 'visible';
        parent.scrollTop = 0;
        parent.scrollLeft = 0;
        parent = parent.parentElement;
      }
    },
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 400);
}
