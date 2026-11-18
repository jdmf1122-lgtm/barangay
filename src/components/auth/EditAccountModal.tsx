import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCheck, 
  CheckCircle2, 
  Mail, 
  AlertCircle,
  Save,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AgencyType, UserRole, User } from '../../types';

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

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
    'Lead Systems & Security Administrator',
    'Municipal Database Administrator',
    'Network Operations Specialist'
  ]
};

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  onClose,
  userToEdit
}) => {
  const { currentUser, updateUser } = useAuth();
  const targetUser = userToEdit || currentUser;

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [agencyType, setAgencyType] = useState<AgencyType>('MDRRMO');
  const [barangay, setBarangay] = useState('San Miguel');
  const [email, setEmail] = useState('');
  const [badgeOrIdNumber, setBadgeOrIdNumber] = useState('');

  const [role, setRole] = useState<UserRole>('MDRRMO_OFFICER');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [showConfirmPasscode, setShowConfirmPasscode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (targetUser && isOpen) {
      setName(targetUser.name || '');
      setPosition(targetUser.position || '');
      setAgencyType(targetUser.agencyType || 'MDRRMO');
      setBarangay(targetUser.barangay || 'San Miguel');
      setEmail(targetUser.email || '');
      setBadgeOrIdNumber(targetUser.badgeOrIdNumber || '');

      setRole(targetUser.role || 'MDRRMO_OFFICER');
      setPasscode(targetUser.passcode || '');
      setConfirmPasscode(targetUser.passcode || '');
      setError(null);
      setSuccess(false);
    }
  }, [targetUser, isOpen]);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide the official account name.');
      return;
    }

    if (!position.trim()) {
      setError('Please provide the position or designation.');
      return;
    }

    if (passcode.trim() && passcode.trim().length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    if (passcode.trim() !== confirmPasscode.trim()) {
      setError('Hindi tugma ang password (Passwords do not match). Siguraduhing pareho ang Password at Confirm Password.');
      return;
    }

    let resolvedAgencyName = targetUser.agencyName;
    if (agencyType === 'MDRRMO') {
      resolvedAgencyName = 'MDRRMO Roxas Emergency & Rescue Operations';
    } else if (agencyType === 'LGU') {
      resolvedAgencyName = 'Municipal Government of Roxas (LGU Admin)';
    } else if (agencyType === 'ADMIN') {
      resolvedAgencyName = 'B-CONNECT Municipal IT & Operations';
    }

    const updated = updateUser(targetUser.id, {
      name: name.trim(),
      position: position.trim(),
      agencyType,
      agencyName: resolvedAgencyName,
      barangay: agencyType === 'RESIDENT' ? barangay : undefined,
      email: email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@roxas.gov.ph`,
      badgeOrIdNumber: badgeOrIdNumber.trim() || undefined,
      role,
      passcode: passcode.trim() || targetUser.passcode || '',
      avatarUrl: agencyType === 'MDRRMO' ? '/mdrrmo_logo.png' : agencyType === 'LGU' ? '/lgu_logo.png' : targetUser.avatarUrl
    });

    if (updated) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 700);
    } else {
      setError('Failed to update account. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60">
      <div 
        id="modal-edit-account"
        className="bg-paper text-ink w-full max-w-xl rounded-xl shadow-card border border-rule overflow-hidden flex flex-col max-h-[92dvh]"
      >
        {/* Header */}
        <div className="p-4 bg-paper-2 border-b border-rule flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-paper border border-rule flex items-center justify-center text-accent shadow-xs flex-shrink-0 overflow-hidden">
              {agencyType === 'MDRRMO' ? (
                <img src="/mdrrmo_logo.png" alt="MDRRMO" className="w-full h-full object-contain p-0.5" />
              ) : agencyType === 'LGU' ? (
                <img src="/lgu_logo.png" alt="LGU" className="w-full h-full object-contain p-0.5" />
              ) : (
                <UserCheck className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-ink flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="truncate">Edit Account Profile</span>
                <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-paper border border-rule text-accent font-mono font-bold flex-shrink-0">
                  {targetUser.id}
                </span>
              </h3>
              <p className="text-xs text-muted mt-0.5 truncate">
                Update account display name, designation, and agency
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-edit-account-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-paper-3 transition-colors cursor-pointer flex-shrink-0 ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-paper-2 border border-rule rounded-lg text-xs text-error font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-paper-2 border border-rule rounded-lg text-xs text-accent font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
              <span>Account details saved successfully!</span>
            </div>
          )}

          {/* Home Barangay Display for RESIDENT */}
          {agencyType === 'RESIDENT' && (
            <div className="space-y-1 bg-paper-2 p-3 rounded-lg border border-rule">
              <label className="block text-xs font-semibold text-ink">
                Home Barangay sa Roxas:
              </label>
              <div className="w-full px-3 py-2 bg-paper border border-rule rounded-lg text-xs text-ink font-bold cursor-not-allowed select-none">
                Barangay {barangay}
              </div>
            </div>
          )}

          {/* Full Name and Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-ink">
                Account / official name <span className="text-error">*</span>
              </label>
              <input
                id="input-edit-account-name"
                type="text"
                placeholder="e.g., Dir. Antonio C. Del Rosario"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-paper-2 border border-rule rounded-lg text-xs text-ink font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-ink">
                Position / designation <span className="text-error">*</span>
              </label>
              <input
                id="input-edit-account-position"
                type="text"
                placeholder="e.g., Municipal Local Government Operations Officer"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 bg-paper-2 border border-rule rounded-lg text-xs text-ink font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
                required
              />
            </div>
          </div>

          {/* Quick Suggestions for Position */}
          {POSITION_SUGGESTIONS[agencyType] && (
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted block">
                Common designations (click to apply):
              </span>
              <div className="flex flex-wrap gap-1">
                {POSITION_SUGGESTIONS[agencyType].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setPosition(sug)}
                    className="px-2 py-0.5 rounded-md bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-medium text-ink transition-colors active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Official Email */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-ink flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-muted" />
              <span>Official email</span>
            </label>
            <input
              id="input-edit-account-email"
              type="email"
              placeholder="officer@roxas.gov.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-paper-2 border border-rule rounded-lg text-xs text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
            />
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-ink flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-muted" />
                <span>Account password / PIN</span>
              </label>
              <div className="relative">
                <input
                  id="input-edit-account-passcode"
                  type={showPasscode ? 'text' : 'password'}
                  placeholder="Min. 4 characters"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-paper-2 border border-rule rounded-lg text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
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

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-ink flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-muted" />
                <span>Confirm password</span>
              </label>
              <div className="relative">
                <input
                  id="input-edit-account-confirm-passcode"
                  type={showConfirmPasscode ? 'text' : 'password'}
                  placeholder="Re-type password"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  className={`w-full pl-3 pr-10 py-2 bg-paper-2 border rounded-lg text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 ${
                    confirmPasscode && passcode !== confirmPasscode
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

          {/* Action buttons */}
          <div className="pt-4 border-t border-rule flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-paper hover:bg-paper-3 text-ink border border-rule rounded-lg text-xs font-semibold transition-colors active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              id="btn-submit-edit-account"
              type="submit"
              className="px-4 py-2 bg-accent text-accent-ink hover:opacity-90 rounded-lg text-xs font-bold transition-opacity active:scale-[0.98] flex items-center gap-1.5 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
