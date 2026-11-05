/**
 * Form 4: 珠海拜瑞 - 活動技工單 (Removable Standard Chinese Order)
 * Source: eForm and Schema/Removable.html & Removable.json
 * Schema: RemovableDentureLabOrder
 */

import JsBarcode from 'jsbarcode';

export const meta = {
    id: 'removable',
    label: '4. 珠海拜瑞 - 活動技工單',
    fullName: '珠海拜瑞 - 活動技工單',
    defaultPrefix: 'removable-order',
    badgeClass: 'pill-removable',
};

export function render() {
    return `
    <div class="form-sheet">

        <!-- Top Header -->
        <div class="top-header">
            <div class="header-box-left">
                <input type="text" id="rm_formCode" name="formCode" />
            </div>
            <div class="header-title">珠海拜瑞口腔医疗股份有限公司</div>
        </div>

        <!-- Main Form Grid -->
        <div class="main-grid">

            <!-- ROW 1: Order No / Try-In / Completion -->
            <div class="row" style="height: 44px;">
                <div class="cell" style="width: 49%;">
                    <span style="white-space: nowrap; margin-right: 8px;">单 号</span>
                    <input type="text" id="rm_orderNo" name="orderNo" class="cell-input" style="font-size: 20px; font-weight: bold;" />
                </div>
                <div class="cell" style="width: 4%; justify-content: center; padding: 2px;">
                    <span class="label-vertical">试戴</span>
                </div>
                <div class="cell" style="width: 21.5%;">
                    <input type="text" id="rm_tryInDate" name="tryInDate" class="cell-input" style="font-size: 18px; text-align: center;" />
                </div>
                <div class="cell" style="width: 4%; justify-content: center; padding: 2px;">
                    <span class="label-vertical">完成</span>
                </div>
                <div class="cell" style="width: 21.5%;">
                    <input type="text" id="rm_completionDate" name="completionDate" class="cell-input" style="font-size: 18px; text-align: center;" />
                </div>
            </div>

            <!-- ROW 2: Shade / Self-Provided Teeth / Tooth Position Cross -->
            <div class="row" style="height: 52px;">
                <div class="cell" style="width: 4%; justify-content: center; padding: 2px;">
                    <span class="label-vertical">比色</span>
                </div>
                <div class="cell" style="width: 10%;">
                    <input type="text" id="rm_shade" name="shade" class="cell-input" style="font-size: 18px; font-weight: bold; text-align: center;" />
                </div>
                <div class="cell" style="width: 4%; justify-content: center; padding: 2px;">
                    <span class="label-vertical" style="font-size: 11px; letter-spacing: 0;">自备牙</span>
                </div>
                <div class="cell" style="width: 9%; justify-content: flex-end;">
                    <input type="text" id="rm_selfProvidedTeethCount" name="selfProvidedTeethCount" class="cell-input" style="text-align: center;" />
                    <span style="font-size: 13px; margin-left: 2px;">颗</span>
                </div>
                <div class="cell" style="width: 4%; justify-content: center; padding: 2px; border-right: none;">
                    <span class="label-vertical">齿位</span>
                </div>
                <div class="cell" style="width: 69%; padding: 4px 24px;">
                    <div class="tooth-cross" style="height: 40px;">
                        <div class="tooth-quad"><input type="text" id="rm_toothPosUR" name="toothPosUR" /></div>
                        <div class="tooth-quad"><input type="text" id="rm_toothPosUL" name="toothPosUL" /></div>
                        <div class="tooth-quad"><input type="text" id="rm_toothPosLR" name="toothPosLR" /></div>
                        <div class="tooth-quad"><input type="text" id="rm_toothPosLL" name="toothPosLL" /></div>
                    </div>
                </div>
            </div>

            <!-- ROW 3: Acrylic / Design / Shipping Options (Left) & Barcode Area (Right) -->
            <div class="row" style="height: 114px;">
                <!-- Left 59%: 3 Sub-rows -->
                <div style="width: 59%; border-right: 1.5px solid var(--border-black); display: flex; flex-direction: column;">
                    
                    <!-- Sub-row 3A: Acrylic Type -->
                    <div style="height: 38px; border-bottom: 1.5px solid var(--border-black); display: flex; align-items: center; justify-content: space-between; padding: 0 10px; font-size: 14px; font-weight: bold;">
                        <span>胶：</span>
                        <label class="chk-label">199胶 <input type="checkbox" id="rm_acrylic199" name="acrylic199" /></label>
                        <label class="chk-label">轻度粉红胶 <input type="checkbox" id="rm_acrylicLightPink" name="acrylicLightPink" /></label>
                        <label class="chk-label">黑人胶 <input type="checkbox" id="rm_acrylicDark" name="acrylicDark" /></label>
                    </div>

                    <!-- Sub-row 3B: Design -->
                    <div style="height: 38px; border-bottom: 1.5px solid var(--border-black); display: flex; font-size: 14px; font-weight: bold;">
                        <div style="width: 46%; border-right: 1.5px solid var(--border-black); display: flex; align-items: center; padding: 0 10px;">
                            <label class="chk-label">设计：按模 <input type="checkbox" id="rm_designByModel" name="designByModel" /></label>
                        </div>
                        <div style="width: 54%; display: flex; align-items: center; justify-content: center; padding: 0 10px;">
                            <label class="chk-label">按设计图 <input type="checkbox" id="rm_designByDiagram" name="designByDiagram" /></label>
                        </div>
                    </div>

                    <!-- Sub-row 3C: Metal Articulator & Add Name -->
                    <div style="height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 10px; font-size: 14px; font-weight: bold;">
                        <label class="chk-label">上金属咬合器出货 <input type="checkbox" id="rm_shipWithMetalArticulator" name="shipWithMetalArticulator" /></label>
                        <label class="chk-label" style="margin-right: 18px;">加名字 <input type="checkbox" id="rm_addName" name="addName" /></label>
                    </div>
                </div>

                <!-- Right 41%: Barcode Area -->
                <div style="width: 41%; display: flex; align-items: center; justify-content: center;">
                    <div class="barcode-area-content">
                        <svg id="rm_barcodeSvg" style="display:none; max-width: 180px; height: 42px; margin-bottom: 4px;"></svg>
                        <input type="text" id="rm_barcode" name="barcode" class="barcode-input" />
                    </div>
                </div>
            </div>

            <!-- ROW 4: Left Column (Clasps, Reinforcing Wire, Ivoclar Teeth) & Right Column (Main Notes + Scheduler/Reviewer) -->
            <div class="row" style="height: 418px;">
                <!-- Left Column (35%) -->
                <div style="width: 35%; border-right: 1.5px solid var(--border-black); display: flex; flex-direction: column;">
                    
                    <!-- Clasps Top Block -->
                    <div style="height: 118px; border-bottom: 1.5px solid var(--border-black); padding: 8px 10px; display: flex; flex-direction: column; justify-content: space-between; font-size: 14px; font-weight: bold;">
                        <div>牙 扣</div>
                        <div style="display: flex; align-items: center;">
                            <span style="white-space: nowrap; margin-right: 6px;">自备牙扣</span>
                            <input type="text" id="rm_selfProvidedClasp" name="selfProvidedClasp" class="line-input" style="flex: 1;" />
                        </div>
                        <div style="display: flex; align-items: center;">
                            <span style="white-space: nowrap; margin-right: 6px;">我司牙扣</span>
                            <input type="text" id="rm_companyClasp" name="companyClasp" class="line-input" style="flex: 1;" />
                        </div>
                    </div>

                    <!-- 5 Clasp Cross Sub-rows -->
                    <div class="clasp-row">
                        <span>线 钩</span>
                        <div class="clasp-cross">
                            <div class="tooth-quad"><input type="text" id="rm_wireClaspUR" name="wireClaspUR" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_wireClaspUL" name="wireClaspUL" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_wireClaspLR" name="wireClaspLR" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_wireClaspLL" name="wireClaspLL" /></div>
                        </div>
                    </div>

                    <div class="clasp-row">
                        <span>透明钩</span>
                        <div class="clasp-cross">
                            <div class="tooth-quad"><input type="text" id="rm_clearClaspUR" name="clearClaspUR" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_clearClaspUL" name="clearClaspUL" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_clearClaspLR" name="clearClaspLR" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_clearClaspLL" name="clearClaspLL" /></div>
                        </div>
                    </div>

                    <div class="clasp-row">
                        <span>弹性钩</span>
                        <div class="clasp-cross">
                            <div class="tooth-quad"><input type="text" id="rm_elasticClaspUR" name="elasticClaspUR" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_elasticClaspUL" name="elasticClaspUL" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_elasticClaspLR" name="elasticClaspLR" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_elasticClaspLL" name="elasticClaspLL" /></div>
                        </div>
                    </div>

                    <div class="clasp-row">
                        <span>二代钩</span>
                        <div class="clasp-cross">
                            <div class="tooth-quad"><input type="text" id="rm_secondGenClaspUR" name="secondGenClaspUR" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_secondGenClaspUL" name="secondGenClaspUL" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_secondGenClaspLR" name="secondGenClaspLR" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_secondGenClaspLL" name="secondGenClaspLL" /></div>
                        </div>
                    </div>

                    <div class="clasp-row solid-bottom">
                        <span>树脂钩</span>
                        <div class="clasp-cross">
                            <div class="tooth-quad"><input type="text" id="rm_resinClaspUR" name="resinClaspUR" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_resinClaspUL" name="resinClaspUL" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_resinClaspLR" name="resinClaspLR" /></div>
                            <div class="tooth-quad"><input type="text" id="rm_resinClaspLL" name="resinClaspLL" /></div>
                        </div>
                    </div>

                    <!-- Reinforcing Wire -->
                    <div style="height: 36px; border-bottom: 1.5px solid var(--border-black); display: flex; align-items: center; justify-content: space-between; padding: 0 10px; font-size: 14px; font-weight: bold;">
                        <span>加强线</span>
                        <label class="chk-label"><input type="checkbox" id="rm_reinforceUpperJaw" name="reinforceUpperJaw" /> 上颚</label>
                        <label class="chk-label"><input type="checkbox" id="rm_reinforceLowerJaw" name="reinforceLowerJaw" /> 下颚</label>
                    </div>

                    <!-- Ivoclar Teeth -->
                    <div style="flex: 1; display: flex; align-items: center; padding: 0 10px; font-size: 14px; font-weight: bold;">
                        <span style="white-space: nowrap;">义获嘉牙</span>
                        <input type="text" id="rm_ivoclarTeethSets" name="ivoclarTeethSets" class="line-input" style="flex: 1; margin: 0 4px; text-align: center;" />
                        <span>套</span>
                    </div>
                </div>

                <!-- Right Column (65%) -->
                <div style="width: 65%; display: flex; flex-direction: column;">
                    <!-- Large Open Instruction / Stamp Area -->
                    <div style="flex: 1; padding: 12px 16px; display: flex; flex-direction: column;">
                        <textarea id="rm_workInstructions" name="workInstructions" style="width: 100%; flex: 1; border: none; background: transparent; resize: none; outline: none; font-size: 18px; font-weight: bold; color: var(--fill-blue); line-height: 1.5;"></textarea>
                    </div>

                    <!-- Bottom Scheduler & Reviewer Bar -->
                    <div style="height: 34px; border-top: 1.5px solid var(--border-black); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; font-size: 14px; font-weight: bold;">
                        <div style="display: flex; align-items: center; width: 48%;">
                            <span style="white-space: nowrap;">排单员：</span>
                            <input type="text" id="rm_scheduledBy" name="scheduledBy" class="line-input" style="flex: 1;" />
                        </div>
                        <div style="display: flex; align-items: center; width: 48%;">
                            <span style="white-space: nowrap;">审单员：</span>
                            <input type="text" id="rm_reviewedBy" name="reviewedBy" class="line-input" style="flex: 1;" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- ROW 5: Attachments -->
            <div class="row" style="height: 40px;">
                <div class="cell" style="width: 100%; justify-content: space-between; padding: 0 10px;">
                    <span style="white-space: nowrap;">附件：</span>
                    <label class="chk-label"><input type="checkbox" id="rm_attUpperModel" name="attUpperModel" /> 上模</label>
                    <label class="chk-label"><input type="checkbox" id="rm_attLowerModel" name="attLowerModel" /> 下模</label>
                    <label class="chk-label"><input type="checkbox" id="rm_attBiteWax" name="attBiteWax" /> 咬腊</label>
                    <label class="chk-label"><input type="checkbox" id="rm_attWaxRim" name="attWaxRim" /> 腊堤</label>
                    <label class="chk-label"><input type="checkbox" id="rm_attSpacer" name="attSpacer" /> 垫片</label>
                    <label class="chk-label"><input type="checkbox" id="rm_attArticulator" name="attArticulator" /> 咬合器</label>
                    <label class="chk-label"><input type="checkbox" id="rm_attImpressionTray" name="attImpressionTray" /> 牙托</label>
                    <label class="chk-label"><input type="checkbox" id="rm_attOldDentureBase" name="attOldDentureBase" /> 旧床</label>
                    <label class="chk-label"><input type="checkbox" id="rm_attPictures" name="attPictures" /> 图片</label>
                </div>
            </div>

        </div>
    </div>
    `;
}

