/**
 * Form 5: BetaMars Dental Lab
 * Schema: BetaMarsDentalLabPrescription
 */

export const meta = {
    id: 'betamars',
    label: '5. BetaMars Dental Lab',
    fullName: 'BetaMars Dental Lab',
    defaultPrefix: 'betamars-rx',
    badgeClass: 'pill-betamars',
};

let onEditedCallback = null;

const bmSelectedTeeth = new Set();
    const BM_UPPER_TEETH = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const BM_LOWER_TEETH = [31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18];

    function renderBetaMarsOdontogram() {
        const upper = document.getElementById('bm_upperArchRow');
        const lower = document.getElementById('bm_lowerArchRow');
        upper.innerHTML = '';
        lower.innerHTML = '';

        BM_UPPER_TEETH.forEach(num => {
            const unit = document.createElement('div');
            unit.className = 'tooth-unit' + (bmSelectedTeeth.has(num) ? ' selected' : '');
            unit.innerHTML = `<span class="tooth-num">${num}</span><div class="tooth-oval"></div>`;
            unit.onclick = () => {
                bmSelectedTeeth.has(num) ? bmSelectedTeeth.delete(num) : bmSelectedTeeth.add(num);
                renderBetaMarsOdontogram();
                if (typeof onEditedCallback === "function") onEditedCallback();
            };
            upper.appendChild(unit);
        });

        BM_LOWER_TEETH.forEach(num => {
            const unit = document.createElement('div');
            unit.className = 'tooth-unit' + (bmSelectedTeeth.has(num) ? ' selected' : '');
            unit.innerHTML = `<div class="tooth-oval"></div><span class="tooth-num">${num}</span>`;
            unit.onclick = () => {
                bmSelectedTeeth.has(num) ? bmSelectedTeeth.delete(num) : bmSelectedTeeth.add(num);
                renderBetaMarsOdontogram();
                if (typeof onEditedCallback === "function") onEditedCallback();
            };
            lower.appendChild(unit);
        });
    }

    function populateBetaMars(data = {}) {
        const ci = data.caseInfo || {};
        document.getElementById('bm_topDateStamp').value = ci.topDateStamp ?? '';
        document.getElementById('bm_locationCode').value = ci.locationCode ?? '';
        document.getElementById('bm_caseNumber').value = ci.caseNumber ?? '';
        document.getElementById('bm_panNumber').value = ci.panNumber ?? '';
        document.getElementById('bm_patientName').value = ci.patientName ?? '';
        const g = ci.gender || {};
        document.getElementById('bm_genderMale').checked = !!g.male;
        document.getElementById('bm_genderFemale').checked = !!g.female;
        document.getElementById('bm_patientAge').value = ci.age ?? '';

        const cb = data.crownAndBridgeRx || {};
        const st = cb.caseStatus || {};
        document.getElementById('bm_cbNewCase').checked = !!st.newCase;
        document.getElementById('bm_cbRedo').checked = !!st.redo;
        document.getElementById('bm_cbRepair').checked = !!st.repair;

        const tr = cb.typeOfRestoration || {};
        document.getElementById('bm_cbTryIn').checked = !!tr.tryIn;
        document.getElementById('bm_cbFinish').checked = !!tr.finish;
        document.getElementById('bm_restPfm').checked = !!tr.porcFusedMetalCrown;
        document.getElementById('bm_restFullMetal').checked = !!tr.fullMetalCrown;
        document.getElementById('bm_restEmax').checked = !!tr.emax;
        document.getElementById('bm_restPfz').checked = !!tr.porcFusedZirconiaCrown;
        document.getElementById('bm_restFullZirconia').checked = !!tr.fullContourZirconiaCrown;
        document.getElementById('bm_restCustomAbutment').checked = !!tr.customAbutment;
        document.getElementById('bm_restTemporary').checked = !!tr.temporary;
        document.getElementById('bm_restDiagWaxup').checked = !!tr.diagWaxUp;

        const tm = cb.typeOfMetal || {};
        document.getElementById('bm_metalNonPrecious').checked = !!tm.nonPrecious;
        document.getElementById('bm_metalNiCr').checked = !!tm.niCr;
        document.getElementById('bm_metalCoCr').checked = !!tm.coCr;
        document.getElementById('bm_metalSemiPrecious').checked = !!tm.semiPrecious;
        document.getElementById('bm_metalCpg').checked = !!tm.cpg;
        document.getElementById('bm_metalW1').checked = !!tm.w1;
        document.getElementById('bm_metalYg').checked = !!tm.yg;
        document.getElementById('bm_metalWg').checked = !!tm.wg;
        document.getElementById('bm_metalCaptek').checked = !!tm.captek;

        const cd = cb.crownDesign || {};
        document.getElementById('bm_cdMetalLingualCollar').checked = !!cd.metalLingualCollar;
        document.getElementById('bm_cdMetalLingualCollarMm').value = cd.metalLingualCollarMm ?? '';
        document.getElementById('bm_cd360MetalCollar').checked = !!cd.metalCollar360;
        document.getElementById('bm_cdPorcelainButtMargin').checked = !!cd.porcelainButtMargin;
        document.getElementById('bm_cdMetalOcclusal').checked = !!cd.metalOcclusal;
        document.getElementById('bm_cdMetalLingualAnterior').checked = !!cd.metalLingualAnteriorOnly;
        document.getElementById('bm_cdCingulumRest').checked = !!cd.cingulumRest;
        document.getElementById('bm_cdOcclusalRest').checked = !!cd.occlusalRest;
        document.getElementById('bm_cdNoMetalShowing').checked = !!cd.noMetalShowing;

        const pd = cb.ponticDesign || {};
        for (let i = 1; i <= 7; i++) {
            document.getElementById('bm_ponticType' + i).checked = !!pd['type' + i];
        }

        const ge = cb.gingivalEmbrasure || {};
        document.getElementById('bm_geOpen').checked = !!ge.open;
        document.getElementById('bm_geClosed').checked = !!ge.closed;
        document.getElementById('bm_geGumTissueModel').checked = !!ge.gumTissueModel;

        const oc = cb.occlusalContact || {};
        document.getElementById('bm_ocOut05').checked = !!oc.out05mmSub;
        document.getElementById('bm_ocOut03').checked = !!oc.out03mmSub;
        document.getElementById('bm_ocContactTouching').checked = !!oc.contactTouchingOpp;

        const ds = data.doctorAndShipping || {};
        document.getElementById('bm_doctorName').value = ds.doctorName ?? '';
        document.getElementById('bm_groupCompanyName').value = ds.groupCompanyName ?? '';
        document.getElementById('bm_doctorAddress').value = ds.address ?? '';
        document.getElementById('bm_doctorCityStateZip').value = ds.cityStateZip ?? '';
        document.getElementById('bm_doctorPhone').value = ds.phone ?? '';
        document.getElementById('bm_doctorEmail').value = ds.emailAddress ?? '';
        const legacyStamp = ds.shippedStamp || {};
        document.getElementById('bm_shippedByDate').value = ds.shippedByDate ?? legacyStamp.date ?? legacyStamp.by ?? '';

        const odo = data.odontogramAndSpecs || {};
        bmSelectedTeeth.clear();
        if (Array.isArray(odo.selectedTeeth)) {
            odo.selectedTeeth.forEach(t => bmSelectedTeeth.add(Number(t)));
        }
        renderBetaMarsOdontogram();

        document.getElementById('bm_archSingles').checked = !!odo.singles;
        document.getElementById('bm_archSinglesNote').value = odo.singlesNote ?? '';
        document.getElementById('bm_archBridge').checked = !!odo.bridge;
        document.getElementById('bm_archBridgeNote').value = odo.bridgeNote ?? '';
        document.getElementById('bm_archPonticNumbers').value = odo.ponticNumbers ?? '';

        const ic = odo.inadequateClearance || {};
        document.getElementById('bm_icCallEmailMe').checked = !!ic.callEmailMe;
        document.getElementById('bm_icReduceOpposing').checked = !!ic.reduceOpposing;
        document.getElementById('bm_icReducePrepMarkDie').checked = !!ic.reducePrepAndMarkDie;
        document.getElementById('bm_icMetalOcclusion').checked = !!ic.metalOcclusion;
        document.getElementById('bm_icMetalIsland').checked = !!ic.metalIsland;

        const sh = odo.desiredShade || {};
        document.getElementById('bm_shadeInstruction').value = sh.instruction ?? '';
        document.getElementById('bm_shadeEmax').value = sh.emax ?? '';
        document.getElementById('bm_shadeStump').value = sh.stumpShade ?? '';

        const os = odo.occlusalStain || {};
        document.getElementById('bm_osNone').checked = !!os.none;
        document.getElementById('bm_osLight').checked = !!os.light;
        document.getElementById('bm_osHeavy').checked = !!os.heavy;

        const ipc = odo.interproximalContact || {};
        document.getElementById('bm_ipcBoardTight').checked = !!ipc.boardAndTight;
        document.getElementById('bm_ipcLight').checked = !!ipc.light;
        document.getElementById('bm_ipcMedium').checked = !!ipc.medium;
        document.getElementById('bm_ipcOpen').checked = !!ipc.open;

        const ab = odo.abutmentBrand || {};
        document.getElementById('bm_ab3i').checked = !!ab.threeI;
        document.getElementById('bm_abAstra').checked = !!ab.astra;
        document.getElementById('bm_abNobelBranemark').checked = !!ab.nobelBranemark;
        document.getElementById('bm_abNobelReplace').checked = !!ab.nobelReplace;
        document.getElementById('bm_abNobelActive').checked = !!ab.nobelActive;
        document.getElementById('bm_abZimmer').checked = !!ab.zimmer;
        document.getElementById('bm_abBioHorizons').checked = !!ab.bioHorizons;
        document.getElementById('bm_abStraumann').checked = !!ab.straumann;
        document.getElementById('bm_abFriadent').checked = !!ab.friadent;
        document.getElementById('bm_abLifecore').checked = !!ab.lifecore;
        document.getElementById('bm_abCamlog').checked = !!ab.camlog;
        document.getElementById('bm_abIntraLock').checked = !!ab.intraLock;
        document.getElementById('bm_abOssem').checked = !!ab.ossem;
        document.getElementById('bm_abOthers').checked = !!ab.others;

        const rem = data.removableRx || {};
        document.getElementById('bm_remShade').value = rem.shade ?? '';
        document.getElementById('bm_remDueDate').value = rem.dueDate ?? '';
        const rst = rem.status || {};
        document.getElementById('bm_remTryIn').checked = !!rst.tryIn;
        document.getElementById('bm_remFinish').checked = !!rst.finish;
        document.getElementById('bm_remRedo').checked = !!rst.redo;
        document.getElementById('bm_remRepair').checked = !!rst.repair;

        const fd = rem.fullDenture || {};
        document.getElementById('bm_fdYamahachi').checked = !!fd.yamahachiTeethEconomy;
        document.getElementById('bm_fdVita').checked = !!fd.vitaTeethPrivate;

        const pdent = rem.partialDenture || {};
        document.getElementById('bm_pdAcrylic').checked = !!pdent.acrylicPartialDenture;
        document.getElementById('bm_pdValplast').checked = !!pdent.valplast;

        const cmf = rem.chromeMetalFrame || {};
        document.getElementById('bm_cmfCoCr').checked = !!cmf.coCrFramework;
        document.getElementById('bm_cmfVitalium').checked = !!cmf.vitaliumFramework;
        document.getElementById('bm_cmfTitanium').checked = !!cmf.titaniumFramework;

        const ng = rem.nightGuards || {};
        document.getElementById('bm_ngThermoplastic').checked = !!ng.thermoplastic;
        document.getElementById('bm_ngHardAcrylic').checked = !!ng.hardAcrylic;
        document.getElementById('bm_ngGelbMora').checked = !!ng.gelbMora;
        document.getElementById('bm_ngBleachingTray').checked = !!ng.bleachingTray;
        document.getElementById('bm_ngCustomSportsGuard').checked = !!ng.customSportsGuard;

        const ro = rem.others || {};
        document.getElementById('bm_roWaxBiteBlock').checked = !!ro.waxBiteBlock;
        document.getElementById('bm_roSpecialTray').checked = !!ro.specialTray;
        document.getElementById('bm_roTemporary').checked = !!ro.temporary;
        document.getElementById('bm_roAttachment').checked = !!ro.attachment;

        document.getElementById('bm_rxSpecialInstructions').value = data.rxSpecialInstructions ?? '';

        const ie = data.itemsEnclosedAndDates || {};
        document.getElementById('bm_ieImp').checked = !!ie.imp;
        document.getElementById('bm_ieModel').checked = !!ie.model;
        document.getElementById('bm_ieBite').checked = !!ie.bite;
        document.getElementById('bm_ieOpposingModel').checked = !!ie.opposingModel;
        document.getElementById('bm_ieShadeTab').checked = !!ie.shadeTab;
        document.getElementById('bm_iePreOpModel').checked = !!ie.preOpModel;
        document.getElementById('bm_iePhoto').checked = !!ie.photo;
        document.getElementById('bm_ieModelOfTemps').checked = !!ie.modelOfTemps;
        document.getElementById('bm_ieImplant').checked = !!ie.implant;
        document.getElementById('bm_ieOther').checked = !!ie.other;
        document.getElementById('bm_shippingDate').value = ie.shippingDate ?? '';
        document.getElementById('bm_dueDate').value = ie.dueDate ?? '';
    }

    function extractBetaMars() {
        return {
            caseInfo: {
                topDateStamp: document.getElementById('bm_topDateStamp').value,
                locationCode: document.getElementById('bm_locationCode').value,
                caseNumber: document.getElementById('bm_caseNumber').value,
                panNumber: document.getElementById('bm_panNumber').value,
                patientName: document.getElementById('bm_patientName').value,
                gender: {
                    male: document.getElementById('bm_genderMale').checked,
                    female: document.getElementById('bm_genderFemale').checked
                },
                age: document.getElementById('bm_patientAge').value
            },
            crownAndBridgeRx: {
                caseStatus: {
                    newCase: document.getElementById('bm_cbNewCase').checked,
                    redo: document.getElementById('bm_cbRedo').checked,
                    repair: document.getElementById('bm_cbRepair').checked
                },
                typeOfRestoration: {
                    tryIn: document.getElementById('bm_cbTryIn').checked,
                    finish: document.getElementById('bm_cbFinish').checked,
                    porcFusedMetalCrown: document.getElementById('bm_restPfm').checked,
                    fullMetalCrown: document.getElementById('bm_restFullMetal').checked,
                    emax: document.getElementById('bm_restEmax').checked,
                    porcFusedZirconiaCrown: document.getElementById('bm_restPfz').checked,
                    fullContourZirconiaCrown: document.getElementById('bm_restFullZirconia').checked,
                    customAbutment: document.getElementById('bm_restCustomAbutment').checked,
                    temporary: document.getElementById('bm_restTemporary').checked,
                    diagWaxUp: document.getElementById('bm_restDiagWaxup').checked
                },
                typeOfMetal: {
                    nonPrecious: document.getElementById('bm_metalNonPrecious').checked,
                    niCr: document.getElementById('bm_metalNiCr').checked,
                    coCr: document.getElementById('bm_metalCoCr').checked,
                    semiPrecious: document.getElementById('bm_metalSemiPrecious').checked,
                    cpg: document.getElementById('bm_metalCpg').checked,
                    w1: document.getElementById('bm_metalW1').checked,
                    yg: document.getElementById('bm_metalYg').checked,
                    wg: document.getElementById('bm_metalWg').checked,
                    captek: document.getElementById('bm_metalCaptek').checked
                },
                crownDesign: {
                    metalLingualCollar: document.getElementById('bm_cdMetalLingualCollar').checked,
                    metalLingualCollarMm: document.getElementById('bm_cdMetalLingualCollarMm').value,
                    metalCollar360: document.getElementById('bm_cd360MetalCollar').checked,
                    porcelainButtMargin: document.getElementById('bm_cdPorcelainButtMargin').checked,
                    metalOcclusal: document.getElementById('bm_cdMetalOcclusal').checked,
                    metalLingualAnteriorOnly: document.getElementById('bm_cdMetalLingualAnterior').checked,
                    cingulumRest: document.getElementById('bm_cdCingulumRest').checked,
                    occlusalRest: document.getElementById('bm_cdOcclusalRest').checked,
                    noMetalShowing: document.getElementById('bm_cdNoMetalShowing').checked
                },
                ponticDesign: {
                    type1: document.getElementById('bm_ponticType1').checked,
                    type2: document.getElementById('bm_ponticType2').checked,
                    type3: document.getElementById('bm_ponticType3').checked,
                    type4: document.getElementById('bm_ponticType4').checked,
                    type5: document.getElementById('bm_ponticType5').checked,
                    type6: document.getElementById('bm_ponticType6').checked,
                    type7: document.getElementById('bm_ponticType7').checked
                },
                gingivalEmbrasure: {
                    open: document.getElementById('bm_geOpen').checked,
                    closed: document.getElementById('bm_geClosed').checked,
                    gumTissueModel: document.getElementById('bm_geGumTissueModel').checked
                },
                occlusalContact: {
                    out05mmSub: document.getElementById('bm_ocOut05').checked,
                    out03mmSub: document.getElementById('bm_ocOut03').checked,
                    contactTouchingOpp: document.getElementById('bm_ocContactTouching').checked
                }
            },
            doctorAndShipping: {
                doctorName: document.getElementById('bm_doctorName').value,
                groupCompanyName: document.getElementById('bm_groupCompanyName').value,
                address: document.getElementById('bm_doctorAddress').value,
                cityStateZip: document.getElementById('bm_doctorCityStateZip').value,
                phone: document.getElementById('bm_doctorPhone').value,
                emailAddress: document.getElementById('bm_doctorEmail').value,
                shippedByDate: document.getElementById('bm_shippedByDate').value
            },
            odontogramAndSpecs: {
                selectedTeeth: Array.from(bmSelectedTeeth),
                singles: document.getElementById('bm_archSingles').checked,
                singlesNote: document.getElementById('bm_archSinglesNote').value,
                bridge: document.getElementById('bm_archBridge').checked,
                bridgeNote: document.getElementById('bm_archBridgeNote').value,
                ponticNumbers: document.getElementById('bm_archPonticNumbers').value,
                inadequateClearance: {
                    callEmailMe: document.getElementById('bm_icCallEmailMe').checked,
                    reduceOpposing: document.getElementById('bm_icReduceOpposing').checked,
                    reducePrepAndMarkDie: document.getElementById('bm_icReducePrepMarkDie').checked,
                    metalOcclusion: document.getElementById('bm_icMetalOcclusion').checked,
                    metalIsland: document.getElementById('bm_icMetalIsland').checked
                },
                desiredShade: {
                    instruction: document.getElementById('bm_shadeInstruction').value,
                    emax: document.getElementById('bm_shadeEmax').value,
                    stumpShade: document.getElementById('bm_shadeStump').value
                },
                occlusalStain: {
                    none: document.getElementById('bm_osNone').checked,
                    light: document.getElementById('bm_osLight').checked,
                    heavy: document.getElementById('bm_osHeavy').checked
                },
                interproximalContact: {
                    boardAndTight: document.getElementById('bm_ipcBoardTight').checked,
                    light: document.getElementById('bm_ipcLight').checked,
                    medium: document.getElementById('bm_ipcMedium').checked,
                    open: document.getElementById('bm_ipcOpen').checked
                },
                abutmentBrand: {
                    threeI: document.getElementById('bm_ab3i').checked,
                    astra: document.getElementById('bm_abAstra').checked,
                    nobelBranemark: document.getElementById('bm_abNobelBranemark').checked,
                    nobelReplace: document.getElementById('bm_abNobelReplace').checked,
                    nobelActive: document.getElementById('bm_abNobelActive').checked,
                    zimmer: document.getElementById('bm_abZimmer').checked,
                    bioHorizons: document.getElementById('bm_abBioHorizons').checked,
                    straumann: document.getElementById('bm_abStraumann').checked,
                    friadent: document.getElementById('bm_abFriadent').checked,
                    lifecore: document.getElementById('bm_abLifecore').checked,
                    camlog: document.getElementById('bm_abCamlog').checked,
                    intraLock: document.getElementById('bm_abIntraLock').checked,
                    ossem: document.getElementById('bm_abOssem').checked,
                    others: document.getElementById('bm_abOthers').checked
                }
            },
            removableRx: {
                shade: document.getElementById('bm_remShade').value,
                dueDate: document.getElementById('bm_remDueDate').value,
                status: {
                    tryIn: document.getElementById('bm_remTryIn').checked,
                    finish: document.getElementById('bm_remFinish').checked,
                    redo: document.getElementById('bm_remRedo').checked,
                    repair: document.getElementById('bm_remRepair').checked
                },
                fullDenture: {
                    yamahachiTeethEconomy: document.getElementById('bm_fdYamahachi').checked,
                    vitaTeethPrivate: document.getElementById('bm_fdVita').checked
                },
                partialDenture: {
                    acrylicPartialDenture: document.getElementById('bm_pdAcrylic').checked,
                    valplast: document.getElementById('bm_pdValplast').checked
                },
                chromeMetalFrame: {
                    coCrFramework: document.getElementById('bm_cmfCoCr').checked,
                    vitaliumFramework: document.getElementById('bm_cmfVitalium').checked,
                    titaniumFramework: document.getElementById('bm_cmfTitanium').checked
                },
                nightGuards: {
                    thermoplastic: document.getElementById('bm_ngThermoplastic').checked,
                    hardAcrylic: document.getElementById('bm_ngHardAcrylic').checked,
                    gelbMora: document.getElementById('bm_ngGelbMora').checked,
                    bleachingTray: document.getElementById('bm_ngBleachingTray').checked,
                    customSportsGuard: document.getElementById('bm_ngCustomSportsGuard').checked
                },
                others: {
                    waxBiteBlock: document.getElementById('bm_roWaxBiteBlock').checked,
                    specialTray: document.getElementById('bm_roSpecialTray').checked,
                    temporary: document.getElementById('bm_roTemporary').checked,
                    attachment: document.getElementById('bm_roAttachment').checked
                }
            },
            rxSpecialInstructions: document.getElementById('bm_rxSpecialInstructions').value,
            itemsEnclosedAndDates: {
                imp: document.getElementById('bm_ieImp').checked,
                model: document.getElementById('bm_ieModel').checked,
                bite: document.getElementById('bm_ieBite').checked,
                opposingModel: document.getElementById('bm_ieOpposingModel').checked,
                shadeTab: document.getElementById('bm_ieShadeTab').checked,
                preOpModel: document.getElementById('bm_iePreOpModel').checked,
                photo: document.getElementById('bm_iePhoto').checked,
                modelOfTemps: document.getElementById('bm_ieModelOfTemps').checked,
                implant: document.getElementById('bm_ieImplant').checked,
                other: document.getElementById('bm_ieOther').checked,
                shippingDate: document.getElementById('bm_shippingDate').value,
                dueDate: document.getElementById('bm_dueDate').value
            }
        };
    }

    /* ---------------- ADAPTER 2: KIMSEY & WRIGHT DENTAL LAB ---------------- */

