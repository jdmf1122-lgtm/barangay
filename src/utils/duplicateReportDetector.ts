import { Case, PersonInvolved, TimelineEvent } from '../types';

// Common Tagalog & English Stopwords
const STOP_WORDS = new Set([
  'ng', 'mga', 'ang', 'sa', 'ay', 'si', 'ni', 'kay', 'ko', 'mo', 'po', 'opo',
  'na', 'at', 'o', 'may', 'maging', 'nang', 'ba', 'pa', 'din', 'rin', 'daw',
  'raw', 'yung', 'yong', 'ito', 'nito', 'dito', 'dyan', 'doon', 'don', 'kasi',
  'dahil', 'para', 'pero', 'kung', 'kapag', 'pag', 'mula', 'hanggang',
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'and', 'or', 'it', 'this', 'that', 'from', 'by', 'be', 'been'
]);

// Synonym mapping to normalize variations in Filipino and English reporting
const SYNONYMS: Record<string, string> = {
  // Collisions & Accidents
  'banggaan': 'collision',
  'nagkabanggaan': 'collision',
  'nabangga': 'collision',
  'aksidente': 'collision',
  'accident': 'collision',
  'crash': 'collision',
  'disgrasya': 'collision',
  'semplang': 'collision',
  'salpok': 'collision',
  'nagkasalpukan': 'collision',
  'karambola': 'collision',
  'collision': 'collision',
  't-bone': 'collision',

  // Vehicles
  'motor': 'motorcycle',
  'motorsiklo': 'motorcycle',
  'motorcycle': 'motorcycle',
  'mc': 'motorcycle',
  'scooter': 'motorcycle',
  'raider': 'motorcycle',
  'mio': 'motorcycle',
  'click': 'motorcycle',
  'kotse': 'car',
  'auto': 'car',
  'sasakyan': 'car',
  'car': 'car',
  'sedan': 'car',
  'suv': 'car',
  'van': 'car',
  'vios': 'car',
  'traysikel': 'tricycle',
  'tricycle': 'tricycle',
  'trike': 'tricycle',
  'toda': 'tricycle',
  'trak': 'truck',
  'truck': 'truck',
  'elf': 'truck',
  'bus': 'puv',
  'jeep': 'puv',
  'jeepney': 'puv',

  // Prepositions / Landmarks
  'tapat': 'front',
  'harapan': 'front',
  'bungad': 'front',
  'harap': 'front',
  'tapatng': 'front',
  'malapit': 'near',
  'near': 'near',
  'tabi': 'near',
  'gilid': 'near',
  'kanto': 'crossing',
  'crossing': 'crossing',
  'intersection': 'crossing',
  'iskina': 'crossing',
  'highway': 'highway',
  'hiway': 'highway',
  'nautical': 'highway',
  'kalsada': 'road',
  'daan': 'road',
  'bridge': 'bridge',
  'tulay': 'bridge',
  'market': 'market',
  'palengke': 'market',
  'simbahan': 'church',
  'church': 'church',
  'hall': 'hall',
  'barangayhall': 'hall',

  // Incidents
  'sunog': 'fire',
  'apoy': 'fire',
  'fire': 'fire',
  'usok': 'fire',
  'nagliliyab': 'fire',
  'baha': 'flood',
  'flood': 'flood',
  'tubig': 'flood',
  'away': 'fight',
  'gulo': 'fight',
  'rambol': 'fight',
  'suntukan': 'fight',
  'brawl': 'fight',
  'riot': 'fight',
  'nakaw': 'theft',
  'nanakawan': 'theft',
  'theft': 'theft',
  'holdup': 'theft',
  'holdap': 'theft',
  'snatching': 'theft'
};

/**
 * Normalizes text: lowercase, strip punctuation, accents, extra spaces
 */
