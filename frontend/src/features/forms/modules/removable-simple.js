/**
 * Form 2: 活動 - 牙科技工單 (Removable Simple)
 * Schema: RemovableRestorationLabOrder
 */

export const meta = {
    id: 'removable_simple',
    label: '2. 活動技工單 (簡)',
    fullName: '活動 - 牙科技工單',
    defaultPrefix: 'removable-simple-order',
    badgeClass: 'pill-removable-simple',
};

export function render() {
    return `
    <div class="form-sheet">
        <div class="form-title">活動</div>
        <table class="main-grid">
            <colgroup>
                <col style="width: 21%;" />
                <col style="width: 35%;" />
                <col style="width: 22%;" />
                <col style="width: 22%;" />
            </colgroup>
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
                    <td class="label-cell">比色</td>
                    <td class="input-cell"><input type="text" name="shade" class="cell-input" /></td>
                </tr>
                <tr>
                    <td class="label-cell">自備牙X顆</td>
                    <td class="input-cell"><input type="text" name="selfProvidedTeethCount" class="cell-input" /></td>
                    <td class="label-cell"></td>
                    <td class="input-cell"></td>
                </tr>
                <tr>
                    <td class="label-cell">膠</td>
                    <td class="radio-cell">
                        <div class="radio-group">
                            <label class="radio-label"><input type="radio" name="rms_acrylicType" value="199膠" /> 199膠</label>
                            <label class="radio-label"><input type="radio" name="rms_acrylicType" value="輕度粉紅膠" /> 輕度粉紅膠</label>
                            <label class="radio-label"><input type="radio" name="rms_acrylicType" value="黑人膠" /> 黑人膠</label>
                        </div>
                    </td>
                    <td class="label-cell">是否放加强线</td>
                    <td class="radio-cell">
                        <div class="radio-group">
                            <label class="radio-label"><input type="radio" name="rms_reinforcingWire" value="true" /> 是</label>
                            <label class="radio-label"><input type="radio" name="rms_reinforcingWire" value="false" /> 否</label>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="label-cell">是否上咬合器出貨</td>
                    <td class="radio-cell">
                        <div class="radio-group">
                            <label class="radio-label"><input type="radio" name="rms_shipWithArticulator" value="true" /> 是</label>
                            <label class="radio-label"><input type="radio" name="rms_shipWithArticulator" value="false" /> 否</label>
                        </div>
                    </td>
                    <td class="label-cell">是否加名字</td>
                    <td class="radio-cell">
                        <div class="radio-group">
                            <label class="radio-label"><input type="radio" name="rms_addName" value="true" /> 是</label>
                            <label class="radio-label"><input type="radio" name="rms_addName" value="false" /> 否</label>
                        </div>
                    </td>
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

    setVal('shade', spec.shade);
    setVal('selfProvidedTeethCount', spec.selfProvidedTeethCount);

    const setRadio = (radioName, val) => {
        const radios = el.querySelectorAll(`input[name="${radioName}"]`);
        radios.forEach(r => {
            r.checked = (val !== null && val !== undefined && val !== '') && (r.value === String(val));
            r.dataset.wasChecked = r.checked ? 'true' : 'false';
        });
    };

    setRadio('rms_acrylicType', spec.acrylicType);
    setRadio('rms_reinforcingWire', spec.reinforcingWire);
    setRadio('rms_shipWithArticulator', spec.shipWithArticulator);
    setRadio('rms_addName', spec.addName);
}

export function extract(el) {
    const getVal = (name) => el.querySelector(`[name="${name}"]`)?.value ?? '';
    const getRadio = (name, isBoolean = false) => {
        const checked = el.querySelector(`input[name="${name}"]:checked`);
        if (!checked) return isBoolean ? null : '';
        return isBoolean ? checked.value === 'true' : checked.value;
    };

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
            shade: getVal('shade'),
            selfProvidedTeethCount: getVal('selfProvidedTeethCount'),
            acrylicType: getRadio('rms_acrylicType', false),
            reinforcingWire: getRadio('rms_reinforcingWire', true),
            shipWithArticulator: getRadio('rms_shipWithArticulator', true),
            addName: getRadio('rms_addName', true),
        },
    };
}

export function init(el, onEdited) {
    el.querySelectorAll('input[type="text"]').forEach(inp => {
        inp.addEventListener('input', onEdited);
    });

    el.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('click', function () {
            if (this.dataset.wasChecked === 'true') {
                this.checked = false;
                this.dataset.wasChecked = 'false';
            } else {
                el.querySelectorAll(`input[name="${this.name}"]`).forEach(r => r.dataset.wasChecked = 'false');
                this.dataset.wasChecked = 'true';
            }
            onEdited();
        });
    });
}
