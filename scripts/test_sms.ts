import {
  buildAlertSmsMessage,
  getRegisteredMdrrmoResponders,
  startSmsResendInterval,
  stopSmsResendInterval,
  getActiveSmsResendStatus
} from '../src/utils/smsService';
import { playAccidentAlarmSound, isAlarmSoundPlaying } from '../src/utils/alarmAudio';
import { User } from '../src/types';

console.log('--- TEST 1: SMS Format Verification ---');
const testPayload = {
  id: 'BC-2026-001',
  title: 'Vehicular Accident at Riverside Crossing',
  incidentType: 'Motorcycle vs Tricycle Collision',
  barangay: 'San Aquilino',
  sitio: 'Sitio Riverside',
  incidentDate: '2026-09-28',
  incidentTime: '14:30',
  reporterName: 'Juan Dela Cruz'
};

const formattedSMS = buildAlertSmsMessage(testPayload);
console.log('Result SMS:\n  "' + formattedSMS + '"');

const expectedSMS = 'ALERT: Motorcycle vs Tricycle Collision reported at San Aquilino / Sitio Riverside on 2026-09-28 14:30 by Juan Dela Cruz. Please verify and respond.';
if (formattedSMS === expectedSMS) {
  console.log('✅ TEST 1 PASSED: SMS text strictly matches required specification format.');
} else {
  console.error('❌ TEST 1 FAILED:\n  Expected: ' + expectedSMS + '\n  Got:      ' + formattedSMS);
  process.exit(1);
}

console.log('\n--- TEST 2: MDRRMO Institutional Account Target Verification ---');
const sampleUsers: User[] = [
  {
    id: 'USR-MDRRMO-01',
    name: 'Engr. Nelson V. Castro',
    role: 'MDRRMO_ADMIN',
    agencyType: 'MDRRMO',
    agencyName: 'MDRRMO Roxas',
    position: 'MDRRMO Operations Head & Emergency Dispatcher',
    email: 'mdrrmo.head@roxas.gov.ph',
    phone: '0919-555-8821'
  },
  {
    id: 'USR-MDRRMO-02',
    name: 'Officer Randy Alcantara',
    role: 'MDRRMO_OFFICER',
    agencyType: 'MDRRMO',
    agencyName: 'MDRRMO Roxas',
    position: 'Emergency Medical Responder (EMR Lead)',
    email: 'mdrrmo.emr@roxas.gov.ph',
    phone: '0917-888-2628'
  },
  {
    id: 'USR-RES-01',
    name: 'Juan Dela Cruz',
    role: 'RESIDENT',
    agencyType: 'RESIDENT',
    agencyName: 'Barangay San Aquilino',
    position: 'Verified Resident Citizen',
    email: 'juan.delacruz@gmail.com',
    phone: '0917-123-4567'
  }
];

const recipients = getRegisteredMdrrmoResponders(sampleUsers);
console.log(`Found ${recipients.length} target recipient(s) for SMS dispatch:`);
recipients.forEach((r, idx) => console.log(`  [${idx + 1}] ${r.name} (${r.role}) - ${r.phone}`));

const isMdrrmoAccount = recipients.length === 1 && recipients[0].phone === '0919-555-8821' && recipients[0].name.includes('MDRRMO');
const hasIndividualPersonnel = recipients.some(r => r.name.includes('Nelson') || r.name.includes('Randy') || r.name.includes('Juan'));

if (isMdrrmoAccount && !hasIndividualPersonnel) {
  console.log('✅ TEST 2 PASSED: SMS targets MDRRMO account directly (0919-555-8821) without individual personnel involvement.');
} else {
  console.error('❌ TEST 2 FAILED: SMS recipient is not restricted to MDRRMO account.');
  process.exit(1);
}

console.log('\n--- TEST 3: Recurring Interval Resend & Halt Logic ---');
const testCaseId = 'TEST-CASE-777';
startSmsResendInterval({ id: testCaseId, title: 'Unacknowledged Crash' }, sampleUsers, 10000);

const statusBefore = getActiveSmsResendStatus(testCaseId);
console.log('Resend Tracker Active Before Halt:', statusBefore.isActive);

stopSmsResendInterval(testCaseId);
const statusAfter = getActiveSmsResendStatus(testCaseId);
console.log('Resend Tracker Active After Halt (Marked Seen/Responded):', statusAfter.isActive);

if (statusBefore.isActive === true && statusAfter.isActive === false) {
  console.log('✅ TEST 3 PASSED: Interval resends start for unacknowledged incidents and halt when marked Seen/Responded.');
} else {
  console.error('❌ TEST 3 FAILED: Interval resend lifecycle failed.');
  process.exit(1);
}

console.log('\n--- TEST 4: Silence Audio Verification ---');
playAccidentAlarmSound();
const isPlaying = isAlarmSoundPlaying();
console.log('Is Alarm Sound Playing after trigger:', isPlaying);

if (!isPlaying) {
  console.log('✅ TEST 4 PASSED: No audible alert or alarm is triggered (SMS text only).');
} else {
  console.error('❌ TEST 4 FAILED: Audio alarm was triggered.');
  process.exit(1);
}

console.log('\n🎉 ALL SPECIFICATION TESTS PASSED SUCCESSFULLY!');
