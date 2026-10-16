import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldAlert,
  Building2,
  Landmark,
  UserPlus,
  LogIn,
  Mail,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  User,
  ArrowRight,
  Moon,
  Sun,
  ShieldCheck,
  Sparkles,
  X
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

// 3D Emerald Flame / Ribbon Emblem SVG matching the user's reference image
export const GreenRibbonEmblem: React.FC<{ className?: string }> = ({ className = "w-20 h-20" }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft 3D Drop Shadows */}
        <filter id="shadow-deep" x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="-1" dy="6" stdDeviation="4.5" floodColor="#023b2c" floodOpacity="0.4" />
        </filter>
        <filter id="shadow-mid" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="-1" dy="5" stdDeviation="4" floodColor="#047857" floodOpacity="0.35" />
        </filter>
        <filter id="shadow-top" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#059669" floodOpacity="0.25" />
        </filter>

        {/* 1. Top Ribbon: Frosty Pearlescent Mint to White Glass Highlight */}
        <linearGradient id="topRibbonGrad" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="35%" stopColor="#e6fcf5" />
          <stop offset="70%" stopColor="#99f6e4" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>

        {/* 2. Middle Ribbon: Electric Glowing Emerald */}
        <linearGradient id="midRibbonGrad" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="45%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* 3. Bottom Ribbon: Deep Rich Jade & Deep Forest Teal */}
        <linearGradient id="botRibbonGrad" x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#047857" />
          <stop offset="100%" stopColor="#023d2e" />
        </linearGradient>

        {/* Specular Curved Highlight */}
        <linearGradient id="specularSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Layer 3: Bottom Deep Jade Ribbon */}
      <g filter="url(#shadow-deep)">
        <path
          d="M 44 54 C 54 48 68 54 66 69 C 64 82 48 94 40 99 C 37 101 34 98 35 94 C 38 84 34 65 44 54 Z"
          fill="url(#botRibbonGrad)"
        />
        {/* Specular rim */}
        <path
          d="M 44 56 C 51 51 63 56 62 67 C 60 77 47 87 41 93 C 40 85 37 69 44 56 Z"
          fill="url(#specularSheen)"
          opacity="0.3"
        />
      </g>

      {/* Layer 2: Middle Vibrant Emerald Ribbon */}
      <g filter="url(#shadow-mid)">
        <path
          d="M 52 32 C 63 26 78 33 78 48 C 78 63 58 76 51 81 C 48 83 45 81 46 77 C 50 64 45 44 52 32 Z"
          fill="url(#midRibbonGrad)"
        />
        {/* Specular rim */}
        <path
          d="M 53 34 C 61 29 73 35 73 47 C 73 59 57 69 52 75 C 51 66 48 44 53 34 Z"
          fill="url(#specularSheen)"
          opacity="0.45"
        />
      </g>

      {/* Layer 1: Top Crystal White/Mint Ribbon */}
      <g filter="url(#shadow-top)">
        <path
          d="M 62 10 C 74 7 88 15 88 30 C 88 44 72 55 65 61 C 63 63 60 61 61 57 C 64 47 57 23 62 10 Z"
          fill="url(#topRibbonGrad)"
        />
        {/* Bright gloss edge */}
        <path
          d="M 64 12 C 73 10 84 17 84 29 C 84 40 71 49 66 54 C 64 47 60 25 64 12 Z"
          fill="url(#specularSheen)"
          opacity="0.8"
        />
      </g>
    </svg>
  );
};

