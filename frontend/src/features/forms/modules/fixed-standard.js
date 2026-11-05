/**
 * Form 3: 珠海拜瑞 - 固定技工單 (Fixed Standard Chinese Order)
 * Source: eForm and Schema/Fixed.html & Fixed.json
 * Schema: DentalLabOrder
 */

import JsBarcode from 'jsbarcode';

export const meta = {
    id: 'fixed',
    label: '3. 珠海拜瑞 - 固定技工單',
    fullName: '珠海拜瑞 - 固定技工單',
    defaultPrefix: 'fixed-order',
    badgeClass: 'pill-fixed',
};

export function render() {
    return `
    <div class="form-sheet">

        <!-- Top Header -->
        <div class="top-header">
            <div class="header-box-left">
                <input type="text" id="fx_formCode" name="formCode" />
            </div>
            <div class="header-center">
                <div>珠海拜瑞口腔</div>
                <div>医疗股份有限公司</div>
            </div>
            <div class="header-box-right">
                <input type="text" id="fx_topRightBox" name="topRightBox" class="top-right-input" />
            </div>
        </div>

        <!-- Main Form Grid -->
        <div class="main-grid">

            <!-- ROW 1: Order No / Arrival Date / Reschedule -->
            <div class="row" style="height: 44px;">
                <div class="cell" style="width: 48%;">
                    <span class="label-vertical" style="margin-right: 8px;">单号</span>
                    <input type="text" id="fx_orderNo" name="orderNo" class="cell-input" style="font-size: 20px; font-weight: bold;" />
                </div>
                <div class="cell" style="width: 3.5%; padding: 2px;">
                    <span class="label-vertical">到货</span>
                </div>
                <div class="cell" style="width: 10%;">
                    <input type="text" id="fx_arrivalDate" name="arrivalDate" class="cell-input" style="font-size: 18px; text-align: center;" />
                </div>
                <div class="cell" style="width: 3.5%; padding: 2px;">
                    <span class="label-vertical">改期</span>
                </div>
                <div class="cell" style="width: 35%;">
                    <input type="text" id="fx_rescheduleDate" name="rescheduleDate" class="cell-input" />
                </div>
            </div>

            <!-- ROW 2: Tooth Chart / Pontic Type / Barcode Area -->
            <div class="row" style="height: 98px;">
                <!-- Tooth Chart (Cross) -->
                <div class="cell" style="width: 48%; padding: 2px 6px;">
                    <div class="tooth-cross-wrapper">
                        <div class="tooth-cross">
                            <div class="tooth-quad"><input type="text" id="fx_quadUR" name="quadUR" /></div>
                            <div class="tooth-quad"><input type="text" id="fx_quadUL" name="quadUL" /></div>
                            <div class="tooth-quad"><input type="text" id="fx_quadLR" name="quadLR" /></div>
                            <div class="tooth-quad"><input type="text" id="fx_quadLL" name="quadLL" /></div>
                        </div>
                        <div class="pm-row">
                            <div>
                                <input type="text" id="fx_pCount" name="pCount" class="line-input" style="width: 75px; text-align: center; font-size: 16px; font-weight: bold;" /> P
                            </div>
                            <div>
                                <input type="text" id="fx_mCount" name="mCount" class="line-input" style="width: 75px; text-align: center; font-size: 16px; font-weight: bold;" /> M
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pontic Design -->
                <div class="cell pontic-cell" style="width: 17%;">
                    <div class="pontic-options">
                        <div class="pontic-item" id="fx_ponticSaddleBox">
                            <span>马鞍型</span>
                            <svg width="28" height="26" viewBox="0 0 32 30" style="margin-top:4px;">
                                <path d="M6,14 C6,6 26,6 26,14 C26,20 22,24 16,20 C10,24 6,20 6,14 Z" fill="none" stroke="#333" stroke-width="1.5"/>
                                <path d="M4,25 Q16,15 28,25" fill="none" stroke="#333" stroke-width="1.5"/>
                            </svg>
                            <input type="checkbox" id="fx_saddleType" name="saddleType" style="display:none;" />
                        </div>
                        <div class="pontic-item" id="fx_ponticUnilateralBox">
                            <span>偏侧型</span>
                            <svg width="28" height="26" viewBox="0 0 32 30" style="margin-top:4px;">
                                <path d="M8,12 C8,5 24,5 24,12 C24,19 18,22 14,22 C10,22 8,17 8,12 Z" fill="none" stroke="#333" stroke-width="1.5"/>
                                <path d="M5,26 Q15,18 27,24" fill="none" stroke="#333" stroke-width="1.5"/>
                            </svg>
                            <input type="checkbox" id="fx_unilateralType" name="unilateralType" style="display:none;" />
                        </div>
                    </div>
                </div>

                <!-- Barcode Area -->
                <div class="cell" style="width: 35%; justify-content: space-between;">
                    <span class="label-vertical" style="font-size: 14px; margin-left: 4px;">条码区</span>
                    <div class="barcode-area-content">
                        <svg id="fx_barcodeSvg" style="display:none; max-width: 155px; height: 34px; margin-bottom: 3px;"></svg>
                        <input type="text" id="fx_barcode" name="barcode" class="barcode-input" placeholder="" />
                    </div>
                </div>
            </div>

            <!-- ROW 3: Porcelain Margin / Metal Occlusal / Single / Connected -->
            <div class="row" style="height: 34px;">
                <div class="cell label-red" style="width: 5%; justify-content: center;">瓷<br>边</div>
                <div class="cell" style="width: 19%;">
                    <input type="text" id="fx_porcelainMargin" name="porcelainMargin" class="cell-input" />
                </div>
                <div class="cell label-red" style="width: 5%; justify-content: center;">咬<br>金</div>
                <div class="cell" style="width: 19%;">
                    <input type="text" id="fx_metalOcclusal" name="metalOcclusal" class="cell-input" />
                </div>
                <div class="cell" style="width: 6%; justify-content: center;">单独</div>
                <div class="cell" style="width: 11%;">
                    <input type="text" id="fx_singleCrown" name="singleCrown" class="cell-input" />
                </div>
                <div class="cell" style="width: 6%; justify-content: center;">相连</div>
                <div class="cell" style="width: 29%;">
                    <input type="text" id="fx_connectedCrown" name="connectedCrown" class="cell-input" />
                </div>
            </div>

            <!-- ROW 4: Metal Margin / Insufficient Space -->
            <div class="row" style="height: 34px;">
                <div class="cell" style="width: 8%; justify-content: center;">金属边</div>
                <div class="cell" style="width: 40%;">
                    <label class="chk-label">
                        <input type="checkbox" id="fx_metalMarginNone" name="metalMarginNone" /> 不要
                    </label>
                    <label class="chk-label" style="margin-left: 10px;">
                        <input type="checkbox" id="fx_metalMarginLingual" name="metalMarginLingual" /> 舌侧
                    </label>
                    <input type="text" id="fx_metalMarginLingualMm" name="metalMarginLingualMm" class="line-input" style="width: 65px; text-align:center;" />
                    <span style="font-size: 12px; margin-left: 2px;">MM</span>
                </div>
                <div class="cell" style="width: 6%; font-size: 12px; text-align: center; line-height: 1.1; justify-content: center;">
                    空间<br>不够
                </div>
                <div class="cell" style="width: 46%; justify-content: space-around;">
                    <label class="chk-label"><input type="checkbox" id="fx_spaceMetalOcclusal" name="spaceMetalOcclusal" /> 咬金</label>
                    <label class="chk-label"><input type="checkbox" id="fx_spaceTrimOpposing" name="spaceTrimOpposing" /> 修对咬</label>
                    <label class="chk-label"><input type="checkbox" id="fx_spaceTrimAbutment" name="spaceTrimAbutment" /> 修支台齿</label>
                </div>
            </div>

            <!-- ROW 5: Staining / Open Bite / Casting Weight / Milled Weight -->
            <div class="row" style="height: 34px;">
                <div class="cell" style="width: 6%; justify-content: center;">染色</div>
                <div class="cell" style="width: 19%; padding: 2px 4px;">
                    <label class="chk-label" style="margin-right: 4px;">
                        <input type="checkbox" id="fx_stainLight" name="stainLight" /> 轻度
                    </label>
                    <label class="chk-label" style="margin-right: 0;">
                        <input type="checkbox" id="fx_stainMedium" name="stainMedium" /> 中度
                    </label>
                </div>
                <div class="cell" style="width: 7%; font-size: 12px; padding: 2px; justify-content: center;">开咬mm</div>
                <div class="cell" style="width: 16%; padding: 2px 4px;">
                    <label class="chk-label" style="margin-right: 4px;">
                        <input type="checkbox" id="fx_openBite07" name="openBite07" /> 0.7
                    </label>
                    <label class="chk-label" style="margin-right: 0;">
                        <input type="checkbox" id="fx_openBite05" name="openBite05" /> 0.5
                    </label>
                </div>
                <div class="cell" style="width: 26%;">
                    <span style="white-space: nowrap; font-size: 13px;">铸造重量</span>
                    <input type="text" id="fx_castingWeight" name="castingWeight" class="cell-input" />
                </div>
                <div class="cell" style="width: 26%;">
                    <span style="white-space: nowrap; font-size: 13px;">车金重量</span>
                    <input type="text" id="fx_milledMetalWeight" name="milledMetalWeight" class="cell-input" />
                </div>
            </div>

            <!-- ROW 6: Shade & Block (Left) / Order Requirements (Right) -->
            <div class="row" style="height: 118px;">
                <!-- Left: Shade & Tooth Diagram -->
                <div class="cell" style="width: 48%; display: flex; justify-content: space-between; padding: 8px 12px;">
                    <div style="display: flex; flex-direction: column; justify-content: space-around; height: 100%; width: 62%;">
                        <div style="display: flex; align-items: flex-end;">
                            <span style="font-size: 14px; margin-right: 6px;">比色</span>
                            <input type="text" id="fx_shade" name="shade" class="line-input" style="width: 130px; text-align: center; font-size: 20px; font-weight: bold;" />
                        </div>
                        <div style="display: flex; align-items: flex-end;">
                            <span style="font-size: 14px; margin-right: 6px;">瓷块</span>
                            <input type="text" id="fx_ceramicBlock" name="ceramicBlock" class="line-input" style="width: 130px; text-align: center; font-size: 16px; font-weight: bold;" />
                        </div>
                    </div>

                    <!-- Tooth 3-Zone Diagram -->
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 35%;">
                        <div style="position: relative; width: 54px; height: 64px;">
                            <svg width="54" height="64" viewBox="0 0 54 64">
                                <path d="M27,3 C14,3 6,24 6,46 C6,57 12,61 27,61 C42,61 48,57 48,46 C48,24 40,3 27,3 Z"
                                      fill="none" stroke="#333" stroke-width="1.3" />
                                <line x1="9" y1="24" x2="45" y2="24" stroke="#333" stroke-width="1" />
                                <line x1="6" y1="43" x2="48" y2="43" stroke="#333" stroke-width="1" />
                            </svg>
                            <input type="text" id="fx_zoneIncisal" name="zoneIncisal" title="Incisal Shade" style="position:absolute; top:6px; left:12px; width:30px; border:none; background:transparent; text-align:center; font-size:10px; color:var(--fill-blue); outline:none;" />
                            <input type="text" id="fx_zoneBody" name="zoneBody" title="Body Shade" style="position:absolute; top:26px; left:10px; width:34px; border:none; background:transparent; text-align:center; font-size:10px; color:var(--fill-blue); outline:none;" />
                            <input type="text" id="fx_zoneCervical" name="zoneCervical" title="Cervical Shade" style="position:absolute; top:45px; left:10px; width:34px; border:none; background:transparent; text-align:center; font-size:10px; color:var(--fill-blue); outline:none;" />
                        </div>
                        <label class="chk-label" style="margin-top: 4px; margin-right: 0; font-size: 13px;">
                            <input type="checkbox" id="fx_pictureViewed" name="pictureViewed" /> 已看图
                        </label>
                    </div>
                </div>

                <!-- Right: Order Requirements -->
                <div class="cell" style="width: 52%; flex-direction: column; align-items: flex-start; justify-content: space-between; padding: 6px 8px;">
                    <div style="font-size: 14px; font-weight: bold;">订单要求：</div>
                    <textarea id="fx_orderRequirements" name="orderRequirements" class="order-req-box"></textarea>
                </div>
            </div>

            <!-- ROW 7 & 8: Left Column (Retention + Workshop + Model) | Right Column (Open Review Area & Signatures) -->
            <div class="row" style="height: 365px;">
                <!-- Left Column (48%) -->
                <div style="width: 48%; border-right: 1.5px solid var(--border-red); display: flex; flex-direction: column;">
                    
                    <!-- Sub-row A: Retention Method -->
                    <div style="display: flex; height: 42px; border-bottom: 1.5px solid var(--border-red);">
                        <div class="cell label-red" style="width: 14%; justify-content: center; text-align: center; font-size: 13px; line-height: 1.15;">
                            固位<br>方式
                        </div>
                        <div class="cell" style="width: 86%; justify-content: space-around;">
                            <label class="chk-label"><input type="checkbox" id="fx_screwRetained" name="screwRetained" /> 螺丝式固位</label>
                            <label class="chk-label"><input type="checkbox" id="fx_cementRetained" name="cementRetained" /> 粘着式固位</label>
                        </div>
                    </div>

                    <!-- Sub-row B: Workshop Check Area -->
                    <div style="display: flex; height: 185px; border-bottom: 1.5px solid var(--border-red);">
                        <div class="cell" style="width: 14%; justify-content: center;">
                            <span class="label-vertical" style="font-size: 13px; letter-spacing: 3px;">车间制作勾选区</span>
                        </div>
                        <div class="cell" style="width: 86%; flex-direction: column; align-items: flex-start; justify-content: space-evenly; padding: 6px 10px;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; width: 100%; row-gap: 6px;">
                                <label class="chk-label"><input type="checkbox" id="fx_handArticulation" name="handArticulation" /> 手上咬合</label>
                                <label class="chk-label"><input type="checkbox" id="fx_closeFittingRemovableDie" name="closeFittingRemovableDie" /> 密合活动床</label>
                                <label class="chk-label"><input type="checkbox" id="fx_sendModelTogether" name="sendModelTogether" /> 牙模同出</label>
                                <label class="chk-label"><input type="checkbox" id="fx_doctorArticulated" name="doctorArticulated" /> 医生上咬合</label>
                                <label class="chk-label"><input type="checkbox" id="fx_doctorTrimmedMargin" name="doctorTrimmedMargin" /> 医生修边</label>
                                <label class="chk-label"><input type="checkbox" id="fx_printReferenceModel" name="printReferenceModel" /> 打印参考模</label>
                            </div>

                            <div style="display: flex; width: 100%; align-items: center;">
                                <label class="chk-label"><input type="checkbox" id="fx_trimAbutment" name="trimAbutment" /> 修支台齿</label>
                                <input type="text" id="fx_trimAbutmentNote" name="trimAbutmentNote" class="line-input" style="flex: 1;" />
                            </div>

                            <div style="display: flex; width: 100%; align-items: center;">
                                <label class="chk-label"><input type="checkbox" id="fx_trimOpposing" name="trimOpposing" /> 修对咬</label>
                                <input type="text" id="fx_trimOpposingNote" name="trimOpposingNote" class="line-input" style="flex: 1;" />
                            </div>

                            <div style="display: flex; width: 100%; align-items: center;">
                                <label class="chk-label"><input type="checkbox" id="fx_addPinkPorcelain" name="addPinkPorcelain" /> 加红瓷</label>
                                <!-- Mini Tooth Cross -->
                                <div style="display: grid; grid-template-columns: 1fr 1fr; width: 140px; margin-left: 4px;">
                                    <input type="text" id="fx_pinkUR" name="pinkUR" style="border:none; border-right:1px solid #333; border-bottom:1px solid #333; background:transparent; text-align:center; font-size:11px; height:14px; color:var(--fill-blue); outline:none;" />
                                    <input type="text" id="fx_pinkUL" name="pinkUL" style="border:none; border-bottom:1px solid #333; background:transparent; text-align:center; font-size:11px; height:14px; color:var(--fill-blue); outline:none;" />
                                    <input type="text" id="fx_pinkLR" name="pinkLR" style="border:none; border-right:1px solid #333; background:transparent; text-align:center; font-size:11px; height:14px; color:var(--fill-blue); outline:none;" />
                                    <input type="text" id="fx_pinkLL" name="pinkLL" style="border:none; background:transparent; text-align:center; font-size:11px; height:14px; color:var(--fill-blue); outline:none;" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sub-row C: Model Number -->
                    <div style="display: flex; flex-direction: column; flex: 1; padding: 8px 12px;">
                        <span style="font-size: 13px;">型号：</span>
                        <input type="text" id="fx_modelLine1" name="modelLine1" style="border:none; border-bottom: 1.5px dashed #333; background:transparent; margin: 14px 16px 8px 16px; padding:2px; font-size:15px; color:var(--fill-blue); outline:none;" />
                        <input type="text" id="fx_modelLine2" name="modelLine2" style="border:none; border-bottom: 1.5px dashed #333; background:transparent; margin: 8px 16px; padding:2px; font-size:15px; color:var(--fill-blue); outline:none;" />
                    </div>
                </div>

                <!-- Right Column (52%): Open Area + (翻单) / (审单) -->
                <div style="width: 52%; display: flex; flex-direction: column; justify-content: space-between; padding: 12px 16px;">
                    <textarea id="fx_reviewAreaNotes" name="reviewAreaNotes" style="width: 100%; flex: 1; border: none; background: transparent; resize: none; outline: none; font-size: 14px; color: var(--fill-blue); margin-bottom: 8px;"></textarea>

                    <!-- Bottom Transcription / Review Row -->
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-size: 13px;">
                        <div style="display: flex; align-items: center;">
                            <span>(翻单) ：</span>
                            <input type="text" id="fx_transcribedBy" name="transcribedBy" class="line-input" style="width: 110px; font-size: 16px; font-weight: bold; text-align: center;" />
                        </div>
                        <div style="display: flex; align-items: center;">
                            <span>(审单)</span>
                            <input type="text" id="fx_reviewedBy" name="reviewedBy" class="line-input" style="width: 90px; font-size: 16px; text-align: center; margin-left: 4px;" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- ROW 9: Implant Accessories -->
            <div class="row" style="height: 68px;">
                <div class="cell" style="width: 6.5%; justify-content: center;">
                    <span class="label-vertical" style="font-size: 13px;">种植配件</span>
                </div>
                <div style="width: 93.5%; display: flex; flex-direction: column;">
                    <div style="height: 34px; border-bottom: 1.5px solid var(--border-red); display: flex; align-items: center; padding: 0 8px; font-size: 13px; justify-content: space-between;">
                        <div>
                            金属/塑料支台齿&螺丝 <input type="text" id="fx_abutmentAndScrew" name="abutmentAndScrew" class="line-input" style="width: 65px;" />
                        </div>
                        <div>
                            转移杆&螺丝 <input type="text" id="fx_impressionCopingAndScrew" name="impressionCopingAndScrew" class="line-input" style="width: 55px;" />
                        </div>
                        <div>
                            替代体 <input type="text" id="fx_analog" name="analog" class="line-input" style="width: 45px;" />
                        </div>
                        <div>
                            牙肉 <input type="text" id="fx_gingivalMask" name="gingivalMask" class="line-input" style="width: 45px;" />
                        </div>
                    </div>
                    <div style="height: 34px; display: flex; align-items: center; padding: 0 8px; font-size: 13px;">
                        <span style="margin-right: 8px;">其它</span>
                        <input type="text" id="fx_implantOther" name="implantOther" class="cell-input" />
                    </div>
                </div>
            </div>

            <!-- ROW 10: Attachments -->
            <div class="row" style="height: 38px;">
                <div class="cell" style="width: 6.5%; justify-content: center; font-size: 13px;">
                    附件
                </div>
                <div class="cell" style="width: 93.5%; justify-content: space-between; padding: 0 10px;">
                    <label class="chk-label"><input type="checkbox" id="fx_attUpperJaw" name="attUpperJaw" /> 上颚</label>
                    <label class="chk-label"><input type="checkbox" id="fx_attLowerJaw" name="attLowerJaw" /> 下颚</label>
                    <label class="chk-label"><input type="checkbox" id="fx_attBiteWax" name="attBiteWax" /> 咬蜡</label>
                    <label class="chk-label"><input type="checkbox" id="fx_attOldTeeth" name="attOldTeeth" /> 旧牙</label>
                    <label class="chk-label"><input type="checkbox" id="fx_attPictures" name="attPictures" /> 图片</label>
                    <label class="chk-label"><input type="checkbox" id="fx_attArticulator" name="attArticulator" /> 咬合器</label>
                    <label class="chk-label"><input type="checkbox" id="fx_attImpressionTray" name="attImpressionTray" /> 牙托</label>
                    <label class="chk-label" style="margin-right: 0;"><input type="checkbox" id="fx_attMetalPins" name="attMetalPins" /> 铁钉</label>
                </div>
            </div>

        </div>
    </div>
    `;
}