function updateBarcodeUI(el) {
    const input = el.querySelector('#rm_barcode');
    const svg = el.querySelector('#rm_barcodeSvg');
    if (!input || !svg) return;

    const val = input.value.trim();
    if (!val) {
        svg.style.display = 'none';
        return;
    }

    try {
        JsBarcode(svg, val, {
            format: 'CODE128',
            width: 1.5,
            height: 38,
            displayValue: false,
            margin: 0,
        });
        svg.style.display = 'block';
    } catch {
        svg.style.display = 'none';
    }
}

export function populate(el, data = {}) {
    const h = data.header || {};
    const o = data.orderInfo || {};
    const st = data.shadeAndToothPosition || {};
    const tp = st.toothPosition || {};
    const adb = data.acrylicDesignAndBarcode || {};
    const ac = adb.acrylic || {};
    const ds = adb.design || {};
    const so = adb.shippingOptions || {};
    const cr = data.claspsAndReinforcement || {};
    const wc = cr.wireClasp || {};
    const cc = cr.clearClasp || {};
    const ec = cr.elasticClasp || {};
    const sgc = cr.secondGenClasp || {};
    const rc = cr.resinClasp || {};
    const rw = cr.reinforcingWire || {};
    const is = data.instructionsAndReview || {};
    const att = data.attachments || {};

    const setVal = (id, val) => {
        const inp = el.querySelector(`#${id}`);
        if (inp) inp.value = val ?? '';
    };

    const setChk = (id, val) => {
        const inp = el.querySelector(`#${id}`);
        if (inp) inp.checked = !!val;
    };

    // Header
    setVal('rm_formCode', h.formCode);

    // Order Info
    setVal('rm_orderNo', o.orderNo);
    setVal('rm_tryInDate', o.tryInDate);
    setVal('rm_completionDate', o.completionDate);

    // Shade & Tooth Position
    setVal('rm_shade', st.shade);
    setVal('rm_selfProvidedTeethCount', st.selfProvidedTeethCount);
    setVal('rm_toothPosUR', tp.upperRight);
    setVal('rm_toothPosUL', tp.upperLeft);
    setVal('rm_toothPosLR', tp.lowerRight);
    setVal('rm_toothPosLL', tp.lowerLeft);

    // Acrylic, Design & Barcode
    setChk('rm_acrylic199', ac.type199);
    setChk('rm_acrylicLightPink', ac.lightPink);
    setChk('rm_acrylicDark', ac.dark);
    setChk('rm_designByModel', ds.byModel);
    setChk('rm_designByDiagram', ds.byDiagram);
    setChk('rm_shipWithMetalArticulator', so.shipWithMetalArticulator);
    setChk('rm_addName', so.addName);
    setVal('rm_barcode', adb.barcode);

    // Clasps & Reinforcement
    setVal('rm_selfProvidedClasp', cr.selfProvidedClasp);
    setVal('rm_companyClasp', cr.companyClasp);

    setVal('rm_wireClaspUR', wc.upperRight);
    setVal('rm_wireClaspUL', wc.upperLeft);
    setVal('rm_wireClaspLR', wc.lowerRight);
    setVal('rm_wireClaspLL', wc.lowerLeft);

    setVal('rm_clearClaspUR', cc.upperRight);
    setVal('rm_clearClaspUL', cc.upperLeft);
    setVal('rm_clearClaspLR', cc.lowerRight);
    setVal('rm_clearClaspLL', cc.lowerLeft);

    setVal('rm_elasticClaspUR', ec.upperRight);
    setVal('rm_elasticClaspUL', ec.upperLeft);
    setVal('rm_elasticClaspLR', ec.lowerRight);
    setVal('rm_elasticClaspLL', ec.lowerLeft);

    setVal('rm_secondGenClaspUR', sgc.upperRight);
    setVal('rm_secondGenClaspUL', sgc.upperLeft);
    setVal('rm_secondGenClaspLR', sgc.lowerRight);
    setVal('rm_secondGenClaspLL', sgc.lowerLeft);

    setVal('rm_resinClaspUR', rc.upperRight);
    setVal('rm_resinClaspUL', rc.upperLeft);
    setVal('rm_resinClaspLR', rc.lowerRight);
    setVal('rm_resinClaspLL', rc.lowerLeft);

    setChk('rm_reinforceUpperJaw', rw.upperJaw);
    setChk('rm_reinforceLowerJaw', rw.lowerJaw);
    setVal('rm_ivoclarTeethSets', cr.ivoclarTeethSets);

    // Instructions & Signatures
    setVal('rm_workInstructions', is.workInstructions);
    setVal('rm_scheduledBy', is.scheduledBy);
    setVal('rm_reviewedBy', is.reviewedBy);

    // Attachments
    setChk('rm_attUpperModel', att.upperModel);
    setChk('rm_attLowerModel', att.lowerModel);
    setChk('rm_attBiteWax', att.biteWax);
    setChk('rm_attWaxRim', att.waxRim);
    setChk('rm_attSpacer', att.spacer);
    setChk('rm_attArticulator', att.articulator);
    setChk('rm_attImpressionTray', att.impressionTray);
    setChk('rm_attOldDentureBase', att.oldDentureBase);
    setChk('rm_attPictures', att.pictures);

    updateBarcodeUI(el);
}