export function normalizeText(text?: string | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenizes text, strips stopwords, and maps synonyms
 */
export function extractNormalizedTokens(text?: string | null): string[] {
  const norm = normalizeText(text);
  if (!norm) return [];
  const words = norm.split(' ');
  const tokens: string[] = [];

  for (const w of words) {
    if (!w || w.length < 2) continue;
    if (STOP_WORDS.has(w)) continue;
    const mapped = SYNONYMS[w] || w;
    tokens.push(mapped);
  }

  return tokens;
}

/**
 * Calculates Token Jaccard similarity (0.0 to 1.0)
 */
export function calculateTokenSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersectionCount = 0;
  for (const t of setA) {
    if (setB.has(t)) intersectionCount++;
  }

  const unionCount = new Set([...tokensA, ...tokensB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Calculates Character Bigram Dice Coefficient for fuzzy text match (handles typos)
 */
export function calculateDiceCoefficient(strA: string, strB: string): number {
  const a = normalizeText(strA).replace(/\s/g, '');
  const b = normalizeText(strB).replace(/\s/g, '');
  if (!a || !b) return 0;
  if (a === b) return 1.0;
  if (a.length < 2 || b.length < 2) return 0;

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bg = str.substring(i, i + 2);
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }
    return bigrams;
  };

  const bgA = getBigrams(a);
  const bgB = getBigrams(b);

  let matches = 0;
  for (const [bg, countA] of bgA.entries()) {
    const countB = bgB.get(bg) || 0;
    matches += Math.min(countA, countB);
  }

  const total = (a.length - 1) + (b.length - 1);
  return (2.0 * matches) / total;
}

/**
 * Converts HH:mm or hh:mm a to minutes from midnight
 */
function parseTimeToMinutes(timeStr?: string | null): number | null {
  if (!timeStr) return null;
  try {
    const clean = timeStr.trim().toLowerCase();
    const isPm = clean.includes('pm');
    const isAm = clean.includes('am');
    const numPart = clean.replace(/[^\d:]/g, '');
    const parts = numPart.split(':');
    if (parts.length < 2) return null;

    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;

    if (isPm && h < 12) h += 12;
    if (isAm && h === 12) h = 0;

    return h * 60 + m;
  } catch (e) {
    return null;
  }
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  score: number;
  reasons: string[];
  matchedPrimaryId?: string;
  matchedSecondaryId?: string;
}

/**
 * Analyzes whether Report A and Report B represent the same incident,
 * even with slight differences in wording, time, or reporter.
 */
export function evaluateDuplicateReports(
  reportA: Partial<Case>,
  reportB: Partial<Case>
): DuplicateCheckResult {
  const reasons: string[] = [];

  // Exclude comparing identical record with itself
  if (reportA.id && reportB.id && reportA.id === reportB.id) {
    return { isDuplicate: false, score: 0, reasons: ['Same record ID'] };
  }

  // 1. Barangay Jurisdiction Check
  const bgyA = normalizeText(reportA.barangay);
  const bgyB = normalizeText(reportB.barangay);
  const locA = normalizeText(reportA.specificLocation);
  const locB = normalizeText(reportB.specificLocation);

  const sameBarangay = Boolean(
    (bgyA && bgyB && bgyA === bgyB) ||
    (bgyA && locB.includes(bgyA)) ||
    (bgyB && locA.includes(bgyB))
  );

  if (!sameBarangay) {
    return { isDuplicate: false, score: 0, reasons: ['Different Barangays'] };
  }
  reasons.push(`Same Barangay: ${reportA.barangay || reportB.barangay}`);

  // 2. Incident Date Check (Same day or within 24 hours)
  let dateMatch = false;
  if (reportA.incidentDate && reportB.incidentDate) {
    if (reportA.incidentDate === reportB.incidentDate) {
      dateMatch = true;
      reasons.push(`Same Incident Date: ${reportA.incidentDate}`);
    } else {
      const timeDiff = Math.abs(new Date(reportA.incidentDate).getTime() - new Date(reportB.incidentDate).getTime());
      if (timeDiff <= 24 * 60 * 60 * 1000) {
        dateMatch = true;
        reasons.push(`Incident Date within 24 hours (${reportA.incidentDate} vs ${reportB.incidentDate})`);
      }
    }
  } else {
    // If one is missing incidentDate, check dateReported or dateCreated
    const dateRepA = reportA.dateReported?.split('T')[0] || reportA.dateCreated?.split('T')[0];
    const dateRepB = reportB.dateReported?.split('T')[0] || reportB.dateCreated?.split('T')[0];
    if (dateRepA && dateRepB && dateRepA === dateRepB) {
      dateMatch = true;
      reasons.push(`Same Date Reported: ${dateRepA}`);
    }
  }

  if (!dateMatch) {
    return { isDuplicate: false, score: 0, reasons: ['Incident dates do not match'] };
  }

  // 3. Incident Time Check (if provided, within 3 hours / 180 mins)
  const minA = parseTimeToMinutes(reportA.incidentTime);
  const minB = parseTimeToMinutes(reportB.incidentTime);
  let timeScore = 0.5; // neutral if missing
  if (minA !== null && minB !== null) {
    const diffMins = Math.abs(minA - minB);
    if (diffMins <= 60) {
      timeScore = 1.0;
      reasons.push(`Incident times within 1 hour (${reportA.incidentTime} vs ${reportB.incidentTime})`);
    } else if (diffMins <= 180) {
      timeScore = 0.75;
      reasons.push(`Incident times within 3 hours (${reportA.incidentTime} vs ${reportB.incidentTime})`);
    } else {
      timeScore = 0.1;
    }
  }

  // 4. Sitio / Specific Landmark Check
  const sitioA = normalizeText(reportA.sitio);
  const sitioB = normalizeText(reportB.sitio);
  let sitioMatch = false;
  if (sitioA && sitioB && (sitioA === sitioB || sitioA.includes(sitioB) || sitioB.includes(sitioA))) {
    sitioMatch = true;
    reasons.push(`Matching Sitio: "${reportA.sitio || reportB.sitio}"`);
  } else if (sitioA && locB.includes(sitioA)) {
    sitioMatch = true;
    reasons.push(`Location mentions Sitio "${reportA.sitio}"`);
  } else if (sitioB && locA.includes(sitioB)) {
    sitioMatch = true;
    reasons.push(`Location mentions Sitio "${reportB.sitio}"`);
  }

  // 5. Category Compatibility
  const catA = normalizeText(reportA.category);
  const catB = normalizeText(reportB.category);
  const isVehicular = (cat: string) =>
    cat.includes('motor') || cat.includes('traffic') || cat.includes('accident') ||
    cat.includes('collision') || cat.includes('vehicle') || cat.includes('crash');

  let categoryMatch = false;
  if (catA && catB && catA === catB) {
    categoryMatch = true;
    reasons.push(`Exact Category Match: "${reportA.category}"`);
  } else if (isVehicular(catA) && isVehicular(catB)) {
    categoryMatch = true;
    reasons.push(`Compatible Vehicular Incident categories`);
  }

  // 6. Text & Semantic Content Similarity (Title + Narrative + Location)
  const textContentA = `${reportA.title || ''} ${reportA.initialNarrative || ''} ${reportA.description || ''} ${reportA.specificLocation || ''}`;
  const textContentB = `${reportB.title || ''} ${reportB.initialNarrative || ''} ${reportB.description || ''} ${reportB.specificLocation || ''}`;

  const tokensA = extractNormalizedTokens(textContentA);
  const tokensB = extractNormalizedTokens(textContentB);
  const tokenSim = calculateTokenSimilarity(tokensA, tokensB);

  const titleDice = calculateDiceCoefficient(reportA.title || '', reportB.title || '');

  // Substring inclusion check (e.g. "Banggaan sa Centro" is inside "Nagkabanggaan ng motor sa Sitio Centro Roxas")
  const normTitleA = normalizeText(reportA.title);
  const normTitleB = normalizeText(reportB.title);
  const hasSubphrase = Boolean(
    (normTitleA.length > 8 && normTitleB.includes(normTitleA)) ||
    (normTitleB.length > 8 && normTitleA.includes(normTitleB))
  );

  // 7. Same Reporter submission (e.g. double-click or re-submission by same user)
  const sameReporter = Boolean(
    (reportA.residentReporterId && reportB.residentReporterId && reportA.residentReporterId === reportB.residentReporterId) ||
    (reportA.reporterName && reportB.reporterName && normalizeText(reportA.reporterName) === normalizeText(reportB.reporterName))
  );
  if (sameReporter) {
    reasons.push('Submitted by the same reporter');
  }

  // 8. Overall Confidence Score Calculation
  // Weighted components:
  // - Token / Keyword similarity (weight 0.40)
  // - Title Fuzzy Dice (weight 0.25)
  // - Category match (weight 0.15)
  // - Sitio / Location landmark match (weight 0.20)
  let baseScore = (tokenSim * 0.40) + (titleDice * 0.25);
  if (categoryMatch) baseScore += 0.15;
  if (sitioMatch) baseScore += 0.20;
  if (hasSubphrase) baseScore += 0.15;
  if (sameReporter) baseScore += 0.15;
  if (timeScore >= 0.75) baseScore += 0.10;

  const finalScore = Math.min(1.0, Math.max(0.0, baseScore));

  // Duplication determination:
  // High similarity (finalScore >= 0.55 with same barangay & date)
  // Or high token similarity (tokenSim >= 0.45)
  // Or title fuzzy match >= 0.65
  // Or same reporter with moderate match
  const isDuplicate =
    (finalScore >= 0.52 && (categoryMatch || sitioMatch || tokenSim >= 0.35)) ||
    (tokenSim >= 0.50) ||
    (titleDice >= 0.65) ||
    (hasSubphrase && (categoryMatch || sitioMatch)) ||
    (sameReporter && finalScore >= 0.40);

  if (isDuplicate) {
    reasons.push(`High Semantic Overlap: ${Math.round(finalScore * 100)}% similarity`);
  }

  return {
    isDuplicate,
    score: Math.round(finalScore * 100) / 100,
    reasons,
    matchedPrimaryId: reportA.id,
    matchedSecondaryId: reportB.id
  };
}

/**
 * Searches a list of existing cases for a duplicate of the incoming report.
 */
export function findDuplicateInCases(
  incomingReport: Partial<Case>,
  existingCases: Case[]
): { matchedCase: Case; checkResult: DuplicateCheckResult } | null {
  for (const existing of existingCases) {
    if (!existing || existing.id === incomingReport.id) continue;
    // Skip historical resolved / closed seed cases
    if (existing.status === 'Resolved' || existing.status === 'Closed' as any) continue;

    const result = evaluateDuplicateReports(existing, incomingReport);
    if (result.isDuplicate) {
      return {
        matchedCase: existing,
        checkResult: result
      };
    }
  }
  return null;
}

/**
 * Merges duplicate report data into the primary case:
 * - Appends unique photos
 * - Adds duplicate's reporter as witness/secondary complainant
 * - Logs timeline event for audit & dispatch clarity
 * - Returns updated primary case
 */
export function mergeDuplicateIntoPrimary(
  primaryCase: Case,
  duplicateReport: Partial<Case>
): Case {
  const now = new Date().toISOString();

  // 1. Merge Images
  const existingImages = new Set(primaryCase.imageUrls || []);
  const mergedImages = [...(primaryCase.imageUrls || [])];
  (duplicateReport.imageUrls || []).forEach((url) => {
    if (url && !existingImages.has(url)) {
      existingImages.add(url);
      mergedImages.push(url);
    }
  });

  // 2. Merge Persons (Complainants / Witnesses)
  const existingPersonNames = new Set(
    (primaryCase.personsInvolved || []).map((p) => normalizeText(p.name))
  );

  const additionalWitnesses: PersonInvolved[] = [...(primaryCase.witnesses || [])];
  const additionalPersons: PersonInvolved[] = [...(primaryCase.personsInvolved || [])];

  if (duplicateReport.reporterName && !existingPersonNames.has(normalizeText(duplicateReport.reporterName))) {
    const secondaryWitness: PersonInvolved = {
      id: `P-DUP-${Date.now()}`,
      name: duplicateReport.reporterName,
      role: 'Witness',
      barangay: duplicateReport.barangay || primaryCase.barangay,
      address: `Consolidated Reporter (${duplicateReport.originatingAgency || 'Citizen Report'})`
    };
    additionalWitnesses.push(secondaryWitness);
    additionalPersons.push(secondaryWitness);
  }

  // 3. Add Deduplication Timeline Event
  const duplicateIdStr = duplicateReport.id ? `Docket #${duplicateReport.id}` : 'Incoming Duplicate Report';
  const duplicateTitleStr = duplicateReport.title || 'Similar Incident Report';
  const duplicateReporterStr = duplicateReport.reporterName || 'Citizen Resident';

  const dedupEvent: TimelineEvent = {
    id: `TL-DEDUP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    caseId: primaryCase.id,
    title: 'Duplicate Report Auto-Consolidated',
    description: `System detected duplicate report (${duplicateIdStr}: "${duplicateTitleStr}") submitted by ${duplicateReporterStr} with slight wording variations. Consolidated into this primary record to maintain a single unified incident report and prevent duplicate emergency dispatch.`,
    stage: 'Initial Assessment',
    actorName: 'B-CONNECT Auto-Deduplication Engine',
    actorRole: 'System Automation',
    actorAgency: 'MDRRMO & LGU Command',
    timestamp: now
  };

  const updatedTimeline = [...(primaryCase.timeline || []), dedupEvent];

  // 4. Build consolidated case
  const mergedReportIds = (primaryCase as any).mergedReportIds || [];
  if (duplicateReport.id && !mergedReportIds.includes(duplicateReport.id)) {
    mergedReportIds.push(duplicateReport.id);
  }

  return {
    ...primaryCase,
    imageUrls: mergedImages,
    witnesses: additionalWitnesses,
    personsInvolved: additionalPersons,
    timeline: updatedTimeline,
    dateLastUpdated: now,
    // Deduplication metadata
    ...( {
      isDeduplicated: true,
      duplicateMergedCount: ((primaryCase as any).duplicateMergedCount || 0) + 1,
      mergedReportIds
    } as any)
  };
}

/**
 * Scans an array of cases and deduplicates pairs:
 * - Detects duplicate pairs
 * - Retains the primary (earlier / existing) case
 * - Flags the secondary duplicate for deletion
 */
export function deduplicateCaseList(allCases: Case[]): {
  cleanedCases: Case[];
  removedDuplicates: { duplicate: Case; primary: Case; result: DuplicateCheckResult }[];
} {
  const cleaned: Case[] = [];
  const removedDuplicates: { duplicate: Case; primary: Case; result: DuplicateCheckResult }[] = [];
  const duplicateIds = new Set<string>();

  // Sort chronologically (earliest first so earliest becomes primary)
  const sorted = [...allCases].sort((a, b) => {
    const timeA = new Date(a.dateCreated || a.dateReported || 0).getTime();
    const timeB = new Date(b.dateCreated || b.dateReported || 0).getTime();
    return timeA - timeB;
  });

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    if (duplicateIds.has(current.id)) continue;

    // Do not deduplicate seed cases against each other (strictly BC-2026-001 to BC-2026-008)
    const isSeed = Boolean(current.id && /^BC-2026-00[1-8]$/.test(current.id));

    let matchedPrimary: Case | null = null;
    let matchRes: DuplicateCheckResult | null = null;

    if (!isSeed) {
      for (const existing of cleaned) {
        const evalRes = evaluateDuplicateReports(existing, current);
        if (evalRes.isDuplicate) {
          matchedPrimary = existing;
          matchRes = evalRes;
          break;
        }
      }
    }

    if (matchedPrimary && matchRes) {
      // Current is a duplicate!
      duplicateIds.add(current.id);
      removedDuplicates.push({
        duplicate: current,
        primary: matchedPrimary,
        result: matchRes
      });
      // Merge into primary in cleaned array
      const idx = cleaned.findIndex((c) => c.id === matchedPrimary!.id);
      if (idx !== -1) {
        cleaned[idx] = mergeDuplicateIntoPrimary(cleaned[idx], current);
      }
    } else {
      cleaned.push(current);
    }
  }

  // Sort back to newest first for UI display
  cleaned.sort((a, b) =>
    new Date(b.dateCreated || b.dateReported || 0).getTime() -
    new Date(a.dateCreated || a.dateReported || 0).getTime()
  );

  return { cleanedCases: cleaned, removedDuplicates };
}

/**
 * Checks if a case has been deduplicated / consolidated with another report
 */
export function isConsolidatedCase(c: Case): boolean {
  if (!c) return false;
  return Boolean(
    c.isDeduplicated ||
    (c.duplicateMergedCount && c.duplicateMergedCount > 0) ||
    c.timeline?.some((t) => t.id?.startsWith('TL-DEDUP') || t.title?.includes('Auto-Consolidated') || t.title?.includes('Duplicate Report'))
  );
}
