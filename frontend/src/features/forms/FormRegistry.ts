export interface FormMeta {
  id: string;
  label: string;
  fullName: string;
  defaultPrefix: string;
}

export const FORMS_META: Record<string, FormMeta> = {
  fixed_simple: { id: 'fixed_simple', label: '1. 固定技工單 (簡)', fullName: '固定 - 牙科技工單', defaultPrefix: 'fixed-simple-order' },
  removable_simple: { id: 'removable_simple', label: '2. 活動技工單 (簡)', fullName: '活動 - 牙科技工單', defaultPrefix: 'removable-simple-order' },
  fixed: { id: 'fixed', label: '3. 珠海拜瑞 - 固定技工單', fullName: '珠海拜瑞 - 固定技工單', defaultPrefix: 'fixed-dental-order' },
  removable: { id: 'removable', label: '4. 珠海拜瑞 - 活動技工單', fullName: '珠海拜瑞 - 活動技工單', defaultPrefix: 'removable-dental-order' },
  betamars: { id: 'betamars', label: '5. BetaMars Dental Lab', fullName: 'BetaMars Dental Lab', defaultPrefix: 'betamars-rx' },
  kimsey: { id: 'kimsey', label: '6. Kimsey & Wright Dental Lab', fullName: 'Kimsey & Wright Dental Lab', defaultPrefix: 'kimsey-wright-order' },
  lk: { id: 'lk', label: '7. LK Dental Lab Order Slip', fullName: 'LK Dental Lab Order Slip', defaultPrefix: 'lk-order-slip' },
  magic: { id: 'magic', label: '8. Mars / Magic Crown Dental Lab', fullName: 'Mars / Magic Crown Dental Lab', defaultPrefix: 'mars-work-order' },
  preferred: { id: 'preferred', label: '9. Preferred Dental Lab', fullName: 'Preferred Dental Lab', defaultPrefix: 'preferred-dental-case' },
};

export function detectFormType(data: any = {}): string {
  if (!data || typeof data !== 'object') return 'fixed_simple';
  const title = String(data.title || data.$schema || '');
  if (title.includes('BetaMars')) return 'betamars';
  if (title.includes('KimseyAndWright')) return 'kimsey';
  if (title.includes('DentalLabOrderSlip')) return 'lk';
  if (title.includes('MarsDentalLabWorkOrder')) return 'magic';
  if (title.includes('PreferredDentalLabOrder')) return 'preferred';
  if (title.includes('FixedRestorationLabOrder')) return 'fixed_simple';
  if (title.includes('RemovableRestorationLabOrder')) return 'removable_simple';
  if (title.includes('DentalLabOrder')) return 'fixed';
  if (title.includes('RemovableDentureLabOrder')) return 'removable';

  if ('restorationSpecs' in data && 'toothPosition' in data && 'orderInfo' in data) {
    const s = data.restorationSpecs || {};
    if ('acrylicType' in s || 'reinforcingWire' in s || 'addName' in s) return 'removable_simple';
    return 'fixed_simple';
  }
  if ('header' in data && ('marginAndConnection' in data || 'toothChartSection' in data)) return 'fixed';
  if ('header' in data && ('shadeAndToothPosition' in data || 'acrylicDesignAndBarcode' in data)) return 'removable';
  if ('crownAndBridgeRx' in data || 'odontogramAndSpecs' in data) return 'betamars';
  if ('products' in data || (data.caseInfo && 'pan' in data.caseInfo)) return 'kimsey';
  if ('doctorAndPatient' in data || 'practiceInfo' in data) return 'lk';
  if ('caseIdentification' in data || 'crownAndBridge' in data) return 'magic';
  if ('restorationOptions' in data || 'specialStain' in data) return 'preferred';

  return 'fixed_simple';
}

export function deriveFallbackName(type: string, data: any = {}): string {
  if (type === 'fixed_simple') return data?.orderInfo?.clientOrderNo || data?.orderInfo?.patientName || 'fixed-simple-order';
  if (type === 'removable_simple') return data?.orderInfo?.clientOrderNo || data?.orderInfo?.patientName || 'removable-simple-order';
  if (type === 'fixed') return data?.orderInfo?.orderNo || 'fixed-dental-order';
  if (type === 'removable') return data?.orderInfo?.orderNo || 'removable-dental-order';
  if (type === 'betamars') return data?.caseInfo?.caseNumber || data?.caseInfo?.patientName || 'betamars-rx';
  if (type === 'kimsey') return data?.header?.orderNumber || data?.caseInfo?.patient || 'kimsey-wright-order';
  if (type === 'lk') return data?.header?.orderNumber || data?.doctorAndPatient?.patientName || 'lk-order-slip';
  if (type === 'magic') return data?.caseIdentification?.caseNumber || data?.caseIdentification?.name || 'mars-work-order';
  if (type === 'preferred') return data?.caseInfo?.caseNumber || 'preferred-dental-case';
  return 'dental-form';
}
