import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Building2,
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
  const { registerUser } = useAuth();
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
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        id="create-account-modal"
        className="bg-paper rounded-xl shadow-card border border-rule w-full max-w-2xl overflow-hidden flex flex-col max-h-[92dvh]"
      >
        {/* Header */}
        <div className="bg-paper-2 text-ink p-4 sm:p-5 flex items-center justify-between border-b border-rule flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-lg bg-paper border border-rule text-accent flex-shrink-0">
              <UserPlus className="w-5 h-5 text-accent" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 truncate">
                <h3 className="font-bold text-sm sm:text-base tracking-tight text-ink truncate">
                  Create Personnel / Citizen Account
                </h3>
                <span className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full bg-paper text-accent font-semibold border border-rule flex-shrink-0">
                  Official Roxas Gateway
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5 truncate">
                Authorized agency personnel and resident accounts &middot; Municipality of Roxas
              </p>
            </div>
          </div>
          <button
            id="btn-close-create-account"
            type="button"
            onClick={() => setIsCreateAccountModalOpen(false)}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-paper-3 transition-colors cursor-pointer flex-shrink-0 ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-paper-2 border border-rule rounded-lg text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Agency Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-ink">
              1. Government agency / operating unit <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { type: 'RESIDENT' as AgencyType, label: 'Resident Citizen', icon: UserPlus },
                { type: 'ADMIN' as AgencyType, label: 'System Admin', icon: Building2 },
              ].map((ag) => {
                const Icon = ag.icon;
                const isSelected = agencyType === ag.type;
                return (
                  <button
                    key={ag.type}
                    type="button"
                    id={`agency-select-${ag.type}`}
                    onClick={() => handleAgencyTypeChange(ag.type)}
                    className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-colors active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed ${isSelected
                      ? 'bg-paper-2 border-accent text-ink shadow-xs font-semibold'
                      : 'bg-paper border-rule text-muted hover:text-ink hover:bg-paper-2'
                      }`}
                  >
                    <div className={`p-2 rounded-md flex items-center justify-center border border-rule ${isSelected ? 'bg-accent text-accent-ink' : 'bg-paper-2 text-muted'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-ink">{ag.label}</div>
                      <div className="text-xs text-muted truncate">{ag.type}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-muted bg-paper-2 border border-rule rounded-lg p-2.5">
              <span className="font-semibold text-ink">Official fixed accounts: </span>
              <span>Ang MDRRMO (<code className="font-mono text-accent">mdrrmoroxas@gmail.com</code>) at LGU (<code className="font-mono text-accent">lguroxas@gmail.com</code>) ay permanente at fixed accounts na sa system.</span>
            </div>
          </div>

          {/* 2. Barangay Scope for Resident Citizens */}
          {agencyType === 'RESIDENT' && (
            <div className="p-3.5 bg-paper-2 border border-rule rounded-lg space-y-2">
              <label className="block text-xs font-semibold text-ink flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-accent" />
                Tinitirahang Barangay sa Roxas (Home Barangay) <span className="text-error">*</span>
              </label>
              <select
                id="select-account-barangay"
                value={barangay}
                onChange={(e) => {
                  setBarangay(e.target.value);
                  setBadgeOrIdNumber(`RES-${e.target.value.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
                }}
                className="w-full bg-paper border border-rule rounded-lg px-3 py-2 text-xs font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
            <label className="block text-xs font-semibold text-ink">
              Official full name <span className="text-error">*</span>
            </label>
            <input
              id="input-account-name"
              type="text"
              required
              placeholder="e.g. Hon. Juan Dela Cruz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-paper-2 border border-rule rounded-lg px-3.5 py-2 text-xs text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
            />
          </div>

          {/* 4. Position & Designation */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-ink">
              Position & designation <span className="text-error">*</span>
            </label>
            <input
              id="input-account-position"
              type="text"
              required
              placeholder="e.g. Punong Barangay / Lupon Chairman"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-paper-2 border border-rule rounded-lg px-3.5 py-2 text-xs text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
            />
            {/* Suggestions Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-xs text-muted self-center mr-1">Quick picks:</span>
              {POSITION_SUGGESTIONS[agencyType].slice(0, 4).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPosition(p)}
                  className="px-2 py-0.5 bg-paper-2 hover:bg-paper-3 text-ink border border-rule rounded text-xs font-medium transition-colors active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Role Tier & Official Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink">
                Security role tier <span className="text-error">*</span>
              </label>
              <select
                id="select-account-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-paper-2 border border-rule rounded-lg px-3 py-2 text-xs font-mono font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
              <label className="block text-xs font-semibold text-ink">
                Official gov email
              </label>
              <input
                id="input-account-email"
                type="email"
                placeholder="officer@roxas.gov.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-paper-2 border border-rule rounded-lg px-3.5 py-2 text-xs text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
              />
            </div>
          </div>

          {/* 6. Security Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-muted" />
                Password / Passcode <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-create-passcode"
                  type={showPasscode ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Min. 6 characters"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-paper-2 border border-rule rounded-lg pl-3 pr-10 py-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-muted" />
                Confirm password <span className="text-error">*</span>
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
                  className={`w-full bg-paper-2 border rounded-lg pl-3 pr-10 py-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 ${confirmPasscode && passcode !== confirmPasscode
                    ? 'border-error'
                    : 'border-rule'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPasscode(!showConfirmPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showConfirmPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {confirmPasscode && passcode !== confirmPasscode && (
                <p className="text-xs text-error font-medium mt-0.5">
                  Hindi tugma ang mga password
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 bg-paper-2 border-t border-rule flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            id="btn-cancel-create-account"
            onClick={() => setIsCreateAccountModalOpen(false)}
            className="px-4 py-2 bg-paper hover:bg-paper-3 border border-rule text-ink rounded-lg text-xs font-semibold transition-colors active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-submit-create-account"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 bg-accent text-accent-ink rounded-lg text-xs font-bold transition-opacity hover:opacity-90 active:scale-[0.98] cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-4 h-4" />
            <span className="whitespace-nowrap">Create account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
