/**
 * Form 1: 固定 - 牙科技工單 (Fixed Simple)
 * Schema: FixedRestorationLabOrder
 */

export const meta = {
    id: 'fixed_simple',
    label: '1. 固定技工單 (簡)',
    fullName: '固定 - 牙科技工單',
    defaultPrefix: 'fixed-simple-order',
    badgeClass: 'pill-fixed-simple',
};

export function render() {
    return `
    <div class="form-sheet">
        <div class="form-title">固定</div>
        <table class="main-grid">
            <tbody>
                <tr>
                    <td class="label-cell">診所名稱</td>
                    <td class="input-cell"><input type="text" name="clinicName" class="cell-input" /></td>
                    <td class="label-cell">醫生名</td>
                    <td class="input-cell"><input type="text" name="doctorName" class="cell-input" /></td>
                </tr>
                <tr>
                    <td class="label-cell">患者名</td>
                    <td class="input-cell"><input type="text" name="patientName" class="cell-input" /></td>
                    <td class="label-cell">到貨日期</td>
                    <td class="input-cell"><input type="text" name="arrivalDate" class="cell-input" /></td>
                </tr>
                <tr>
                    <td class="label-cell">客戶代碼/醫院簡稱</td>
                    <td class="input-cell"><input type="text" name="clientCodeOrHospitalAbbr" class="cell-input" /></td>
                    <td class="label-cell">出貨日期</td>
                    <td class="input-cell"><input type="text" name="shippingDate" class="cell-input" /></td>
                </tr>
                <tr>
                    <td class="label-cell">客戶單號</td>
                    <td class="input-cell"><input type="text" name="clientOrderNo" class="cell-input" /></td>
                    <td class="label-cell">Pan</td>
                    <td class="input-cell"><input type="text" name="pan" class="cell-input" /></td>
                </tr>
                <tr>
                    <td class="label-cell">美式齒位</td>
                    <td class="input-cell"><input type="text" name="usToothPosition" class="cell-input" /></td>
                    <td class="label-cell">中式齒位</td>
                    <td class="input-cell"><input type="text" name="chineseToothPosition" class="cell-input" /></td>
                </tr>
                <tr>
                    <td class="label-cell">歐式齒位</td>
                    <td class="input-cell"><input type="text" name="euToothPosition" class="cell-input" /></td>
                    <td class="label-cell">單獨</td>
                    <td class="input-cell"><input type="text" name="singleCrown" class="cell-input" /></td>
                </tr>
                <tr>
                    <td class="label-cell">比色</td>
                    <td class="input-cell"><input type="text" name="shade" class="cell-input" /></td>
                    <td class="label-cell">相連</td>
                    <td class="input-cell"><input type="text" name="splintedCrown" class="cell-input" /></td>
                </tr>
                <tr>
                    <td class="label-cell">牙橋形狀</td>
                    <td class="input-cell"><input type="text" name="ponticDesign" class="cell-input" /></td>
                    <td class="label-cell">金屬邊</td>
                    <td class="input-cell"><input type="text" name="metalMargin" class="cell-input" /></td>
                </tr>
                <tr>
                    <td class="label-cell">染色程度</td>
                    <td class="input-cell"><input type="text" name="stainingDegree" class="cell-input" /></td>
                    <td class="label-cell">咬合程度</td>
                    <td class="input-cell"><input type="text" name="occlusionDegree" class="cell-input" /></td>
                </tr>
                <tr>
                    <td class="label-cell">咬金</td>
                    <td class="input-cell"><input type="text" name="metalOcclusion" class="cell-input" /></td>
                    <td class="label-cell">瓷邊</td>
                    <td class="input-cell"><input type="text" name="porcelainMargin" class="cell-input" /></td>
                </tr>
            </tbody>
        </table>
    </div>
    `;
}

export function populate(el, data = {}) {
    const o = data.orderInfo || {};
    const tp = data.toothPosition || {};
    const spec = data.restorationSpecs || {};

    const setVal = (name, val) => {
        const inp = el.querySelector(`[name="${name}"]`);
        if (inp) inp.value = val ?? '';
    };

    setVal('clinicName', o.clinicName);
    setVal('doctorName', o.doctorName);
    setVal('patientName', o.patientName);
    setVal('arrivalDate', o.arrivalDate);
    setVal('clientCodeOrHospitalAbbr', o.clientCodeOrHospitalAbbr);
    setVal('shippingDate', o.shippingDate);
    setVal('clientOrderNo', o.clientOrderNo);
    setVal('pan', o.pan);

    setVal('usToothPosition', tp.usToothPosition);
    setVal('chineseToothPosition', tp.chineseToothPosition);
    setVal('euToothPosition', tp.euToothPosition);

    setVal('singleCrown', spec.singleCrown);
    setVal('shade', spec.shade);
    setVal('splintedCrown', spec.splintedCrown);
    setVal('ponticDesign', spec.ponticDesign);
    setVal('metalMargin', spec.metalMargin);
    setVal('stainingDegree', spec.stainingDegree);
    setVal('occlusionDegree', spec.occlusionDegree);
    setVal('metalOcclusion', spec.metalOcclusion);
    setVal('porcelainMargin', spec.porcelainMargin);
}

export function extract(el) {
    const getVal = (name) => el.querySelector(`[name="${name}"]`)?.value ?? '';

    return {
        orderInfo: {
            clinicName: getVal('clinicName'),
            doctorName: getVal('doctorName'),
            patientName: getVal('patientName'),
            arrivalDate: getVal('arrivalDate'),
            clientCodeOrHospitalAbbr: getVal('clientCodeOrHospitalAbbr'),
            shippingDate: getVal('shippingDate'),
            clientOrderNo: getVal('clientOrderNo'),
            pan: getVal('pan'),
        },
        toothPosition: {
            usToothPosition: getVal('usToothPosition'),
            chineseToothPosition: getVal('chineseToothPosition'),
            euToothPosition: getVal('euToothPosition'),
        },
        restorationSpecs: {
            singleCrown: getVal('singleCrown'),
            shade: getVal('shade'),
            splintedCrown: getVal('splintedCrown'),
            ponticDesign: getVal('ponticDesign'),
            metalMargin: getVal('metalMargin'),
            stainingDegree: getVal('stainingDegree'),
            occlusionDegree: getVal('occlusionDegree'),
            metalOcclusion: getVal('metalOcclusion'),
            porcelainMargin: getVal('porcelainMargin'),
        },
    };
}

export function init(el, onEdited) {
    el.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', onEdited);
    });
}
