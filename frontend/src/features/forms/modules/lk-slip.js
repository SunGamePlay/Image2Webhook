/**
 * Form 7: LK Dental Lab Order Slip
 * Schema: DentalLabOrderSlip
 */

import JsBarcode from 'jsbarcode';

export const meta = {
    id: 'lk',
    label: '7. LK Dental Lab Order Slip',
    fullName: 'LK Dental Lab Order Slip',
    defaultPrefix: 'lk-order-slip',
    badgeClass: 'pill-lk',
};

let onEditedCallback = null;

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function updateLkBarcode() {
        const val = document.getElementById('lk_barcodeValue').value.trim();
        const svg = document.getElementById('lk_barcodeSvg');
        if (!val) {
            svg.style.display = 'none';
            svg.innerHTML = '';
            return;
        }
        try {
            JsBarcode(svg, val, {
                format: "CODE128",
                width: 1.3,
                height: 24,
                displayValue: false,
                margin: 0
            });
            svg.style.display = 'block';
        } catch (e) {
            svg.style.display = 'none';
        }
    }

    function createLkItemRow(itemData = {}) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>
          <div class="item-cell-inner">
            <input type="text" class="clean-input item-desc-input" />
            <input type="text" class="handwritten-input item-note-input" />
          </div>
        </td>
        <td><input type="text" class="clean-input item-tooth-input" /></td>
        <td><input type="text" class="clean-input item-qty-input" /></td>
        <td class="col-action"><button type="button" class="btn-remove-row">&times;</button></td>
      `;
        tr.querySelector('.item-desc-input').value = itemData.description ?? '';
        tr.querySelector('.item-note-input').value = itemData.handwrittenNote ?? '';
        tr.querySelector('.item-tooth-input').value = itemData.toothNumber ?? '';
        tr.querySelector('.item-qty-input').value = itemData.quantity ?? '';
        tr.querySelector('.btn-remove-row').onclick = () => { tr.remove(); if (typeof onEditedCallback === "function") onEditedCallback(); };
        return tr;
    }

    function populateLk(data = {}) {
        const h = data.header || {};
        document.getElementById('lk_createdBy').value = h.createdBy ?? '';
        document.getElementById('lk_createdAt').value = h.createdAt ?? '';
        document.getElementById('lk_barcodeValue').value = h.barcode ?? '';
        document.getElementById('lk_orderNumber').value = h.orderNumber ?? '';
        document.getElementById('lk_panNumber').value = h.panNumber ?? '';
        document.getElementById('lk_shade').value = h.shade ?? '';
        document.getElementById('lk_shadeNote').value = h.shadeHandwrittenNote ?? '';
        updateLkBarcode();

        const dp = data.doctorAndPatient || {};
        document.getElementById('lk_doctorName').value = dp.doctorName ?? '';
        document.getElementById('lk_patientName').value = dp.patientName ?? '';
        document.getElementById('lk_patientNote').value = dp.patientHandwrittenNote ?? '';
        document.getElementById('lk_receivedDateStamp').value = dp.receivedDateStamp ?? '';

        const p = data.practiceInfo || {};
        document.getElementById('lk_practiceName').value = p.practiceName ?? '';
        document.getElementById('lk_practiceStreet').value = p.streetAddress ?? '';
        document.getElementById('lk_practiceCityStateZip').value = p.cityStateZip ?? '';
        document.getElementById('lk_practicePhone').value = p.phone ?? '';

        const s = data.shippingInfo || {};
        document.getElementById('lk_shipDate').value = s.shipDate ?? '';
        document.getElementById('lk_shipDayOfWeek').value = s.shipDayOfWeek ?? '';
        document.getElementById('lk_shipDateNote').value = s.shipDateHandwrittenNote ?? '';

        const tbody = document.getElementById('lk_itemsTableBody');
        tbody.innerHTML = '';
        const items = Array.isArray(data.items) && data.items.length > 0 ? data.items : Array.from({ length: 5 }, () => ({}));
        items.forEach(item => tbody.appendChild(createLkItemRow(item)));

        const n = data.additionalNotes || {};
        document.getElementById('lk_preferences').value = n.preferences ?? '';
        document.getElementById('lk_specialInstructions').value = n.specialInstructions ?? '';
    }

    function extractLk() {
        const items = Array.from(document.querySelectorAll('#lk_itemsTableBody tr'))
            .map(tr => ({
                description: tr.querySelector('.item-desc-input').value,
                handwrittenNote: tr.querySelector('.item-note-input').value,
                toothNumber: tr.querySelector('.item-tooth-input').value,
                quantity: tr.querySelector('.item-qty-input').value
            }))
            .filter(i => i.description !== '' || i.handwrittenNote !== '' || i.toothNumber !== '' || i.quantity !== '');

        return {
            header: {
                createdBy: document.getElementById('lk_createdBy').value,
                createdAt: document.getElementById('lk_createdAt').value,
                barcode: document.getElementById('lk_barcodeValue').value,
                orderNumber: document.getElementById('lk_orderNumber').value,
                panNumber: document.getElementById('lk_panNumber').value,
                shade: document.getElementById('lk_shade').value,
                shadeHandwrittenNote: document.getElementById('lk_shadeNote').value
            },
            doctorAndPatient: {
                doctorName: document.getElementById('lk_doctorName').value,
                patientName: document.getElementById('lk_patientName').value,
                patientHandwrittenNote: document.getElementById('lk_patientNote').value,
                receivedDateStamp: document.getElementById('lk_receivedDateStamp').value
            },
            practiceInfo: {
                practiceName: document.getElementById('lk_practiceName').value,
                streetAddress: document.getElementById('lk_practiceStreet').value,
                cityStateZip: document.getElementById('lk_practiceCityStateZip').value,
                phone: document.getElementById('lk_practicePhone').value
            },
            shippingInfo: {
                shipDate: document.getElementById('lk_shipDate').value,
                shipDayOfWeek: document.getElementById('lk_shipDayOfWeek').value,
                shipDateHandwrittenNote: document.getElementById('lk_shipDateNote').value
            },
            items,
            additionalNotes: {
                preferences: document.getElementById('lk_preferences').value,
                specialInstructions: document.getElementById('lk_specialInstructions').value
            }
        };
    }

    /* ---------------- ADAPTER 4: MAGIC CROWN / MARS DENTAL LAB ---------------- */
    const mcSelectedTeeth = new Set();

export function render() {
    return `<div class="slip-container">
                    <div class="header-row">
                        <div class="created-col">
                            <div class="created-line">
                                <span>Created by:</span>
                                <input type="text" id="lk_createdBy" class="clean-input" />
                            </div>
                            <input type="text" id="lk_createdAt" class="clean-input timestamp-input" />
                            <div class="barcode-wrapper">
                                <svg id="lk_barcodeSvg"></svg>
                                <input type="text" id="lk_barcodeValue" class="barcode-input" placeholder="Barcode value..." />
                            </div>
                        </div>

                        <div class="header-metric">
                            <span class="header-metric-label">Order #</span>
                            <input type="text" id="lk_orderNumber" class="clean-input header-metric-value" />
                        </div>

                        <div class="header-metric">
                            <span class="header-metric-label">Pan #</span>
                            <input type="text" id="lk_panNumber" class="clean-input header-metric-value" />
                        </div>

                        <div class="shade-col">
                            <span class="header-metric-label">Shade</span>
                            <div class="shade-value-row">
                                <input type="text" id="lk_shade" class="clean-input shade-input" />
                                <input type="text" id="lk_shadeNote" class="handwritten-input shade-note-input" title="Handwritten Shade Note" />
                            </div>
                        </div>
                    </div>

                    <div class="info-section">
                        <div class="info-left">
                            <span class="field-label">Doctor:</span>
                            <input type="text" id="lk_doctorName" class="clean-input doctor-input" />

                            <span class="field-label">Patient:</span>
                            <div class="patient-row">
                                <input type="text" id="lk_patientName" class="clean-input patient-input" />
                                <input type="text" id="lk_patientNote" class="handwritten-input patient-note-input" />
                            </div>

                            <div class="practice-block">
                                <input type="text" id="lk_practiceName" class="clean-input practice-line" />
                                <input type="text" id="lk_practiceStreet" class="clean-input practice-line" />
                                <input type="text" id="lk_practiceCityStateZip" class="clean-input practice-line" />
                                <input type="text" id="lk_practicePhone" class="clean-input practice-line" />
                            </div>
                        </div>

                        <div class="info-right">
                            <div class="stamp-row">
                                <input type="text" id="lk_receivedDateStamp" class="received-stamp-input" />
                            </div>
                            <div class="ship-date-wrapper">
                                <input type="text" id="lk_shipDateNote" class="handwritten-input ship-Override-note" />
                                <div class="ship-date-box">
                                    <span class="ship-date-title">Ship Date</span>
                                    <input type="text" id="lk_shipDate" class="clean-input ship-date-main" />
                                    <input type="text" id="lk_shipDayOfWeek" class="clean-input ship-date-day" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="items-section">
                        <table class="items-table">
                            <thead>
                            <tr>
                                <th>Item</th>
                                <th class="col-tooth">Tooth #</th>
                                <th class="col-qty">Qty</th>
                                <th class="col-action"></th>
                            </tr>
                            </thead>
                            <tbody id="lk_itemsTableBody"></tbody>
                        </table>
                        <div class="table-controls">
                            <button type="button" class="btn-add-row" id="lk_btnAddRow">+ Add Item Row</button>
                        </div>
                    </div>

                    <div class="footer-notes-section">
                        <div class="note-block">
                            <div class="note-block-header">Preferences</div>
                            <div class="note-block-content"><input type="text" id="lk_preferences" class="clean-input" /></div>
                        </div>
                        <div class="note-block">
                            <div class="note-block-header">Special Instructions</div>
                            <div class="note-block-content"><input type="text" id="lk_specialInstructions" class="clean-input" /></div>
                        </div>
                    </div>
                </div>`;
}

export function populate(el, data = {}) {
    populateLk(data);
}

export function extract(el) {
    return extractLk();
}

export function init(el, onEdited) {
    onEditedCallback = onEdited;
    const btnAdd = document.getElementById('lk_btnAddRow') || document.getElementById('lk_btnAddItemRow');
    if (btnAdd) {
        btnAdd.onclick = () => {
            const tbody = document.getElementById('lk_itemsTableBody');
            if (tbody) tbody.appendChild(createLkItemRow({}));
            if (onEditedCallback) onEditedCallback();
        };
    }
    el.querySelectorAll('input, select, textarea').forEach(inp => {
        inp.addEventListener('input', () => {
            if (inp.id === 'lk_barcodeValue' || inp.id === 'lk_barcodeInput') updateLkBarcode();
            onEdited();
        });
        inp.addEventListener('change', onEdited);
    });
}
