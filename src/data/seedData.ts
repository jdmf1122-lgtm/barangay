import { Case, User, AuditLog, NotificationItem } from '../types';

export const SEED_USERS: User[] = [
  // --- SINGLE PILOT MDRRMO OPERATIONS ACCOUNT ---
  {
    id: 'USR-MDRRMO-01',
    name: 'Engr. Nelson V. Castro',
    role: 'MDRRMO_ADMIN',
    agencyType: 'MDRRMO',
    agencyName: 'MDRRMO Roxas Emergency & Rescue Operations',
    position: 'MDRRMO Operations Head & Emergency Dispatcher',
    badgeOrIdNumber: 'MDRRMO-ROX-2026',
    email: 'mdrrmo@roxas.gov.ph',
    phone: '0919-555-8821'
  },
  {
    id: 'USR-MDRRMO-02',
    name: 'Officer Randy Alcantara',
    role: 'MDRRMO_OFFICER',
    agencyType: 'MDRRMO',
    agencyName: 'MDRRMO Roxas Quick Response & Rescue Team',
    position: 'Emergency Medical Responder (EMR Lead)',
    badgeOrIdNumber: 'MDRRMO-EMR-02',
    email: 'responder.mdrrmo@roxas.gov.ph',
    phone: '0917-888-2628'
  },

  // --- MUNICIPAL & INTER-AGENCY OVERSIGHT ACCOUNTS ---
  {
    id: 'USR-LGU-01',
    name: 'Atty. Clarissa Reyes',
    role: 'LGU_ADMINISTRATOR',
    agencyType: 'LGU',
    agencyName: 'Municipal Government of Roxas (LGU Executive & Traffic Oversight)',
    position: 'Municipal Administrator & Traffic Safety Director',
    badgeOrIdNumber: 'LGU-ROX-ADM-01',
    email: 'admin.lgu@roxas.gov.ph'
  },
  {
    id: 'USR-SYS-01',
    name: 'Engr. Mark Lawrence Navarro',
    role: 'SYSTEM_ADMIN',
    agencyType: 'ADMIN',
    agencyName: 'System Administration Master Node',
    position: 'Master Governance Node Administrator',
    badgeOrIdNumber: 'SYS-ADM-01',
    email: 'admin@bconnect.gov.ph'
  },
  // --- VERIFIED RESIDENT CITIZEN ACCOUNT ---
  {
    id: 'USR-RES-01',
    name: 'Maria Elena Santos',
    role: 'RESIDENT',
    agencyType: 'RESIDENT',
    agencyName: 'Barangay San Aquilino Resident',
    barangay: 'San Aquilino',
    position: 'Verified Resident Citizen',
    badgeOrIdNumber: 'RES-SAQ-0892',
    email: 'maria.santos@gmail.com',
    phone: '0917-555-2144',
    address: 'Purok 2, San Aquilino, Roxas, Oriental Mindoro'
  }
];