function updateBarcodeUI(el) {
    const input = el.querySelector('#fx_barcode');
    const svg = el.querySelector('#fx_barcodeSvg');
    if (!input || !svg) return;

    const val = input.value.trim();
    if (!val) {
        svg.style.display = 'none';
        return;
    }

    try {
        JsBarcode(svg, val, {
            format: 'CODE128',
            width: 1.4,
            height: 32,
            displayValue: false,
            margin: 0,
        });
        svg.style.display = 'block';
    } catch {
        svg.style.display = 'none';
    }
}

function updatePonticUI(el) {
    const saddleBox = el.querySelector('#fx_ponticSaddleBox');
    const saddleChk = el.querySelector('#fx_saddleType');
    if (saddleBox && saddleChk) {
        saddleBox.classList.toggle('active', !!saddleChk.checked);
    }

    const unilateralBox = el.querySelector('#fx_ponticUnilateralBox');
    const unilateralChk = el.querySelector('#fx_unilateralType');
    if (unilateralBox && unilateralChk) {
        unilateralBox.classList.toggle('active', !!unilateralChk.checked);
    }
}

export function populate(el, data = {}) {
    const h = data.header || {};
    const o = data.orderInfo || {};
    const tc = data.toothChartSection || {};
    const q = tc.quadrants || {};
    const pd = tc.ponticDesign || {};
    const mc = data.marginAndConnection || {};
    const mms = data.metalMarginAndSpace || {};
    const mm = mms.metalMargin || {};
    const is = mms.insufficientSpace || {};
    const sw = data.stainingAndWeight || {};
    const st = sw.staining || {};
    const ob = sw.openBiteMm || {};
    const sr = data.shadeAndRequirements || {};
    const tz = sr.toothShadeZones || {};
    const rm = data.retentionMethod || {};
    const wc = data.workshopCheckArea || {};
    const pc = wc.addPinkPorcelainChart || {};
    const mr = data.modelAndReview || {};
    const ia = data.implantAccessories || {};
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
    setVal('fx_formCode', h.formCode);
    setVal('fx_topRightBox', h.topRightBox);

    // Order Info
    setVal('fx_orderNo', o.orderNo);
    setVal('fx_arrivalDate', o.arrivalDate);
    setVal('fx_rescheduleDate', o.rescheduleDate);

    // Tooth Chart Section
    setVal('fx_quadUR', q.upperRight);
    setVal('fx_quadUL', q.upperLeft);
    setVal('fx_quadLR', q.lowerRight);
    setVal('fx_quadLL', q.lowerLeft);
    setVal('fx_pCount', tc.pCount);
    setVal('fx_mCount', tc.mCount);
    setChk('fx_saddleType', pd.saddleType);
    setChk('fx_unilateralType', pd.unilateralType);
    setVal('fx_barcode', tc.barcode);

    // Margin & Connection
    setVal('fx_porcelainMargin', mc.porcelainMargin);
    setVal('fx_metalOcclusal', mc.metalOcclusal);
    setVal('fx_singleCrown', mc.singleCrown);
    setVal('fx_connectedCrown', mc.connectedCrown);

    // Metal Margin & Space
    setChk('fx_metalMarginNone', mm.none);
    setChk('fx_metalMarginLingual', mm.lingual);
    setVal('fx_metalMarginLingualMm', mm.lingualMm);
    setChk('fx_spaceMetalOcclusal', is.metalOcclusal);
    setChk('fx_spaceTrimOpposing', is.trimOpposing);
    setChk('fx_spaceTrimAbutment', is.trimAbutment);

    // Staining & Weight
    setChk('fx_stainLight', st.light);
    setChk('fx_stainMedium', st.medium);
    setChk('fx_openBite07', ob.mm07);
    setChk('fx_openBite05', ob.mm05);
    setVal('fx_castingWeight', sw.castingWeight);
    setVal('fx_milledMetalWeight', sw.milledMetalWeight);

    // Shade & Requirements
    setVal('fx_shade', sr.shade);
    setVal('fx_ceramicBlock', sr.ceramicBlock);
    setVal('fx_zoneIncisal', tz.incisal);
    setVal('fx_zoneBody', tz.body);
    setVal('fx_zoneCervical', tz.cervical);
    setChk('fx_pictureViewed', sr.pictureViewed);
    setVal('fx_orderRequirements', sr.orderRequirements);

    // Retention Method
    setChk('fx_screwRetained', rm.screwRetained);
    setChk('fx_cementRetained', rm.cementRetained);

    // Workshop Check Area
    setChk('fx_handArticulation', wc.handArticulation);
    setChk('fx_closeFittingRemovableDie', wc.closeFittingRemovableDie);
    setChk('fx_sendModelTogether', wc.sendModelTogether);
    setChk('fx_doctorArticulated', wc.doctorArticulated);
    setChk('fx_doctorTrimmedMargin', wc.doctorTrimmedMargin);
    setChk('fx_printReferenceModel', wc.printReferenceModel);
    setChk('fx_trimAbutment', wc.trimAbutment);
    setVal('fx_trimAbutmentNote', wc.trimAbutmentNote);
    setChk('fx_trimOpposing', wc.trimOpposing);
    setVal('fx_trimOpposingNote', wc.trimOpposingNote);
    setChk('fx_addPinkPorcelain', wc.addPinkPorcelain);
    setVal('fx_pinkUR', pc.upperRight);
    setVal('fx_pinkUL', pc.upperLeft);
    setVal('fx_pinkLR', pc.lowerRight);
    setVal('fx_pinkLL', pc.lowerLeft);

    // Model & Review
    setVal('fx_modelLine1', mr.modelLine1);
    setVal('fx_modelLine2', mr.modelLine2);
    setVal('fx_reviewAreaNotes', mr.reviewAreaNotes);
    setVal('fx_transcribedBy', mr.transcribedBy);
    setVal('fx_reviewedBy', mr.reviewedBy);

    // Implant Accessories
    setVal('fx_abutmentAndScrew', ia.abutmentAndScrew);
    setVal('fx_impressionCopingAndScrew', ia.impressionCopingAndScrew);
    setVal('fx_analog', ia.analog);
    setVal('fx_gingivalMask', ia.gingivalMask);
    setVal('fx_implantOther', ia.other);

    // Attachments
    setChk('fx_attUpperJaw', att.upperJaw);
    setChk('fx_attLowerJaw', att.lowerJaw);
    setChk('fx_attBiteWax', att.biteWax);
    setChk('fx_attOldTeeth', att.oldTeeth);
    setChk('fx_attPictures', att.pictures);
    setChk('fx_attArticulator', att.articulator);
    setChk('fx_attImpressionTray', att.impressionTray);
    setChk('fx_attMetalPins', att.metalPins);

    updatePonticUI(el);
    updateBarcodeUI(el);
}