export const AuthPage: React.FC = () => {
  const { login, loginWithCredentials, registerUser, users } = useAuth();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Ambient lighting / theme toggle
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Remember Me checkbox
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password modal
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Quick action feedback
  const [quickActionNotice, setQuickActionNotice] = useState<string | null>(null);

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
  const [regPasscode, setRegPasscode] = useState('');
  const [regConfirmPasscode, setRegConfirmPasscode] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);

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
      setRegError('Please provide your official full name.');
      return;
    }

    if (!regPosition.trim()) {
      setRegError('Please provide your position or designation.');
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

    if (!regAgreeTerms) {
      setRegError('Please accept the Data Privacy Terms and Guidelines to proceed.');
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
      login(createdUser);
    } catch (error: any) {
      setRegError(error.message || 'Registration failed. Please try again.');
    }
  };

  // Quick Agency Demo Access shortcuts (corresponding to the 3 round icons)
  const handleQuickRoleAccess = (type: 'RESIDENT' | 'MDRRMO' | 'LGU') => {
    const existing = (users || []).find((u) => u.agencyType === type);
    if (existing) {
      setLoginIdentifier(existing.email || existing.badgeOrIdNumber || existing.name);
      setLoginPasscode('jarinyes');
      login(existing);
      return;
    }

    // Default fast login payloads if no stored user in local db
    if (type === 'RESIDENT') {
      const demoRes: UserType = {
        id: 'USR-RES-DEMO',
        name: 'Maria Santos (Resident Citizen)',
        role: 'RESIDENT',
        agencyType: 'RESIDENT',
        agencyName: 'Barangay San Aquilino Resident Citizen',
        barangay: 'San Aquilino',
        position: 'Verified Resident Citizen',
        badgeOrIdNumber: 'RES-SAQ-2026',
        email: 'resident.roxas@orientalmindoro.ph'
      };
      login(demoRes);
    } else if (type === 'MDRRMO') {
      const demoMdr: UserType = {
        id: 'USR-MDR-DEMO',
        name: 'Capt. Edgardo Ramos',
        role: 'MDRRMO_ADMIN',
        agencyType: 'MDRRMO',
        agencyName: 'MDRRMO Roxas Emergency Operations Center',
        position: 'MDRRMO Operations Head / Admin',
        badgeOrIdNumber: 'MDRRMO-ROX-01',
        email: 'mdrrmo@roxas.gov.ph'
      };
      login(demoMdr);
    } else {
      const demoLgu: UserType = {
        id: 'USR-LGU-DEMO',
        name: 'Hon. Mayor Office Admin',
        role: 'LGU_ADMINISTRATOR',
        agencyType: 'LGU',
        agencyName: 'Municipal Government of Roxas (LGU Admin)',
        position: 'Municipal Administrator (LGU Admin)',
        badgeOrIdNumber: 'LGU-ROX-ADMIN',
        email: 'admin@roxas.gov.ph'
      };
      login(demoLgu);
    }
  };

  return (
    <div
      id="auth-portal-page"
      className={`min-h-screen relative overflow-hidden flex flex-col justify-between selection:bg-emerald-600 selection:text-white transition-colors duration-500 ${
        isDarkMode ? 'bg-[#0f1d16] text-emerald-50' : 'neo-bg-soft text-slate-800'
      }`}
    >
      {/* =========================================================================
          Decorative Soft 3D Neomorphic Geometry & Incident Report Background Murals
          ========================================================================= */}

      {/* Top Left: Concentric Neomorphic Ring Contour */}
      <div
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full border-[22px] border-emerald-100/60 pointer-events-none neo-ring-decor hidden sm:block opacity-75"
        aria-hidden="true"
      />
      <div
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full border-[12px] border-emerald-50/80 pointer-events-none hidden sm:block opacity-60"
        aria-hidden="true"
      />

      {/* Mid Right: Floating Soft 3D Mint Sphere */}
      <div
        className="absolute top-1/4 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-[#ffffff] via-[#e2f3e8] to-[#c7e9d4] pointer-events-none neo-sphere-decor hidden md:block opacity-85 transform hover:scale-105 transition-transform"
        aria-hidden="true"
      />

      {/* Bottom Left: Embossed Arc */}
      <div
        className="absolute -bottom-20 -left-16 w-64 h-64 rounded-full border-[20px] border-emerald-100/50 pointer-events-none neo-ring-decor hidden sm:block opacity-65"
        aria-hidden="true"
      />

      {/* Bottom Right: Neomorphic Curved Wave with Typography */}
      <div
        className="absolute -bottom-10 -right-10 w-60 h-60 rounded-tl-[100px] bg-gradient-to-tl from-[#e4f2e9] via-[#edf7f1] to-transparent pointer-events-none hidden lg:flex flex-col items-center justify-center p-8 text-right select-none opacity-80"
        aria-hidden="true"
      >
        <div className="absolute bottom-10 right-10 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-900/60 leading-tight">
          <div>MORE</div>
          <div>THAN</div>
          <div>A PORTAL</div>
          <div className="w-5 h-[2px] bg-emerald-600/40 mt-1.5 ml-auto"></div>
        </div>
      </div>

      {/* =========================================================================
          Top Bar: Discreet Government Header & Dark Mode Button
          ========================================================================= */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-emerald-600/20">
            B
          </div>
          <div>
            <span className="font-extrabold text-xs sm:text-sm tracking-tight text-emerald-950">
              B-CONNECT
            </span>
            <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Roxas, Oriental Mindoro
            </span>
          </div>
        </div>

        {/* Top Right: Theme Mode Neomorphic Squircle Toggle */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Switch to Bright Mode' : 'Switch to Ambient Night'}
          className="w-11 h-11 rounded-2xl neo-squircle-btn flex items-center justify-center text-emerald-900 cursor-pointer transition-transform"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-500 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 text-emerald-800 transition-transform" />
          )}
        </button>
      </div>

      {/* =========================================================================
          Central Hero Container (The Neomorphic Card)
          ========================================================================= */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div
          className={`w-full max-w-[440px] rounded-[38px] sm:rounded-[44px] p-7 sm:p-9 transition-all duration-300 ${
            isDarkMode
              ? 'bg-[#152a20] border border-emerald-800/40 shadow-2xl shadow-emerald-950/80 text-emerald-100'
              : 'neo-card text-slate-800'
          }`}
        >
          {/* 3D Green Ribbon Emblem in Neomorphic Squircle Frame */}
          <div className="flex justify-center mb-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] neo-badge-frame flex items-center justify-center p-3 relative group">
              <GreenRibbonEmblem className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md transition-transform duration-300 group-hover:scale-105" />
            </div>
          </div>

          {/* Title and Subtitle */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0c2e1f]">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {authMode === 'login' ? 'Sign in to continue' : 'Sign up to get started'}
            </p>
          </div>

          {/* Quick Tab Switcher (Soft Neomorphic Pill) */}
          <div className="neo-tab-pill rounded-full p-1 flex items-center mb-6">
            <button
              id="tab-btn-login"
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'neo-tab-active text-emerald-900 font-extrabold'
                  : 'text-slate-500 hover:text-emerald-950'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              id="tab-btn-register"
              type="button"
              onClick={() => {
                setAuthMode('register');
                setRegError(null);
              }}
              className={`flex-1 py-2 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'neo-tab-active text-emerald-900 font-extrabold'
                  : 'text-slate-500 hover:text-emerald-950'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          {/* Feedback Notices */}
          {loginError && authMode === 'login' && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          {regError && authMode === 'register' && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{regError}</span>
            </div>
          )}

          {quickActionNotice && (
            <div className="mb-4 p-2.5 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 text-xs flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>{quickActionNotice}</span>
            </div>
          )}

          {/* =====================================================================
              TAB 1: SIGN IN (LOG IN)
              ===================================================================== */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Username or Email Input */}
              <div className="neo-input-pill rounded-full flex items-center px-4 py-3.5 gap-3">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
                <input
                  id="input-login-email"
                  type="text"
                  autoComplete="username"
                  placeholder="Username or Email"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                />
              </div>

              {/* Password Input with Eye Toggle */}
              <div className="neo-input-pill rounded-full flex items-center px-4 py-3.5 gap-3">
                <KeyRound className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
                <input
                  id="input-login-passcode"
                  type={showLoginPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={loginPasscode}
                  onChange={(e) => setLoginPasscode(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-slate-400 hover:text-emerald-700 transition cursor-pointer p-0.5"
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between pt-1 px-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                      rememberMe
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'neo-checkbox-custom'
                    }`}
                  >
                    {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-600">
                    Remember Me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-800 transition cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Green Gradient Pill Action Button */}
              <button
                id="btn-submit-login"
                type="submit"
                className="neo-btn-pill w-full py-4 px-6 rounded-full flex items-center justify-center relative font-bold text-base text-white tracking-wide cursor-pointer group mt-2"
              >
                <span>Login</span>
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center absolute right-3 shadow-inner group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
              </button>
            </form>
          ) : (
            /* =====================================================================
                TAB 2: REGISTER (SIGN UP)
                ===================================================================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Agency Type Selector Chips */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 px-1">
                  Agency / Department
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'RESIDENT' as AgencyType, label: 'Resident', icon: User },
                    { type: 'MDRRMO' as AgencyType, label: 'MDRRMO', icon: ShieldAlert },
                    { type: 'LGU' as AgencyType, label: 'LGU Admin', icon: Landmark }
                  ].map((ag) => {
                    const isSelected = regAgencyType === ag.type;
                    const Icon = ag.icon;
                    return (
                      <button
                        key={ag.type}
                        type="button"
                        onClick={() => handleAgencyChange(ag.type)}
                        className={`py-2 px-2 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/30'
                            : 'neo-squircle-btn text-slate-600 hover:text-emerald-950'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{ag.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Barangay Dropdown (if resident citizen) */}
              {regAgencyType === 'RESIDENT' && (
                <div className="relative" ref={barangayDropdownRef}>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 px-1 mb-1">
                    Home Barangay in Roxas
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsBarangayDropdownOpen((prev) => !prev)}
                    className="neo-input-pill w-full rounded-full px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">Barangay {regBarangay}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-emerald-700 transition-transform ${
                        isBarangayDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isBarangayDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-emerald-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto py-1 divide-y divide-emerald-50">
                      {ROXAS_BARANGAYS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            setRegBarangay(b);
                            setRegBadge(`RES-${b.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
                            setIsBarangayDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-xs text-left flex items-center justify-between hover:bg-emerald-50 cursor-pointer ${
                            regBarangay === b ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                          }`}
                        >
                          <span>Barangay {b}</span>
                          {regBarangay === b && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Full Name Input */}
              <div className="neo-input-pill rounded-full flex items-center px-4 py-3 gap-3">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
                <input
                  type="text"
                  placeholder="Official Full Name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                />
              </div>

              {/* Position / Designation Input */}
              <div className="neo-input-pill rounded-full flex items-center px-4 py-3 gap-3">
                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
                <input
                  type="text"
                  placeholder="Position or Designation"
                  value={regPosition}
                  onChange={(e) => setRegPosition(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                />
              </div>

              {/* Email Address */}
              <div className="neo-input-pill rounded-full flex items-center px-4 py-3 gap-3">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
                <input
                  type="email"
                  placeholder="Official Email Address"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="neo-input-pill rounded-full flex items-center px-3.5 py-3 gap-2">
                  <KeyRound className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={regPasscode}
                    onChange={(e) => setRegPasscode(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="text-slate-400 hover:text-emerald-700 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="neo-input-pill rounded-full flex items-center px-3.5 py-3 gap-2">
                  <KeyRound className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm"
                    value={regConfirmPasscode}
                    onChange={(e) => setRegConfirmPasscode(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="text-slate-400 hover:text-emerald-700 cursor-pointer"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Data Privacy Agreement Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1 px-1">
                <div
                  onClick={() => setRegAgreeTerms(!regAgreeTerms)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                    regAgreeTerms ? 'bg-emerald-600 text-white shadow-xs' : 'neo-checkbox-custom'
                  }`}
                >
                  {regAgreeTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-[11px] font-medium text-slate-600">
                  I certify that the provided credentials are valid and agree to official governance terms.
                </span>
              </label>

              {/* Green Gradient Pill Submit Button */}
              <button
                id="btn-submit-register"
                type="submit"
                className="neo-btn-pill w-full py-4 px-6 rounded-full flex items-center justify-center relative font-bold text-base text-white tracking-wide cursor-pointer group mt-2"
              >
                <span>Register & Sign In</span>
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center absolute right-3 shadow-inner group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
              </button>
            </form>
          )}

          {/* =====================================================================
              Divider: OR CONTINUE WITH
              ===================================================================== */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1" />
            <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-slate-400 uppercase select-none">
              Or Continue With
            </span>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1" />
          </div>

          {/* =====================================================================
              Google Sign In Button
              ===================================================================== */}
          <div className="flex items-center justify-center">
            {/* Google Button */}
            <button
              type="button"
              onClick={() => {
                setQuickActionNotice('One-click sign in as Resident Citizen...');
                setTimeout(() => handleQuickRoleAccess('RESIDENT'), 400);
              }}
              title="Sign in with Google (Resident Citizen Portal)"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] neo-squircle-btn flex items-center justify-center cursor-pointer group"
            >
              {/* Google G Logo in Full Colors */}
              <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </button>
          </div>

          {/* =====================================================================
              Footer Slogan: COMMUNITY • SERVICE • PROGRESS
              ===================================================================== */}
          <div className="text-center mt-7 pt-2">
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.28em] text-slate-400 select-none">
              Community &bull; Service &bull; Progress
            </p>

            {/* Bottom Switcher Helper */}
            <div className="mt-4 text-xs font-semibold text-slate-500">
              {authMode === 'login' ? (
                <div>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setLoginError(null);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-extrabold underline cursor-pointer"
                  >
                    Register here &rarr;
                  </button>
                </div>
              ) : (
                <div>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setRegError(null);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-extrabold underline cursor-pointer"
                  >
                    Sign In here &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          Bottom Legal & Government Compliance Footer
          ========================================================================= */}
      <footer className="py-3 px-6 text-center text-[11px] text-slate-500 font-medium z-10">
        B-CONNECT Multi-Agency Network &bull; Municipality of Roxas, Oriental Mindoro
      </footer>

      {/* =========================================================================
          Forgot Password Modal Helper
          ========================================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full neo-card relative animate-scaleUp">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 neo-badge-frame">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Password Recovery</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              For security compliance, passwords are reset via the Roxas Municipal IT Administrator or through your registered department head.
            </p>
            <div className="mt-3 p-3 bg-emerald-50/80 rounded-xl text-xs text-emerald-900 border border-emerald-200">
              <strong>Master Demo Passcode:</strong>{' '}
              <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300">jarinyes</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoginPasscode('jarinyes');
                setShowForgotModal(false);
              }}
              className="mt-5 w-full py-3 neo-btn-pill text-white text-xs font-bold rounded-full cursor-pointer"
            >
              Apply Demo Passcode & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
