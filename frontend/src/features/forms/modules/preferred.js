/**
 * Form 9: Preferred Dental Lab
 * Schema: PreferredDentalLabOrder
 */

export const meta = {
    id: 'preferred',
    label: '9. Preferred Dental Lab',
    fullName: 'Preferred Dental Lab',
    defaultPrefix: 'preferred-dental-case',
    badgeClass: 'pill-preferred',
};

let onEditedCallback = null;

const pfSelectedTeeth = new Set();
    const PF_OPTION_IDS = [
        'pfmNp', 'pfmSp', 'pfmPreciousWhite', 'pfmPreciousYellow', 'captek',
        'postAndCore', 'fullCastNp', 'fullCastSp', 'fullCastYellow', 'wantButton',
        'metalStop', 'noMetal360', 'eMaxCrown', 'eMaxVeneer', 'eMaxInlayOnlay',
        'bruxzir', 'layeredZirconia', 'porcelainButtMargin', 'marylandBridge',
        'castPartialFrame', 'valplast', 'inlayOnlayMetal', 'metalOcclusal',
        'rest', 'temporary'
    ];

    function initPreferredArch() {
        const upper = document.getElementById('pf_upperArchContainer');
        const lower = document.getElementById('pf_lowerArchContainer');
        for (let i = 0; i < 16; i++) {
            const toothNum = i + 1;
            const angle = Math.PI * (1 - i / 15);
            const btn = document.createElement('div');
            btn.className = 'tooth-node';
            btn.id = `pf_tooth_${toothNum}`;
            btn.textContent = toothNum;
            btn.style.left = `${107.5 + 76 * Math.cos(angle)}px`;
            btn.style.top = `${165 - 140 * Math.sin(angle)}px`;
            btn.onclick = () => {
                const k = String(toothNum);
                pfSelectedTeeth.has(k) ? pfSelectedTeeth.delete(k) : pfSelectedTeeth.add(k);
                updatePfTeethUI();
                if (typeof onEditedCallback === "function") onEditedCallback();
            };
            upper.appendChild(btn);
        }
        for (let i = 0; i < 16; i++) {
            const toothNum = 17 + i;
            const angle = Math.PI * (1 - i / 15);
            const btn = document.createElement('div');
            btn.className = 'tooth-node';
            btn.id = `pf_tooth_${toothNum}`;
            btn.textContent = toothNum;
            btn.style.left = `${107.5 + 76 * Math.cos(angle)}px`;
            btn.style.top = `${165 - 140 * Math.sin(angle)}px`;
            btn.onclick = () => {
                const k = String(toothNum);
                pfSelectedTeeth.has(k) ? pfSelectedTeeth.delete(k) : pfSelectedTeeth.add(k);
                updatePfTeethUI();
                if (typeof onEditedCallback === "function") onEditedCallback();
            };
            lower.appendChild(btn);
        }
    }

    function updatePfTeethUI() {
        for (let i = 1; i <= 32; i++) {
            const el = document.getElementById(`pf_tooth_${i}`);
            if (el) el.classList.toggle('selected', pfSelectedTeeth.has(String(i)));
        }
    }

    function populatePreferred(data = {}) {
        const ci = data.caseInfo || {};
        document.getElementById('pf_caseNumber').value = ci.caseNumber ?? '';
        document.getElementById('pf_date').value = ci.date ?? '';
        document.getElementById('pf_returnDate').value = ci.returnDate ?? '';
        document.getElementById('pf_stampedDate').value = ci.stampedDate ?? '';

        const ro = data.restorationOptions || {};
        PF_OPTION_IDS.forEach(id => {
            document.getElementById('pf_' + id).checked = !!ro[id];
        });

        const sp = data.specifications || {};
        document.getElementById('pf_shade').value = sp.shade ?? '';
        document.getElementById('pf_toothNumber').value = sp.toothNumber ?? '';
        document.getElementById('pf_handwrittenNotes').value = sp.handwrittenNotes ?? '';

        const ss = data.specialStain || {};
        document.getElementById('pf_stainIncisalLeft').value = ss.incisalLeft ?? '';
        document.getElementById('pf_stainIncisalCenter').value = ss.incisalCenter ?? '';
        document.getElementById('pf_stainIncisalRight').value = ss.incisalRight ?? '';
        document.getElementById('pf_stainBodyLeft').value = ss.bodyLeft ?? '';
        document.getElementById('pf_stainBodyCenter').value = ss.bodyCenter ?? '';
        document.getElementById('pf_stainBodyRight').value = ss.bodyRight ?? '';
        document.getElementById('pf_stainCervicalLeft').value = ss.cervicalLeft ?? '';
        document.getElementById('pf_stainCervicalCenter').value = ss.cervicalCenter ?? '';
        document.getElementById('pf_stainCervicalRight').value = ss.cervicalRight ?? '';

        pfSelectedTeeth.clear();
        const dc = data.designCase || {};
        if (Array.isArray(dc.circledTeeth)) dc.circledTeeth.forEach(t => pfSelectedTeeth.add(String(t)));
        updatePfTeethUI();
    }

    function extractPreferred() {
        const ro = {};
        PF_OPTION_IDS.forEach(id => {
            ro[id] = document.getElementById('pf_' + id).checked;
        });
        return {
            caseInfo: {
                caseNumber: document.getElementById('pf_caseNumber').value,
                date: document.getElementById('pf_date').value,
                returnDate: document.getElementById('pf_returnDate').value,
                stampedDate: document.getElementById('pf_stampedDate').value
            },
            restorationOptions: ro,
            specifications: {
                shade: document.getElementById('pf_shade').value,
                toothNumber: document.getElementById('pf_toothNumber').value,
                handwrittenNotes: document.getElementById('pf_handwrittenNotes').value
            },
            specialStain: {
                incisalLeft: document.getElementById('pf_stainIncisalLeft').value,
                incisalCenter: document.getElementById('pf_stainIncisalCenter').value,
                incisalRight: document.getElementById('pf_stainIncisalRight').value,
                bodyLeft: document.getElementById('pf_stainBodyLeft').value,
                bodyCenter: document.getElementById('pf_stainBodyCenter').value,
                bodyRight: document.getElementById('pf_stainBodyRight').value,
                cervicalLeft: document.getElementById('pf_stainCervicalLeft').value,
                cervicalCenter: document.getElementById('pf_stainCervicalCenter').value,
                cervicalRight: document.getElementById('pf_stainCervicalRight').value
            },
            designCase: {
                circledTeeth: Array.from(pfSelectedTeeth).sort((a, b) => Number(a) - Number(b))
            }
        };
    }

