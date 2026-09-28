import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert,
  Building2, 
  Landmark, 
  CheckCircle2, 
  Settings, 
  UserPlus, 
  LogIn, 
  Mail, 
  AlertCircle, 
  KeyRound,
  Eye,
  EyeOff,
  ChevronDown,
  Check
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AgencyType, UserRole, ROXAS_BARANGAYS, User as UserType } from '../../types';



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

export const AuthPage: React.FC = () => {
  const { login, loginWithCredentials, registerUser } = useAuth();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPasscode, setLoginPasscode] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regAgencyType, setRegAgencyType] = useState<AgencyType>('MDRRMO');
  const [regBarangay, setRegBarangay] = useState<string>(ROXAS_BARANGAYS[0]);
  const [isBarangayDropdownOpen, setIsBarangayDropdownOpen] = useState(false);
  const barangayDropdownRef = useRef<HTMLDivElement>(null);
  const [regPosition, setRegPosition] = useState('MDRRMO Operations Head / Admin');
  const [regRole, setRegRole] = useState<UserRole>('MDRRMO_ADMIN');
  const [regBadge, setRegBadge] = useState('MDRRMO-ROX-2026');
  const [regEmail, setRegEmail] = useState('');
  const [regPasscode, setRegPasscode] = useState('jarinyes');
  const [regConfirmPasscode, setRegConfirmPasscode] = useState('jarinyes');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (barangayDropdownRef.current && !barangayDropdownRef.current.contains(event.target as Node)) {
        setIsBarangayDropdownOpen(false);
      }
    };
    if (isBarangayDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBarangayDropdownOpen]);

  const [regError, setRegError] = useState<string | null>(null);

  const getAgencyBadge = (agency: AgencyType) => {
    switch (agency) {
      case 'RESIDENT':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', icon: UserPlus, label: 'Resident Citizen' };
      case 'MDRRMO':
        return { bg: 'bg-orange-50 text-orange-700 border-orange-200', icon: ShieldAlert, label: 'MDRRMO (Emergency Ops)' };
      case 'LGU':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Landmark, label: 'Municipal LGU (Admin)' };
      case 'ADMIN':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Settings, label: 'System Admin' };
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: Building2, label: 'Agency' };
    }
  };

  const handleAgencyChange = (newAgency: AgencyType) => {
    setRegAgencyType(newAgency);
    const suggestions = POSITION_SUGGESTIONS[newAgency] || [];
    setRegPosition(suggestions[0] || '');

    switch (newAgency) {
      case 'RESIDENT':
        setRegRole('RESIDENT');
        setRegBadge(`RES-${(regBarangay || 'SAQ').slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
        break;
      case 'MDRRMO':
        setRegRole('MDRRMO_ADMIN');
        setRegBadge(`MDRRMO-ROX-${Math.floor(100 + Math.random() * 900)}`);
        break;
      case 'LGU':
        setRegRole('LGU_ADMINISTRATOR');
        setRegBadge(`LGU-ROX-${Math.floor(100 + Math.random() * 900)}`);
        break;
      case 'ADMIN':
        setRegRole('SYSTEM_ADMIN');
        setRegBadge(`SYS-ADM-${Math.floor(10 + Math.random() * 90)}`);
        break;
    }
  };

  const getAgencyName = (): string => {
    switch (regAgencyType) {
      case 'RESIDENT':
        return `Barangay ${regBarangay} Resident Citizen`;
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your Email, Badge ID, or Full Name to sign in.');
      return;
    }

    const result = await loginWithCredentials(loginIdentifier, loginPasscode);
    if (!result.success) {
      setLoginError(result.message || 'Account not found. Please verify your credentials or register a new account.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Please provide the official full name.');
      return;
    }

    if (!regPosition.trim()) {
      setRegError('Please provide the position or designation.');
      return;
    }

    if (!regPasscode.trim()) {
      setRegError('Please set a password / passcode for your account.');
      return;
    }

    if (regPasscode.trim().length < 4) {
      setRegError('Password must be at least 4 characters long.');
      return;
    }

    if (regPasscode.trim() !== regConfirmPasscode.trim()) {
      setRegError('Hindi tugma ang kinumpirmang password (Passwords do not match). Siguraduhing pareho ang Password at Confirm Password.');
      return;
    }

    const cleanEmail = regEmail.trim() || `${regName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@${regAgencyType === 'MDRRMO' ? 'mdrrmo.' : ''}roxas.gov.ph`;

    const newUserPayload: Omit<UserType, 'id'> & { passcode: string } = {
      name: regName.trim(),
      role: regRole,
      agencyType: regAgencyType,
      agencyName: getAgencyName(),
      barangay: regAgencyType === 'RESIDENT' ? regBarangay : undefined,
      position: regPosition.trim(),
      badgeOrIdNumber: regBadge.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      email: cleanEmail,
      passcode: regPasscode.trim(),

    };

    try {
      const createdUser = await registerUser(newUserPayload);
      // Immediately log in with the newly created account
      login(createdUser);
    } catch (error: any) {
      setRegError(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div id="auth-portal-page" className="min-h-screen bg-[#f5fbf7] text-slate-900 flex flex-col justify-between selection:bg-emerald-600 selection:text-white" style={{ backgroundColor: '#f5fbf7' }}>
      {/* Top Government Banner */}
      <header className="border-b border-emerald-200/80 bg-white/90 backdrop-blur-md py-3 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-sm shadow-md border border-emerald-400/40">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-emerald-950">
                B-CONNECT
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                Official Gateway
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/80 font-medium">
              Municipality of Roxas, Oriental Mindoro • Katarungang Pambarangay & Multi-Agency Network
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs text-emerald-800/80 font-semibold">
          <span className="flex items-center gap-1.5 font-medium text-emerald-900">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" /> {ROXAS_BARANGAYS.length} Component Barangays
          </span>
          <span className="text-emerald-300">•</span>
          <span className="flex items-center gap-1.5 font-medium text-emerald-900">
            <Landmark className="w-3.5 h-3.5 text-emerald-600" /> Municipal LGU Administration
          </span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-xl bg-white border border-emerald-200 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">
          
          {/* Mode Switcher Tabs */}
          <div className="space-y-6">
            <div className="flex items-center p-1 bg-emerald-50/80 rounded-2xl border border-emerald-200">
              <button
                id="tab-btn-login"
                onClick={() => {
                  setAuthMode('login');
                  setLoginError(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-950 hover:bg-emerald-100/50'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Log In (Existing Account)</span>
              </button>
              <button
                id="tab-btn-register"
                onClick={() => {
                  setAuthMode('register');
                  setRegError(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-950 hover:bg-emerald-100/50'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Account</span>
              </button>
            </div>

              {/* ----------------- TAB 1: LOG IN ----------------- */}
              {authMode === 'login' ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                      <LogIn className="w-5 h-5 text-emerald-600" />
                      Sign In to Official Account
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Enter your authorized agency email or User ID and password to log in.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Manual Credentials Form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Official Email or User ID: <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="input-login-email"
                          type="text"
                          autoComplete="username"
                          autoFocus
                          placeholder="e.g., mdrrmo@roxas.gov.ph or USR-MDRRMO-01"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-emerald-50/30 border border-emerald-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">
                          Password / PIN Passcode: <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] text-emerald-700 font-medium">Secure Access</span>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="input-login-passcode"
                          type={showLoginPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="Enter your password / passcode"
                          value={loginPasscode}
                          onChange={(e) => setLoginPasscode(e.target.value)}
                          className="w-full pl-9 pr-10 py-2.5 bg-emerald-50/30 border border-emerald-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>


                    <button
                      id="btn-submit-login"
                      type="submit"
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98 mt-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to B-CONNECT</span>
                    </button>
                  </form>
                </div>
              ) : (
                /* ----------------- TAB 2: CREATE ACCOUNT ----------------- */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-emerald-600" />
                      Register New Officer Account
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Register your credentials and government agency to obtain authorized access to B-CONNECT.
                    </p>
                  </div>

                  {regError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* 1. Agency Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      1. Agency / Department <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { type: 'RESIDENT' as AgencyType, label: 'Resident Citizen', icon: UserPlus },
                        { type: 'MDRRMO' as AgencyType, label: 'MDRRMO (Emergency Ops)', icon: ShieldAlert },
                        { type: 'LGU' as AgencyType, label: 'Municipal LGU (Admin)', icon: Landmark },
                      ].map((ag) => {
                        const Icon = ag.icon;
                        const isSelected = regAgencyType === ag.type;
                        return (
                          <button
                            key={ag.type}
                            type="button"
                            onClick={() => handleAgencyChange(ag.type)}
                            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/30'
                                : 'bg-white border-emerald-200 text-slate-700 hover:text-emerald-950 hover:bg-emerald-50/50'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                            <span className="text-xs truncate">{ag.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Home Barangay dropdown if RESIDENT is chosen */}
                  {regAgencyType === 'RESIDENT' && (
                    <div className="space-y-1 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200" ref={barangayDropdownRef}>
                      <label className="block text-xs font-bold text-emerald-900">
                        Tinitirahang Barangay sa Roxas (Home Barangay):
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          id="btn-select-barangay"
                          onClick={() => setIsBarangayDropdownOpen((prev) => !prev)}
                          className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs text-slate-900 font-medium flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm text-left transition"
                        >
                          <span className="truncate">Barangay {regBarangay}</span>
                          <ChevronDown className={`w-4 h-4 text-emerald-600 flex-shrink-0 transition-transform duration-200 ${isBarangayDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isBarangayDropdownOpen && (
                          <div 
                            id="barangay-dropdown-menu"
                            className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-emerald-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-emerald-50 py-1"
                          >
                            {ROXAS_BARANGAYS.map((b) => {
                              const isSelected = regBarangay === b;
                              return (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => {
                                    setRegBarangay(b);
                                    setRegBadge(`RES-${b.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
                                    setIsBarangayDropdownOpen(false);
                                  }}
                                  className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between transition cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-50 font-bold text-emerald-950'
                                      : 'text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-950 font-medium'
                                  }`}
                                >
                                  <span>Barangay {b}</span>
                                  {isSelected && (
                                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 ml-2" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Security Role Tier Selector */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Official Security Role Tier <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider font-mono">
                        System POV: {regRole}
                      </span>
                    </label>
                    <select
                      id="select-register-role"
                      value={regRole}
                      onChange={(e) => {
                        const newRole = e.target.value as UserRole;
                        setRegRole(newRole);
                        if (newRole === 'MDRRMO_OFFICER' && regPosition.includes('Head')) {
                          setRegPosition('Emergency Medical Responder (EMR)');
                        } else if (newRole === 'MDRRMO_ADMIN' && regPosition.includes('Responder')) {
                          setRegPosition('MDRRMO Operations Head / Admin');
                        } else if (newRole === 'LGU_OFFICER' && regPosition.includes('Administrator')) {
                          setRegPosition('Public Order & Safety Office (POSO) Head');
                        } else if (newRole === 'LGU_ADMINISTRATOR' && regPosition.includes('Order')) {
                          setRegPosition('Municipal Administrator (LGU Admin)');
                        }
                      }}
                      className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    >
                      {regAgencyType === 'MDRRMO' && (
                        <>
                          <option value="MDRRMO_ADMIN">MDRRMO_ADMIN (Operations Head / Dispatch Chief)</option>
                          <option value="MDRRMO_OFFICER">MDRRMO_OFFICER (Emergency Medical Responder / Crash Investigator / Ambulance Lead)</option>
                        </>
                      )}
                      {regAgencyType === 'LGU' && (
                        <>
                          <option value="LGU_ADMINISTRATOR">LGU_ADMINISTRATOR (Mayor / Municipal Administrator / Executive Staff)</option>
                          <option value="LGU_OFFICER">LGU_OFFICER (Public Order & Safety / Municipal Legal / MENRO / MSWDO)</option>
                        </>
                      )}
                      {regAgencyType === 'RESIDENT' && (
                        <option value="RESIDENT">RESIDENT (Verified Resident Citizen)</option>
                      )}
                    </select>
                  </div>

                  {/* 2. Full Name & Position */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Hon. Juan Dela Cruz"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Position / Designation <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Punong Barangay or Secretary"
                        value={regPosition}
                        onChange={(e) => setRegPosition(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Position Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {POSITION_SUGGESTIONS[regAgencyType].slice(0, 4).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setRegPosition(pos)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition font-medium cursor-pointer"
                      >
                        + {pos}
                      </button>
                    ))}
                  </div>

                  {/* 3. Official Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Official Email Address:
                    </label>
                    <input
                      type="email"
                      placeholder="officer@roxas.gov.ph (Optional)"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* 4. Passcode & Confirm Passcode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Create Password / Passcode: <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="input-register-passcode"
                          type={showRegPassword ? 'text' : 'password'}
                          placeholder="Min. 4 characters"
                          value={regPasscode}
                          onChange={(e) => setRegPasscode(e.target.value)}
                          className="w-full pl-3 pr-10 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Confirm Password: <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="input-register-confirm-passcode"
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          placeholder="Re-type password"
                          value={regConfirmPasscode}
                          onChange={(e) => setRegConfirmPasscode(e.target.value)}
                          className={`w-full pl-3 pr-10 py-2 bg-white border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 ${
                            regConfirmPasscode && regPasscode !== regConfirmPasscode
                              ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                              : 'border-emerald-200 focus:ring-emerald-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {regConfirmPasscode && regPasscode !== regConfirmPasscode && (
                        <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
                          ⚠ Hindi tugma ang mga password
                        </p>
                      )}
                    </div>
                  </div>



                  <button
                    id="btn-submit-register"
                    type="submit"
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98 mt-4"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register & Sign In Immediately</span>
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Switcher Helper */}
            <div className="pt-6 border-t border-emerald-100 text-center text-xs text-slate-600 font-medium">
              {authMode === 'login' ? (
                <div>
                  Don't have an official account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setRegError(null);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                  >
                    Register an Account here →
                  </button>
                </div>
              ) : (
                <div>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setLoginError(null);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                  >
                    Sign In here →
                  </button>
                </div>
              )}
            </div>

          </div>
        </main>

      {/* Footer */}
      <footer className="py-3 px-6 text-center text-[11px] text-emerald-800/80 border-t border-emerald-100 font-medium bg-white/60">
        B-CONNECT Multi-Agency Incident & Case Tracking Network • Municipality of Roxas, Oriental Mindoro • Katarungang Pambarangay & DILG Governance Compliance
      </footer>
    </div>
  );
};
