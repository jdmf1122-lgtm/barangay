import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Shield,
  ShieldAlert,
  Building2,
  Landmark,
  CheckCircle2,
  Settings,
  Mail,
  UserCheck,
  Sparkles,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { AgencyType, UserRole, ROXAS_BARANGAYS, User } from '../../types';



const POSITION_SUGGESTIONS: Record<AgencyType, string[]> = {
  RESIDENT: [
    'Verified Resident Citizen',
    'Homeowner / Resident Complainant',
    'Barangay Youth Resident (SK)',
    'Community Representative'
  ],
  MDRRMO: [
    'MDRRMO Operations Head / Admin',
    'Emergency Medical Responder (EMR)',
    'Rescue Ambulance Unit Lead',
    'Traffic Crash Incident Investigator',
    'Quick Response Team (QRT) Leader',
    'MDRRMO Emergency Dispatcher'
  ],
  LGU: [
    'Municipal Administrator (LGU Admin)',
    'Municipal Legal Officer',
    'Municipal Mayor / Executive Staff',
    'Public Order & Safety Office (POSO) Head',
    'Municipal Social Welfare & Development Officer (MSWDO)',
    'LGU Grievance Desk Officer'
  ],
  ADMIN: [
    'Master Governance Node Administrator',
    'System Security & Database Officer',
    'IT Operations Coordinator'
  ]
};

