/**
 * Form 6: Kimsey & Wright Dental Lab
 * Schema: KimseyAndWrightDentalLabOrder
 */

import JsBarcode from 'jsbarcode';

export const meta = {
    id: 'kimsey',
    label: '6. Kimsey & Wright Dental Lab',
    fullName: 'Kimsey & Wright Dental Lab',
    defaultPrefix: 'kimsey-wright-order',
    badgeClass: 'pill-kimsey',
};

let onEditedCallback = null;

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function autoResizeTextarea(el) {
    if (!el) return;
    el.style.height = 'auto';
    if (el.scrollHeight > 0) {
        el.style.height = el.scrollHeight + 'px';
    }
}

function updateKwBarcode() {
    const elOrderNumber = document.getElementById('kw_orderNumber');
    const val = elOrderNumber ? elOrderNumber.value.trim() : '';
    const svg = document.getElementById('kw_barcodeSvg');
    if (!svg) return;
    if (!val) {
        svg.style.display = 'none';
        svg.innerHTML = '';
        return;
    }
    try {
        const barcodeFn = typeof JsBarcode !== 'undefined' ? JsBarcode : (typeof window !== 'undefined' ? window.JsBarcode : null);
        if (typeof barcodeFn === 'function') {
            barcodeFn(svg, val, {
                format: "CODE128",
                width: 1.6,
                height: 50,
                displayValue: false,
                background: "transparent",
                lineColor: "#111820",
                margin: 0
            });
            svg.style.display = 'block';
        }
    } catch (e) {
        svg.style.display = 'none';
    }
}

function addKwProductRow(description = '', note = '') {
    const container = document.getElementById('kw_productsContainer');
    if (!container) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'product-item';
    wrapper.innerHTML = `
    <div class="product-main-line">
      <input type="text" class="product-name-input" value="${escapeHtml(description)}" />
      <button type="button" class="remove-item-btn" title="Remove product">✕</button>
    </div>
    <div class="product-note-line">
      <span>•</span>
      <input type="text" class="product-note-input" value="${escapeHtml(note)}" />
    </div>
  `;
    wrapper.querySelector('.remove-item-btn').onclick = () => {
        wrapper.remove();
        if (typeof onEditedCallback === "function") onEditedCallback();
    };
    wrapper.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', () => { if (typeof onEditedCallback === "function") onEditedCallback(); });
        inp.addEventListener('change', () => { if (typeof onEditedCallback === "function") onEditedCallback(); });
    });
    container.appendChild(wrapper);
}

function addKwAttachedFileRow(filename = '') {
    const container = document.getElementById('kw_attachedFilesContainer');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'file-item-row';
    row.innerHTML = `
    <span>•</span>
    <input type="text" class="attached-file-input" value="${escapeHtml(filename)}" />
    <button type="button" class="remove-item-btn" title="Remove file">✕</button>
  `;
    row.querySelector('.remove-item-btn').onclick = () => {
        row.remove();
        if (typeof onEditedCallback === "function") onEditedCallback();
    };
    const inp = row.querySelector('.attached-file-input');
    if (inp) {
        inp.addEventListener('input', () => { if (typeof onEditedCallback === "function") onEditedCallback(); });
        inp.addEventListener('change', () => { if (typeof onEditedCallback === "function") onEditedCallback(); });
    }
    container.appendChild(row);
}

function populateKimsey(data = {}) {
    const h = data.header || {};
    const elOrderNumber = document.getElementById('kw_orderNumber');
    const elStampedDate = document.getElementById('kw_stampedDate');
    if (elOrderNumber) elOrderNumber.value = h.orderNumber ?? '';
    if (elStampedDate) elStampedDate.value = h.stampedDate ?? '';
    updateKwBarcode();

    const ci = data.caseInfo || {};
    const elDueDate = document.getElementById('kw_dueDate');
    const elDoctor = document.getElementById('kw_doctor');
    const elPatient = document.getElementById('kw_patient');
    const elPan = document.getElementById('kw_pan');
    if (elDueDate) elDueDate.value = ci.dueDate ?? '';
    if (elDoctor) elDoctor.value = ci.doctor ?? '';
    if (elPatient) elPatient.value = ci.patient ?? '';
    if (elPan) elPan.value = ci.pan ?? '';

    const prodContainer = document.getElementById('kw_productsContainer');
    if (prodContainer) {
        prodContainer.innerHTML = '';
        const products = Array.isArray(data.products) && data.products.length > 0 ? data.products : [{ description: '', notes: [''] }];
        products.forEach(item => {
            const firstNote = Array.isArray(item.notes) && item.notes.length > 0 ? item.notes[0] : '';
            addKwProductRow(item.description ?? '', firstNote);
        });
    }

    const shadeEl = document.getElementById('kw_shade');
    const specEl = document.getElementById('kw_specialInstructions');
    if (shadeEl) {
        shadeEl.value = data.shade ?? '';
        autoResizeTextarea(shadeEl);
    }
    if (specEl) {
        specEl.value = data.specialInstructions ?? '';
        autoResizeTextarea(specEl);
    }

    const filesContainer = document.getElementById('kw_attachedFilesContainer');
    if (filesContainer) {
        filesContainer.innerHTML = '';
        const files = Array.isArray(data.attachedFiles) && data.attachedFiles.length > 0 ? data.attachedFiles : [''];
        files.forEach(f => addKwAttachedFileRow(f));
    }
}

