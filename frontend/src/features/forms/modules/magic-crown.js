/**
 * Form 8: Mars / Magic Crown Dental Lab
 * Schema: MarsDentalLabWorkOrder
 */

export const meta = {
    id: 'magic',
    label: '8. Mars / Magic Crown Dental Lab',
    fullName: 'Mars / Magic Crown Dental Lab',
    defaultPrefix: 'mars-work-order',
    badgeClass: 'pill-magic',
};

let onEditedCallback = null;

const mcSelectedTeeth = new Set();

    function initMagicArch() {
        const group = document.getElementById('mc_archTeethGroup');
        group.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const toothNum = i + 1;
            const angle = Math.PI * (0.06 + (i / 15) * 0.88);
            createMcToothNode(group, toothNum, 90 - Math.cos(angle) * 62, 92 - Math.sin(angle) * 76);
        }
        for (let i = 0; i < 16; i++) {
            const toothNum = 32 - i;
            const angle = Math.PI * (0.06 + (i / 15) * 0.88);
            createMcToothNode(group, toothNum, 90 - Math.cos(angle) * 62, 108 + Math.sin(angle) * 76);
        }
    }

    function createMcToothNode(container, toothNum, x, y) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '7.2');
        circle.setAttribute('id', `mc_tooth_${toothNum}`);
        circle.setAttribute('class', 'tooth-svg-item');
        circle.setAttribute('fill', '#ffffff');
        circle.setAttribute('stroke', '#333333');
        circle.setAttribute('stroke-width', '1.2');

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', y);
        label.setAttribute('class', 'tooth-num-label');
        label.setAttribute('font-size', '7');
        label.setAttribute('fill', '#222222');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('dominant-baseline', 'central');
        label.setAttribute('font-weight', 'bold');
        label.textContent = toothNum;

        g.appendChild(circle);
        g.appendChild(label);
        g.onclick = () => {
            mcSelectedTeeth.has(toothNum) ? mcSelectedTeeth.delete(toothNum) : mcSelectedTeeth.add(toothNum);
            updateMcArchUI();
            if (typeof onEditedCallback === "function") onEditedCallback();
        };
        container.appendChild(g);
    }

    function updateMcArchUI() {
        for (let n = 1; n <= 32; n++) {
            const el = document.getElementById(`mc_tooth_${n}`);
            if (el) {
                const isSel = mcSelectedTeeth.has(n);
                el.classList.toggle('selected', isSel);
                el.setAttribute('fill', isSel ? 'rgba(27, 59, 140, 0.35)' : '#ffffff');
                el.setAttribute('stroke', isSel ? '#1b3b8c' : '#333333');
                el.setAttribute('stroke-width', isSel ? '1.8' : '1.2');
            }
        }
    }

    function populateMagic(data = {}) {
        const h = data.header || {};
        document.getElementById('mc_attentionTo').value = h.attentionTo ?? '';
        document.getElementById('mc_receivedDateStamp').value = h.receivedDateStamp ?? '';
        document.getElementById('mc_returnDate').value = h.returnDate ?? '';

        const ci = data.caseIdentification || {};
        document.getElementById('mc_clinicOrLabName').value = ci.name ?? '';
        document.getElementById('mc_caseNumber').value = ci.caseNumber ?? '';
        document.getElementById('mc_additionalInstructions').value = ci.additionalInstructions ?? '';

        const cb = data.crownAndBridge || {};
        const cbs = cb.stage || {};
        document.getElementById('mc_cbStageFrame').checked = !!cbs.frame;
        document.getElementById('mc_cbStageTryIn').checked = !!cbs.tryIn;
        document.getElementById('mc_cbStageFinish').checked = !!cbs.finish;
        document.getElementById('mc_cbPfmCrBr').checked = !!cb.pfmCrBr;
        document.getElementById('mc_cbCercon').checked = !!cb.cercon;
        document.getElementById('mc_cbEmaxEmpress').checked = !!cb.emaxEmpressII;
        document.getElementById('mc_cbFgc').checked = !!cb.fgc40Or60Gold;
        document.getElementById('mc_cbImplant').checked = !!cb.implant;
        document.getElementById('mc_cbFullMetalCrown').checked = !!cb.fullMetalCrown;
        document.getElementById('mc_cbFmcNp').checked = !!cb.fullMetalCrownNP;
        document.getElementById('mc_cbFmcSp').checked = !!cb.fullMetalCrownSP;
        document.getElementById('mc_cbMetalInlayOnlay').checked = !!cb.metalInlayOnlay;
        document.getElementById('mc_cbPostAndCore').checked = !!cb.postAndCore;
        document.getElementById('mc_cbPfmPost1Piece').checked = !!cb.pfmPlusPost1Piece;
        document.getElementById('mc_cbCompositInlayOnlay').checked = !!cb.compositInlayOnlay;
        document.getElementById('mc_cbCaptek').checked = !!cb.captek;
        document.getElementById('mc_cbExpressVeneer').checked = !!cb.expressVeneer;
        document.getElementById('mc_cbExpressInlay').checked = !!cb.expressInlay;
        document.getElementById('mc_cbExpressOnlay').checked = !!cb.expressOnlay;
        document.getElementById('mc_cbTelescope').checked = !!cb.telescope;

        const rd = data.removableDenture || {};
        const rds = rd.stage || {};
        document.getElementById('mc_rdStageTryIn').checked = !!rds.tryIn;
        document.getElementById('mc_rdStageFinish').checked = !!rds.finish;
        document.getElementById('mc_rdCoCrFramework').checked = !!rd.coCrFramework;
        document.getElementById('mc_rdVitalliumFramework').checked = !!rd.vitalliumFramework;
        document.getElementById('mc_rdTitaniumFramework').checked = !!rd.titaniumFramework;
        document.getElementById('mc_rdAcrylicImdDenture').checked = !!rd.acrylicImdDenture;
        document.getElementById('mc_rdValplast').checked = !!rd.valplast;
        document.getElementById('mc_rdWaxBite').checked = !!rd.waxBite;
        document.getElementById('mc_rdSpecialTray').checked = !!rd.specialTray;
        document.getElementById('mc_rdNightGuard').checked = !!rd.nightGuard;
        document.getElementById('mc_rdTemporary').checked = !!rd.temporary;
        document.getElementById('mc_rdAttachment').checked = !!rd.attachment;
        document.getElementById('mc_superRushCase').checked = !!rd.superRushCase;

        const di = data.designInstructions || {};
        const mat = di.material || {};
        document.getElementById('mc_matNonPrecious').checked = !!mat.nonPrecious;
        document.getElementById('mc_matSemiPrecious').checked = !!mat.semiPrecious;
        document.getElementById('mc_matHighNobleWhite').checked = !!mat.highNobleWhite;
        document.getElementById('mc_matHighNobleYellow').checked = !!mat.highNobleYellow;

        const md = di.materialDesign || {};
        document.getElementById('mc_mdNoMetalMargin').checked = !!md.noMetalMargin;
        document.getElementById('mc_mdPorcelainShoulder').checked = !!md.porcelainShoulder;
        document.getElementById('mc_mdLingualMetalMargin').checked = !!md.lingualMetalMargin;
        document.getElementById('mc_mdAllMetalMargin').checked = !!md.allMetalMargin;
        document.getElementById('mc_mdThreeQuarterOcclusal').checked = !!md.threeQuarterOcclusalMetal;
        document.getElementById('mc_mdOcclusalMetal').checked = !!md.occlusalMetal;

        const cp = data.clinicalPreferences || {};
        document.getElementById('mc_prefEasyFit').checked = !!cp.easyFit;
        document.getElementById('mc_prefGoodRetention').checked = !!cp.goodRetention;
        document.getElementById('mc_prefExtendMargins').checked = !!cp.extendMarginsQuarterMm;
        document.getElementById('mc_prefCoverUndercuts').checked = !!cp.coverAllUndercuts;
        document.getElementById('mc_prefBestTech').checked = !!cp.bestTechToWorkOnCase;
        document.getElementById('mc_prefNotBulky').checked = !!cp.doNotMakeItBulky;
        document.getElementById('mc_prefButton').checked = !!cp.button;
        document.getElementById('mc_prefLightContacts').checked = !!cp.lightContacts;
        document.getElementById('mc_prefOutOfOcclusion').checked = !!cp.outOfOcclusion;

        const enc = data.enclosuresAndArch || {};
        mcSelectedTeeth.clear();
        if (Array.isArray(enc.selectedTeeth)) enc.selectedTeeth.forEach(num => mcSelectedTeeth.add(Number(num)));
        updateMcArchUI();
        document.getElementById('mc_trayImpression').value = enc.trayImpression ?? '';
        document.getElementById('mc_biteArticulator').value = enc.biteArticulator ?? '';
        document.getElementById('mc_modelOther').value = enc.modelOther ?? '';

        const ss = data.shadeAndStain || {};
        document.getElementById('mc_shadeInput').value = ss.shade ?? '';
        const os = ss.occlusalStain || {};
        document.getElementById('mc_stainNone').checked = !!os.none;
        document.getElementById('mc_stainLight').checked = !!os.light;
        document.getElementById('mc_stainMedium').checked = !!os.medium;
        document.getElementById('mc_stainDark').checked = !!os.dark;

        const cd = data.contactsAndPonticDesign || {};
        const emb = cd.embrasure || {};
        document.getElementById('mc_embOpen').checked = !!emb.open;
        document.getElementById('mc_embClose').checked = !!emb.close;
        const epc = cd.extentProximalContact || {};
        document.getElementById('mc_epcExtended').checked = !!epc.extended;
        document.getElementById('mc_epcNormal').checked = !!epc.normal;
        const occ = cd.occlusalContact || {};
        document.getElementById('mc_occHeavy').checked = !!occ.heavy;
        document.getElementById('mc_occLight').checked = !!occ.light;
        document.getElementById('mc_occOpen').checked = !!occ.open;
        const pd = cd.ponticDesign || {};
        document.getElementById('mc_ponticFullRidge').checked = !!pd.fullRidge;
        document.getElementById('mc_ponticPartialRidge').checked = !!pd.partialRidge;
        document.getElementById('mc_ponticNoRidge').checked = !!pd.noRidge;
        document.getElementById('mc_ponticSanitary').checked = !!pd.sanitary;
        document.getElementById('mc_ponticBullet').checked = !!pd.bullet;
    }

    function extractMagic() {
        return {
            header: {
                attentionTo: document.getElementById('mc_attentionTo').value,
                receivedDateStamp: document.getElementById('mc_receivedDateStamp').value,
                returnDate: document.getElementById('mc_returnDate').value
            },
            caseIdentification: {
                name: document.getElementById('mc_clinicOrLabName').value,
                caseNumber: document.getElementById('mc_caseNumber').value,
                additionalInstructions: document.getElementById('mc_additionalInstructions').value
            },
            crownAndBridge: {
                stage: {
                    frame: document.getElementById('mc_cbStageFrame').checked,
                    tryIn: document.getElementById('mc_cbStageTryIn').checked,
                    finish: document.getElementById('mc_cbStageFinish').checked
                },
                pfmCrBr: document.getElementById('mc_cbPfmCrBr').checked,
                cercon: document.getElementById('mc_cbCercon').checked,
                emaxEmpressII: document.getElementById('mc_cbEmaxEmpress').checked,
                fgc40Or60Gold: document.getElementById('mc_cbFgc').checked,
                implant: document.getElementById('mc_cbImplant').checked,
                fullMetalCrown: document.getElementById('mc_cbFullMetalCrown').checked,
                fullMetalCrownNP: document.getElementById('mc_cbFmcNp').checked,
                fullMetalCrownSP: document.getElementById('mc_cbFmcSp').checked,
                metalInlayOnlay: document.getElementById('mc_cbMetalInlayOnlay').checked,
                postAndCore: document.getElementById('mc_cbPostAndCore').checked,
                pfmPlusPost1Piece: document.getElementById('mc_cbPfmPost1Piece').checked,
                compositInlayOnlay: document.getElementById('mc_cbCompositInlayOnlay').checked,
                captek: document.getElementById('mc_cbCaptek').checked,
                expressVeneer: document.getElementById('mc_cbExpressVeneer').checked,
                expressInlay: document.getElementById('mc_cbExpressInlay').checked,
                expressOnlay: document.getElementById('mc_cbExpressOnlay').checked,
                telescope: document.getElementById('mc_cbTelescope').checked
            },
            removableDenture: {
                stage: {
                    tryIn: document.getElementById('mc_rdStageTryIn').checked,
                    finish: document.getElementById('mc_rdStageFinish').checked
                },
                coCrFramework: document.getElementById('mc_rdCoCrFramework').checked,
                vitalliumFramework: document.getElementById('mc_rdVitalliumFramework').checked,
                titaniumFramework: document.getElementById('mc_rdTitaniumFramework').checked,
                acrylicImdDenture: document.getElementById('mc_rdAcrylicImdDenture').checked,
                valplast: document.getElementById('mc_rdValplast').checked,
                waxBite: document.getElementById('mc_rdWaxBite').checked,
                specialTray: document.getElementById('mc_rdSpecialTray').checked,
                nightGuard: document.getElementById('mc_rdNightGuard').checked,
                temporary: document.getElementById('mc_rdTemporary').checked,
                attachment: document.getElementById('mc_rdAttachment').checked,
                superRushCase: document.getElementById('mc_superRushCase').checked
            },
            designInstructions: {
                material: {
                    nonPrecious: document.getElementById('mc_matNonPrecious').checked,
                    semiPrecious: document.getElementById('mc_matSemiPrecious').checked,
                    highNobleWhite: document.getElementById('mc_matHighNobleWhite').checked,
                    highNobleYellow: document.getElementById('mc_matHighNobleYellow').checked
                },
                materialDesign: {
                    noMetalMargin: document.getElementById('mc_mdNoMetalMargin').checked,
                    porcelainShoulder: document.getElementById('mc_mdPorcelainShoulder').checked,
                    lingualMetalMargin: document.getElementById('mc_mdLingualMetalMargin').checked,
                    allMetalMargin: document.getElementById('mc_mdAllMetalMargin').checked,
                    threeQuarterOcclusalMetal: document.getElementById('mc_mdThreeQuarterOcclusal').checked,
                    occlusalMetal: document.getElementById('mc_mdOcclusalMetal').checked
                }
            },
            clinicalPreferences: {
                easyFit: document.getElementById('mc_prefEasyFit').checked,
                goodRetention: document.getElementById('mc_prefGoodRetention').checked,
                extendMarginsQuarterMm: document.getElementById('mc_prefExtendMargins').checked,
                coverAllUndercuts: document.getElementById('mc_prefCoverUndercuts').checked,
                bestTechToWorkOnCase: document.getElementById('mc_prefBestTech').checked,
                doNotMakeItBulky: document.getElementById('mc_prefNotBulky').checked,
                button: document.getElementById('mc_prefButton').checked,
                lightContacts: document.getElementById('mc_prefLightContacts').checked,
                outOfOcclusion: document.getElementById('mc_prefOutOfOcclusion').checked
            },
            enclosuresAndArch: {
                selectedTeeth: Array.from(mcSelectedTeeth).sort((a, b) => a - b),
                trayImpression: document.getElementById('mc_trayImpression').value,
                biteArticulator: document.getElementById('mc_biteArticulator').value,
                modelOther: document.getElementById('mc_modelOther').value
            },
            shadeAndStain: {
                shade: document.getElementById('mc_shadeInput').value,
                occlusalStain: {
                    none: document.getElementById('mc_stainNone').checked,
                    light: document.getElementById('mc_stainLight').checked,
                    medium: document.getElementById('mc_stainMedium').checked,
                    dark: document.getElementById('mc_stainDark').checked
                }
            },
            contactsAndPonticDesign: {
                embrasure: {
                    open: document.getElementById('mc_embOpen').checked,
                    close: document.getElementById('mc_embClose').checked
                },
                extentProximalContact: {
                    extended: document.getElementById('mc_epcExtended').checked,
                    normal: document.getElementById('mc_epcNormal').checked
                },
                occlusalContact: {
                    heavy: document.getElementById('mc_occHeavy').checked,
                    light: document.getElementById('mc_occLight').checked,
                    open: document.getElementById('mc_occOpen').checked
                },
                ponticDesign: {
                    fullRidge: document.getElementById('mc_ponticFullRidge').checked,
                    partialRidge: document.getElementById('mc_ponticPartialRidge').checked,
                    noRidge: document.getElementById('mc_ponticNoRidge').checked,
                    sanitary: document.getElementById('mc_ponticSanitary').checked,
                    bullet: document.getElementById('mc_ponticBullet').checked
                }
            }
        };
    }

    /* ---------------- ADAPTER 5: PREFERRED DENTAL LAB ---------------- */

