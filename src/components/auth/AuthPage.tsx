import React, { useState, useRef, useEffect } from 'react';
import {
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
  Moon,
  Sun,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { AgencyType, ROXAS_BARANGAYS, User as UserType } from '../../types';

export const POSITION_SUGGESTIONS: Record<AgencyType, string[]> = {
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

  // Ambient lighting / theme toggle
  const { isDark, toggleTheme } = useUI();

  // Remember Me checkbox
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot Password modal
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPasscode, setLoginPasscode] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form States (Resident Citizens Only)
  const [regName, setRegName] = useState('');
  const [regBarangay, setRegBarangay] = useState<string>(ROXAS_BARANGAYS[0]);
  const [isBarangayDropdownOpen, setIsBarangayDropdownOpen] = useState(false);
  const barangayDropdownRef = useRef<HTMLDivElement>(null);
  const [regPosition] = useState('Verified Resident Citizen');
  const [regBadge, setRegBadge] = useState(`RES-${ROXAS_BARANGAYS[0].slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [regEmail, setRegEmail] = useState('');
  const [regPasscode, setRegPasscode] = useState('');
  const [regConfirmPasscode, setRegConfirmPasscode] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);

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

    if (!regPasscode.trim()) {
      setRegError('Please set a password / passcode for your account.');
      return;
    }

    if (regPasscode.trim().length < 6) {
      setRegError('Password must be at least 6 characters long.');
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

    const cleanEmail = regEmail.trim() || `${regName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@resident.roxas.ph`;

    const newUserPayload: Omit<UserType, 'id'> & { passcode: string; avatarUrl?: string } = {
      name: regName.trim(),
      role: 'RESIDENT',
      agencyType: 'RESIDENT',
      agencyName: `Barangay ${regBarangay} Resident Citizen`,
      barangay: regBarangay,
      position: regPosition.trim(),
      badgeOrIdNumber: regBadge.trim() || `RES-${regBarangay.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      email: cleanEmail,
      passcode: regPasscode.trim(),
      avatarUrl: '/bconnect_logo_transparent.png',
    };

    try {
      const createdUser = await registerUser(newUserPayload);
      login(createdUser);
    } catch (error: any) {
      setRegError(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div
      id="auth-portal-page"
      className="min-h-screen flex flex-col justify-between selection:bg-accent selection:text-accent-ink transition-colors duration-200 bg-paper text-ink"
    >
      {/* =========================================================================
          Top Bar: Official Municipal Header & Accessibility Actions
          ========================================================================= */}
      <header className="w-full border-b border-rule bg-paper-2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-paper p-1 flex items-center justify-center border border-rule">
              <img
                src="/bconnect_logo_transparent.png"
                alt="B-CONNECT Municipal Seal"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-ink">
                  B-CONNECT
                </span>
                <span className="text-xs px-2 py-0.5 rounded-sm bg-paper-3 text-ink-2 font-medium border border-rule">
                  Official Portal
                </span>
              </div>
              <p className="text-xs text-muted">
                Municipality of Roxas, Oriental Mindoro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs text-muted">
              Emergency Hotline: 911 / (043) 289-2026
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 rounded-md border border-rule bg-paper flex items-center justify-center text-ink cursor-pointer hover:bg-paper-3 transition-colors focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-ink-2" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          Central Stage Container: 2-Column Responsive Civic Workbench
          ========================================================================= */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Context & Authority */}
          <section className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-sm bg-paper-3 text-ink-2 border border-rule">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true"></span>
                Active municipal emergency dispatch network
              </span>
              <h1 className="text-display font-display font-bold tracking-tight text-ink leading-tight">
                Emergency Dispatch & Case Governance
              </h1>
              <p className="lead text-ink-2 max-w-xl">
                Unified emergency dispatch and municipal oversight across all 20 Roxas barangays.
              </p>
            </div>

            {/* Jurisdiction Notice */}
            <div className="text-xs text-muted pt-2 border-t border-rule space-y-1">
              <p>
                Coverage: Bagumbayan, Cantil, Dangay, Happy Valley, Libertad, Mabuhay, Marfcoc, Odiong, Paclasan, San Aquilino, San Isidro, San Jose, San Mariano, San Mateo, San Rafael, San Vicente, Santo Niño, Victoria, Villa Hermosa, Little Tanauan.
              </p>
              <p>
                Compliance: Automatic escalation monitoring compliant with DILG governance protocols.
              </p>
            </div>
          </section>

          {/* Right Column: High-Density Authentication & Registration Workbench */}
          <section className="lg:col-span-5">
            <div className="p-6 sm:p-7 rounded-card border border-rule bg-paper-2 shadow-card space-y-5">
              
              {/* Header inside form card */}
              <div className="space-y-1 pb-3 border-b border-rule">
                <h2 className="text-lg font-bold text-ink">
                  {authMode === 'login' ? 'Portal Sign In' : 'Resident Citizen Registration'}
                </h2>
                <p className="text-xs text-muted">
                  {authMode === 'login'
                    ? 'Enter official credentials to access your agency workspace'
                    : 'Register as a certified resident of Roxas, Oriental Mindoro'}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="p-1 rounded-md bg-paper border border-rule flex items-center">
                <button
                  id="tab-btn-login"
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setLoginError(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-sm text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-focus ${
                    authMode === 'login'
                      ? 'bg-paper-3 text-ink shadow-xs border border-rule'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Sign In</span>
                </button>
                <button
                  id="tab-btn-register"
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setRegError(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-sm text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-focus ${
                    authMode === 'register'
                      ? 'bg-paper-3 text-ink shadow-xs border border-rule'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Resident Register</span>
                </button>
              </div>

              {/* Status Feedback */}
              {loginError && authMode === 'login' && (
                <div className="p-3 bg-paper-3 border border-error/40 text-error rounded-md text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-error" aria-hidden="true" />
                  <span>{loginError}</span>
                </div>
              )}

              {regError && authMode === 'register' && (
                <div className="p-3 bg-paper-3 border border-error/40 text-error rounded-md text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-error" aria-hidden="true" />
                  <span>{regError}</span>
                </div>
              )}

              {/* =================================================================
                  TAB 1: SIGN IN (LOG IN)
                  ================================================================= */}
              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4">
                  {/* Identifier Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="input-login-email"
                      className="block text-xs font-semibold text-ink-2"
                    >
                      Username, Email, or Badge ID
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted absolute left-3 top-3" aria-hidden="true" />
                      <input
                        id="input-login-email"
                        name="user_login_credential_field"
                        type="text"
                        autoComplete="off"
                        readOnly
                        onFocus={(e) => { e.target.readOnly = false; }}
                        data-lpignore="true"
                        data-1p-ignore="true"
                        placeholder="e.g. mdrrmoroxas@gmail.com"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-paper text-ink border border-rule rounded-md focus:border-focus focus:outline-none focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="input-login-passcode"
                        className="block text-xs font-semibold text-ink-2"
                      >
                        Passcode
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs text-accent hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-focus"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-muted absolute left-3 top-3" aria-hidden="true" />
                      <input
                        id="input-login-passcode"
                        name="user_password_credential_field"
                        type={showLoginPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        readOnly
                        onFocus={(e) => { e.target.readOnly = false; }}
                        data-lpignore="true"
                        data-1p-ignore="true"
                        placeholder="••••••••"
                        value={loginPasscode}
                        onChange={(e) => setLoginPasscode(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-paper text-ink border border-rule rounded-md focus:border-focus focus:outline-none focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        aria-label={showLoginPassword ? 'Hide passcode' : 'Show passcode'}
                        className="absolute right-2.5 top-2.5 text-muted hover:text-ink cursor-pointer p-0.5 focus-visible:outline-2 focus-visible:outline-focus"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        onClick={() => setRememberMe(!rememberMe)}
                        className="w-4 h-4 rounded-sm border-rule text-accent focus:ring-focus cursor-pointer"
                      />
                      <span className="text-xs text-ink-2">
                        Keep me signed in on this workstation
                      </span>
                    </label>
                  </div>

                  {/* Submit Action */}
                  <button
                    id="btn-submit-login"
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-md bg-accent text-accent-ink font-semibold text-xs sm:text-sm hover:opacity-95 active:scale-[0.99] transition-opacity cursor-pointer focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sign in to portal
                  </button>

                  <p className="text-xs text-center text-muted pt-1">
                    Don’t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setLoginError(null);
                      }}
                      className="text-accent font-semibold hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      Register as resident
                    </button>
                  </p>
                </form>
              ) : (
                /* =================================================================
                    TAB 2: REGISTER (SIGN UP - RESIDENT CITIZENS ONLY)
                    ================================================================= */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Barangay Dropdown */}
                  <div className="space-y-1 relative" ref={barangayDropdownRef}>
                    <label className="block text-xs font-semibold text-ink-2">
                      Home Barangay in Roxas
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsBarangayDropdownOpen((prev) => !prev)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-paper text-ink border border-rule rounded-md flex items-center justify-between cursor-pointer focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      <span>Barangay {regBarangay}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted transition-transform duration-150 ${
                          isBarangayDropdownOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {isBarangayDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-paper border border-rule max-h-48 overflow-y-auto py-1 divide-y divide-rule">
                        {ROXAS_BARANGAYS.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              setRegBarangay(b);
                              setRegBadge(`RES-${b.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
                              setIsBarangayDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-paper-3 cursor-pointer ${
                              regBarangay === b ? 'bg-paper-3 text-ink font-bold' : 'text-ink-2'
                            }`}
                          >
                            <span>Barangay {b}</span>
                            {regBarangay === b && <Check className="w-3.5 h-3.5 text-accent" aria-hidden="true" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-ink-2">
                      Official Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted absolute left-3 top-2.5" aria-hidden="true" />
                      <input
                        type="text"
                        placeholder="e.g. Juan dela Cruz"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-paper text-ink border border-rule rounded-md focus:border-focus focus:outline-none focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-ink-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted absolute left-3 top-2.5" aria-hidden="true" />
                      <input
                        type="email"
                        placeholder="resident@gmail.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-paper text-ink border border-rule rounded-md focus:border-focus focus:outline-none focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Passcode & Confirmation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-ink-2">
                        Passcode
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          placeholder="At least 6 chars"
                          value={regPasscode}
                          onChange={(e) => setRegPasscode(e.target.value)}
                          className="w-full pl-3 pr-8 py-2 text-xs bg-paper text-ink border border-rule rounded-md focus:border-focus focus:outline-none focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          aria-label={showRegPassword ? 'Hide passcode' : 'Show passcode'}
                          className="absolute right-2 top-2 text-muted hover:text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-focus"
                        >
                          {showRegPassword ? (
                            <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-ink-2">
                        Confirm
                      </label>
                      <div className="relative">
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          placeholder="Re-type passcode"
                          value={regConfirmPasscode}
                          onChange={(e) => setRegConfirmPasscode(e.target.value)}
                          className="w-full pl-3 pr-8 py-2 text-xs bg-paper text-ink border border-rule rounded-md focus:border-focus focus:outline-none focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          aria-label={showRegConfirmPassword ? 'Hide passcode' : 'Show passcode'}
                          className="absolute right-2 top-2 text-muted hover:text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-focus"
                        >
                          {showRegConfirmPassword ? (
                            <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Agreement */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={regAgreeTerms}
                        onChange={() => setRegAgreeTerms(!regAgreeTerms)}
                        onClick={() => setRegAgreeTerms(!regAgreeTerms)}
                        className="mt-0.5 w-4 h-4 rounded-sm border-rule text-accent focus:ring-focus cursor-pointer"
                      />
                      <span className="text-xs text-muted leading-tight">
                        I certify that I am a resident of Roxas, Oriental Mindoro and accept statutory data privacy terms.
                      </span>
                    </label>
                  </div>

                  {/* Submit Registration */}
                  <button
                    id="btn-submit-register"
                    type="submit"
                    className="w-full whitespace-nowrap py-2.5 px-4 rounded-md bg-accent text-accent-ink font-semibold text-xs sm:text-sm hover:opacity-95 active:scale-[0.99] transition-opacity cursor-pointer focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Register resident
                  </button>

                  <p className="text-xs text-center text-muted pt-1">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setRegError(null);
                      }}
                      className="text-accent font-semibold hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* =========================================================================
          Bottom Legal & Government Compliance Footer
          ========================================================================= */}
      <footer className="w-full border-t border-rule bg-paper-2 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
          <span>
            B-CONNECT Multi-Agency Incident & Case Tracking System
          </span>
          <span>
            Local Government Unit of Roxas, Oriental Mindoro
          </span>
        </div>
      </footer>

      {/* =========================================================================
          Forgot Password Modal Helper
          ========================================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-paper-2 rounded-card p-6 max-w-sm w-full border border-rule shadow-card relative">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-muted hover:text-ink cursor-pointer p-1 focus-visible:outline-2 focus-visible:outline-focus"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
            <div className="w-10 h-10 rounded-md bg-paper border border-rule text-accent flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-ink">
              Official Password Recovery
            </h3>
            <p className="text-xs text-muted mt-2 leading-relaxed">
              In compliance with local government data integrity policies, credentials can be reset through your designated Barangay IT Officer or by coordinating with the Roxas Municipal IT Operations Desk.
            </p>
            <div className="mt-3 p-3 bg-paper rounded-md text-xs text-ink-2 border border-rule">
              <span className="font-semibold text-ink">Assistance Desk:</span>{' '}
              <span>Contact the Municipal Administrator’s Office or MDRRMO Dispatch Desk for emergency credential verification.</span>
            </div>
            <button
              type="button"
              onClick={() => { setShowForgotModal(false); }}
              className="mt-4 w-full py-2 bg-paper-3 text-ink text-xs font-semibold rounded-md border border-rule hover:bg-paper cursor-pointer focus-visible:outline-2 focus-visible:outline-focus"
            >
              Close dialog
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