export function render() {
    return `<div class="columns-container">
                    <!-- LEFT COLUMN -->
                    <div class="col col-left">
                        <div class="top-stamp-row">
                            <div>
                                <span style="font-size:10px; color:#666;">Top Note / Stamp:</span>
                                <input type="text" id="bm_topDateStamp" class="line-input" style="width:115px; color:var(--stamp-red);" />
                            </div>
                            <input type="text" id="bm_locationCode" class="pa-code-input" placeholder="PA" />
                        </div>

                        <div class="field-row"><label>Case #</label><input type="text" id="bm_caseNumber" class="line-input" style="font-size:18px;" /></div>
                        <div class="field-row"><label>Pan#</label><input type="text" id="bm_panNumber" class="line-input" style="font-size:16px;" /></div>
                        <div class="field-row"><label>Patient Name:</label><input type="text" id="bm_patientName" class="line-input" style="font-size:16px;" /></div>

                        <div style="display:flex; align-items:center; justify-content:space-between; margin: 4px 0;">
                            <label class="chk-label"><input type="checkbox" id="bm_genderMale" /> Male</label>
                            <label class="chk-label"><input type="checkbox" id="bm_genderFemale" /> Female</label>
                            <div style="font-size:11.5px;">Age <input type="text" id="bm_patientAge" class="line-input" style="width:55px; text-align:center;" /></div>
                        </div>

                        <div class="section-title">Crown &amp; Bridge Rx</div>
                        <div class="grid-3" style="margin-bottom:2px;">
                            <label class="chk-label"><input type="checkbox" id="bm_cbNewCase" /> New Case</label>
                            <label class="chk-label"><input type="checkbox" id="bm_cbRedo" /> Redo</label>
                            <label class="chk-label"><input type="checkbox" id="bm_cbRepair" /> Repair</label>
                        </div>

                        <div class="sec-bar">1. Type of Restoration</div>
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; margin-bottom:3px;">
                            <div><strong>Crown &amp; Bridge</strong><br /><em style="font-size:9.5px;">(fill cut boxes#1-10)</em></div>
                            <label class="chk-label"><input type="checkbox" id="bm_cbTryIn" /> TRYIN</label>
                            <label class="chk-label"><input type="checkbox" id="bm_cbFinish" /> FINISH</label>
                        </div>

                        <div style="display:grid; grid-template-columns: 1.35fr 0.85fr; gap:2px;">
                            <div style="display:flex; flex-direction:column; gap:2px;">
                                <label class="chk-label"><input type="checkbox" id="bm_restPfm" /> a. Porc. Fused Metal Crown</label>
                                <label class="chk-label"><input type="checkbox" id="bm_restFullMetal" /> b. Full Metal Crown</label>
                                <label class="chk-label"><input type="checkbox" id="bm_restEmax" /> c. E.max</label>
                                <label class="chk-label"><input type="checkbox" id="bm_restPfz" /> d. Porc. Fused Zirconia Crown</label>
                                <label class="chk-label"><input type="checkbox" id="bm_restFullZirconia" /> e. Full Contour Zirconia Crown</label>
                                <label class="chk-label"><input type="checkbox" id="bm_restCustomAbutment" /> f. Costom Abutment</label>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:2px;">
                                <label class="chk-label"><input type="checkbox" id="bm_restTemporary" /> g.Temporary</label>
                                <label class="chk-label"><input type="checkbox" id="bm_restDiagWaxup" /> h. Diag. Wax-up</label>
                            </div>
                        </div>

                        <div class="sec-bar">2. Type of Metal</div>
                        <div class="grid-2">
                            <div style="display:flex; flex-direction:column; gap:2px;">
                                <label class="chk-label"><input type="checkbox" id="bm_metalNonPrecious" /> Non Precious</label>
                                <div style="padding-left:12px; display:flex; gap:8px;">
                                    <label class="chk-label"><input type="checkbox" id="bm_metalNiCr" /> Ni-Cr</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_metalCoCr" /> Co-Cr</label>
                                </div>
                                <label class="chk-label"><input type="checkbox" id="bm_metalSemiPrecious" /> Semi Precious</label>
                                <div style="padding-left:12px; display:flex; gap:8px;">
                                    <label class="chk-label"><input type="checkbox" id="bm_metalCpg" /> CPG</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_metalW1" /> W1</label>
                                </div>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:2px;">
                                <label class="chk-label"><input type="checkbox" id="bm_metalYg" /> YG</label>
                                <label class="chk-label"><input type="checkbox" id="bm_metalWg" /> WG</label>
                                <label class="chk-label"><input type="checkbox" id="bm_metalCaptek" /> Captek</label>
                            </div>
                        </div>

                        <div class="sec-bar">3.Crown Design</div>
                        <div style="display:flex; flex-direction:column; gap:2px;">
                            <div style="display:flex; align-items:center;">
                                <label class="chk-label"><input type="checkbox" id="bm_cdMetalLingualCollar" /> Metal Lingual Collar</label>
                                <input type="text" id="bm_cdMetalLingualCollarMm" class="line-input" style="width:45px; text-align:center;" />
                                <span style="font-size:11px;">mm</span>
                            </div>
                            <label class="chk-label"><input type="checkbox" id="bm_cd360MetalCollar" /> 360° Metal Collar</label>
                            <label class="chk-label"><input type="checkbox" id="bm_cdPorcelainButtMargin" /> Porcelain Butt Margin (90° shoulder required)</label>
                            <label class="chk-label"><input type="checkbox" id="bm_cdMetalOcclusal" /> Metal Occlusal</label>
                            <label class="chk-label"><input type="checkbox" id="bm_cdMetalLingualAnterior" /> Metal lingual (Anterior Only)</label>
                            <label class="chk-label"><input type="checkbox" id="bm_cdCingulumRest" /> Cingulum Rest</label>
                            <label class="chk-label"><input type="checkbox" id="bm_cdOcclusalRest" /> Occlusal Rest</label>
                            <label class="chk-label"><input type="checkbox" id="bm_cdNoMetalShowing" /> No metal showing</label>
                        </div>

                        <div class="sec-bar">4.Pontic Design</div>
                        <div class="pontic-grid">
                            <div class="pontic-col"><svg width="20" height="18" viewBox="0 0 24 22"><path d="M8,3 L12,18 L16,3 Z" fill="none" stroke="#3c6382" stroke-width="1.5"/></svg><input type="checkbox" id="bm_ponticType1" /></div>
                            <div class="pontic-col"><svg width="20" height="18" viewBox="0 0 24 22"><path d="M8,3 L11,18 L16,14 L16,3 Z" fill="none" stroke="#3c6382" stroke-width="1.5"/></svg><input type="checkbox" id="bm_ponticType2" /></div>
                            <div class="pontic-col"><svg width="20" height="18" viewBox="0 0 24 22"><path d="M8,3 L10,16 Q12,19 15,16 L16,3 Z" fill="none" stroke="#3c6382" stroke-width="1.5"/></svg><input type="checkbox" id="bm_ponticType3" /></div>
                            <div class="pontic-col"><svg width="20" height="18" viewBox="0 0 24 22"><rect x="5" y="4" width="14" height="10" rx="4" fill="none" stroke="#3c6382" stroke-width="1.5"/><line x1="4" y1="17" x2="20" y2="17" stroke="#3c6382" stroke-width="1.5"/></svg><input type="checkbox" id="bm_ponticType4" /></div>
                            <div class="pontic-col"><svg width="20" height="18" viewBox="0 0 24 22"><path d="M5,8 C5,3 19,3 19,8 C19,13 15,15 12,12 C9,15 5,13 5,8 Z" fill="none" stroke="#3c6382" stroke-width="1.5"/><path d="M4,17 Q12,11 20,17" fill="none" stroke="#3c6382" stroke-width="1.5"/></svg><input type="checkbox" id="bm_ponticType5" /></div>
                            <div class="pontic-col"><svg width="20" height="18" viewBox="0 0 24 22"><path d="M5,8 C5,3 19,3 19,8 C19,13 14,15 10,14 C7,14 5,11 5,8 Z" fill="none" stroke="#3c6382" stroke-width="1.5"/><path d="M4,17 Q12,12 20,16" fill="none" stroke="#3c6382" stroke-width="1.5"/></svg><input type="checkbox" id="bm_ponticType6" /></div>
                            <div class="pontic-col"><svg width="20" height="18" viewBox="0 0 24 22"><ellipse cx="12" cy="9" rx="7" ry="5" fill="none" stroke="#3c6382" stroke-width="1.5"/><path d="M4,14 Q12,19 20,14" fill="none" stroke="#3c6382" stroke-width="1.5"/></svg><input type="checkbox" id="bm_ponticType7" /></div>
                        </div>

                        <div class="sec-bar" style="display:flex; justify-content:space-between;">
                            <span>5. Gingival Embrasure</span><span>6.Occlusal Contact</span>
                        </div>
                        <div class="grid-2">
                            <div style="display:flex; flex-direction:column; gap:2px;">
                                <label class="chk-label"><input type="checkbox" id="bm_geOpen" /> Open</label>
                                <label class="chk-label"><input type="checkbox" id="bm_geClosed" /> Closed</label>
                                <label class="chk-label"><input type="checkbox" id="bm_geGumTissueModel" /> Gum Tissue Model</label>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:2px;">
                                <label class="chk-label"><input type="checkbox" id="bm_ocOut05" /> Out 0.5mm sub</label>
                                <label class="chk-label"><input type="checkbox" id="bm_ocOut03" /> Out 0.3mm sub</label>
                                <label class="chk-label"><input type="checkbox" id="bm_ocContactTouching" /> Contact(Touching Opp)</label>
                            </div>
                        </div>
                    </div>

                    <!-- CENTER COLUMN -->
                    <div class="col col-center">
                        <div class="lab-title">BetaMars Dental Lab <span>珠海拜瑞口腔医疗股份有限公司</span></div>
                        <div class="address-seal-row">
                            <div class="lab-address">
                                <strong>No. 128, Tongchang Road</strong><br />
                                <strong>Nanping Science and Technology</strong><br />
                                <strong>Industrial Area</strong><br />
                                <strong>Zhuhai City, GD, China.</strong><br />
                                <strong>US Telephone: 1-800-736-3613</strong><br />
                                <strong>China Tel Phone: +86(756)3876853</strong>
                            </div>
                            <div class="certs-box">
                                <span class="fda-logo">FDA</span>
                                <div class="sgs-seal"><span>ISO 13485</span><span style="font-size:12px; color:#d35400;">✔</span><span>SGS</span></div>
                            </div>
                        </div>

                        <div class="doc-shipped-row">
                            <div class="doc-fields">
                                <div class="doc-line"><span>Doctor's Name:</span><input type="text" id="bm_doctorName" class="line-input" /></div>
                                <div class="doc-line"><span>Group Name/Company Name:</span><input type="text" id="bm_groupCompanyName" class="line-input" /></div>
                                <div class="doc-line"><span>Address:</span><input type="text" id="bm_doctorAddress" class="line-input" /></div>
                                <div class="doc-line"><span>City, State, Zip</span><input type="text" id="bm_doctorCityStateZip" class="line-input" /></div>
                                <div class="doc-line"><span>Phone:</span><input type="text" id="bm_doctorPhone" class="line-input" /></div>
                                <div class="doc-line"><span>Email Address:</span><input type="text" id="bm_doctorEmail" class="line-input" /></div>
                            </div>
                            <div class="shipped-stamp-box">
                                <div class="shipped-title">SHIPPED</div>
                                <div style="display:flex; align-items:center; width:100%; font-size:12px; margin-top:auto;">
                                    <span style="margin-right:4px; font-weight:bold;">By:</span>
                                    <input type="text" id="bm_shippedByDate" class="line-input" style="flex:1; width:100%; text-align:center; color:var(--stamp-red); font-size:12.5px;" />
                                </div>
                            </div>
                        </div>

                        <div class="odontogram-box">
                            <div class="arch-row" id="bm_upperArchRow"></div>
                            <div class="arch-labels"><span>Right</span><span>left</span></div>
                            <div class="arch-row" id="bm_lowerArchRow"></div>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:6px;">
                            <div style="display:flex; align-items:center;">
                                <label class="chk-label" style="width:65px;"><input type="checkbox" id="bm_archSingles" /> Singles</label>
                                <input type="text" id="bm_archSinglesNote" class="line-input" style="flex:1;" />
                            </div>
                            <div style="display:flex; align-items:center;">
                                <label class="chk-label" style="width:65px;"><input type="checkbox" id="bm_archBridge" /> Bridge</label>
                                <input type="text" id="bm_archBridgeNote" class="line-input" style="flex:1;" />
                            </div>
                            <div style="display:flex; justify-content:flex-end; align-items:center; font-size:10.5px;">
                                <span>(Pontic #</span>
                                <input type="text" id="bm_archPonticNumbers" class="line-input" style="width:90px; text-align:center;" />
                                <span>)</span>
                            </div>
                        </div>

                        <div class="grid-2" style="gap: 6px 10px;">
                            <div>
                                <div class="sec-bar">7. If inadequate clearance</div>
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <label class="chk-label"><input type="checkbox" id="bm_icCallEmailMe" /> Call / Email me</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_icReduceOpposing" /> Reduce Opposing</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_icReducePrepMarkDie" /> Reduce Prep &amp; Mark Die</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_icMetalOcclusion" /> Metal Occlusion</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_icMetalIsland" /> Metal Island</label>
                                </div>
                            </div>
                            <div>
                                <div class="sec-bar">8.Desired Shade</div>
                                <div style="display:flex; flex-direction:column; gap:3px; font-size:11px;">
                                    <div>Instruction:<input type="text" id="bm_shadeInstruction" class="line-input" style="width:100%; font-size:15px;" /></div>
                                    <div style="display:flex; align-items:center;"><em style="margin-right:4px;">E.Max</em><input type="text" id="bm_shadeEmax" class="line-input" style="flex:1; font-size:15px;" /></div>
                                    <div style="display:flex; align-items:center;"><em style="margin-right:4px;">Stump shade:</em><input type="text" id="bm_shadeStump" class="line-input" style="flex:1;" /></div>
                                </div>
                            </div>
                            <div>
                                <div class="sec-bar">9. Occlusal Stain</div>
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <label class="chk-label"><input type="checkbox" id="bm_osNone" /> None</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_osLight" /> Light</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_osHeavy" /> Heavy</label>
                                </div>
                            </div>
                            <div>
                                <div class="sec-bar">10.Interproximal Contact</div>
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <label class="chk-label"><input type="checkbox" id="bm_ipcBoardTight" /> Board &amp; Tight</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_ipcLight" /> Light</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_ipcMedium" /> Medium</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_ipcOpen" /> Open</label>
                                </div>
                            </div>
                        </div>

                        <div class="sec-bar" style="text-align:center; margin-top:8px;">ABUTMENT BRAND</div>
                        <div style="display:grid; grid-template-columns: 1.15fr 1fr 0.9fr 0.75fr; gap:2px 4px;">
                            <label class="chk-label"><input type="checkbox" id="bm_ab3i" /> 3I</label>
                            <label class="chk-label"><input type="checkbox" id="bm_abNobelActive" /> Nobel Active</label>
                            <label class="chk-label"><input type="checkbox" id="bm_abFriadent" /> Friadent</label>
                            <label class="chk-label"><input type="checkbox" id="bm_abOssem" /> Ossem</label>
                            <label class="chk-label"><input type="checkbox" id="bm_abAstra" /> Astra</label>
                            <label class="chk-label"><input type="checkbox" id="bm_abZimmer" /> Zimmer</label>
                            <label class="chk-label"><input type="checkbox" id="bm_abLifecore" /> Lifecore</label>
                            <label class="chk-label"><input type="checkbox" id="bm_abOthers" /> Others</label>
                            <label class="chk-label"><input type="checkbox" id="bm_abNobelBranemark" /> Nobel Branemark</label>
                            <label class="chk-label"><input type="checkbox" id="bm_abBioHorizons" /> BioHorizons</label>
                            <label class="chk-label"><input type="checkbox" id="bm_abCamlog" /> Camlog</label>
                            <span></span>
                            <label class="chk-label"><input type="checkbox" id="bm_abNobelReplace" /> Nobel Replace</label>
                            <label class="chk-label"><input type="checkbox" id="bm_abStraumann" /> Straumann</label>
                            <label class="chk-label"><input type="checkbox" id="bm_abIntraLock" /> Intra-lock</label>
                            <span></span>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN -->
                    <div class="col col-right">
                        <div class="section-title" style="margin-top:2px;">Removable Rx</div>
                        <div class="field-row" style="font-size:11px;"><label>SHADE:</label><input type="text" id="bm_remShade" class="line-input" /></div>
                        <div class="field-row" style="font-size:11px;"><label>DUE DATE:</label><input type="text" id="bm_remDueDate" class="line-input" /></div>
                        <div style="display:flex; justify-content:space-between; margin: 4px 0 6px 0;">
                            <label class="chk-label"><input type="checkbox" id="bm_remTryIn" /> TRY IN</label>
                            <label class="chk-label"><input type="checkbox" id="bm_remFinish" /> FINISH</label>
                            <label class="chk-label"><input type="checkbox" id="bm_remRedo" /> REDO</label>
                            <label class="chk-label"><input type="checkbox" id="bm_remRepair" /> REPAIR</label>
                        </div>

                        <div class="grid-2" style="gap: 6px 8px;">
                            <div>
                                <div class="sec-bar">FULL DENTURE (QC20 Densply)</div>
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <label class="chk-label"><input type="checkbox" id="bm_fdYamahachi" /> Yamahachi Teeth(Economy)</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_fdVita" /> VITA Teeth(Private)</label>
                                </div>
                            </div>
                            <div>
                                <div class="sec-bar">PARTIAL DENTURE</div>
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <label class="chk-label"><input type="checkbox" id="bm_pdAcrylic" /> Acrylic Partial Denture</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_pdValplast" /> Valplast</label>
                                </div>
                            </div>
                            <div>
                                <div class="sec-bar">CHROME METAL FRAME</div>
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <label class="chk-label"><input type="checkbox" id="bm_cmfCoCr" /> Co-Cr Framework</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_cmfVitalium" /> Vitalium Framework</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_cmfTitanium" /> Titanium Framework</label>
                                </div>
                                <div class="sec-bar" style="margin-top:6px;">Others</div>
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <label class="chk-label"><input type="checkbox" id="bm_roWaxBiteBlock" /> Wax Bite Block</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_roSpecialTray" /> Special Tray</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_roTemporary" /> Temporary</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_roAttachment" /> Attachment</label>
                                </div>
                            </div>
                            <div>
                                <div class="sec-bar">NIGHT GUARDS</div>
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <label class="chk-label"><input type="checkbox" id="bm_ngThermoplastic" /> Thermoplastic</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_ngHardAcrylic" /> Hard Acrylic</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_ngGelbMora" /> Gelb-Mora</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_ngBleachingTray" /> Bleaching Tray</label>
                                    <label class="chk-label"><input type="checkbox" id="bm_ngCustomSportsGuard" /> Custom Sports Guard</label>
                                </div>
                            </div>
                        </div>

                        <div class="sec-bar" style="text-align:center; margin-top:8px;">Rx SPECIAL INSTRUCTIONS</div>
                        <textarea id="bm_rxSpecialInstructions" class="rx-textarea"></textarea>

                        <div class="sec-bar">Items Enclosed</div>
                        <div style="display:grid; grid-template-columns: 1.1fr 1.1fr 0.8fr; gap:2px 4px;">
                            <label class="chk-label"><input type="checkbox" id="bm_ieImp" /> Imp</label>
                            <label class="chk-label"><input type="checkbox" id="bm_ieShadeTab" /> Shade Tab</label>
                            <label class="chk-label"><input type="checkbox" id="bm_ieImplant" /> Implant</label>
                            <label class="chk-label"><input type="checkbox" id="bm_ieModel" /> Model</label>
                            <label class="chk-label"><input type="checkbox" id="bm_iePreOpModel" /> Pre-op Model</label>
                            <label class="chk-label"><input type="checkbox" id="bm_ieOther" /> Other</label>
                            <label class="chk-label"><input type="checkbox" id="bm_ieBite" /> Bite</label>
                            <label class="chk-label"><input type="checkbox" id="bm_iePhoto" /> Photo</label>
                            <span></span>
                            <label class="chk-label"><input type="checkbox" id="bm_ieOpposingModel" /> Opposing Model</label>
                            <label class="chk-label"><input type="checkbox" id="bm_ieModelOfTemps" /> Model of Temps</label>
                            <span></span>
                        </div>

                        <div class="grid-2" style="margin-top:6px; font-size:11px; font-weight:bold;">
                            <div style="display:flex; align-items:center;"><span style="white-space:nowrap; margin-right:4px;">Shipping Date:</span><input type="text" id="bm_shippingDate" class="line-input" style="flex:1; width:100%;" /></div>
                            <div style="display:flex; align-items:center;"><span style="white-space:nowrap; margin-right:4px;">Due Date:</span><input type="text" id="bm_dueDate" class="line-input" style="flex:1; width:100%;" /></div>
                        </div>

                        <div class="terms-text">
                            <strong>Terms and Condition:</strong><br />
                            BetaMars Dental Lab Inc. requires each case be accompained by a labslip which is to be a binding work order agreement and acceptance of our Terms and Conditons. Invoices are emailed by statement wih payment due by the end of the subsequent month from statment due date. 2% Service Charge will be billed on all past due balances.
                        </div>
                    </div>
                </div>`;
}

export function populate(el, data = {}) {
    populateBetaMars(data);
}

export function extract(el) {
    return extractBetaMars();
}

export function init(el, onEdited) {
    onEditedCallback = onEdited;
    renderBetaMarsOdontogram();
    el.querySelectorAll('input, select, textarea').forEach(inp => {
        inp.addEventListener('input', onEdited);
        inp.addEventListener('change', onEdited);
    });
}