export function render() {
    return `<div class="top-bar">
                    <div class="attention-line">
                        <span>ATTENTION</span>
                        <input type="text" id="mc_attentionTo" class="line-input" style="width: 140px; font-weight: bold; font-size: 17px;" />
                    </div>
                    <input type="text" id="mc_receivedDateStamp" class="stamp-input" />
                </div>

                <div class="landscape-banner">
                    <svg width="70" height="46" viewBox="0 0 70 46">
                        <path d="M28,36 L30,26 M32,36 L31,26" stroke="#222" stroke-width="2" />
                        <ellipse cx="30" cy="20" rx="22" ry="8" fill="#2c3539" />
                        <ellipse cx="22" cy="17" rx="14" ry="6" fill="#3d484d" />
                    </svg>
                    <div class="banner-logo">
                        <span>MARS</span>
                        <svg width="24" height="22" viewBox="0 0 24 22">
                            <path d="M4,4 C4,1 20,1 20,4 C20,9 18,19 15,19 C13,19 13,12 12,12 C11,12 11,19 9,19 C6,19 4,9 4,4 Z" fill="#fff" stroke="#111" stroke-width="1.5"/>
                        </svg>
                        <span>DENTAL LAB</span>
                    </div>
                </div>

                <div class="rx-reminder">
                    RX - Remember to include: Rx form, Impression, Opposite Model and Wax Bite
                </div>

                <div class="main-columns">
                    <div>
                        <div class="sub-header-row">
                            <span>Dental Work Order Form</span>
                            <div><span>Return Date:</span><input type="text" id="mc_returnDate" class="line-input" style="width: 110px;" /></div>
                        </div>

                        <div class="gray-bar">
                            <span style="padding-left: 28px;">Crown and Bridge</span>
                            <span>Removable Denture</span>
                        </div>

                        <div class="work-order-box">
                            <div style="padding-right: 6px;">
                                <div class="stage-row">
                                    <label class="chk-label"><input type="checkbox" id="mc_cbStageFrame" />Frame</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbStageTryIn" />Try in</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbStageFinish" />Finish</label>
                                </div>
                                <div class="chk-list">
                                    <label class="chk-label"><input type="checkbox" id="mc_cbPfmCrBr" />PFM Cr./Br</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbCercon" />Cercon</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbEmaxEmpress" />E-max//Empress II</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbFgc" />F.G.C (40% Gold / 60% Gold)</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbImplant" />Implant</label>
                                    <div style="display: flex; align-items: center; gap: 3px; font-size: 11.5px;">
                                        <label class="chk-label"><input type="checkbox" id="mc_cbFullMetalCrown" />Full Metal Crown (</label>
                                        <label class="chk-label"><input type="checkbox" id="mc_cbFmcNp" />NP or</label>
                                        <label class="chk-label"><input type="checkbox" id="mc_cbFmcSp" />SP)</label>
                                    </div>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbMetalInlayOnlay" />Metal Inlay/Onlay</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbPostAndCore" />Post &amp; Core</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbPfmPost1Piece" />PFM + Post (1 piece)</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbCompositInlayOnlay" />Composit Inlay/ Onlay</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbCaptek" />Captek</label>
                                    <div style="height: 12px;"></div>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbExpressVeneer" />Express Veneer</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbExpressInlay" />Express Inlay</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbExpressOnlay" />Express Onlay</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_cbTelescope" />Telescope</label>
                                </div>
                            </div>

                            <div>
                                <div class="stage-row">
                                    <label class="chk-label"><input type="checkbox" id="mc_rdStageTryIn" />Try in</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_rdStageFinish" />Finish</label>
                                </div>
                                <div class="chk-list">
                                    <label class="chk-label"><input type="checkbox" id="mc_rdCoCrFramework" />Co-Cr Framework</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_rdVitalliumFramework" />Vitallium Framework</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_rdTitaniumFramework" />Titanium Framework</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_rdAcrylicImdDenture" />Acrylic/Imd Denture</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_rdValplast" />Valplast</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_rdWaxBite" />Wax Bite</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_rdSpecialTray" />Special Tray</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_rdNightGuard" />Night Guard</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_rdTemporary" />Temporary</label>
                                    <label class="chk-label"><input type="checkbox" id="mc_rdAttachment" />Attachment</label>
                                </div>
                                <div class="super-rush-wrapper">
                                    <label class="circle-chk" style="margin: 0;"><input type="checkbox" id="mc_superRushCase" style="width: 14px; height: 14px;" /></label>
                                    <div class="super-rush-text">SUPER<br />RUSH CASE</div>
                                </div>
                            </div>
                        </div>

                        <div class="gray-bar" style="margin-top: 8px; grid-template-columns: 1fr;"><span>Design Instructions</span></div>
                        <div style="display: grid; grid-template-columns: 50% 50%; font-size: 10.5px; font-weight: bold; padding: 2px 6px;">
                            <span>Material</span><span>Material Design</span>
                        </div>
                        <div class="design-box">
                            <div class="chk-list" style="justify-content: center;">
                                <label class="chk-label"><input type="checkbox" id="mc_matNonPrecious" />Non-Precious</label>
                                <label class="chk-label"><input type="checkbox" id="mc_matSemiPrecious" />Semi-Precious</label>
                                <label class="chk-label"><input type="checkbox" id="mc_matHighNobleWhite" />High Noble White</label>
                                <label class="chk-label"><input type="checkbox" id="mc_matHighNobleYellow" />High Noble Yellow</label>
                            </div>
                            <div class="chk-list">
                                <label class="chk-label"><input type="checkbox" id="mc_mdNoMetalMargin" />No Metal Margin</label>
                                <label class="chk-label"><input type="checkbox" id="mc_mdPorcelainShoulder" />Porcelain Shoulder</label>
                                <label class="chk-label"><input type="checkbox" id="mc_mdLingualMetalMargin" />Lingual Metal Margin</label>
                                <label class="chk-label"><input type="checkbox" id="mc_mdAllMetalMargin" />All Metal Margin</label>
                                <label class="chk-label"><input type="checkbox" id="mc_mdThreeQuarterOcclusal" />3/4 Occlusal Metal</label>
                                <label class="chk-label"><input type="checkbox" id="mc_mdOcclusalMetal" />Occlusal Metal</label>
                            </div>
                        </div>

                        <div class="bottom-left-grid">
                            <div class="arch-container">
                                <svg width="175" height="190" viewBox="0 0 180 200">
                                    <line x1="90" y1="15" x2="90" y2="185" stroke="#999" stroke-width="0.6" />
                                    <line x1="20" y1="100" x2="160" y2="100" stroke="#999" stroke-width="0.6" />
                                    <text x="90" y="68" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">U</text>
                                    <text x="90" y="142" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">L</text>
                                    <g id="mc_archTeethGroup"></g>
                                </svg>
                            </div>

                            <div>
                                <div class="tray-boxes">
                                    <div class="labeled-rect"><span>Tray/Impression:</span><input type="text" id="mc_trayImpression" class="box-input" /></div>
                                    <div class="labeled-rect"><span>Bite/Articulator:</span><input type="text" id="mc_biteArticulator" class="box-input" /></div>
                                    <div class="labeled-rect"><span>Model/Other:</span><input type="text" id="mc_modelOther" class="box-input" /></div>
                                </div>
                                <div class="anterior-six">
                                    <div class="ant-tooth"><span></span><span></span><span></span><span></span></div>
                                    <div class="ant-tooth"><span></span><span></span><span></span><span></span></div>
                                    <div class="ant-tooth"><span></span><span></span><span></span><span></span></div>
                                    <div class="ant-tooth"><span></span><span></span><span></span><span></span></div>
                                    <div class="ant-tooth"><span></span><span></span><span></span><span></span></div>
                                    <div class="ant-tooth"><span></span><span></span><span></span><span></span></div>
                                </div>
                                <div class="shade-stain-row">
                                    <div style="display: flex; align-items: baseline;">
                                        <span style="font-size: 10px; font-weight: bold;">Shade:</span>
                                        <input type="text" id="mc_shadeInput" class="line-input" style="width: 78px; font-size: 18px; font-weight: bold; text-align: center;" />
                                    </div>
                                    <div class="occl-stain-box">
                                        <div class="occl-stain-title">OCCL.STAIN:</div>
                                        <div class="occl-stain-grid">
                                            <label class="chk-label"><input type="checkbox" id="mc_stainNone" />None</label>
                                            <label class="chk-label"><input type="checkbox" id="mc_stainMedium" />Medium</label>
                                            <label class="chk-label"><input type="checkbox" id="mc_stainLight" />Light</label>
                                            <label class="chk-label"><input type="checkbox" id="mc_stainDark" />Dark</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="footer-info">
                            <div>Mars Dental Lab International, LLC.</div>
                            <div style="padding-left: 48px;">www.marsdentallab.com</div>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN -->
                    <div>
                        <div class="case-card">
                            <div class="case-card-row" style="height: 46px;">
                                <span style="font-size: 12px; font-weight: bold; white-space: nowrap;">Name:</span>
                                <input type="text" id="mc_clinicOrLabName" class="line-input" style="width: 100%; font-size: 13px; font-weight: bold;" />
                            </div>
                            <div class="case-card-row" style="height: 44px;">
                                <span style="font-size: 14px; font-weight: bold; white-space: nowrap;">CASE #</span>
                                <input type="text" id="mc_caseNumber" class="box-input" style="font-size: 22px; font-weight: bold;" />
                            </div>
                            <div class="case-card-row additional-inst-box">
                                <span style="font-size: 11px; font-weight: bold; text-decoration: underline;">Additional Instructions:</span>
                                <textarea id="mc_additionalInstructions" class="additional-inst-textarea"></textarea>
                            </div>
                        </div>

                        <div style="padding-left: 8px; margin-bottom: 14px;">
                            <label class="circle-chk"><input type="checkbox" id="mc_prefEasyFit" />Easy Fit</label>
                            <label class="circle-chk"><input type="checkbox" id="mc_prefGoodRetention" />Good Retention</label>
                            <label class="circle-chk"><input type="checkbox" id="mc_prefExtendMargins" />Extend Margins 1/4mm</label>
                            <label class="circle-chk"><input type="checkbox" id="mc_prefCoverUndercuts" />Cover All Undercuts</label>
                            <label class="circle-chk"><input type="checkbox" id="mc_prefBestTech" />Best Tech. to Work on the Case</label>
                            <label class="circle-chk"><input type="checkbox" id="mc_prefNotBulky" />Do not Make it BULKY</label>
                            <label class="circle-chk"><input type="checkbox" id="mc_prefButton" />Button</label>
                            <label class="circle-chk"><input type="checkbox" id="mc_prefLightContacts" />Light Contacts</label>
                            <label class="circle-chk"><input type="checkbox" id="mc_prefOutOfOcclusion" />Out of Occlusion</label>
                        </div>

                        <div class="diagrams-section">
                            <div class="diag-group">
                                <div class="diag-title">Embrasure</div>
                                <div class="diag-row">
                                    <div class="diag-options">
                                        <label class="chk-label"><input type="checkbox" id="mc_embOpen" />Open</label>
                                        <label class="chk-label"><input type="checkbox" id="mc_embClose" />Close</label>
                                    </div>
                                    <svg width="110" height="28" viewBox="0 0 110 28">
                                        <path d="M5,26 L5,8 C5,3 18,3 18,8 L18,26 M22,26 L22,8 C22,3 35,3 35,8 L35,26" fill="none" stroke="#444" stroke-width="1" stroke-dasharray="2,1"/>
                                        <path d="M55,26 L55,8 C55,3 68,3 68,8 L68,26 M69,26 L69,8 C69,3 82,3 82,8 L82,26" fill="none" stroke="#444" stroke-width="1" stroke-dasharray="2,1"/>
                                    </svg>
                                </div>
                            </div>

                            <div class="diag-group">
                                <div class="diag-title">Extent Proximal Contact</div>
                                <div class="diag-row">
                                    <div class="diag-options">
                                        <label class="chk-label"><input type="checkbox" id="mc_epcExtended" />Extended</label>
                                        <label class="chk-label"><input type="checkbox" id="mc_epcNormal" />Normal</label>
                                    </div>
                                    <svg width="130" height="26" viewBox="0 0 130 26">
                                        <rect x="6" y="5" width="22" height="16" rx="5" fill="none" stroke="#444" stroke-dasharray="2,1"/>
                                        <rect x="28" y="5" width="22" height="16" rx="5" fill="none" stroke="#444" stroke-dasharray="2,1"/>
                                        <ellipse cx="82" cy="13" rx="11" ry="8" fill="none" stroke="#444" stroke-dasharray="2,1"/>
                                        <ellipse cx="104" cy="13" rx="11" ry="8" fill="none" stroke="#444" stroke-dasharray="2,1"/>
                                    </svg>
                                </div>
                            </div>

                            <div class="diag-group">
                                <div class="diag-title">Occlusal contact</div>
                                <div class="diag-row">
                                    <div class="diag-options">
                                        <label class="chk-label"><input type="checkbox" id="mc_occHeavy" />Heavy</label>
                                        <label class="chk-label"><input type="checkbox" id="mc_occLight" />Light</label>
                                        <label class="chk-label"><input type="checkbox" id="mc_occOpen" />Open</label>
                                    </div>
                                    <svg width="145" height="36" viewBox="0 0 145 36">
                                        <path d="M8,4 C8,14 26,14 26,4 M8,32 C8,20 26,20 26,32" fill="none" stroke="#444" stroke-dasharray="2,1"/>
                                        <path d="M52,4 C52,13 70,13 70,4 M52,32 C52,22 70,22 70,32" fill="none" stroke="#444" stroke-dasharray="2,1"/>
                                        <path d="M96,4 C96,11 114,11 114,4 M96,34 C96,26 114,26 114,34" fill="none" stroke="#444" stroke-dasharray="2,1"/>
                                    </svg>
                                </div>
                            </div>

                            <div class="diag-group">
                                <div class="diag-title">Pontic design</div>
                                <div class="pontic-row">
                                    <label class="pontic-choice">
                                        <svg width="30" height="32" viewBox="0 0 30 32"><path d="M7,6 C7,2 23,2 23,6 C23,14 21,20 15,20 C9,20 7,14 7,6 Z" fill="none" stroke="#222" stroke-width="1.2"/><path d="M4,26 Q15,16 26,26" fill="#222" /></svg>
                                        <span>Full Ridge</span><input type="checkbox" id="mc_ponticFullRidge" />
                                    </label>
                                    <label class="pontic-choice">
                                        <svg width="30" height="32" viewBox="0 0 30 32"><path d="M7,6 C7,2 23,2 23,6 C23,14 21,20 15,20 C9,20 7,14 7,6 Z" fill="none" stroke="#222" stroke-width="1.2"/><path d="M4,26 Q15,19 26,26" fill="#222" /></svg>
                                        <span>Partial Ridge</span><input type="checkbox" id="mc_ponticPartialRidge" />
                                    </label>
                                    <label class="pontic-choice">
                                        <svg width="30" height="32" viewBox="0 0 30 32"><path d="M7,6 C7,2 23,2 23,6 C23,14 21,20 15,20 C9,20 7,14 7,6 Z" fill="none" stroke="#222" stroke-width="1.2"/><path d="M4,27 Q15,23 26,27" fill="#222" /></svg>
                                        <span>No Ridge</span><input type="checkbox" id="mc_ponticNoRidge" />
                                    </label>
                                    <label class="pontic-choice">
                                        <svg width="30" height="32" viewBox="0 0 30 32"><path d="M7,5 C7,1 23,1 23,5 C23,12 21,17 15,17 C9,17 7,12 7,5 Z" fill="none" stroke="#222" stroke-width="1.2"/><path d="M4,28 Q15,23 26,28" fill="#222" /></svg>
                                        <span>Sanitary</span><input type="checkbox" id="mc_ponticSanitary" />
                                    </label>
                                    <label class="pontic-choice">
                                        <svg width="30" height="32" viewBox="0 0 30 32"><path d="M7,5 C7,1 23,1 23,5 C23,13 18,22 15,22 C12,22 7,13 7,5 Z" fill="none" stroke="#222" stroke-width="1.2"/><path d="M4,27 Q12,21 15,25 Q18,21 26,27" fill="#222" /></svg>
                                        <span>Bullet</span><input type="checkbox" id="mc_ponticBullet" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
}

export function populate(el, data = {}) {
    populateMagic(data);
}

export function extract(el) {
    return extractMagic();
}

export function init(el, onEdited) {
    onEditedCallback = onEdited;
    initMagicArch();
    el.querySelectorAll('input, select, textarea').forEach(inp => {
        inp.addEventListener('input', onEdited);
        inp.addEventListener('change', onEdited);
    });
}
