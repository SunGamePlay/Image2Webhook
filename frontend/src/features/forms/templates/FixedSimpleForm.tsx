import React from 'react';

interface Props {
  data: any;
  onChange: (newData: any) => void;
}

export const FixedSimpleForm: React.FC<Props> = ({ data = {}, onChange }) => {
  const o = data.orderInfo || {};
  const tp = data.toothPosition || {};
  const s = data.restorationSpecs || {};

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
      <div className="form-title">固定</div>
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
            <Cell label="單獨" sec="restorationSpecs" fld="singleCrown" />
          </tr>
          <tr>
            <Cell label="比色" sec="restorationSpecs" fld="shade" />
            <Cell label="相連" sec="restorationSpecs" fld="splintedCrown" />
          </tr>
          <tr>
            <Cell label="橋體設計" sec="restorationSpecs" fld="ponticDesign" />
            <Cell label="金屬邊緣" sec="restorationSpecs" fld="metalMargin" />
          </tr>
          <tr>
            <Cell label="染色程度" sec="restorationSpecs" fld="stainingDegree" />
            <Cell label="咬合程度" sec="restorationSpecs" fld="occlusionDegree" />
          </tr>
          <tr>
            <Cell label="金屬咬合" sec="restorationSpecs" fld="metalOcclusion" />
            <Cell label="瓷邊緣" sec="restorationSpecs" fld="porcelainMargin" />
          </tr>
        </tbody>
      </table>
    </div>
  );
};
