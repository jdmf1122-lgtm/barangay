import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  User, 
  MapPin, 
  FileText, 
  ShieldAlert, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Car,
  Bike,
  Activity,
  Ambulance
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

  const isBarangayOfficer = currentUser?.agencyType === 'MDRRMO' && !!currentUser?.barangay;

  // Form State - Accident Core
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('Motorcycle vs Motorcycle Collision');
  const [barangay, setBarangay] = useState(currentUser.barangay || ROXAS_BARANGAYS[0]);
  const [specificLocation, setSpecificLocation] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [initialNarrative, setInitialNarrative] = useState('');
  const [dateReported, setDateReported] = useState(new Date().toISOString().split('T')[0]);

  // Crash Dynamics & Conditions
  const [collisionImpactType, setCollisionImpactType] = useState('Intersection Collision');
  const [roadSurfaceCondition, setRoadSurfaceCondition] = useState('Dry & Clear');
  const [weatherCondition, setWeatherCondition] = useState('Clear & Sunny');
  const [injuriesCount, setInjuriesCount] = useState<number>(0);
  const [casualtiesCount, setCasualtiesCount] = useState<number>(0);
  const [isHitAndRun, setIsHitAndRun] = useState(false);
  const [respondingAmbulanceUnit, setRespondingAmbulanceUnit] = useState('MDRRMO Rescue Ambulance');
  const [hospitalTransported, setHospitalTransported] = useState('');

  // Primary Vehicle / Party 1 (Complainant / Driver 1)
  const [v1Type, setV1Type] = useState('Motorcycle');
  const [v1MakeModel, setV1MakeModel] = useState('');
  const [v1Plate, setV1Plate] = useState('');
  const [v1DriverName, setV1DriverName] = useState('');
  const [v1DriverContact, setV1DriverContact] = useState('');
  const [v1DriverAddress, setV1DriverAddress] = useState('');
  const [v1DriverCondition, setV1DriverCondition] = useState<'Uninjured' | 'Minor Scratches/Bruises' | 'Hospitalized' | 'Fatal'>('Minor Scratches/Bruises');
  const [v1Damage, setV1Damage] = useState<'Minor Dent/Scratch' | 'Moderate Functional Damage' | 'Severe / Total Wreck'>('Moderate Functional Damage');
  const [v1Helmet, setV1Helmet] = useState(true);

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

  if (!isNewCaseModalOpen) return null;

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
    let initialStatus: CaseStatus = 'Unresolved';

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
      casualtiesCount,
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
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div 
        id="new-case-modal-card"
        className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30 flex-shrink-0">
              <Car className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-xs sm:text-sm md:text-base text-white tracking-tight flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="truncate">Record Vehicular Accident</span>
                <span className="hidden sm:inline-block text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30 font-semibold flex-shrink-0">
                  Crash Desk
                </span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                Official Incident Docketing • Roxas, Oriental Mindoro
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNewCaseModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 sm:p-5 text-xs space-y-4 sm:space-y-5">
          
          {/* Section 1: Accident Core & Classification */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <FileText className="w-4 h-4 text-blue-600" />
              1. Accident Identification, Category & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Accident / Crash Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Motorcycle vs Tricycle Collision along Morente Ave / Strong Republic Nautical Highway"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Accident Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                  className="w-full p-2 text-xs bg-white rounded-lg border border-slate-300 font-semibold text-blue-900"
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
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Barangay Jurisdiction <span className="text-rose-500">*</span>
                </label>
                {isBarangayOfficer ? (
                  <div className="w-full p-2 text-xs bg-emerald-50 text-emerald-950 rounded-lg border border-emerald-300 font-bold flex items-center justify-between">
                    <span>Brgy. {currentUser.barangay}</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                      Jurisdiction Locked
                    </span>
                  </div>
                ) : (
                  <select
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    className="w-full p-2 text-xs bg-white rounded-lg border border-slate-300 font-medium"
                  >
                    {ROXAS_BARANGAYS.map((b) => (
                      <option key={b} value={b}>Brgy. {b}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Date of Accident <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  required
                  value={dateReported}
                  onChange={(e) => setDateReported(e.target.value)}
                  className="w-full p-2 text-xs bg-white rounded-lg border border-slate-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Specific Location (Purok / Highway / Landmark) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Corner Morente Ave & Nautical Highway / Sitio Riverside Curve"
                    value={specificLocation}
                    onChange={(e) => setSpecificLocation(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2 text-xs bg-white rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Urgency Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full p-2 text-xs bg-white rounded-lg border border-slate-300 font-semibold"
                >
                  <option value="Low">Low (Minor Fender Bender / Scratch)</option>
                  <option value="Medium">Medium (Moderate Damage / Clear Road)</option>
                  <option value="High">High (Road Blocked / Medical Attention)</option>
                  <option value="Urgent">Urgent (Hospitalization / Hit-and-Run / Major Highway Block)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Crash Dynamics & Environmental Conditions */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Activity className="w-4 h-4 text-amber-600" />
              2. Crash Dynamics, Road Environment & Medical Casualties
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Collision Impact Type</label>
                <select
                  value={collisionImpactType}
                  onChange={(e) => setCollisionImpactType(e.target.value)}
                  className="w-full p-2 text-xs bg-white rounded-lg border border-slate-300 font-medium"
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
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Road Surface Condition</label>
                <select
                  value={roadSurfaceCondition}
                  onChange={(e) => setRoadSurfaceCondition(e.target.value)}
                  className="w-full p-2 text-xs bg-white rounded-lg border border-slate-300 font-medium"
                >
                  <option value="Dry & Clear">Dry & Clear Asphalt/Concrete</option>
                  <option value="Wet / Slippery">Wet / Slippery Tarmac</option>
                  <option value="Gravel / Muddy">Loose Gravel / Sand Spill / Muddy</option>
                  <option value="Potholes / Under Construction">Potholes / Road Construction</option>
                  <option value="Blind Curve / Steep Gradient">Blind Curve / Steep Slope</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Weather Condition</label>
                <select
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                  className="w-full p-2 text-xs bg-white rounded-lg border border-slate-300 font-medium"
                >
                  <option value="Clear & Sunny">Clear & Sunny</option>
                  <option value="Heavy Rain / Storm">Heavy Rain / Downpour</option>
                  <option value="Overcast / Drizzle">Overcast / Light Drizzle</option>
                  <option value="Foggy / Night Dark">Night Time / Dark Road</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Injured Persons Count</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={injuriesCount}
                  onChange={(e) => setInjuriesCount(parseInt(e.target.value) || 0)}
                  className="w-full p-2 text-xs bg-white rounded-lg border border-slate-300 font-bold text-rose-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center space-x-2 text-xs font-bold text-rose-800 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={isHitAndRun}
                    onChange={(e) => setIsHitAndRun(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                  />
                  <span>Suspect vehicle fled the scene (Hit-and-Run)</span>
                </label>
              </div>

              {injuriesCount > 0 && (
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-rose-50 rounded-lg border border-rose-200">
                  <div>
                    <label className="text-[10px] font-bold text-rose-900 block">Responding Ambulance / First Aid Unit</label>
                    <input
                      type="text"
                      value={respondingAmbulanceUnit}
                      onChange={(e) => setRespondingAmbulanceUnit(e.target.value)}
                      placeholder="e.g., MDRRMO Alpha-1 / Barangay Tanod Responder"
                      className="w-full p-1.5 text-xs bg-white rounded border border-rose-300 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-rose-900 block">Hospital Transported To (if any)</label>
                    <input
                      type="text"
                      value={hospitalTransported}
                      onChange={(e) => setHospitalTransported(e.target.value)}
                      placeholder="e.g., Oriental Mindoro Southern District Hospital"
                      className="w-full p-1.5 text-xs bg-white rounded border border-rose-300 font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Vehicles & Drivers Involved */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Car className="w-4 h-4 text-indigo-600" />
              3. Involved Vehicles & Driver Profiles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle 1 Card */}
              <div className="p-3.5 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
                  <span className="font-bold text-blue-900 text-xs flex items-center gap-1">
                    <Bike className="w-3.5 h-3.5 text-blue-600" />
                    Vehicle 1 / Primary Reporting Driver
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">Party 1</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block">Vehicle Classification</label>
                    <select
                      value={v1Type}
                      onChange={(e) => setV1Type(e.target.value)}
                      className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300 font-medium"
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
                    <label className="text-[10px] font-semibold text-slate-600 block">Make & Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Honda Click 125i"
                      value={v1MakeModel}
                      onChange={(e) => setV1MakeModel(e.target.value)}
                      className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block">Plate / MV File No.</label>
                    <input
                      type="text"
                      placeholder="e.g. 8912-MC"
                      value={v1Plate}
                      onChange={(e) => setV1Plate(e.target.value)}
                      className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block">Driver Condition</label>
                    <select
                      value={v1DriverCondition}
                      onChange={(e) => setV1DriverCondition(e.target.value as any)}
                      className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300 font-medium"
                    >
                      <option value="Uninjured">Uninjured</option>
                      <option value="Minor Scratches/Bruises">Minor Scratches / First Aid</option>
                      <option value="Hospitalized">Hospitalized / Fractures</option>
                      <option value="Fatal">Fatal / Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Driver Full Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Carlos Dalisay"
                    value={v1DriverName}
                    onChange={(e) => setV1DriverName(e.target.value)}
                    className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="0917-xxx-xxxx"
                      value={v1DriverContact}
                      onChange={(e) => setV1DriverContact(e.target.value)}
                      className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block">Damage Severity</label>
                    <select
                      value={v1Damage}
                      onChange={(e) => setV1Damage(e.target.value as any)}
                      className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300 font-medium"
                    >
                      <option value="Minor Dent/Scratch">Minor Dent / Scratches</option>
                      <option value="Moderate Functional Damage">Moderate Functional Damage</option>
                      <option value="Severe / Total Wreck">Severe / Total Wreck</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Vehicle 2 / Pedestrian Card */}
              <div className="p-3.5 bg-white rounded-xl border border-rose-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-rose-100 pb-1.5">
                  <span className="font-bold text-rose-900 text-xs flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-rose-600" />
                    Vehicle 2 / Second Party / Pedestrian
                  </span>
                  <label className="flex items-center space-x-1 text-[10px] text-slate-600 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasParty2}
                      onChange={(e) => setHasParty2(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Include Party 2</span>
                  </label>
                </div>

                {hasParty2 ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Classification</label>
                        <select
                          value={v2Type}
                          onChange={(e) => setV2Type(e.target.value)}
                          className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300 font-medium"
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
                        <label className="text-[10px] font-semibold text-slate-600 block">Make & Model</label>
                        <input
                          type="text"
                          placeholder="e.g. Bajaj RE / Toyota Vios"
                          value={v2MakeModel}
                          onChange={(e) => setV2MakeModel(e.target.value)}
                          className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Plate Number</label>
                        <input
                          type="text"
                          placeholder="e.g. 4821-TG"
                          value={v2Plate}
                          onChange={(e) => setV2Plate(e.target.value)}
                          className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Driver Condition</label>
                        <select
                          value={v2DriverCondition}
                          onChange={(e) => setV2DriverCondition(e.target.value as any)}
                          className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300 font-medium"
                        >
                          <option value="Uninjured">Uninjured</option>
                          <option value="Minor Scratches/Bruises">Minor Scratches / First Aid</option>
                          <option value="Hospitalized">Hospitalized / Fractures</option>
                          <option value="Fatal">Fatal / Critical</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Driver / Party 2 Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Danilo Hernandez"
                        value={v2DriverName}
                        onChange={(e) => setV2DriverName(e.target.value)}
                        className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300 font-medium"
                      />
                    </div>

                    {/* Official Involvement Toggle */}
                    <div className="pt-1">
                      <label className="flex items-center space-x-2 text-[11px] font-bold text-rose-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isRespondentOfficial}
                          onChange={(e) => setIsRespondentOfficial(e.target.checked)}
                          className="rounded text-rose-600"
                        />
                        <span>Party 2 is an Official / Government Service Vehicle</span>
                      </label>

                      {isRespondentOfficial && (
                        <div className="mt-2 p-2 bg-rose-50 rounded border border-rose-200 space-y-1.5">
                          <div>
                            <label className="text-[10px] font-semibold text-rose-900 block">Official Position / Role</label>
                            <input
                              type="text"
                              value={officialPosition}
                              onChange={(e) => setOfficialPosition(e.target.value)}
                              placeholder="e.g. Municipal Driver, Barangay Kagawad"
                              className="w-full p-1 text-xs bg-white rounded border border-rose-300"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-rose-900 block">Agency / Unit</label>
                            <input
                              type="text"
                              value={officialAgency}
                              onChange={(e) => setOfficialAgency(e.target.value)}
                              placeholder="e.g. Municipal Government of Roxas, MDRRMO"
                              className="w-full p-1 text-xs bg-white rounded border border-rose-300"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-slate-400 italic text-xs">
                    Single vehicle crash (skid, fixed object, canal rollover, or self-accident).
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block">Witness / Responding Tanod Name (Optional)</label>
              <input
                type="text"
                placeholder="Name of primary witness or tanod first responder"
                value={witnessName}
                onChange={(e) => setWitnessName(e.target.value)}
                className="w-full p-2 text-xs bg-white rounded-lg border border-slate-300"
              />
            </div>
          </div>

          {/* Section 4: Narrative & Agency Action Routing */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Layers className="w-4 h-4 text-blue-600" />
              4. Factual Crash Narrative & Multi-Agency Action Routing
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Factual Sequence of Events / Crash Statement <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="State the point of origin, direction of travel, speed estimates, point of impact, vehicle damages, roadway obstacles, and on-site settlement status..."
                value={initialNarrative}
                onChange={(e) => setInitialNarrative(e.target.value)}
                className="w-full p-2.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-normal"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Initial Action Routing / Agency Jurisdiction <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center space-x-2 text-xs transition ${
                  routingType === 'MDRRMO' ? 'bg-orange-50 border-orange-500 font-bold text-orange-900 shadow-2xs' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="routing"
                    checked={routingType === 'MDRRMO'}
                    onChange={() => setRoutingType('MDRRMO')}
                  />
                  <span>MDRRMO Emergency Desk (Rescue Operations)</span>
                </label>

                <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center space-x-2 text-xs transition ${
                  routingType === 'LGU' ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900 shadow-2xs' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="routing"
                    checked={routingType === 'LGU'}
                    onChange={() => setRoutingType('LGU')}
                  />
                  <span>LGU Traffic & Transport Division</span>
                </label>




              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewCaseModalOpen(false)}
              className="px-5 py-2.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Register Accident Dossier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