export const CreateAccountModal: React.FC = () => {
  const { registerUser, setCurrentUser } = useAuth();
  const { isCreateAccountModalOpen, setIsCreateAccountModalOpen } = useUI();

  const [name, setName] = useState('');
  const [agencyType, setAgencyType] = useState<AgencyType>('RESIDENT');
  const [barangay, setBarangay] = useState<string>(ROXAS_BARANGAYS[0]);
  const [position, setPosition] = useState('Verified Resident Citizen');
  const [role, setRole] = useState<UserRole>('RESIDENT');
  const [badgeOrIdNumber, setBadgeOrIdNumber] = useState(`RES-${ROXAS_BARANGAYS[0].slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [showConfirmPasscode, setShowConfirmPasscode] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isCreateAccountModalOpen) {
      setPasscode('');
      setConfirmPasscode('');
      setError(null);
    }
  }, [isCreateAccountModalOpen]);

  if (!isCreateAccountModalOpen) return null;

  const handleAgencyTypeChange = (newAgency: AgencyType) => {
    setAgencyType(newAgency);
    const suggestions = POSITION_SUGGESTIONS[newAgency];
    setPosition(suggestions[0] || '');

    // Set matching default role
    switch (newAgency) {
      case 'RESIDENT':
        setRole('RESIDENT');
        setBadgeOrIdNumber(`RES-${(barangay || 'SAQ').slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
        break;
      case 'MDRRMO':
        setRole('MDRRMO_ADMIN');
        setBadgeOrIdNumber(`MDRRMO-ROX-${Math.floor(100 + Math.random() * 900)}`);
        break;
      case 'LGU':
        setRole('LGU_ADMINISTRATOR');
        setBadgeOrIdNumber(`LGU-ROX-${Math.floor(100 + Math.random() * 900)}`);
        break;
      case 'ADMIN':
        setRole('SYSTEM_ADMIN');
        setBadgeOrIdNumber(`SYS-ADM-${Math.floor(10 + Math.random() * 90)}`);
        break;
    }
  };

  const getAgencyName = (): string => {
    switch (agencyType) {
      case 'RESIDENT':
        return `Barangay ${barangay} Resident Citizen`;
      case 'MDRRMO':
        return 'MDRRMO Roxas Emergency & Rescue Operations';
      case 'LGU':
        return 'Municipal Government of Roxas (LGU Admin)';
      case 'ADMIN':
        return 'System Administration Master Node';
      default:
        return 'Municipal Government of Roxas';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide the official full name.');
      return;
    }

    if (!position.trim()) {
      setError('Please provide the position or designation.');
      return;
    }

    if (!passcode.trim()) {
      setError('Please provide a password for the account.');
      return;
    }

    if (passcode.trim().length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (passcode.trim() !== confirmPasscode.trim()) {
      setError('Hindi tugma ang kinumpirmang password (Passwords do not match).');
      return;
    }

    const cleanEmail = email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@${agencyType === 'MDRRMO' ? 'mdrrmo.' : ''}roxas.gov.ph`;

    const newUserPayload: Omit<User, 'id'> & { passcode: string; avatarUrl?: string } = {
      name: name.trim(),
      role,
      agencyType,
      agencyName: getAgencyName(),
      barangay: agencyType === 'RESIDENT' ? barangay : undefined,
      position: position.trim(),
      badgeOrIdNumber: badgeOrIdNumber.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      email: cleanEmail,
      passcode: passcode.trim(),
      avatarUrl: agencyType === 'MDRRMO' ? '/mdrrmo_logo.png' : agencyType === 'LGU' ? '/lgu_logo.png' : undefined,
    };

    try {
      await registerUser(newUserPayload);

      // Reset and close
      setName('');
      setEmail('');
      setBadgeOrIdNumber('');
      setPasscode('');
      setConfirmPasscode('');
      setIsCreateAccountModalOpen(false);
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div
      id="create-account-modal-overlay"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        id="create-account-modal"
        className="bg-[#f0f7f3] rounded-[32px] shadow-2xl border border-emerald-100 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92dvh] neo-card"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-800/50 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 text-emerald-300 flex-shrink-0">
              <UserPlus className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 truncate">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate">
                  Create Personnel / Citizen Account
                </h3>
                <span className="hidden sm:inline-block text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30 flex-shrink-0">
                  Official Roxas Gateway
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-200/80 mt-0.5 truncate">
                Authorized agency personnel & resident accounts • Municipality of Roxas
              </p>
            </div>
          </div>
          <button
            id="btn-close-create-account"
            onClick={() => setIsCreateAccountModalOpen(false)}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition cursor-pointer flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Agency Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Government Agency / Operating Unit <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { type: 'RESIDENT' as AgencyType, label: 'Resident Citizen', icon: UserPlus, color: 'hover:border-emerald-500' },
                { type: 'ADMIN' as AgencyType, label: 'System Admin', icon: Settings, color: 'hover:border-purple-500' },
              ].map((ag) => {
                const Icon = ag.icon;
                const isSelected = agencyType === ag.type;
                return (
                  <button
                    key={ag.type}
                    type="button"
                    id={`agency-select-${ag.type}`}
                    onClick={() => handleAgencyTypeChange(ag.type)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${isSelected
                      ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20 text-emerald-950 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <div className={`p-2 rounded-lg flex items-center justify-center ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{ag.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{ag.type}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <span className="font-semibold text-slate-700">Official Fixed Accounts: </span>
              <span>Ang MDRRMO (<code className="text-orange-700 font-mono">mdrrmoroxas@gmail.com</code>) at LGU (<code className="text-emerald-700 font-mono">lguroxas@gmail.com</code>) ay permanente at fixed accounts na sa system.</span>
            </div>
          </div>

          {/* 2. Barangay Scope for Resident Citizens */}
          {agencyType === 'RESIDENT' && (
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                Tinitirahang Barangay sa Roxas (Home Barangay) <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-account-barangay"
                value={barangay}
                onChange={(e) => {
                  setBarangay(e.target.value);
                  setBadgeOrIdNumber(`RES-${e.target.value.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
                }}
                className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ROXAS_BARANGAYS.map((b) => (
                  <option key={b} value={b}>
                    Barangay {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Official Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Official Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-account-name"
              type="text"
              required
              placeholder="e.g. Hon. Juan Dela Cruz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 4. Position & Designation */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Position & Designation <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-account-position"
              type="text"
              required
              placeholder="e.g. Punong Barangay / Lupon Chairman"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Suggestions Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 self-center mr-1">Quick Picks:</span>
              {POSITION_SUGGESTIONS[agencyType].slice(0, 4).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPosition(p)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-medium transition cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Role Tier & Official Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Security Role Tier <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-account-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-purple-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {agencyType === 'MDRRMO' && (
                  <>
                    <option value="MDRRMO_ADMIN">MDRRMO_ADMIN (Operations Head / Dispatch Chief)</option>
                    <option value="MDRRMO_OFFICER">MDRRMO_OFFICER (Responder / Investigator / EMR)</option>
                  </>
                )}
                {agencyType === 'RESIDENT' && (
                  <option value="RESIDENT">RESIDENT (Verified Resident Citizen)</option>
                )}
                {agencyType === 'LGU' && (
                  <>
                    <option value="LGU_ADMINISTRATOR">LGU_ADMINISTRATOR (Mayor / Municipal Administrator)</option>
                    <option value="LGU_OFFICER">LGU_OFFICER (Legal / Social / Staff)</option>
                  </>
                )}
                {agencyType === 'ADMIN' && (
                  <option value="SYSTEM_ADMIN">SYSTEM_ADMIN (Master Control Node)</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                Official Gov Email
              </label>
              <input
                id="input-account-email"
                type="email"
                placeholder="officer@roxas.gov.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 6. Security Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                Password / Passcode <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-create-passcode"
                  type={showPasscode ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Min. 4 characters"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-10 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-create-confirm-passcode"
                  type={showConfirmPasscode ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Re-type password"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  className={`w-full bg-slate-50 border rounded-lg pl-3 pr-10 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 ${confirmPasscode && passcode !== confirmPasscode
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-blue-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPasscode(!showConfirmPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showConfirmPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {confirmPasscode && passcode !== confirmPasscode && (
                <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
                  ⚠ Hindi tugma ang mga password
                </p>
              )}
            </div>
          </div>


        </form>

        {/* Footer Actions */}
        <div className="p-4 bg-emerald-50/70 border-t border-emerald-100 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            id="btn-cancel-create-account"
            onClick={() => setIsCreateAccountModalOpen(false)}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-emerald-200 text-slate-700 rounded-full text-xs font-bold transition cursor-pointer shadow-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-submit-create-account"
            onClick={handleSubmit}
            className="neo-btn-pill inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-full text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-white" />
            <span>Create Account & Grant Access</span>
          </button>
        </div>
      </div>
    </div>
  );
};
