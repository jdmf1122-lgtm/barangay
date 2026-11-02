import { IncidentCategory } from '../types';

export interface ClassificationResult {
  category: IncidentCategory;
  confidence: 'high' | 'medium' | 'fallback';
  matchedKeywords: string[];
}

/**
 * Intelligent incident classification engine for resident citizen reports.
 * Analyzes natural language accident summaries (Tagalog, English, Taglish, local vehicle keywords)
 * to automatically assign the most accurate official accident category for MDRRMO dispatch and analytics.
 */
export function classifyIncidentFromText(text: string): ClassificationResult {
  if (!text || !text.trim()) {
    return {
      category: 'Motorcycle vs Motorcycle Collision',
      confidence: 'fallback',
      matchedKeywords: []
    };
  }

  const normalized = text.toLowerCase();

  const has = (...keywords: string[]) => {
    return keywords.some((k) => normalized.includes(k));
  };

  // 1. HIT-AND-RUN (Highest priority detection)
  if (
    has(
      'hit and run',
      'hit-and-run',
      'hit & run',
      'tumakas',
      'tinakbuhan',
      'walang plaka tumakas',
      'iniwan ang biktima',
      'fled',
      'runaway',
      'di huminto',
      'nagtago'
    )
  ) {
    return {
      category: 'Hit-and-Run Vehicular Crash',
      confidence: 'high',
      matchedKeywords: ['hit and run', 'tumakas']
    };
  }

  // 2. PEDESTRIAN HIT (Pedestrian / Crossing / Nabundol ang tao)
  if (
    has(
      'pedestrian',
      'tumatawid',
      'tumawid',
      'nabundol',
      'nasagasaan',
      'nasapol na tao',
      'naglalakad',
      'bata',
      'matanda nabundol',
      'hit person',
      'hit pedestrian',
      'taong tumatawid',
      'nasalpok ang naglalakad',
      'nasagasaan ang bata'
    )
  ) {
    return {
      category: 'Pedestrian Hit by Vehicle / Motorcycle',
      confidence: 'high',
      matchedKeywords: ['pedestrian / tumatawid']
    };
  }

  // 3. MULTI-VEHICLE PILEUP (Karambola / Multiple vehicles)
  if (
    has(
      'karambola',
      'carambola',
      'pileup',
      'pile-up',
      'maramihang banggaan',
      'tatlong sasakyan',
      'apat na sasakyan',
      'multiple vehicle',
      'multiple collision',
      'chain reaction',
      '3 sasakyan',
      '4 na sasakyan',
      'nagsalpukan ang mga sasakyan'
    )
  ) {
    return {
      category: 'Multi-Vehicle Pileup Collision',
      confidence: 'high',
      matchedKeywords: ['karambola / pileup']
    };
  }

  // 4. TRUCK / BUS / HEAVY VEHICLE CRASH
  if (
    has(
      'truck',
      'trak',
      'bus',
      'trailer',
      'dump truck',
      'dumptruck',
      '10-wheeler',
      'heavy vehicle',
      'mixer',
      'forward',
      'canter',
      'elf',
      'hauler',
      'buses',
      'tangke'
    )
  ) {
    return {
      category: 'Truck / Bus / Heavy Vehicle Crash',
      confidence: 'high',
      matchedKeywords: ['truck / bus']
    };
  }

  // 5. PUV / JEEPNEY / MULTICAB ACCIDENT
  if (
    has(
      'jeep',
      'jeepney',
      'dyip',
      'multicab',
      'multi-cab',
      'uv express',
      'puv',
      'passenger van',
      'commuter van',
      'fx'
    )
  ) {
    return {
      category: 'PUV / Jeepney / Multicab Accident',
      confidence: 'high',
      matchedKeywords: ['jeepney / multicab']
    };
  }

  // 6. BICYCLE / E-BIKE / E-TRIKE CRASH
  if (
    has(
      'e-bike',
      'ebike',
      'e-trike',
      'etrike',
      'bisikleta',
      'bicycle',
      'bike',
      'padyak',
      'scooter',
      'e-scooter',
      'escooter',
      'mountain bike'
    )
  ) {
    return {
      category: 'Bicycle / E-Bike / E-Trike Crash',
      confidence: 'high',
      matchedKeywords: ['bicycle / e-bike']
    };
  }

  // 7. SINGLE-VEHICLE ROAD SKID / FIXED OBJECT CRASH
  if (
    has(
      'poste',
      'puno',
      'ditch',
      'kanal',
      'barrier',
      'gutter',
      'pader',
      'tulay',
      'sumalpok sa poste',
      'nadulas',
      'road skid',
      'skid',
      'nawalan ng preno',
      'self-accident',
      'self accident',
      'sumalpok mag-isa',
      'tumagilid mag-isa',
      'nahulog sa kanal',
      'salpok sa puno',
      'guardrail',
      'buhangin',
      'dumulas'
    )
  ) {
    return {
      category: 'Single-Vehicle Road Skid / Fixed Object Crash',
      confidence: 'high',
      matchedKeywords: ['road skid / poste / fixed object']
    };
  }

  // 8. Vehicle Entity Extractions
  const mentionsMotor = has(
    'motor',
    'motorcycle',
    'motorsiklo',
    'raider',
    'nmax',
    'aerox',
    'click',
    'mio',
    'wave',
    'single',
    'rusi',
    'yamaha',
    'honda',
    'suzuki',
    'kawasaki'
  );

  const mentionsTrike = has('tricycle', 'traysikel', 'trike', 'sidecar', 'toda');

  const mentionsCar = has(
    'kotse',
    'car',
    'suv',
    'sedan',
    'van',
    'vios',
    'innova',
    'fortuner',
    'hilux',
    'montero',
    'pickup',
    'pick-up',
    '4-wheel',
    'four wheel',
    'ranger',
    'wigo',
    'mirage',
    'everest'
  );

  // 8a. MOTORCYCLE VS TRICYCLE
  if (mentionsMotor && mentionsTrike) {
    return {
      category: 'Motorcycle vs Tricycle Collision',
      confidence: 'high',
      matchedKeywords: ['motorcycle', 'tricycle']
    };
  }

  // 8b. MOTORCYCLE VS CAR / SUV
  if (mentionsMotor && mentionsCar) {
    return {
      category: 'Motorcycle vs Car / SUV Collision',
      confidence: 'high',
      matchedKeywords: ['motorcycle', 'car / SUV']
    };
  }

  // 8c. TRICYCLE COLLISION / ROLLOVER
  if (mentionsTrike) {
    return {
      category: 'Tricycle Collision / Rollover',
      confidence: 'medium',
      matchedKeywords: ['tricycle']
    };
  }

  // 8d. CAR / 4-WHEELED VEHICLE COLLISION
  if (mentionsCar) {
    return {
      category: 'Car / 4-Wheeled Vehicle Collision',
      confidence: 'medium',
      matchedKeywords: ['car / 4-wheeled vehicle']
    };
  }

  // 8e. MOTORCYCLE VS MOTORCYCLE COLLISION (or Default Motorcycle crash)
  if (mentionsMotor || has('banggaan', 'salpukan', 'aksidente', 'collision', 'crash', 'disgrasya')) {
    return {
      category: 'Motorcycle vs Motorcycle Collision',
      confidence: mentionsMotor ? 'high' : 'medium',
      matchedKeywords: mentionsMotor ? ['motorcycle'] : ['general incident']
    };
  }

  // Default fallback
  return {
    category: 'Motorcycle vs Motorcycle Collision',
    confidence: 'fallback',
    matchedKeywords: ['default']
  };
}