function extractKimsey() {
    const products = [];
    document.querySelectorAll('#kw_productsContainer .product-item').forEach(el => {
        const desc = el.querySelector('.product-name-input')?.value.trim() || '';
        const note = el.querySelector('.product-note-input')?.value.trim() || '';
        if (desc || note) products.push({ description: desc, notes: note ? [note] : [] });
    });

    const attachedFiles = [];
    document.querySelectorAll('#kw_attachedFilesContainer .attached-file-input').forEach(input => {
        const val = input.value.trim();
        if (val) attachedFiles.push(val);
    });

    return {
        header: {
            orderNumber: document.getElementById('kw_orderNumber')?.value ?? '',
            stampedDate: document.getElementById('kw_stampedDate')?.value ?? ''
        },
        caseInfo: {
            dueDate: document.getElementById('kw_dueDate')?.value ?? '',
            doctor: document.getElementById('kw_doctor')?.value ?? '',
            patient: document.getElementById('kw_patient')?.value ?? '',
            pan: document.getElementById('kw_pan')?.value ?? ''
        },
        products,
        shade: document.getElementById('kw_shade')?.value ?? '',
        specialInstructions: document.getElementById('kw_specialInstructions')?.value ?? '',
        attachedFiles
    };
}

export function render() {
    return `<div class="form-left-column">
                    <div class="header-top">
                        <div class="lab-info">
                            <h1>Kimsey and Wright Dental Lab</h1>
                            <p>2000 Hwy 76</p>
                            <p>Hiawassee, GA 30546</p>
                            <p>Tel. (706) 896-5768</p>
                        </div>
                        <div class="stamp-wrapper">
                            <input type="text" id="kw_stampedDate" class="stamp-input" title="Stamped Date" />
                        </div>
                        <div class="barcode-box">
                            <svg id="kw_barcodeSvg"></svg>
                            <div class="order-no-row">
                                <span>No.</span>
                                <input type="text" id="kw_orderNumber" class="order-no-input" />
                            </div>
                        </div>
                    </div>

                    <div class="due-date-row">
                        <input type="text" id="kw_dueDate" class="due-date-input" />
                    </div>

                    <div class="field-row">
                        <label for="kw_doctor">Doctor:</label>
                        <input type="text" id="kw_doctor" class="field-input-bold" />
                    </div>

                    <div class="patient-pan-row">
                        <div class="patient-group">
                            <label for="kw_patient" style="margin-right: 6px;">Patient:</label>
                            <input type="text" id="kw_patient" class="field-input-bold" />
                        </div>
                        <div class="pan-group">
                            <label for="kw_pan" style="margin-right: 4px;">Pan:</label>
                            <input type="text" id="kw_pan" class="pan-input" />
                        </div>
                    </div>

                    <div class="section-block">
                        <div class="section-header">
                            <span>PRODUCTS</span>
                            <button type="button" class="mini-btn" id="kw_btnAddProduct">+ Add Product</button>
                        </div>
                        <div id="kw_productsContainer"></div>
                    </div>

                    <div class="section-block">
                        <div class="section-header"><span>SHADE</span></div>
                        <textarea id="kw_shade" class="section-textarea" rows="1"></textarea>
                    </div>

                    <div class="section-block">
                        <div class="section-header"><span>SPECIAL INSTRUCTIONS</span></div>
                        <textarea id="kw_specialInstructions" class="instructions-textarea" rows="2"></textarea>
                    </div>

                    <div class="section-block">
                        <div class="section-header">
                            <span>ATTACHED FILES</span>
                            <button type="button" class="mini-btn" id="kw_btnAddFile">+ Add File</button>
                        </div>
                        <div id="kw_attachedFilesContainer"></div>
                    </div>
                </div>`;
}

export function populate(el, data = {}) {
    populateKimsey(data);
}

export function extract(el) {
    return extractKimsey();
}

export function init(el, onEdited) {
    onEditedCallback = onEdited;
    const btnAddProd = document.getElementById('kw_btnAddProduct') || document.getElementById('kw_btnAddProductRow');
    if (btnAddProd) {
        btnAddProd.onclick = () => {
            addKwProductRow();
            if (typeof onEditedCallback === 'function') onEditedCallback();
        };
    }
    const btnAddFile = document.getElementById('kw_btnAddFile') || document.getElementById('kw_btnAddAttachedFileRow');
    if (btnAddFile) {
        btnAddFile.onclick = () => {
            addKwAttachedFileRow();
            if (typeof onEditedCallback === 'function') onEditedCallback();
        };
    }
    el.querySelectorAll('input, select, textarea').forEach(inp => {
        inp.addEventListener('input', () => {
            if (inp.id === 'kw_orderNumber') updateKwBarcode();
            if (inp.id === 'kw_shade' || inp.id === 'kw_specialInstructions') autoResizeTextarea(inp);
            if (typeof onEditedCallback === 'function') onEditedCallback();
        });
        inp.addEventListener('change', () => {
            if (typeof onEditedCallback === 'function') onEditedCallback();
        });
    });
}
