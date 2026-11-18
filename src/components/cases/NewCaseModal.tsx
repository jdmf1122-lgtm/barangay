import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Layers,
  Car,
  Bike,
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useUI } from '../../hooks/useUI';
import { 
  ROXAS_BARANGAYS, 
  IncidentCategory, 
  PriorityLevel, 
  CaseStatus, 
  Person,
  VehicleCrashDetail
} from '../../types';

export const NewCaseModal: React.FC = () => {
  const { currentUser } = useAuth();
  const { createCase } = useCases();
  const { isNewCaseModalOpen, setIsNewCaseModalOpen } = useUI();

  const isBarangayOfficer = (currentUser?.agencyType as string) === 'BARANGAY' && !!currentUser?.barangay;

  // Form State - Accident Core
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('Motorcycle vs Motorcycle Collision');
  const [barangay, setBarangay] = useState(currentUser?.barangay || ROXAS_BARANGAYS[0]);
  const [specificLocation, setSpecificLocation] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [initialNarrative, setInitialNarrative] = useState('');
  const [dateReported, setDateReported] = useState(new Date().toISOString().split('T')[0]);

  // Crash Dynamics & Conditions
  const [collisionImpactType, setCollisionImpactType] = useState('Intersection Collision');
  const [roadSurfaceCondition, setRoadSurfaceCondition] = useState('Dry & Clear');
  const [weatherCondition, setWeatherCondition] = useState('Clear & Sunny');
  const [injuriesCount, setInjuriesCount] = useState<number>(0);
  const [isHitAndRun, setIsHitAndRun] = useState(false);
  const [respondingAmbulanceUnit, setRespondingAmbulanceUnit] = useState('MDRRMO Rescue Ambulance');
  const [hospitalTransported, setHospitalTransported] = useState('');

  // Primary Vehicle / Party 1 (Complainant / Driver 1)
  const [v1Type, setV1Type] = useState('Motorcycle');
  const [v1MakeModel, setV1MakeModel] = useState('');
  const [v1Plate, setV1Plate] = useState('');
  const [v1DriverName, setV1DriverName] = useState('');
  const [v1DriverContact, setV1DriverContact] = useState('');
  const [v1DriverAddress] = useState('');
  const [v1DriverCondition, setV1DriverCondition] = useState<'Uninjured' | 'Minor Scratches/Bruises' | 'Hospitalized' | 'Fatal'>('Minor Scratches/Bruises');
  const [v1Damage, setV1Damage] = useState<'Minor Dent/Scratch' | 'Moderate Functional Damage' | 'Severe / Total Wreck'>('Moderate Functional Damage');
  const [v1Helmet] = useState(true);

  // Secondary Vehicle / Party 2 (Respondent / Driver 2 / Pedestrian)
  const [hasParty2, setHasParty2] = useState(true);
  const [v2Type, setV2Type] = useState('Tricycle');
  const [v2MakeModel, setV2MakeModel] = useState('');
  const [v2Plate, setV2Plate] = useState('');
  const [v2DriverName, setV2DriverName] = useState('');
  const [v2DriverContact, setV2DriverContact] = useState('');
  const [v2DriverCondition, setV2DriverCondition] = useState<'Uninjured' | 'Minor Scratches/Bruises' | 'Hospitalized' | 'Fatal'>('Uninjured');
  const [v2Damage, setV2Damage] = useState<'Minor Dent/Scratch' | 'Moderate Functional Damage' | 'Severe / Total Wreck'>('Minor Dent/Scratch');
  const [isRespondentOfficial, setIsRespondentOfficial] = useState(false);
  const [officialPosition, setOfficialPosition] = useState('Municipal Driver');
  const [officialAgency, setOfficialAgency] = useState('Municipal Government of Roxas');

  // Witness / Tanod Responder
  const [witnessName, setWitnessName] = useState('');

  // Routing
  const [routingType, setRoutingType] = useState<'MDRRMO' | 'LGU'>('MDRRMO');

  if (!isNewCaseModalOpen || currentUser?.agencyType === 'LGU' || currentUser?.agencyType === 'MDRRMO') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !initialNarrative.trim() || !v1DriverName.trim()) {
      alert('Please fill in the required fields: Accident Title, Primary Driver Name, and Crash Narrative.');
      return;
    }

    const complainants: Person[] = [
      {
        id: `P-${Date.now()}-1`,
        name: v1DriverName.trim(),
        role: 'Complainant',
        contact: v1DriverContact.trim() || undefined,
        address: v1DriverAddress.trim() || undefined,
        barangay: barangay
      }
    ];

    const respondents: Person[] = hasParty2 && v2DriverName.trim()
      ? [
          {
            id: `P-${Date.now()}-2`,
            name: v2DriverName.trim(),
            role: 'Respondent',
            contact: v2DriverContact.trim() || undefined,
            barangay: barangay,
            isOfficial: isRespondentOfficial,
            officialPosition: isRespondentOfficial ? officialPosition : undefined,
            officialAgency: isRespondentOfficial ? officialAgency : undefined
          }
        ]
      : [];

    const witnesses: Person[] = witnessName.trim()
      ? [
          {
            id: `P-${Date.now()}-3`,
            name: witnessName.trim(),
            role: 'Witness',
            barangay: barangay
          }
        ]
      : [];

    const vehiclesInvolved: VehicleCrashDetail[] = [
      {
        id: `VEH-${Date.now()}-1`,
        vehicleType: v1Type,
        makeModel: v1MakeModel.trim() || `${v1Type} Unit`,
        plateNumberOrConduction: v1Plate.trim() || 'Unregistered / Conduction',
        driverName: v1DriverName.trim(),
        driverCondition: v1DriverCondition,
        damageSeverity: v1Damage,
        helmetOrSeatbeltWorn: v1Helmet,
        insuranceCoverage: true
      }
    ];

    if (hasParty2 && (v2DriverName.trim() || v2MakeModel.trim() || isHitAndRun)) {
      vehiclesInvolved.push({
        id: `VEH-${Date.now()}-2`,
        vehicleType: isHitAndRun ? 'Hit-and-Run Vehicle' : v2Type,
        makeModel: v2MakeModel.trim() || (isHitAndRun ? 'Unidentified Fleeing Vehicle' : `${v2Type} Unit`),
        plateNumberOrConduction: v2Plate.trim() || (isHitAndRun ? 'FLED / UNKNOWN' : 'Conduction / Plate Pending'),
        driverName: v2DriverName.trim() || (isHitAndRun ? 'Unknown Fleeing Suspect' : 'Party 2 Driver'),
        driverCondition: v2DriverCondition,
        damageSeverity: v2Damage,
        helmetOrSeatbeltWorn: false,
        insuranceCoverage: false
      });
    }

    const isReferredToLgu = routingType === 'LGU';
    const isRemainedAtBarangay = routingType === 'MDRRMO';
    const initialStatus: CaseStatus = 'Unresolved';

    createCase({
      title: title.trim(),
      category,
      barangay,
      specificLocation: specificLocation.trim() || `Brgy. ${barangay}`,
      dateReported,
      status: initialStatus,
      priority,
      complainants,
      respondents,
      witnesses,
      personsInvolved: [...complainants, ...respondents, ...witnesses],
      initialNarrative: initialNarrative.trim(),
      
      // Accident & Crash details
      collisionImpactType,
      roadSurfaceCondition,
      weatherCondition,
      injuriesCount,
      casualtiesCount: 0,
      isHitAndRun,
      respondingAmbulanceUnit: injuriesCount > 0 ? respondingAmbulanceUnit : undefined,
      hospitalTransported: hospitalTransported.trim() || undefined,
      vehiclesInvolved,
      accidentVehicleDetails: `${v1Type} (${v1MakeModel || 'V1'}) vs ${hasParty2 ? `${v2Type} (${v2MakeModel || 'V2'})` : 'Fixed Object / Road Skid'}`,
      accidentCasualties: injuriesCount > 0 ? `${injuriesCount} injured` : 'No injuries (Property damage only)',

      isInvolvingOfficial: isRespondentOfficial,
      officialInvolvedName: isRespondentOfficial ? v2DriverName.trim() : undefined,
      officialInvolvedPosition: isRespondentOfficial ? officialPosition : undefined,
      officialInvolvedAgency: isRespondentOfficial ? officialAgency : undefined,
      officialInvolvedType: isRespondentOfficial ? 'Local Government Personnel' : undefined,
      isRemainedAtBarangay,
      isReferredToLgu
    });

    setIsNewCaseModalOpen(false);
  };

  return (
    <div 
      id="new-case-modal-backdrop"
      className="fixed inset-0 z-50 bg-ink/75 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div 
        id="new-case-modal-card"
        className="bg-paper text-ink w-full max-w-4xl rounded-xl shadow-xs border border-rule overflow-hidden flex flex-col max-h-[92dvh]"
      >
        {/* Header */}
        <div className="bg-paper-2 text-ink px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between border-b border-rule flex-shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-paper text-accent rounded-lg border border-rule flex-shrink-0">
              <Car className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-xs sm:text-sm md:text-base text-ink tracking-tight flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="truncate">Record vehicular accident</span>
                <span className="hidden sm:inline-block text-[10px] bg-paper text-muted px-2 py-0.5 rounded-full border border-rule font-medium flex-shrink-0">
                  Crash desk
                </span>
              </h2>
              <p className="text-xs text-muted truncate">
                Official incident docketing · Roxas, Oriental Mindoro
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsNewCaseModalOpen(false)}
            className="p-1.5 text-muted hover:text-ink hover:bg-paper-3 active:bg-paper rounded-lg transition-colors cursor-pointer flex-shrink-0 ml-2 focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 sm:p-5 text-xs space-y-4 sm:space-y-5">
          
          {/* Section 1: Accident Core & Classification */}
          <div className="bg-paper-2 p-4 rounded-xl border border-rule space-y-3">
            <h3 className="font-semibold text-xs text-ink flex items-center gap-1.5 border-b border-rule pb-2">
              <FileText className="w-4 h-4 text-accent" />
              <span>1. Accident identification, category, and location</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-ink block mb-1">
                  Accident or crash title <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Motorcycle vs Tricycle Collision along Morente Ave / Strong Republic Nautical Highway"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 text-xs bg-paper rounded-lg border border-rule focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden font-medium text-ink disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">
                  Accident category <span className="text-error">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                  className="w-full p-2 text-xs bg-paper rounded-lg border border-rule font-medium text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
                >
                  <option value="Motorcycle vs Motorcycle Collision">Motorcycle vs Motorcycle Collision</option>
                  <option value="Motorcycle vs Car / SUV Collision">Motorcycle vs Car / SUV Collision</option>
                  <option value="Motorcycle vs Tricycle Collision">Motorcycle vs Tricycle Collision</option>
                  <option value="Car / 4-Wheeled Vehicle Collision">Car / 4-Wheeled Vehicle Collision</option>
                  <option value="Tricycle Collision / Rollover">Tricycle Collision / Rollover</option>
                  <option value="Truck / Bus / Heavy Vehicle Crash">Truck / Bus / Heavy Vehicle Crash</option>
                  <option value="PUV / Jeepney / Multicab Accident">PUV / Jeepney / Multicab Accident</option>
                  <option value="Pedestrian Hit by Vehicle / Motorcycle">Pedestrian Hit by Vehicle / Motorcycle</option>
                  <option value="Bicycle / E-Bike / E-Trike Crash">Bicycle / E-Bike / E-Trike Crash</option>
                  <option value="Single-Vehicle Road Skid / Fixed Object Crash">Single-Vehicle Road Skid / Fixed Object Crash</option>
                  <option value="Multi-Vehicle Pileup Collision">Multi-Vehicle Pileup Collision</option>
                  <option value="Hit-and-Run Vehicular Crash">Hit-and-Run Vehicular Crash</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">
                  Barangay jurisdiction <span className="text-error">*</span>
                </label>
                {isBarangayOfficer ? (
                  <div className="w-full p-2 text-xs bg-paper text-ink rounded-lg border border-rule font-medium flex items-center justify-between">
                    <span>Brgy. {currentUser.barangay}</span>
                    <span className="text-[10px] text-muted bg-paper-2 px-2 py-0.5 rounded font-medium border border-rule">
                      Locked
                    </span>
                  </div>
                ) : (
                  <select
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    className="w-full p-2 text-xs bg-paper rounded-lg border border-rule font-medium text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
                  >
                    {ROXAS_BARANGAYS.map((b) => (
                      <option key={b} value={b}>Brgy. {b}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Date of accident <span className="text-error">*</span></label>
                <input
                  type="date"
                  required
                  value={dateReported}
                  onChange={(e) => setDateReported(e.target.value)}
                  className="w-full p-2 text-xs bg-paper text-ink rounded-lg border border-rule focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 num"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-ink block mb-1">
                  Specific location (Purok, highway, or landmark) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Corner Morente Ave & Nautical Highway / Sitio Riverside Curve"
                    value={specificLocation}
                    onChange={(e) => setSpecificLocation(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2 text-xs bg-paper text-ink rounded-lg border border-rule focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Urgency priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full p-2 text-xs bg-paper text-ink rounded-lg border border-rule font-medium focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
                >
                  <option value="Low">Low (Minor fender bender or scratch)</option>
                  <option value="Medium">Medium (Moderate damage, clear road)</option>
                  <option value="High">High (Road blocked, medical attention)</option>
                  <option value="Urgent">Urgent (Hospitalization, hit-and-run, major highway block)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Crash Dynamics & Environmental Conditions */}
          <div className="bg-paper-2 p-4 rounded-xl border border-rule space-y-3">
            <h3 className="font-semibold text-xs text-ink flex items-center gap-1.5 border-b border-rule pb-2">
              <Activity className="w-4 h-4 text-warning" />
              <span>2. Crash dynamics, road environment, and medical casualties</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Collision impact type</label>
                <select
                  value={collisionImpactType}
                  onChange={(e) => setCollisionImpactType(e.target.value)}
                  className="w-full p-2 text-xs bg-paper text-ink rounded-lg border border-rule font-medium focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
                >
                  <option value="Intersection Collision">Intersection Collision</option>
                  <option value="Head-On Collision">Head-On Collision</option>
                  <option value="Rear-End Impact">Rear-End Impact</option>
                  <option value="Side-Swipe / T-Bone">Side-Swipe / T-Bone</option>
                  <option value="Pedestrian Impact">Pedestrian Impact</option>
                  <option value="Single Vehicle Skid / Rollover">Single Vehicle Skid / Rollover</option>
                  <option value="Fixed Obstacle Collision">Fixed Obstacle Collision</option>
                  <option value="Multi-Vehicle Pileup">Multi-Vehicle Pileup</option>
                  <option value="Hit-and-Run">Hit-and-Run</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Road surface condition</label>
                <select
                  value={roadSurfaceCondition}
                  onChange={(e) => setRoadSurfaceCondition(e.target.value)}
                  className="w-full p-2 text-xs bg-paper text-ink rounded-lg border border-rule font-medium focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
                >
                  <option value="Dry & Clear">Dry & Clear Asphalt/Concrete</option>
                  <option value="Wet / Slippery">Wet / Slippery Tarmac</option>
                  <option value="Gravel / Muddy">Loose Gravel / Sand Spill / Muddy</option>
                  <option value="Potholes / Under Construction">Potholes / Road Construction</option>
                  <option value="Blind Curve / Steep Gradient">Blind Curve / Steep Slope</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Weather condition</label>
                <select
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                  className="w-full p-2 text-xs bg-paper text-ink rounded-lg border border-rule font-medium focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
                >
                  <option value="Clear & Sunny">Clear & Sunny</option>
                  <option value="Heavy Rain / Storm">Heavy Rain / Downpour</option>
                  <option value="Overcast / Drizzle">Overcast / Light Drizzle</option>
                  <option value="Foggy / Night Dark">Night Time / Dark Road</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Injured persons count</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={injuriesCount}
                  onChange={(e) => setInjuriesCount(parseInt(e.target.value) || 0)}
                  className="w-full p-2 text-xs bg-paper text-ink rounded-lg border border-rule font-medium focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 num"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center space-x-2 text-xs font-medium text-ink cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={isHitAndRun}
                    onChange={(e) => setIsHitAndRun(e.target.checked)}
                    className="rounded border-rule text-accent focus-visible:ring-2 focus-visible:ring-focus w-4 h-4"
                  />
                  <span>Suspect vehicle fled the scene (Hit-and-Run)</span>
                </label>
              </div>

              {injuriesCount > 0 && (
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-paper rounded-lg border border-rule">
                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">Responding ambulance or first aid unit</label>
                    <input
                      type="text"
                      value={respondingAmbulanceUnit}
                      onChange={(e) => setRespondingAmbulanceUnit(e.target.value)}
                      placeholder="e.g., MDRRMO Alpha-1 / Barangay Tanod Responder"
                      className="w-full p-1.5 text-xs bg-paper-2 rounded border border-rule text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">Hospital transported to (if any)</label>
                    <input
                      type="text"
                      value={hospitalTransported}
                      onChange={(e) => setHospitalTransported(e.target.value)}
                      placeholder="e.g., Oriental Mindoro Southern District Hospital"
                      className="w-full p-1.5 text-xs bg-paper-2 rounded border border-rule text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Vehicles & Drivers Involved */}
          <div className="bg-paper-2 p-4 rounded-xl border border-rule space-y-3">
            <h3 className="font-semibold text-xs text-ink flex items-center gap-1.5 border-b border-rule pb-2">
              <Car className="w-4 h-4 text-accent" />
              <span>3. Involved vehicles and driver profiles</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle 1 Card */}
              <div className="p-3.5 bg-paper rounded-xl border border-rule shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-rule pb-1.5">
                  <span className="font-semibold text-ink text-xs flex items-center gap-1">
                    <Bike className="w-3.5 h-3.5 text-accent" />
                    <span>Vehicle 1 (Primary reporting driver)</span>
                  </span>
                  <span className="text-[10px] bg-paper-2 border border-rule text-muted px-2 py-0.5 rounded font-medium">Party 1</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-muted block mb-0.5">Vehicle classification</label>
                    <select
                      value={v1Type}
                      onChange={(e) => setV1Type(e.target.value)}
                      className="w-full p-1.5 text-xs bg-paper-2 rounded border border-rule text-ink font-medium focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
                    >
                      <option value="Motorcycle">Motorcycle (Underbone / Scooter)</option>
                      <option value="Tricycle">Tricycle (Passenger TODA)</option>
                      <option value="Sedan / Car">Sedan / Hatchback</option>
                      <option value="SUV / AUV">SUV / AUV / Pickup</option>
                      <option value="Van">Van / Utility Vehicle</option>
                      <option value="Truck (Dump/Cargo)">Truck (Dump / 10-Wheeler)</option>
                      <option value="Bus / PUV">Bus / PUV / Multicab</option>
                      <option value="Bicycle / E-Bike">Bicycle / E-Bike / E-Trike</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted block mb-0.5">Make and model</label>
                    <input
                      type="text"
                      placeholder="e.g. Honda Click 125i"
                      value={v1MakeModel}
                      onChange={(e) => setV1MakeModel(e.target.value)}
                      className="w-full p-1.5 text-xs bg-paper-2 rounded border border-rule text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-muted block mb-0.5">Plate or MV file number</label>
                    <input
                      type="text"
                      placeholder="e.g. 8912-MC"
                      value={v1Plate}
                      onChange={(e) => setV1Plate(e.target.value)}
                      className="w-full p-1.5 text-xs bg-paper-2 rounded border border-rule font-mono text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 num"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted block mb-0.5">Driver condition</label>
                    <select
                      value={v1DriverCondition}
                      onChange={(e) => setV1DriverCondition(e.target.value as 'Uninjured' | 'Minor Scratches/Bruises' | 'Hospitalized' | 'Fatal')}
                      className="w-full p-1.5 text-xs bg-paper-2 rounded border border-rule text-ink font-medium focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
                    >
                      <option value="Uninjured">Uninjured</option>
                      <option value="Minor Scratches/Bruises">Minor Scratches / First Aid</option>
                      <option value="Hospitalized">Hospitalized / Fractures</option>
                      <option value="Fatal">Fatal / Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-muted block mb-0.5">Driver full name <span className="text-error">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Carlos Dalisay"
                    value={v1DriverName}
                    onChange={(e) => setV1DriverName(e.target.value)}
                    className="w-full p-1.5 text-xs bg-paper-2 rounded border border-rule font-medium text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-muted block mb-0.5">Contact phone</label>
                    <input
                      type="text"
                      placeholder="0917-xxx-xxxx"
                      value={v1DriverContact}
                      onChange={(e) => setV1DriverContact(e.target.value)}
                      className="w-full p-1.5 text-xs bg-paper-2 rounded border border-rule text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 num"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted block mb-0.5">Damage severity</label>
                    <select
                      value={v1Damage}
                      onChange={(e) => setV1Damage(e.target.value as 'Minor Dent/Scratch' | 'Moderate Functional Damage' | 'Severe / Total Wreck')}
                      className="w-full p-1.5 text-xs bg-paper-2 rounded border border-rule text-ink font-medium focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
                    >
                      <option value="Minor Dent/Scratch">Minor Dent / Scratches</option>
                      <option value="Moderate Functional Damage">Moderate Functional Damage</option>
                      <option value="Severe / Total Wreck">Severe / Total Wreck</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Vehicle 2 / Pedestrian Card */}
              <div className="p-3.5 bg-paper rounded-xl border border-rule shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-rule pb-1.5">
                  <span className="font-semibold text-ink text-xs flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-muted" />
                    <span>Vehicle 2 (Second party or pedestrian)</span>
                  </span>
                  <label className="flex items-center space-x-1 text-[10px] text-muted font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasParty2}
                      onChange={(e) => setHasParty2(e.target.checked)}
                      className="rounded border-rule text-accent focus-visible:ring-2 focus-visible:ring-focus"
                    />
                    <span>Include party 2</span>
                  </label>
                </div>

                {hasParty2 ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-muted block mb-0.5">Classification</label>
                        <select
                          value={v2Type}
                          onChange={(e) => setV2Type(e.target.value)}
                          className="w-full p-1.5 text-xs bg-paper-2 rounded border border-rule text-ink font-medium focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
                        >
                          <option value="Tricycle">Tricycle (Passenger TODA)</option>
                          <option value="Motorcycle">Motorcycle (Underbone / Scooter)</option>
                          <option value="Sedan / Car">Sedan / Hatchback</option>
                          <option value="SUV / AUV">SUV / Pickup</option>
                          <option value="Van">Van / Delivery</option>
                          <option value="Truck (Dump/Cargo)">Dump Truck / Heavy</option>
                          <option value="Bus / PUV">Bus / Multicab</option>
                          <option value="Pedestrian">Pedestrian</option>
                          <option value="Bicycle / E-Bike">Bicycle / E-Bike</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted block mb-0.5">Make and model</label>
                        <input
                          type="text"
                          placeholder="e.g. Bajaj RE / Toyota Vios"
                          value={v2MakeModel}
                          onChange={(e) => setV2MakeModel(e.target.value)}
                          className="w-full p-1.5 text-xs bg-paper-2 rounded border border-rule text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-muted block mb-0.5">Plate number</label>
                        <input
                          type="text"
                          placeholder="e.g. 4821-TG"
                          value={v2Plate}
                          onChange={(e) => setV2Plate(e.target.value)}
                          className="w-full p-1.5 text-xs bg-paper-2 rounded border border-rule font-mono text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 num"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted block mb-0.5">Driver condition</label>
                        <select
                          value={v2DriverCondition}
                          onChange={(e) => setV2DriverCondition(e.target.value as 'Uninjured' | 'Minor Scratches/Bruises' | 'Hospitalized' | 'Fatal')}
                          className="w-full p-1.5 text-xs bg-paper-2 rounded border border-rule text-ink font-medium focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
                        >
                          <option value="Uninjured">Uninjured</option>
                          <option value="Minor Scratches/Bruises">Minor Scratches / First Aid</option>
                          <option value="Hospitalized">Hospitalized / Fractures</option>
                          <option value="Fatal">Fatal / Critical</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-muted block mb-0.5">Driver or party 2 full name</label>
                      <input
                        type="text"
                        placeholder="e.g., Danilo Hernandez"
                        value={v2DriverName}
                        onChange={(e) => setV2DriverName(e.target.value)}
                        className="w-full p-1.5 text-xs bg-paper-2 rounded border border-rule font-medium text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
                      />
                    </div>

                    {/* Official Involvement Toggle */}
                    <div className="pt-1">
                      <label className="flex items-center space-x-2 text-xs font-medium text-ink cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isRespondentOfficial}
                          onChange={(e) => setIsRespondentOfficial(e.target.checked)}
                          className="rounded border-rule text-accent focus-visible:ring-2 focus-visible:ring-focus"
                        />
                        <span>Party 2 is an official or government service vehicle</span>
                      </label>

                      {isRespondentOfficial && (
                        <div className="mt-2 p-2.5 bg-paper-2 rounded-lg border border-rule space-y-1.5">
                          <div>
                            <label className="text-[10px] font-medium text-muted block mb-0.5">Official position or role</label>
                            <input
                              type="text"
                              value={officialPosition}
                              onChange={(e) => setOfficialPosition(e.target.value)}
                              placeholder="e.g. Municipal Driver, Barangay Kagawad"
                              className="w-full p-1.5 text-xs bg-paper rounded border border-rule text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-muted block mb-0.5">Agency or unit</label>
                            <input
                              type="text"
                              value={officialAgency}
                              onChange={(e) => setOfficialAgency(e.target.value)}
                              placeholder="e.g. Municipal Government of Roxas, MDRRMO"
                              className="w-full p-1.5 text-xs bg-paper rounded border border-rule text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-muted italic text-xs">
                    Single vehicle crash (skid, fixed object, canal rollover, or self-accident).
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted block mb-1">Witness or responding tanod name (Optional)</label>
              <input
                type="text"
                placeholder="Name of primary witness or tanod first responder"
                value={witnessName}
                onChange={(e) => setWitnessName(e.target.value)}
                className="w-full p-2 text-xs bg-paper rounded-lg border border-rule text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
              />
            </div>
          </div>

          {/* Section 4: Narrative & Agency Action Routing */}
          <div className="bg-paper-2 p-4 rounded-xl border border-rule space-y-3">
            <h3 className="font-semibold text-xs text-ink flex items-center gap-1.5 border-b border-rule pb-2">
              <Layers className="w-4 h-4 text-accent" />
              <span>4. Factual crash narrative and multi-agency action routing</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-ink block mb-1">
                Factual sequence of events or crash statement <span className="text-error">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="State the point of origin, direction of travel, speed estimates, point of impact, vehicle damages, roadway obstacles, and on-site settlement status..."
                value={initialNarrative}
                onChange={(e) => setInitialNarrative(e.target.value)}
                className="w-full p-2.5 text-xs bg-paper rounded-lg border border-rule text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden font-normal disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block mb-1">
                Initial action routing and agency jurisdiction <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className={`p-2.5 rounded-lg border cursor-pointer flex items-center space-x-2 text-xs transition-colors ${
                  routingType === 'MDRRMO' ? 'bg-paper border-accent font-semibold text-ink shadow-2xs' : 'bg-paper-2 border-rule text-muted'
                }`}>
                  <input
                    type="radio"
                    name="routing"
                    checked={routingType === 'MDRRMO'}
                    onChange={() => setRoutingType('MDRRMO')}
                    className="text-accent focus-visible:ring-2 focus-visible:ring-focus"
                  />
                  <span>MDRRMO emergency desk (Rescue operations)</span>
                </label>

                <label className={`p-2.5 rounded-lg border cursor-pointer flex items-center space-x-2 text-xs transition-colors ${
                  routingType === 'LGU' ? 'bg-paper border-accent font-semibold text-ink shadow-2xs' : 'bg-paper-2 border-rule text-muted'
                }`}>
                  <input
                    type="radio"
                    name="routing"
                    checked={routingType === 'LGU'}
                    onChange={() => setRoutingType('LGU')}
                    className="text-accent focus-visible:ring-2 focus-visible:ring-focus"
                  />
                  <span>LGU traffic and transport division</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-rule">
            <button
              type="button"
              onClick={() => setIsNewCaseModalOpen(false)}
              className="px-5 py-2 text-xs text-muted hover:text-ink hover:bg-paper-3 active:bg-paper-2 rounded-lg font-semibold cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 whitespace-nowrap"
            >
              <span className="whitespace-nowrap">Cancel</span>
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-accent hover:bg-accent/90 active:bg-accent/80 text-accent-ink rounded-lg text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="whitespace-nowrap">Register accident</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