export function render() {
    return `<div class="lab-header">
                    <div class="lab-title">PREFERRED DENTAL LAB</div>
                    <div class="lab-sub">37 Woodland Road, Roseland NJ 07068</div>
                    <div class="lab-sub">973-228-7777</div>
                </div>

                <div class="case-row">
                    <div class="case-box">
                        <div class="case-field"><span>Case Number:</span><input type="text" id="pf_caseNumber" class="line-input" /></div>
                        <div class="case-field"><span>Date:</span><input type="text" id="pf_date" class="line-input" /></div>
                        <div class="case-field"><span>Return Date:</span><input type="text" id="pf_returnDate" class="line-input" /></div>
                    </div>
                    <div class="stamp-box">
                        <input type="text" id="pf_stampedDate" class="stamp-input" title="Stamped Date" />
                    </div>
                </div>

                <div class="options-grid">
                    <div class="options-col">
                        <label class="bracket-chk"><input type="checkbox" id="pf_pfmNp" /><span class="bracket-box"></span>PFM NP</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_pfmSp" /><span class="bracket-box"></span>PFM SP</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_pfmPreciousWhite" /><span class="bracket-box"></span>PFM Precious White</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_pfmPreciousYellow" /><span class="bracket-box"></span>PFM Precious Yellow</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_captek" /><span class="bracket-box"></span>Captek</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_postAndCore" /><span class="bracket-box"></span>Post &amp; Core</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_fullCastNp" /><span class="bracket-box"></span>Full Cast NP</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_fullCastSp" /><span class="bracket-box"></span>Full Cast SP</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_fullCastYellow" /><span class="bracket-box"></span>Full Cast Yellow</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_wantButton" /><span class="bracket-box"></span>Want Button</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_metalStop" /><span class="bracket-box"></span>Metal Stop</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_noMetal360" /><span class="bracket-box"></span>No Metal 360</label>
                    </div>
                    <div class="options-col">
                        <label class="bracket-chk"><input type="checkbox" id="pf_eMaxCrown" /><span class="bracket-box"></span>E-Max Crown</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_eMaxVeneer" /><span class="bracket-box"></span>E-Max Veneer</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_eMaxInlayOnlay" /><span class="bracket-box"></span>E-Max Inlay/Onlay</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_bruxzir" /><span class="bracket-box"></span>Bruxzir</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_layeredZirconia" /><span class="bracket-box"></span>Layered Zirconia</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_porcelainButtMargin" /><span class="bracket-box"></span>Porcelain Butt Margin</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_marylandBridge" /><span class="bracket-box"></span>Maryland Bridge</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_castPartialFrame" /><span class="bracket-box"></span>Cast Partial Frame</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_valplast" /><span class="bracket-box"></span>Valplast</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_inlayOnlayMetal" /><span class="bracket-box"></span>Inlay/Onlay Metal</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_metalOcclusal" /><span class="bracket-box"></span>Metal Occlusal</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_rest" /><span class="bracket-box"></span>Rest</label>
                        <label class="bracket-chk"><input type="checkbox" id="pf_temporary" /><span class="bracket-box"></span>Temporary</label>
                    </div>
                </div>

                <div class="shade-tooth-section">
                    <div class="st-row" style="width: 58%;"><span>SHADE</span><input type="text" id="pf_shade" class="line-input" /></div>
                    <div class="st-row" style="width: 85%;"><span>TOOTH #</span><input type="text" id="pf_toothNumber" class="line-input" /></div>
                </div>

                <div class="middle-section">
                    <div class="notes-area">
                        <textarea id="pf_handwrittenNotes" class="notes-textarea"></textarea>
                    </div>
                    <div class="special-stain-wrapper">
                        <div class="stain-tooth-container">
                            <svg width="96" height="112" viewBox="0 0 96 112">
                                <path d="M48,6 C22,6 10,48 10,82 C10,100 22,106 48,106 C74,106 86,100 86,82 C86,48 74,6 48,6 Z" fill="none" stroke="#222" stroke-width="1.8" />
                                <line x1="16" y1="42" x2="80" y2="42" stroke="#333" stroke-width="1.2" stroke-dasharray="2,3" />
                                <line x1="11" y1="74" x2="85" y2="74" stroke="#333" stroke-width="1.2" stroke-dasharray="2,3" />
                                <line x1="48" y1="8" x2="48" y2="105" stroke="#333" stroke-width="1.2" stroke-dasharray="2,3" />
                            </svg>
                            <div class="stain-grid-inputs">
                                <input type="text" id="pf_stainIncisalLeft" />
                                <input type="text" id="pf_stainIncisalCenter" />
                                <input type="text" id="pf_stainIncisalRight" />
                                <input type="text" id="pf_stainBodyLeft" />
                                <input type="text" id="pf_stainBodyCenter" />
                                <input type="text" id="pf_stainBodyRight" />
                                <input type="text" id="pf_stainCervicalLeft" />
                                <input type="text" id="pf_stainCervicalCenter" />
                                <input type="text" id="pf_stainCervicalRight" />
                            </div>
                        </div>
                        <div class="special-stain-label">SPECIAL STAIN</div>
                    </div>
                </div>

                <div class="design-section">
                    <div class="design-title">DESIGN CASE HERE</div>
                    <div class="arches-container">
                        <div class="arch-box" id="pf_upperArchContainer">
                            <div class="arch-center-label" style="top: 105px;">UPPER</div>
                            <div class="arch-side-label" style="left: 8px;">RIGHT</div>
                            <div class="arch-side-label" style="right: 8px;">LEFT</div>
                        </div>
                        <div class="arch-box" id="pf_lowerArchContainer">
                            <div class="arch-center-label" style="top: 105px;">LOWER</div>
                            <div class="arch-side-label" style="left: 8px;">LEFT</div>
                            <div class="arch-side-label" style="right: 8px;">RIGHT</div>
                        </div>
                    </div>
                </div>`;
}

export function populate(el, data = {}) {
    populatePreferred(data);
}

export function extract(el) {
    return extractPreferred();
}

export function init(el, onEdited) {
    onEditedCallback = onEdited;
    initPreferredArch();
    el.querySelectorAll('input, select, textarea').forEach(inp => {
        inp.addEventListener('input', onEdited);
        inp.addEventListener('change', onEdited);
    });
}