export function extract(el) {
    const getVal = (id) => el.querySelector(`#${id}`)?.value ?? '';
    const getChk = (id) => !!el.querySelector(`#${id}`)?.checked;

    return {
        header: {
            formCode: getVal('fx_formCode'),
            topRightBox: getVal('fx_topRightBox'),
        },
        orderInfo: {
            orderNo: getVal('fx_orderNo'),
            arrivalDate: getVal('fx_arrivalDate'),
            rescheduleDate: getVal('fx_rescheduleDate'),
        },
        toothChartSection: {
            quadrants: {
                upperRight: getVal('fx_quadUR'),
                upperLeft: getVal('fx_quadUL'),
                lowerRight: getVal('fx_quadLR'),
                lowerLeft: getVal('fx_quadLL'),
            },
            pCount: getVal('fx_pCount'),
            mCount: getVal('fx_mCount'),
            ponticDesign: {
                saddleType: getChk('fx_saddleType'),
                unilateralType: getChk('fx_unilateralType'),
            },
            barcode: getVal('fx_barcode'),
        },
        marginAndConnection: {
            porcelainMargin: getVal('fx_porcelainMargin'),
            metalOcclusal: getVal('fx_metalOcclusal'),
            singleCrown: getVal('fx_singleCrown'),
            connectedCrown: getVal('fx_connectedCrown'),
        },
        metalMarginAndSpace: {
            metalMargin: {
                none: getChk('fx_metalMarginNone'),
                lingual: getChk('fx_metalMarginLingual'),
                lingualMm: getVal('fx_metalMarginLingualMm'),
            },
            insufficientSpace: {
                metalOcclusal: getChk('fx_spaceMetalOcclusal'),
                trimOpposing: getChk('fx_spaceTrimOpposing'),
                trimAbutment: getChk('fx_spaceTrimAbutment'),
            },
        },
        stainingAndWeight: {
            staining: {
                light: getChk('fx_stainLight'),
                medium: getChk('fx_stainMedium'),
            },
            openBiteMm: {
                mm07: getChk('fx_openBite07'),
                mm05: getChk('fx_openBite05'),
            },
            castingWeight: getVal('fx_castingWeight'),
            milledMetalWeight: getVal('fx_milledMetalWeight'),
        },
        shadeAndRequirements: {
            shade: getVal('fx_shade'),
            ceramicBlock: getVal('fx_ceramicBlock'),
            toothShadeZones: {
                incisal: getVal('fx_zoneIncisal'),
                body: getVal('fx_zoneBody'),
                cervical: getVal('fx_zoneCervical'),
            },
            pictureViewed: getChk('fx_pictureViewed'),
            orderRequirements: getVal('fx_orderRequirements'),
        },
        retentionMethod: {
            screwRetained: getChk('fx_screwRetained'),
            cementRetained: getChk('fx_cementRetained'),
        },
        workshopCheckArea: {
            handArticulation: getChk('fx_handArticulation'),
            closeFittingRemovableDie: getChk('fx_closeFittingRemovableDie'),
            sendModelTogether: getChk('fx_sendModelTogether'),
            doctorArticulated: getChk('fx_doctorArticulated'),
            doctorTrimmedMargin: getChk('fx_doctorTrimmedMargin'),
            printReferenceModel: getChk('fx_printReferenceModel'),
            trimAbutment: getChk('fx_trimAbutment'),
            trimAbutmentNote: getVal('fx_trimAbutmentNote'),
            trimOpposing: getChk('fx_trimOpposing'),
            trimOpposingNote: getVal('fx_trimOpposingNote'),
            addPinkPorcelain: getChk('fx_addPinkPorcelain'),
            addPinkPorcelainChart: {
                upperRight: getVal('fx_pinkUR'),
                upperLeft: getVal('fx_pinkUL'),
                lowerRight: getVal('fx_pinkLR'),
                lowerLeft: getVal('fx_pinkLL'),
            },
        },
        modelAndReview: {
            modelLine1: getVal('fx_modelLine1'),
            modelLine2: getVal('fx_modelLine2'),
            reviewAreaNotes: getVal('fx_reviewAreaNotes'),
            transcribedBy: getVal('fx_transcribedBy'),
            reviewedBy: getVal('fx_reviewedBy'),
        },
        implantAccessories: {
            abutmentAndScrew: getVal('fx_abutmentAndScrew'),
            impressionCopingAndScrew: getVal('fx_impressionCopingAndScrew'),
            analog: getVal('fx_analog'),
            gingivalMask: getVal('fx_gingivalMask'),
            other: getVal('fx_implantOther'),
        },
        attachments: {
            upperJaw: getChk('fx_attUpperJaw'),
            lowerJaw: getChk('fx_attLowerJaw'),
            biteWax: getChk('fx_attBiteWax'),
            oldTeeth: getChk('fx_attOldTeeth'),
            pictures: getChk('fx_attPictures'),
            articulator: getChk('fx_attArticulator'),
            impressionTray: getChk('fx_attImpressionTray'),
            metalPins: getChk('fx_attMetalPins'),
        },
    };
}