export const SEED_CASES: Case[] = [
  {
    id: 'BC-2026-001',
    incidentId: 'INC-2026-001',
    complaintId: 'CMP-2026-001',
    title: 'Motorcycle vs Tricycle Collision at Morente Avenue Crossing',
    category: 'Motorcycle vs Tricycle Collision',
    description: 'Intersection collision between a Honda Click 125 motorcycle and a Bajaj passenger tricycle along the corner of Morente Avenue and the Strong Republic Nautical Highway.',
    initialNarrative: 'Motorcycle rider Carlos Dalisay was traveling northbound along Morente Avenue when passenger tricycle (Plate # 4821-TG) executed a sudden left turn toward Purok 3. Both vehicles collided at low-to-moderate speed, causing the motorcycle to slide into the sidewalk curb and damaging the tricycle front fender.',
    currentNarrativeSummary: 'Barangay San Aquilino Traffic Responders and Tanod pacified the scene, cleared debris, and assisted both parties. Tricycle operator agreed to shoulder 70% of motorcycle front-fork repairs (₱3,500) through amicable settlement signed before the Lupon.',
    dateReported: '2026-02-10T08:30:00.000Z',
    incidentDate: '2026-02-09',
    barangay: 'San Aquilino',
    specificLocation: 'Corner Morente Ave & Strong Republic Nautical Highway, Brgy. San Aquilino, Roxas',
    
    complainants: [
      { id: 'P-101', name: 'Carlos Dalisay (Motorcycle Rider)', role: 'Complainant', contact: '0917-889-1234', address: 'Purok 2', barangay: 'San Aquilino' }
    ],
    respondents: [
      { id: 'P-102', name: 'Danilo Hernandez (Tricycle Driver)', role: 'Respondent', contact: '0920-554-9876', address: 'Purok 3', barangay: 'San Aquilino' }
    ],
    witnesses: [
      { id: 'P-103', name: 'Tanod Pedro Alvarez', role: 'Witness', contact: '0918-444-2211', address: 'Barangay Hall', barangay: 'San Aquilino' }
    ],
    personsInvolved: [
      { id: 'P-101', name: 'Carlos Dalisay', role: 'Complainant', barangay: 'San Aquilino' },
      { id: 'P-102', name: 'Danilo Hernandez', role: 'Respondent', barangay: 'San Aquilino' }
    ],
    
    isInvolvingOfficial: false,
    officialInvolvedType: 'None',
    
    originatingAgency: 'Barangay San Aquilino Traffic Safety Desk',
    currentHandlingAgency: 'Barangay San Aquilino Traffic Safety Desk',
    assignedPersonnel: 'Hon. Elena V. Macalalad (Punong Barangay)',
    priority: 'Medium',
    status: 'Resolved',

    isAccidentEmergency: false,
    accidentVehicleDetails: 'Honda Click 125 (Plate # 8912-MC) vs Bajaj RE Tricycle (Plate # 4821-TG)',
    accidentCasualties: 'Minor abrasions (Driver Carlos Dalisay treated on-site by Tanod First Aid kit)',
    collisionImpactType: 'Intersection Collision',
    roadSurfaceCondition: 'Dry & Clear',
    weatherCondition: 'Clear & Sunny',
    injuriesCount: 1,
    casualtiesCount: 0,
    isHitAndRun: false,
    vehiclesInvolved: [
      {
        id: 'VEH-001',
        vehicleType: 'Motorcycle',
        makeModel: 'Honda Click 125i (Matte Black)',
        plateNumberOrConduction: '8912-MC',
        driverName: 'Carlos Dalisay',
        driverLicenseNo: 'D02-18-094821',
        driverCondition: 'Minor Scratches/Bruises',
        damageSeverity: 'Moderate Functional Damage',
        helmetOrSeatbeltWorn: true,
        insuranceCoverage: true
      },
      {
        id: 'VEH-002',
        vehicleType: 'Tricycle',
        makeModel: 'Bajaj RE 4S (Blue/Yellow TODA)',
        plateNumberOrConduction: '4821-TG',
        driverName: 'Danilo Hernandez',
        driverLicenseNo: 'D01-15-081290',
        driverCondition: 'Uninjured',
        damageSeverity: 'Minor Dent/Scratch',
        helmetOrSeatbeltWorn: false,
        insuranceCoverage: true
      }
    ],
    statusHistory: [
      { id: 'SH-001', previousStatus: 'Unresolved', newStatus: 'Unresolved', reason: 'Assigned to Barangay Traffic Committee', changedBy: 'Hon. Elena V. Macalalad', changedByRole: 'Punong Barangay', agency: 'Barangay San Aquilino Traffic Safety Desk', timestamp: '2026-02-10T09:00:00.000Z' },
      { id: 'SH-002', previousStatus: 'Unresolved', newStatus: 'Unresolved', reason: 'Scheduled conciliation with vehicle owners', changedBy: 'Hon. Elena V. Macalalad', changedByRole: 'Punong Barangay', agency: 'Barangay San Aquilino Traffic Safety Desk', timestamp: '2026-02-12T10:00:00.000Z' },
      { id: 'SH-003', previousStatus: 'Unresolved', newStatus: 'Resolved', reason: 'Amicable settlement executed with repair compensation', changedBy: 'Hon. Elena V. Macalalad', changedByRole: 'Punong Barangay', agency: 'Barangay San Aquilino Traffic Safety Desk', timestamp: '2026-02-18T14:00:00.000Z' }
    ],
    timeline: [
      { id: 'TL-001', caseId: 'BC-2026-001', title: 'Accident Reported', description: 'Motorcycle vs tricycle collision logged at San Aquilino crossing.', stage: 'Report Filed', actorName: 'Carlos Dalisay', actorRole: 'Complainant', actorAgency: 'Barangay San Aquilino Traffic Safety Desk', timestamp: '2026-02-10T08:30:00.000Z' },
      { id: 'TL-002', caseId: 'BC-2026-001', title: 'On-Site Inspection & Clearing', description: 'Barangay Tanod documented skid marks, road position, and cleared broken glass.', stage: 'Barangay Action / Lupon', actorName: 'Tanod Pedro Alvarez', actorRole: 'Witness / Tanod', actorAgency: 'Barangay San Aquilino Traffic Safety Desk', timestamp: '2026-02-10T09:15:00.000Z' },
      { id: 'TL-003', caseId: 'BC-2026-001', title: 'Traffic Settlement Hearing', description: 'Conciliation hearing held at Barangay Session Hall with TODA president present.', stage: 'Barangay Action / Lupon', actorName: 'Hon. Elena V. Macalalad', actorRole: 'Punong Barangay', actorAgency: 'Barangay San Aquilino Traffic Safety Desk', timestamp: '2026-02-15T10:00:00.000Z' },
      { id: 'TL-004', caseId: 'BC-2026-001', title: 'Amicable Settlement Signed', description: 'Parties executed KP Form No. 16 with agreed repair terms.', stage: 'Resolution', actorName: 'Hon. Elena V. Macalalad', actorRole: 'Punong Barangay', actorAgency: 'Barangay San Aquilino Traffic Safety Desk', timestamp: '2026-02-18T14:00:00.000Z' }
    ],
    dateCreated: '2026-02-10T08:30:00.000Z',
    dateLastUpdated: '2026-02-18T14:30:00.000Z',
    createdBy: 'Hon. Elena V. Macalalad'
  },
  {
    id: 'BC-2026-003',
    incidentId: 'INC-2026-003',
    complaintId: 'CMP-2026-003',
    title: 'Head-On Motorcycle vs Motorcycle Crash along Strong Republic Nautical Highway',
    category: 'Motorcycle vs Motorcycle Collision',
    description: 'High-speed head-on collision between two underbone motorcycles along a blind curve segment of the Nautical Highway in Barangay San Miguel during rainy weather.',
    initialNarrative: 'Rider Michael Ramos on a Yamaha Sniper 150 was negotiating the southbound curve when rider Gary Cruz on a Suzuki Raider 150 overtook an unidentified vehicle on a solid double-yellow line, resulting in a direct head-on collision. Both riders were thrown several meters onto the shoulder.',
    currentNarrativeSummary: 'MDRRMO Rescue Ambulance Unit 02 dispatched immediately. Both riders suffered multiple fractures and deep lacerations. Emergency medical evacuation conducted to Oriental Mindoro Southern District Hospital. Case is under active investigation for reckless imprudence.',
    dateReported: '2026-03-12T23:45:00.000Z',
    incidentDate: '2026-03-12',
    barangay: 'San Miguel',
    specificLocation: 'Kilometer Post 128, Strong Republic Nautical Highway, Brgy. San Miguel, Roxas',
    
    complainants: [
      { id: 'P-301', name: 'Michael Ramos (Injured Rider 1)', role: 'Victim', contact: '0917-223-8899', address: 'Purok 4', barangay: 'San Miguel' },
      { id: 'P-302', name: 'Elena Ramos (Spouse)', role: 'Complainant', contact: '0917-223-8890', address: 'Purok 4', barangay: 'San Miguel' }
    ],
    respondents: [
      { id: 'P-303', name: 'Gary Cruz (Rider 2 - Counterflow)', role: 'Respondent', contact: '0948-333-1122', address: 'Purok 5', barangay: 'Odiong' }
    ],
    witnesses: [
      { id: 'P-305', name: 'Renato Dalisay (Gasoline Station Attendant)', role: 'Witness', contact: '0908-112-9988', address: 'San Miguel Highway', barangay: 'San Miguel' }
    ],
    personsInvolved: [
      { id: 'P-301', name: 'Michael Ramos', role: 'Victim', barangay: 'San Miguel' },
      { id: 'P-303', name: 'Gary Cruz', role: 'Respondent', barangay: 'Odiong' }
    ],
    
    isInvolvingOfficial: false,
    officialInvolvedType: 'None',
    
    originatingAgency: 'Barangay San Miguel Traffic Safety Unit',
    currentHandlingAgency: 'Municipal Government of Roxas (LGU Executive & Traffic Oversight)',
    assignedPersonnel: 'MDRRMO Traffic Crash Investigation Unit',
    assignedPersonnelContact: '0928-555-7890 (MDRRMO Roxas)',
    priority: 'Urgent',
    status: 'Unresolved',

    isAccidentEmergency: true,
    accidentVehicleDetails: 'Yamaha Sniper 150 (Plate # 9921-YM) vs Suzuki Raider 150 (Plate # 3144-SZ)',
    accidentCasualties: '2 Critical Injuries (Both riders hospitalized with lower extremity fractures)',
    collisionImpactType: 'Head-On Collision',
    roadSurfaceCondition: 'Wet / Slippery',
    weatherCondition: 'Heavy Rain / Storm',
    injuriesCount: 2,
    casualtiesCount: 0,
    isHitAndRun: false,
    respondingAmbulanceUnit: 'MDRRMO Ambulance Alpha-2',
    hospitalTransported: 'Oriental Mindoro Southern District Hospital (Bongabong/Roxas)',
    vehiclesInvolved: [
      {
        id: 'VEH-005',
        vehicleType: 'Motorcycle',
        makeModel: 'Yamaha Sniper 150 (Blue/Silver)',
        plateNumberOrConduction: '9921-YM',
        driverName: 'Michael Ramos',
        driverLicenseNo: 'D03-17-089912',
        driverCondition: 'Hospitalized',
        damageSeverity: 'Severe / Total Wreck',
        helmetOrSeatbeltWorn: true,
        insuranceCoverage: true
      },
      {
        id: 'VEH-006',
        vehicleType: 'Motorcycle',
        makeModel: 'Suzuki Raider R150 (Red/Black)',
        plateNumberOrConduction: '3144-SZ',
        driverName: 'Gary Cruz',
        driverLicenseNo: 'D01-19-011288',
        driverCondition: 'Hospitalized',
        damageSeverity: 'Severe / Total Wreck',
        helmetOrSeatbeltWorn: false,
        insuranceCoverage: false
      }
    ],
    statusHistory: [
      { id: 'SH-007', previousStatus: 'Unresolved', newStatus: 'Unresolved', reason: 'High-speed head-on collision requiring hospital tracking and technical crash analysis', changedBy: 'Atty. Clarissa Reyes', changedByRole: 'LGU Administrator', agency: 'Municipal Government of Roxas', timestamp: '2026-03-13T01:30:00.000Z' }
    ],
    timeline: [
      { id: 'TL-010', caseId: 'BC-2026-003', title: 'Severe Collision Occurred', description: 'Head-on crash reported on Nautical Highway. Emergency alarm broadcasted.', stage: 'Report Filed', actorName: 'Renato Dalisay', actorRole: 'Witness', actorAgency: 'Barangay San Miguel Traffic Safety Unit', timestamp: '2026-03-12T23:45:00.000Z' },
      { id: 'TL-011', caseId: 'BC-2026-003', title: 'MDRRMO Ambulance Dispatch', description: 'Rescue unit transported critical victims to Southern District Hospital.', stage: 'LGU Action', actorName: 'MDRRMO Alpha-2', actorRole: 'Responder', actorAgency: 'Municipal Government of Roxas', timestamp: '2026-03-13T00:10:00.000Z' },
      { id: 'TL-012', caseId: 'BC-2026-003', title: 'CCTV Footage Impounded', description: 'Gas station security camera clip showing counterflow maneuver secured.', stage: 'LGU Action', actorName: 'Traffic Safety Team', actorRole: 'Investigator', actorAgency: 'Municipal Government of Roxas', timestamp: '2026-03-13T09:00:00.000Z' }
    ],
    dateCreated: '2026-03-13T01:30:00.000Z',
    dateLastUpdated: '2026-03-15T14:00:00.000Z',
    createdBy: 'MDRRMO Emergency Desk'
  },
  {
    id: 'BC-2026-004',
    incidentId: 'INC-2026-004',
    complaintId: 'CMP-2026-004',
    title: 'Gravel Dump Truck vs Passenger Multicab Rear-End Crash',
    category: 'Truck / Bus / Heavy Vehicle Crash',
    description: '10-wheeler gravel dump truck experienced brake fade on a slope approach to Bagumbayan Bridge, rear-ending a stopped passenger multicab.',
    initialNarrative: 'An Isuzu Giga dump truck carrying river sand failed to stop in time at the bridge construction traffic signal, ramming into the rear of a Suzuki Carry multicab carrying 6 passengers. The multicab was pushed forward into the guardrail.',
    currentNarrativeSummary: 'Three passengers sustained whiplash and contusions. Commercial trucking operator dispatch office has engaged with Municipal Traffic Desk and victims regarding vehicle replacement and medical bill coverage.',
    dateReported: '2026-02-22T07:45:00.000Z',
    incidentDate: '2026-02-21',
    barangay: 'Bagumbayan',
    specificLocation: 'Bridge Approach, Purok 4, Barangay Bagumbayan, Roxas, Oriental Mindoro',
    
    complainants: [
      { id: 'P-401', name: 'Rolando Dimaano (Multicab Driver)', role: 'Complainant', contact: '0919-667-2233', address: 'Purok 4', barangay: 'Bagumbayan' }
    ],
    respondents: [
      { id: 'P-402', name: 'Antonio Go (Truck Fleet Owner) & Driver Manuel Cruz', role: 'Respondent', contact: '0922-441-8899', address: 'Commercial Strip', barangay: 'Bagumbayan' }
    ],
    witnesses: [
      { id: 'P-403', name: 'Jaime Cruz (Bridge Flagman)', role: 'Witness', contact: '0930-112-7788', address: 'Purok 4', barangay: 'Bagumbayan' }
    ],
    personsInvolved: [
      { id: 'P-401', name: 'Rolando Dimaano', role: 'Complainant', barangay: 'Bagumbayan' },
      { id: 'P-402', name: 'Antonio Go', role: 'Respondent', barangay: 'Bagumbayan' }
    ],
    
    isInvolvingOfficial: false,
    officialInvolvedType: 'None',
    
    originatingAgency: 'Barangay Bagumbayan Traffic Unit',
    currentHandlingAgency: 'Municipal Government of Roxas (LGU Executive & Traffic Oversight)',
    assignedPersonnel: 'Engr. Dennis Tan (Municipal Traffic & Transport Officer)',
    priority: 'High',
    status: 'Resolved',

    isAccidentEmergency: false,
    accidentVehicleDetails: 'Isuzu Giga 10-Wheeler Dump Truck (Plate # NAK-4412) vs Suzuki Carry Multicab (Plate # 7719-PUV)',
    accidentCasualties: '3 Minor-to-Moderate Injuries (Whiplash and cuts, all discharged after outpatient treatment)',
    collisionImpactType: 'Rear-End Impact',
    roadSurfaceCondition: 'Potholes / Under Construction',
    weatherCondition: 'Clear & Sunny',
    injuriesCount: 3,
    casualtiesCount: 0,
    isHitAndRun: false,
    vehiclesInvolved: [
      {
        id: 'VEH-007',
        vehicleType: 'Truck (Dump/Cargo)',
        makeModel: 'Isuzu Giga 10-Wheeler Dump Truck (Yellow)',
        plateNumberOrConduction: 'NAK-4412',
        driverName: 'Manuel Cruz',
        driverLicenseNo: 'D01-11-094120',
        driverCondition: 'Uninjured',
        damageSeverity: 'Minor Dent/Scratch',
        helmetOrSeatbeltWorn: true,
        insuranceCoverage: true
      },
      {
        id: 'VEH-008',
        vehicleType: 'Bus / PUV',
        makeModel: 'Suzuki Carry Multicab 12-Seater (White/Green)',
        plateNumberOrConduction: '7719-PUV',
        driverName: 'Rolando Dimaano',
        driverLicenseNo: 'D02-14-067812',
        driverCondition: 'Minor Scratches/Bruises',
        damageSeverity: 'Severe / Total Wreck',
        helmetOrSeatbeltWorn: true,
        insuranceCoverage: true
      }
    ],
    statusHistory: [
      { id: 'SH-009', previousStatus: 'Unresolved', newStatus: 'Unresolved', reason: 'Commercial heavy vehicle liability requiring municipal transport unit adjudication', changedBy: 'PB Bagumbayan', changedByRole: 'Punong Barangay', agency: 'Barangay Bagumbayan Traffic Unit', timestamp: '2026-02-25T09:00:00.000Z' },
      { id: 'SH-010', previousStatus: 'Unresolved', newStatus: 'Resolved', reason: 'Full commercial liability indemnity acknowledged and paid', changedBy: 'Engr. Dennis Tan', changedByRole: 'Municipal Traffic Officer', agency: 'Municipal Government of Roxas', timestamp: '2026-03-05T14:00:00.000Z' }
    ],
    timeline: [
      { id: 'TL-014', caseId: 'BC-2026-004', title: 'Rear-End Crash Logged', description: 'Dump truck struck passenger multicab at Bagumbayan bridge.', stage: 'Report Filed', actorName: 'Rolando Dimaano', actorRole: 'Complainant', actorAgency: 'Barangay Bagumbayan Traffic Unit', timestamp: '2026-02-22T07:45:00.000Z' },
      { id: 'TL-015', caseId: 'BC-2026-004', title: 'Traffic Division Technical Inspection', description: 'Brake line failure confirmed; operator fleet summoned for mediation.', stage: 'LGU Action', actorName: 'Engr. Dennis Tan', actorRole: 'Traffic Officer', actorAgency: 'Municipal Government of Roxas', timestamp: '2026-02-25T09:00:00.000Z' },
      { id: 'TL-016', caseId: 'BC-2026-004', title: 'Indemnity Settlement Signed', description: 'Commercial operator completed medical hospital payments and agreed to repair multicab.', stage: 'Resolution', actorName: 'Engr. Dennis Tan', actorRole: 'Traffic Officer', actorAgency: 'Municipal Government of Roxas', timestamp: '2026-03-05T14:00:00.000Z' }
    ],
    dateCreated: '2026-02-22T07:45:00.000Z',
    dateLastUpdated: '2026-03-05T14:00:00.000Z',
    createdBy: 'Barangay Bagumbayan Traffic Unit'
  },
  {
    id: 'BC-2026-005',
    incidentId: 'INC-2026-005',
    complaintId: 'CMP-2026-005',
    title: 'Single Motorcycle Skid & Canal Rollover due to Road Hazard / Sand Spill',
    category: 'Single-Vehicle Road Skid / Fixed Object Crash',
    description: 'Motorcycle lost traction on loose gravel and sand spill on Sitio Riverside curve, sliding into roadside open irrigation canal.',
    initialNarrative: 'Resident rider Mark Anthony Salazar on a Kawasaki Rouser 200 was traveling at approximately 40 km/h along Sitio Riverside. Due to unsecured gravel left by roadside residential construction, his front wheel slipped, causing a low-side fall into the canal ditch.',
    currentNarrativeSummary: 'Barangay San Aquilino Tanod quick-response team rescued the rider and winched the motorcycle out of the canal. Construction owner ordered to clear all road aggregate immediately.',
    dateReported: '2026-03-10T11:00:00.000Z',
    incidentDate: '2026-03-09',
    barangay: 'San Aquilino',
    specificLocation: 'Sitio Riverside Curve, Barangay San Aquilino, Roxas, Oriental Mindoro',
    
    complainants: [
      { id: 'P-501', name: 'Mark Anthony Salazar (Rider)', role: 'Complainant', contact: '0917-334-9988', address: 'Sitio Riverside', barangay: 'San Aquilino' }
    ],
    respondents: [
      { id: 'P-502', name: 'Felipe Villar (Lot Owner / Contractor)', role: 'Respondent', contact: '0928-119-3344', address: 'Sitio Riverside', barangay: 'San Aquilino' }
    ],
    witnesses: [
      { id: 'P-503', name: 'Rosita Alcantara', role: 'Witness', contact: '0939-887-2211', address: 'Sitio Riverside', barangay: 'San Aquilino' }
    ],
    personsInvolved: [
      { id: 'P-501', name: 'Mark Anthony Salazar', role: 'Complainant', barangay: 'San Aquilino' },
      { id: 'P-502', name: 'Felipe Villar', role: 'Respondent', barangay: 'San Aquilino' }
    ],
    
    isInvolvingOfficial: false,
    officialInvolvedType: 'None',
    
    originatingAgency: 'Barangay San Aquilino Traffic Safety Desk',
    currentHandlingAgency: 'Barangay San Aquilino Traffic Safety Desk',
    assignedPersonnel: 'Hon. Elena V. Macalalad (Punong Barangay)',
    priority: 'Medium',
    status: 'Resolved',

    isAccidentEmergency: false,
    accidentVehicleDetails: 'Kawasaki Rouser NS200 (Plate # 2910-MC)',
    accidentCasualties: 'Minor arm and knee abrasions (Treated at San Aquilino Health Center)',
    collisionImpactType: 'Single Vehicle Skid / Rollover',
    roadSurfaceCondition: 'Gravel / Muddy',
    weatherCondition: 'Clear & Sunny',
    injuriesCount: 1,
    casualtiesCount: 0,
    isHitAndRun: false,
    vehiclesInvolved: [
      {
        id: 'VEH-009',
        vehicleType: 'Motorcycle',
        makeModel: 'Kawasaki Rouser NS200 (Black/Yellow)',
        plateNumberOrConduction: '2910-MC',
        driverName: 'Mark Anthony Salazar',
        driverLicenseNo: 'D02-19-038112',
        driverCondition: 'Minor Scratches/Bruises',
        damageSeverity: 'Minor Dent/Scratch',
        helmetOrSeatbeltWorn: true,
        insuranceCoverage: true
      }
    ],
    statusHistory: [
      { id: 'SH-011', previousStatus: 'Unresolved', newStatus: 'Unresolved', reason: 'Single-vehicle road hazard incident logged', changedBy: 'Hon. Elena V. Macalalad', changedByRole: 'Punong Barangay', agency: 'Barangay San Aquilino Traffic Safety Desk', timestamp: '2026-03-10T11:30:00.000Z' },
      { id: 'SH-012', previousStatus: 'Unresolved', newStatus: 'Resolved', reason: 'Road hazard cleared and motorcycle repair reimbursement made', changedBy: 'Hon. Elena V. Macalalad', changedByRole: 'Punong Barangay', agency: 'Barangay San Aquilino Traffic Safety Desk', timestamp: '2026-03-11T16:00:00.000Z' }
    ],
    timeline: [
      { id: 'TL-017', caseId: 'BC-2026-005', title: 'Single-Vehicle Crash Logged', description: 'Motorcycle slipped on loose sand along Sitio Riverside.', stage: 'Report Filed', actorName: 'Mark Anthony Salazar', actorRole: 'Complainant', actorAgency: 'Barangay San Aquilino Traffic Safety Desk', timestamp: '2026-03-10T11:00:00.000Z' },
      { id: 'TL-018', caseId: 'BC-2026-005', title: 'Road Hazard Removed', description: 'Contractor cleared sand and gravel off asphalt surface.', stage: 'Barangay Action / Lupon', actorName: 'Tanod Patrol Team', actorRole: 'Responder', actorAgency: 'Barangay San Aquilino Traffic Safety Desk', timestamp: '2026-03-11T09:00:00.000Z' },
      { id: 'TL-019', caseId: 'BC-2026-005', title: 'Amicable Settlement Reached', description: 'Parties executed KP Form 16 settlement.', stage: 'Resolution', actorName: 'Hon. Elena V. Macalalad', actorRole: 'Punong Barangay', actorAgency: 'Barangay San Aquilino Traffic Safety Desk', timestamp: '2026-03-11T16:00:00.000Z' }
    ],
    dateCreated: '2026-03-10T11:00:00.000Z',
    dateLastUpdated: '2026-03-11T16:00:00.000Z',
    createdBy: 'Hon. Elena V. Macalalad'
  },
  {
    id: 'BC-2026-006',
    incidentId: 'INC-2026-006',
    complaintId: 'CMP-2026-006',
    title: 'Nighttime Hit-and-Run Incident: Pedestrian Struck by Unregistered Motorcycle',
    category: 'Hit-and-Run Vehicular Crash',
    description: 'Elderly pedestrian struck while crossing designated pedestrian crossing in front of Victoria Public Market by a speeding motorcycle that fled without stopping.',
    initialNarrative: 'At approximately 8:15 PM, 62-year-old resident Victoria Dalisay was crossing along the marked pedestrian lane when a northbound modified underbone motorcycle with no headlight struck her and accelerated away towards Barangay Odiong.',
    currentNarrativeSummary: 'Victim suffered broken left wrist and head contusions. Barangay and Municipal Traffic units extracted municipal CCTV footage showing a black motorcycle with open exhaust pipe. Plate identification and suspect profiling ongoing.',
    dateReported: '2026-03-08T20:30:00.000Z',
    incidentDate: '2026-03-08',
    barangay: 'Victoria',
    specificLocation: 'In front of Victoria Public Market, National Highway, Brgy. Victoria, Roxas',
    
    complainants: [
      { id: 'P-601', name: 'Victoria Dalisay (Victim)', role: 'Victim', contact: '0918-223-4455', address: 'Purok 1', barangay: 'Victoria' },
      { id: 'P-602', name: 'Melencio Dalisay (Son)', role: 'Complainant', contact: '0918-223-4456', address: 'Purok 1', barangay: 'Victoria' }
    ],
    respondents: [
      { id: 'P-603', name: 'Unidentified Fleeing Rider (Black Underbone Motorcycle)', role: 'Respondent', address: 'Unknown / Fled towards Brgy. Odiong', barangay: 'Odiong' }
    ],
    witnesses: [
      { id: 'P-604', name: 'Danilo Ramos (Tricycle Driver on Queue)', role: 'Witness', contact: '0921-998-1122', address: 'Market Terminal', barangay: 'Victoria' }
    ],
    personsInvolved: [
      { id: 'P-601', name: 'Victoria Dalisay', role: 'Victim', barangay: 'Victoria' },
      { id: 'P-603', name: 'Unidentified Fleeing Rider', role: 'Respondent', barangay: 'Odiong' }
    ],
    
    isInvolvingOfficial: false,
    officialInvolvedType: 'None',
    
    originatingAgency: 'Barangay Victoria Traffic Desk',
    currentHandlingAgency: 'Municipal Government of Roxas (LGU Executive & Traffic Oversight)',
    assignedPersonnel: 'Municipal Traffic Enforcement & CCTV Command',
    priority: 'Urgent',
    status: 'Unresolved',

    isAccidentEmergency: true,
    accidentVehicleDetails: 'Unidentified Black Underbone Motorcycle (Open Exhaust / No Plate Installed)',
    accidentCasualties: '1 Pedestrian Hospitalized (Fractured wrist, head laceration)',
    collisionImpactType: 'Hit-and-Run',
    roadSurfaceCondition: 'Dry & Clear',
    weatherCondition: 'Foggy / Night Dark',
    injuriesCount: 1,
    casualtiesCount: 0,
    isHitAndRun: true,
    respondingAmbulanceUnit: 'MDRRMO Ambulance Bravo-1',
    hospitalTransported: 'Roxas Medicare Hospital',
    vehiclesInvolved: [
      {
        id: 'VEH-010',
        vehicleType: 'Pedestrian',
        driverName: 'Victoria Dalisay (Pedestrian)',
        driverCondition: 'Hospitalized',
        damageSeverity: 'Moderate Functional Damage'
      },
      {
        id: 'VEH-011',
        vehicleType: 'Motorcycle',
        makeModel: 'Unidentified Black Underbone / Drag-Type',
        plateNumberOrConduction: 'NO PLATE / FLED',
        driverName: 'John Doe (Fleeing Suspect)',
        driverCondition: 'Unknown',
        damageSeverity: 'Moderate Functional Damage'
      }
    ],
    statusHistory: [
      { id: 'SH-013', previousStatus: 'Unresolved', newStatus: 'Unresolved', reason: 'Hit-and-run vehicular incident requiring CCTV surveillance tracking', changedBy: 'Atty. Clarissa Reyes', changedByRole: 'LGU Administrator', agency: 'Municipal Government of Roxas', timestamp: '2026-03-09T08:00:00.000Z' }
    ],
    timeline: [
      { id: 'TL-020', caseId: 'BC-2026-006', title: 'Hit-and-Run Incident Reported', description: 'Pedestrian struck at Victoria pedestrian lane; suspect fled northbound.', stage: 'Report Filed', actorName: 'Danilo Ramos', actorRole: 'Witness', actorAgency: 'Barangay Victoria Traffic Desk', timestamp: '2026-03-08T20:30:00.000Z' },
      { id: 'TL-021', caseId: 'BC-2026-006', title: 'Emergency Transport Conducted', description: 'MDRRMO ambulance mobilized patient to Roxas Medicare.', stage: 'LGU Action', actorName: 'MDRRMO Bravo-1', actorRole: 'Responder', actorAgency: 'Municipal Government of Roxas', timestamp: '2026-03-08T20:45:00.000Z' },
      { id: 'TL-022', caseId: 'BC-2026-006', title: 'CCTV Grid Analysis Initiated', description: 'Municipal CCTV command traced suspect route across barangay boundaries.', stage: 'LGU Action', actorName: 'Traffic Enforcement', actorRole: 'Investigator', actorAgency: 'Municipal Government of Roxas', timestamp: '2026-03-09T09:00:00.000Z' }
    ],
    dateCreated: '2026-03-08T20:30:00.000Z',
    dateLastUpdated: '2026-03-14T11:00:00.000Z',
    createdBy: 'Barangay Victoria Traffic Desk'
  },
  {
    id: 'BC-2026-007',
    incidentId: 'INC-2026-007',
    complaintId: 'CMP-2026-007',
    title: 'Tricycle Rollover & Electric Post Collision due to Tire Blowout',
    category: 'Tricycle Collision / Rollover',
    description: 'Passenger tricycle carrying 4 passengers suffered rear tire blowout while descending a slope in Barangay Victoria, overturning into an electric concrete pole.',
    initialNarrative: 'Tricycle unit (Plate # 3390-TO) driven by Nestor Alcantara experienced sudden deflation of its left rear tire at 35 km/h. Driver lost steering control, swerved onto the embankment, and rolled over on its right side against a concrete power post.',
    currentNarrativeSummary: 'Barangay first responders extricated passengers. Two passengers suffered mild concussions. ORTA (Oriental Mindoro Tricycle Operators Association) and Barangay Victoria Lupon coordinated insurance claim for medical bills and post repair.',
    dateReported: '2026-02-14T14:15:00.000Z',
    incidentDate: '2026-02-14',
    barangay: 'Victoria',
    specificLocation: 'Purok 1 Boundary Road, Brgy. Victoria, Roxas, Oriental Mindoro',
    
    complainants: [
      { id: 'P-701', name: 'Rosario Mendoza (Passenger)', role: 'Victim', contact: '0917-889-7766', address: 'Purok 1', barangay: 'Victoria' }
    ],
    respondents: [
      { id: 'P-702', name: 'Nestor Alcantara (Tricycle Driver)', role: 'Respondent', contact: '0920-445-1122', address: 'Purok 1', barangay: 'Victoria' }
    ],
    witnesses: [
      { id: 'P-703', name: 'Kagawad Juanito Cruz', role: 'Witness', contact: '0919-223-1100', address: 'Purok 1', barangay: 'Victoria' }
    ],
    personsInvolved: [
      { id: 'P-701', name: 'Rosario Mendoza', role: 'Victim', barangay: 'Victoria' },
      { id: 'P-702', name: 'Nestor Alcantara', role: 'Respondent', barangay: 'Victoria' }
    ],
    
    isInvolvingOfficial: false,
    officialInvolvedType: 'None',
    
    originatingAgency: 'Barangay Victoria Traffic Desk',
    currentHandlingAgency: 'Barangay Victoria Traffic Desk',
    assignedPersonnel: 'Punong Barangay Victoria & TODA Council',
    priority: 'Medium',
    status: 'Resolved',

    isAccidentEmergency: false,
    accidentVehicleDetails: 'Kawasaki Barako 175 with Passenger Sidecar (Plate # 3390-TO)',
    accidentCasualties: '2 Passengers with mild concussions (Discharged from clinic)',
    collisionImpactType: 'Fixed Obstacle Collision',
    roadSurfaceCondition: 'Dry & Clear',
    weatherCondition: 'Clear & Sunny',
    injuriesCount: 2,
    casualtiesCount: 0,
    isHitAndRun: false,
    vehiclesInvolved: [
      {
        id: 'VEH-012',
        vehicleType: 'Tricycle',
        makeModel: 'Kawasaki Barako 175 with Stainless Sidecar',
        plateNumberOrConduction: '3390-TO',
        driverName: 'Nestor Alcantara',
        driverLicenseNo: 'D01-16-048291',
        driverCondition: 'Minor Scratches/Bruises',
        damageSeverity: 'Moderate Functional Damage',
        helmetOrSeatbeltWorn: false,
        insuranceCoverage: true
      }
    ],
    statusHistory: [
      { id: 'SH-014', previousStatus: 'Unresolved', newStatus: 'Unresolved', reason: 'Tricycle passenger accident referred to Lupon mediation', changedBy: 'PB Victoria', changedByRole: 'Punong Barangay', agency: 'Barangay Victoria Traffic Desk', timestamp: '2026-02-15T09:00:00.000Z' },
      { id: 'SH-015', previousStatus: 'Unresolved', newStatus: 'Resolved', reason: 'TODA group insurance settlement disbursed', changedBy: 'PB Victoria', changedByRole: 'Punong Barangay', agency: 'Barangay Victoria Traffic Desk', timestamp: '2026-02-28T15:00:00.000Z' }
    ],
    timeline: [
      { id: 'TL-023', caseId: 'BC-2026-007', title: 'Tricycle Rollover Logged', description: 'Tire blowout caused sidecar rollover into concrete pole.', stage: 'Report Filed', actorName: 'Kagawad Juanito Cruz', actorRole: 'Witness', actorAgency: 'Barangay Victoria Traffic Desk', timestamp: '2026-02-14T14:15:00.000Z' },
      { id: 'TL-024', caseId: 'BC-2026-007', title: 'Amicable Settlement Signed', description: 'TODA insurance covered clinic bills; passenger signed release.', stage: 'Resolution', actorName: 'Nestor Alcantara', actorRole: 'Respondent', actorAgency: 'Barangay Victoria Traffic Desk', timestamp: '2026-02-28T15:00:00.000Z' }
    ],
    dateCreated: '2026-02-14T14:15:00.000Z',
    dateLastUpdated: '2026-02-28T15:00:00.000Z',
    createdBy: 'Barangay Victoria Secretary'
  },
  {
    id: 'BC-2026-008',
    incidentId: 'INC-2026-008',
    complaintId: 'CMP-2026-008',
    title: 'SUV vs 3-Wheel Electric Trike Collision along Odiong Junction',
    category: 'Bicycle / E-Bike / E-Trike Crash',
    description: 'Toyota Fortuner SUV making a left turn into Odiong market road clipped an oncoming 3-wheel electric trike carrying two students.',
    initialNarrative: 'Toyota Fortuner (Plate # NBN-9081) attempted an unsignaled left turn across oncoming traffic, colliding with the front wheel assembly of an e-trike (NWOW Model). The e-trike tipped over onto its left side.',
    currentNarrativeSummary: 'Both student passengers sustained minor contusions and were given first aid. SUV driver accepted full responsibility, reimbursed e-trike battery and body repair costs (₱12,000), and signed settlement.',
    dateReported: '2026-03-05T16:20:00.000Z',
    incidentDate: '2026-03-05',
    barangay: 'Odiong',
    specificLocation: 'Odiong Junction, Strong Republic Nautical Highway, Brgy. Odiong, Roxas',
    
    complainants: [
      { id: 'P-801', name: 'Liza Macaraeg (Mother of Student Rider)', role: 'Complainant', contact: '0917-554-3322', address: 'Purok 2', barangay: 'Odiong' }
    ],
    respondents: [
      { id: 'P-802', name: 'Engr. Bernardo Ramos (SUV Driver)', role: 'Respondent', contact: '0920-881-4455', address: 'Purok 3', barangay: 'Odiong' }
    ],
    witnesses: [
      { id: 'P-803', name: 'Tanod SPO Edgardo Lim', role: 'Witness', contact: '0918-990-2211', address: 'Junction Outpost', barangay: 'Odiong' }
    ],
    personsInvolved: [
      { id: 'P-801', name: 'Liza Macaraeg', role: 'Complainant', barangay: 'Odiong' },
      { id: 'P-802', name: 'Bernardo Ramos', role: 'Respondent', barangay: 'Odiong' }
    ],
    
    isInvolvingOfficial: false,
    officialInvolvedType: 'None',
    
    originatingAgency: 'Barangay Odiong Traffic Desk',
    currentHandlingAgency: 'Barangay Odiong Traffic Desk',
    assignedPersonnel: 'PB Odiong & Barangay Traffic Committee',
    priority: 'Low',
    status: 'Resolved',

    isAccidentEmergency: false,
    accidentVehicleDetails: 'Toyota Fortuner SUV (Plate # NBN-9081) vs NWOW 3-Wheel E-Trike (Electric Vehicle)',
    accidentCasualties: 'Minor scrapes (First aid applied at scene)',
    collisionImpactType: 'Intersection Collision',
    roadSurfaceCondition: 'Dry & Clear',
    weatherCondition: 'Clear & Sunny',
    injuriesCount: 2,
    casualtiesCount: 0,
    isHitAndRun: false,
    vehiclesInvolved: [
      {
        id: 'VEH-013',
        vehicleType: 'SUV / AUV',
        makeModel: 'Toyota Fortuner 2.8L (Silver Metallic)',
        plateNumberOrConduction: 'NBN-9081',
        driverName: 'Bernardo Ramos',
        driverLicenseNo: 'D01-14-091244',
        driverCondition: 'Uninjured',
        damageSeverity: 'Minor Dent/Scratch',
        helmetOrSeatbeltWorn: true,
        insuranceCoverage: true
      },
      {
        id: 'VEH-014',
        vehicleType: 'Bicycle / E-Bike',
        makeModel: 'NWOW ERV 3-Wheel Electric Trike (Red)',
        plateNumberOrConduction: 'E-BIKE UNREGISTERED',
        driverName: 'Joshua Macaraeg (Student)',
        driverCondition: 'Minor Scratches/Bruises',
        damageSeverity: 'Moderate Functional Damage',
        helmetOrSeatbeltWorn: false,
        insuranceCoverage: false
      }
    ],
    statusHistory: [
      { id: 'SH-016', previousStatus: 'Unresolved', newStatus: 'Resolved', reason: 'Settlement executed and acknowledged on-site', changedBy: 'PB Odiong', changedByRole: 'Punong Barangay', agency: 'Barangay Odiong Traffic Desk', timestamp: '2026-03-06T10:00:00.000Z' }
    ],
    timeline: [
      { id: 'TL-025', caseId: 'BC-2026-008', title: 'E-Trike Crash Reported', description: 'SUV clipped electric trike at Odiong Junction.', stage: 'Report Filed', actorName: 'Liza Macaraeg', actorRole: 'Complainant', actorAgency: 'Barangay Odiong Traffic Desk', timestamp: '2026-03-05T16:20:00.000Z' },
      { id: 'TL-026', caseId: 'BC-2026-008', title: 'Settlement Executed', description: 'SUV driver settled repair costs with e-trike owner.', stage: 'Resolution', actorName: 'Bernardo Ramos', actorRole: 'Respondent', actorAgency: 'Barangay Odiong Traffic Desk', timestamp: '2026-03-06T10:00:00.000Z' }
    ],
    dateCreated: '2026-03-05T16:20:00.000Z',
    dateLastUpdated: '2026-03-06T10:00:00.000Z',
    createdBy: 'Barangay Odiong Secretary'
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-1001',
    timestamp: '2026-03-13T09:00:00.000Z',
    userId: 'USR-LGU-01',
    userName: 'Atty. Clarissa Reyes',
    role: 'Municipal Administrator',
    agency: 'Municipal Government of Roxas',
    action: 'DISPATCHED_CRASH_INVESTIGATION',
    caseId: 'BC-2026-003',
    details: 'MDRRMO dispatched technical investigation team to secure CCTV footage for head-on motorcycle crash along Nautical Highway.'
  },
  {
    id: 'LOG-1002',
    timestamp: '2026-03-12T23:50:00.000Z',
    userId: 'USR-LGU-01',
    userName: 'Atty. Clarissa Reyes',
    role: 'Municipal Administrator',
    agency: 'Municipal Government of Roxas',
    action: 'EMERGENCY_AMBULANCE_DISPATCH',
    caseId: 'BC-2026-003',
    details: 'Dispatched MDRRMO Ambulance Alpha-2 for emergency extraction and hospital transport of two motorcycle riders.'
  },
  {
    id: 'LOG-1003',
    timestamp: '2026-03-09T08:00:00.000Z',
    userId: 'USR-LGU-01',
    userName: 'Atty. Clarissa Reyes',
    role: 'Municipal Administrator',
    agency: 'Municipal Government of Roxas',
    action: 'CCTV_SURVEILLANCE_ANALYSIS',
    caseId: 'BC-2026-006',
    details: 'Analyzed municipal CCTV footage for nighttime pedestrian hit-and-run incident in Brgy. Victoria.'
  },
  {
    id: 'LOG-1004',
    timestamp: '2026-03-06T10:30:00.000Z',
    userId: 'USR-LGU-01',
    userName: 'Atty. Clarissa Reyes',
    role: 'Municipal Administrator',
    agency: 'Municipal Government of Roxas',
    action: 'INSURANCE_CLAIM_APPROVED',
    caseId: 'BC-2026-002',
    details: 'Approved municipal vehicle insurance claim reimbursement (₱8,400) for motorcycle repair.'
  },
  {
    id: 'LOG-1005',
    timestamp: '2026-02-18T14:00:00.000Z',
    userId: 'USR-BRGY-SANAQUILINO',
    userName: 'Hon. Elena V. Macalalad',
    role: 'Punong Barangay',
    agency: 'Barangay San Aquilino LGU',
    action: 'ACCIDENT_SETTLEMENT_EXECUTED',
    caseId: 'BC-2026-001',
    previousValue: 'For Barangay Action',
    newValue: 'Resolved',
    details: 'Executed KP Form No. 16 Amicable Settlement between motorcycle rider and tricycle driver. Repair compensation disbursed.'
  }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  // --- RESIDENT NOTIFICATIONS ---
  {
    id: 'NOTIF-RES-01',
    title: 'Accident Report Docketed by Barangay Traffic Desk',
    message: 'Your submitted vehicular accident report in Sitio Riverside has been officially docketed under Case #BC-2026-005.',
    type: 'status_update',
    caseId: 'BC-2026-005',
    timestamp: '2026-03-10T11:30:00.000Z',
    isRead: false,
    targetAgencyTypes: ['RESIDENT'],
    targetRoles: ['RESIDENT'],
    targetBarangay: 'San Aquilino',
    targetUserId: 'USR-RES-01',
    priority: 'normal'
  },
  {
    id: 'NOTIF-RES-02',
    title: 'Roxas Road Safety Public Advisory',
    message: 'Always wear DTI-approved motorcycle helmets and observe 40 km/h speed limits along residential and school zones.',
    type: 'advisory',
    timestamp: '2026-03-12T08:00:00.000Z',
    isRead: true,
    targetAgencyTypes: ['RESIDENT'],
    targetRoles: ['RESIDENT'],
    targetBarangay: 'San Aquilino',
    priority: 'normal'
  },
  {
    id: 'NOTIF-BGY-02',
    title: 'Road Hazard Cleared Notification',
    message: 'Loose gravel hazard along Sitio Riverside curve successfully cleared by barangay response team.',
    type: 'status_update',
    caseId: 'BC-2026-005',
    timestamp: '2026-03-11T16:00:00.000Z',
    isRead: true,
    targetAgency: 'MDRRMO',
    targetAgencyTypes: ['MDRRMO'],
    targetBarangay: 'San Aquilino',
    priority: 'normal'
  },
  {
    id: 'NOTIF-LGU-02',
    title: 'Hit-and-Run CCTV Tracking Alert (Victoria)',
    message: 'Case #BC-2026-006: CCTV Command reviewing commercial video footage for fleeing motorcycle suspect.',
    type: 'status_update',
    caseId: 'BC-2026-006',
    timestamp: '2026-03-09T08:30:00.000Z',
    isRead: false,
    targetAgency: 'LGU',
    targetAgencyTypes: ['LGU', 'ADMIN'],
    priority: 'high'
  },

  // --- SYSTEM ADMIN NOTIFICATIONS ---
  {
    id: 'NOTIF-SYS-01',
    title: 'System Account Registered',
    message: 'Official user account Hon. Elena V. Macalalad (Punong Barangay, San Aquilino) has been provisioned.',
    type: 'system',
    timestamp: '2026-03-01T08:00:00.000Z',
    isRead: false,
    targetAgency: 'ADMIN',
    targetAgencyTypes: ['ADMIN'],
    targetRoles: ['SYSTEM_ADMIN'],
    priority: 'normal'
  }
];
