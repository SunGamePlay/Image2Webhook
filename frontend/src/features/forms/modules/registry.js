/**
 * Central Form Registry and Auto-Detector for all 9 Dental Lab Forms.
 */

import * as FixedSimple from './fixed-simple.js';
import * as RemovableSimple from './removable-simple.js';
import * as FixedStandard from './fixed-standard.js';
import * as RemovableStandard from './removable-standard.js';
import * as BetaMars from './betamars.js';
import * as KimseyWright from './kimsey-wright.js';
import * as LkSlip from './lk-slip.js';
import * as MagicCrown from './magic-crown.js';
import * as Preferred from './preferred.js';

export const FORMS = [
    FixedSimple,
    RemovableSimple,
    FixedStandard,
    RemovableStandard,
    BetaMars,
    KimseyWright,
    LkSlip,
    MagicCrown,
    Preferred,
];

export const FORM_REGISTRY = {
    fixed_simple: FixedSimple,
    removable_simple: RemovableSimple,
    fixed: FixedStandard,
    removable: RemovableStandard,
    betamars: BetaMars,
    kimsey: KimseyWright,
    lk: LkSlip,
    magic: MagicCrown,
    preferred: Preferred,
};

/**
 * Accurately detects which dental form matches the given JSON object.
 */
export function detectFormType(data = {}) {
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

    // Heuristics based on properties:
    // Fixed simple vs Removable simple:
    if ('restorationSpecs' in data && 'toothPosition' in data && 'orderInfo' in data) {
        const specs = data.restorationSpecs || {};
        if (
            'acrylicType' in specs ||
            'reinforcingWire' in specs ||
            'shipWithArticulator' in specs ||
            'selfProvidedTeethCount' in specs ||
            'addName' in specs
        ) {
            return 'removable_simple';
        }
        return 'fixed_simple';
    }

    // Chinese Fixed (DentalLabOrder):
    if ('header' in data && ('marginAndConnection' in data || 'toothChartSection' in data || 'metalMarginAndSpace' in data)) {
        return 'fixed';
    }

    // Chinese Removable (RemovableDentureLabOrder):
    if ('header' in data && ('shadeAndToothPosition' in data || 'acrylicDesignAndBarcode' in data || 'claspsAndReinforcement' in data)) {
        return 'removable';
    }

    // BetaMars:
    if ('crownAndBridgeRx' in data || 'odontogramAndSpecs' in data || 'removableRx' in data || 'doctorAndShipping' in data) {
        return 'betamars';
    }

    // Kimsey & Wright:
    if ('products' in data || 'attachedFiles' in data || (data.caseInfo && 'pan' in data.caseInfo && 'doctor' in data.caseInfo)) {
        return 'kimsey';
    }

    // LK Order Slip:
    if (
        'doctorAndPatient' in data ||
        'practiceInfo' in data ||
        'shippingInfo' in data ||
        'additionalNotes' in data ||
        (data.header && 'createdBy' in data.header)
    ) {
        return 'lk';
    }

    // Magic Crown / Mars:
    if ('caseIdentification' in data || 'crownAndBridge' in data || 'enclosuresAndArch' in data || 'contactsAndPonticDesign' in data) {
        return 'magic';
    }

    // Preferred Dental Lab:
    if ('restorationOptions' in data || 'specialStain' in data || 'designCase' in data || 'specifications' in data) {
        return 'preferred';
    }

    return 'fixed_simple';
}

/**
 * Derive a clean base file name for exporting (without extension).
 */
export function deriveFallbackName(type, data = {}) {
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