export function init(el, onEdited) {
    // Input & Change listeners for two-way synchronization
    el.querySelectorAll('input, textarea').forEach((inp) => {
        inp.addEventListener('input', () => {
            if (inp.id === 'fx_barcode') {
                updateBarcodeUI(el);
            }
            if (onEdited) onEdited();
        });
        inp.addEventListener('change', () => {
            if (inp.id === 'fx_saddleType' || inp.id === 'fx_unilateralType') {
                updatePonticUI(el);
            }
            if (onEdited) onEdited();
        });
    });

    // Pontic interactive box clicks
    const saddleBox = el.querySelector('#fx_ponticSaddleBox');
    const saddleChk = el.querySelector('#fx_saddleType');
    if (saddleBox && saddleChk) {
        saddleBox.onclick = () => {
            saddleChk.checked = !saddleChk.checked;
            updatePonticUI(el);
            if (onEdited) onEdited();
        };
    }

    const unilateralBox = el.querySelector('#fx_ponticUnilateralBox');
    const unilateralChk = el.querySelector('#fx_unilateralType');
    if (unilateralBox && unilateralChk) {
        unilateralBox.onclick = () => {
            unilateralChk.checked = !unilateralChk.checked;
            updatePonticUI(el);
            if (onEdited) onEdited();
        };
    }
}
