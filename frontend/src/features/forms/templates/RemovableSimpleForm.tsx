import React from 'react';

interface Props {
  data: any;
  onChange: (newData: any) => void;
}

export const RemovableSimpleForm: React.FC<Props> = ({ data = {}, onChange }) => {
  const update = (section: string, field: string, value: any) => {
    onChange({
      ...data,
      [section]: {
        ...(data[section] || {}),
        [field]: value,
      },
    });
  };

  const Cell = ({ label, sec, fld }: { label: string; sec: string; fld: string }) => {
    const val = (data[sec] || {})[fld] ?? '';
    return (
      <>
        <td className="label-cell">{label}</td>
        <td className="input-cell">
          <input
            type="text"
            className="cell-input"
            value={val}
            onChange={(e) => update(sec, fld, e.target.value)}
          />
        </td>
      </>
    );
  };

  return (
    <div className="form-sheet form-sheet-simple">
      <div className="form-title">活動</div>
      <table className="main-grid">
        <tbody>
          <tr>
            <Cell label="診所名稱" sec="orderInfo" fld="clinicName" />
            <Cell label="醫生名" sec="orderInfo" fld="doctorName" />
          </tr>
          <tr>
            <Cell label="患者名" sec="orderInfo" fld="patientName" />
            <Cell label="到貨日期" sec="orderInfo" fld="arrivalDate" />
          </tr>
          <tr>
            <Cell label="客戶代碼/醫院簡稱" sec="orderInfo" fld="clientCodeOrHospitalAbbr" />
            <Cell label="出貨日期" sec="orderInfo" fld="shippingDate" />
          </tr>
          <tr>
            <Cell label="客戶單號" sec="orderInfo" fld="clientOrderNo" />
            <Cell label="Pan" sec="orderInfo" fld="pan" />
          </tr>
          <tr>
            <Cell label="美式齒位" sec="toothPosition" fld="usToothPosition" />
            <Cell label="中式齒位" sec="toothPosition" fld="chineseToothPosition" />
          </tr>
          <tr>
            <Cell label="歐式齒位" sec="toothPosition" fld="euToothPosition" />
            <Cell label="膠托類型" sec="restorationSpecs" fld="acrylicType" />
          </tr>
          <tr>
            <Cell label="比色" sec="restorationSpecs" fld="shade" />
            <Cell label="加強絲" sec="restorationSpecs" fld="reinforcingWire" />
          </tr>
          <tr>
            <Cell label="加名" sec="restorationSpecs" fld="addName" />
            <Cell label="連咬合架出貨" sec="restorationSpecs" fld="shipWithArticulator" />
          </tr>
          <tr>
            <Cell label="自備牙數量" sec="restorationSpecs" fld="selfProvidedTeethCount" />
            <Cell label="備註說明" sec="restorationSpecs" fld="notes" />
          </tr>
        </tbody>
      </table>
    </div>
  );
};