export function extract(el) {
    const getVal = (id) => el.querySelector(`#${id}`)?.value ?? '';
    const getChk = (id) => !!el.querySelector(`#${id}`)?.checked;

    return {
        header: {
            formCode: getVal('rm_formCode'),
        },
        orderInfo: {
            orderNo: getVal('rm_orderNo'),
            tryInDate: getVal('rm_tryInDate'),
            completionDate: getVal('rm_completionDate'),
        },
        shadeAndToothPosition: {
            shade: getVal('rm_shade'),
            selfProvidedTeethCount: getVal('rm_selfProvidedTeethCount'),
            toothPosition: {
                upperRight: getVal('rm_toothPosUR'),
                upperLeft: getVal('rm_toothPosUL'),
                lowerRight: getVal('rm_toothPosLR'),
                lowerLeft: getVal('rm_toothPosLL'),
            },
        },
        acrylicDesignAndBarcode: {
            acrylic: {
                type199: getChk('rm_acrylic199'),
                lightPink: getChk('rm_acrylicLightPink'),
                dark: getChk('rm_acrylicDark'),
            },
            design: {
                byModel: getChk('rm_designByModel'),
                byDiagram: getChk('rm_designByDiagram'),
            },
            shippingOptions: {
                shipWithMetalArticulator: getChk('rm_shipWithMetalArticulator'),
                addName: getChk('rm_addName'),
            },
            barcode: getVal('rm_barcode'),
        },
        claspsAndReinforcement: {
            selfProvidedClasp: getVal('rm_selfProvidedClasp'),
            companyClasp: getVal('rm_companyClasp'),
            wireClasp: {
                upperRight: getVal('rm_wireClaspUR'),
                upperLeft: getVal('rm_wireClaspUL'),
                lowerRight: getVal('rm_wireClaspLR'),
                lowerLeft: getVal('rm_wireClaspLL'),
            },
            clearClasp: {
                upperRight: getVal('rm_clearClaspUR'),
                upperLeft: getVal('rm_clearClaspUL'),
                lowerRight: getVal('rm_clearClaspLR'),
                lowerLeft: getVal('rm_clearClaspLL'),
            },
            elasticClasp: {
                upperRight: getVal('rm_elasticClaspUR'),
                upperLeft: getVal('rm_elasticClaspUL'),
                lowerRight: getVal('rm_elasticClaspLR'),
                lowerLeft: getVal('rm_elasticClaspLL'),
            },
            secondGenClasp: {
                upperRight: getVal('rm_secondGenClaspUR'),
                upperLeft: getVal('rm_secondGenClaspUL'),
                lowerRight: getVal('rm_secondGenClaspLR'),
                lowerLeft: getVal('rm_secondGenClaspLL'),
            },
            resinClasp: {
                upperRight: getVal('rm_resinClaspUR'),
                upperLeft: getVal('rm_resinClaspUL'),
                lowerRight: getVal('rm_resinClaspLR'),
                lowerLeft: getVal('rm_resinClaspLL'),
            },
            reinforcingWire: {
                upperJaw: getChk('rm_reinforceUpperJaw'),
                lowerJaw: getChk('rm_reinforceLowerJaw'),
            },
            ivoclarTeethSets: getVal('rm_ivoclarTeethSets'),
        },
        instructionsAndReview: {
            workInstructions: getVal('rm_workInstructions'),
            scheduledBy: getVal('rm_scheduledBy'),
            reviewedBy: getVal('rm_reviewedBy'),
        },
        attachments: {
            upperModel: getChk('rm_attUpperModel'),
            lowerModel: getChk('rm_attLowerModel'),
            biteWax: getChk('rm_attBiteWax'),
            waxRim: getChk('rm_attWaxRim'),
            spacer: getChk('rm_attSpacer'),
            articulator: getChk('rm_attArticulator'),
            impressionTray: getChk('rm_attImpressionTray'),
            oldDentureBase: getChk('rm_attOldDentureBase'),
            pictures: getChk('rm_attPictures'),
        },
    };
}

export function init(el, onEdited) {
    el.querySelectorAll('input, textarea').forEach((inp) => {
        inp.addEventListener('input', () => {
            if (inp.id === 'rm_barcode') {
                updateBarcodeUI(el);
            }
            if (onEdited) onEdited();
        });
        inp.addEventListener('change', () => {
            if (onEdited) onEdited();
        });
    });
}
