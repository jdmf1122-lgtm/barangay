import React, { useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Calendar,
  PlusCircle,
  Search,
  Eye,
  X,
  MapPin,
  PhoneCall,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useNotifications } from '../../hooks/useNotifications';
import { useUI } from '../../hooks/useUI';
import {
  ROXAS_BARANGAYS,
  PersonInvolved
} from '../../types';
import { formatDateShort } from '../../utils/reportGenerators';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { classifyIncidentFromText } from '../../utils/incidentClassifier';
import { isConsolidatedCase } from '../../utils/duplicateReportDetector';

export const ResidentPortalView: React.FC<{ initialTab?: 'overview' | 'submit' | 'my_reports' }> = ({ initialTab = 'overview' }) => {
  const { currentUser } = useAuth();
  const { cases, createCase, deleteCase, setSelectedCaseId } = useCases();
  const { triggerNotification } = useNotifications();
  const { setActiveTab } = useUI();

  const [portalTab, setPortalTab] = useState<'overview' | 'submit' | 'my_reports'>(initialTab);

  // Form state
  const [reportTitle, setReportTitle] = useState('');
  const [reportBarangay, setReportBarangay] = useState(currentUser.barangay || 'San Aquilino');
  const [reportSitio, setReportSitio] = useState('');
  const [reportDate, setReportDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [reportTime, setReportTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [isUrgent, setIsUrgent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccessCaseId, setSubmittedSuccessCaseId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [reportSearch, setReportSearch] = useState('');
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);

  useEffect(() => {
    setPortalTab(initialTab);
    setSubmittedSuccessCaseId(null);
    if (initialTab === 'submit') {
      const now = new Date();
      setReportTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      setReportDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    }
  }, [initialTab]);

  const handleSwitchTab = (tab: 'overview' | 'submit' | 'my_reports') => {
    setPortalTab(tab);
    setSubmittedSuccessCaseId(null);
    if (tab === 'submit') {
      setActiveTab('submit_report');
      const now = new Date();
      setReportTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      setReportDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    } else if (tab === 'my_reports') {
      setActiveTab('my_reports');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Filter reports submitted strictly by this resident account
  const myReports = (cases || []).filter((c) =>
    Boolean(
      currentUser?.id && (
        c.residentReporterId === currentUser.id ||
        (c.witnesses && c.witnesses.some((w) => w.id === currentUser.id))
      )
    )
  );

  const filteredMyReports = myReports.filter((c) => {
    if (!reportSearch.trim()) return true;
    const q = reportSearch.toLowerCase();
    return (
      (c.id || '').toLowerCase().includes(q) ||
      (c.title || '').toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q) ||
      (c.status || '').toLowerCase().includes(q) ||
      (c.specificLocation || '').toLowerCase().includes(q)
    );
  });

  // Real-time classification preview
  const liveClassification = reportTitle.trim() ? classifyIncidentFromText(reportTitle) : null;

  // Submit Incident Report Form
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportTitle.trim()) {
      alert('Pakilagay ang Pamagat o Paksa ng Insidente (Please enter the incident title).');
      return;
    }
    if (!reportSitio.trim()) {
      alert('Pakilagay ang Sitio ng insidente (Please specify the Sitio).');
      return;
    }

    setIsSubmitting(true);

    const uploadedImageUrls: string[] = [];
    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('report-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
        } else {
          const { data } = supabase.storage.from('report-images').getPublicUrl(filePath);
          uploadedImageUrls.push(data.publicUrl);
        }
      }
    }

    const complainantPerson: PersonInvolved = {
      id: `P-RES-${Date.now()}`,
      name: currentUser.name || 'Resident Reporter',
      role: 'Complainant',
      contact: currentUser.phone,
      address: currentUser.address,
      barangay: reportBarangay
    };

    const respondentPersons: PersonInvolved[] = [];
    const witnessPersons: PersonInvolved[] = [];

    const isAccidentReport =
      reportTitle.toLowerCase().includes('accident') ||
      reportTitle.toLowerCase().includes('banggaan') ||
      reportTitle.toLowerCase().includes('vehicular') ||
      reportTitle.toLowerCase().includes('disgrasya') ||
      reportTitle.toLowerCase().includes('motorcycle') ||
      reportTitle.toLowerCase().includes('crash');

    const finalSitio = reportSitio.trim();
    const finalLocation = `${finalSitio ? `${finalSitio}, ` : ''}Barangay ${reportBarangay}, Roxas, Oriental Mindoro`;

    const classified = classifyIncidentFromText(reportTitle);
    const finalCategory = classified.category;

    // Dispatched to Supabase Realtime channel; fetch() endpoint supported for backend parity
    const newCaseId = createCase({
      title: reportTitle.trim(),
      category: finalCategory,
      description: reportTitle.trim(),
      initialNarrative: reportTitle.trim(),
      dateReported: new Date().toISOString(),
      dateCreated: new Date().toISOString(),
      incidentDate: reportDate,
      incidentTime: reportTime,
      barangay: reportBarangay,
      sitio: finalSitio,
      specificLocation: finalLocation,
      reporterName: complainantPerson.name,
      complainants: [complainantPerson],
      respondents: respondentPersons,
      witnesses: witnessPersons,
      priority: isUrgent ? 'Urgent' : 'Urgent',
      isAccidentEmergency: true,
      accidentVehicleDetails: isAccidentReport ? 'Road/Vehicular Accident Reported by Resident' : 'Incident Reported by Resident',
      isAccidentProneArea: isAccidentReport,
      originatingAgency: `Resident Citizen (Brgy. ${reportBarangay})`,
      currentHandlingAgency: 'MDRRMO Roxas Operations & Emergency Command Center',
      status: 'Received',
      isCitizenReport: true,
      residentReporterId: currentUser.id,
      isRemainedAtBarangay: false,
      barangayRetentionReason: 'Direct emergency incident transmission to MDRRMO Operations Center',
      barangayRetentionNotes: 'Citizen report received via B-CONNECT Resident Portal and dispatched directly to MDRRMO.',
      isConfidential: false,
      imageUrls: uploadedImageUrls
    });

    setIsSubmitting(false);
    setSubmittedSuccessCaseId(newCaseId);

    // Reset Form
    setReportTitle('');
    setReportSitio('');
    setIsUrgent(false);
    setSelectedFiles([]);

    triggerNotification(
      'Incident Report Transmitted to MDRRMO!',
      `Your report #${newCaseId} has been transmitted to the MDRRMO Command Center. In-system emergency dispatch alert logged.`,
      'system',
      newCaseId,
      'RESIDENT',
      'urgent',
      {
        targetAgencyTypes: ['RESIDENT'],
        targetRoles: ['RESIDENT'],
        targetUserId: currentUser.id,
        targetBarangay: reportBarangay
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ----------------- TOP CIVIC HEADER & BENCH ----------------- */}
      <section
        aria-label="Resident overview"
        className="bg-paper border border-rule rounded-xl p-5 sm:p-6 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-paper-2 border border-rule p-1 shrink-0 flex items-center justify-center">
              <img
                src="/bconnect_logo_transparent.png"
                alt="B-CONNECT logo"
                className="w-full h-full object-contain rounded"
              />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-paper-2 border border-rule text-ink text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>Official resident portal · Barangay {currentUser.barangay || 'San Aquilino'}</span>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-ink">
                Welcome, {currentUser.name}
              </h1>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-row items-center gap-2 sm:gap-2.5 w-full md:w-auto">
            <button
              id="btn-nav-file-report"
              type="button"
              onClick={() => handleSwitchTab('submit')}
              className={`flex-1 md:flex-none px-3.5 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap ${
                portalTab === 'submit'
                  ? 'bg-accent text-accent-ink'
                  : 'bg-paper-2 hover:bg-paper-3 text-ink border border-rule'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report incident</span>
            </button>

            <button
              id="btn-nav-my-reports"
              type="button"
              onClick={() => handleSwitchTab('my_reports')}
              className={`flex-1 md:flex-none px-3.5 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap ${
                portalTab === 'my_reports'
                  ? 'bg-accent text-accent-ink'
                  : 'bg-paper-2 hover:bg-paper-3 text-ink border border-rule'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>My reports (<span className="num font-bold">{myReports.length}</span>)</span>
            </button>
          </div>
        </div>

        {/* Quick Resident Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-rule">
          <div className="bg-paper-2 border border-rule p-3 rounded-lg">
            <span className="text-xs text-muted block font-medium">Total filed</span>
            <span className="text-lg font-bold text-ink mt-0.5 block num">{myReports.length}</span>
          </div>
          <div className="bg-paper-2 border border-rule p-3 rounded-lg">
            <span className="text-xs text-muted block font-medium">In review</span>
            <span className="text-lg font-bold text-ink mt-0.5 block num">
              {myReports.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length}
            </span>
          </div>
          <div className="bg-paper-2 border border-rule p-3 rounded-lg">
            <span className="text-xs text-muted block font-medium">Resolved</span>
            <span className="text-lg font-bold text-ink mt-0.5 block num">
              {myReports.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length}
            </span>
          </div>
          <div className="bg-paper-2 border border-rule p-3 rounded-lg">
            <span className="text-xs text-muted block font-medium">Jurisdiction</span>
            <span className="text-xs font-semibold text-ink mt-1 block truncate">
              Brgy. {currentUser.barangay || 'San Aquilino'}
            </span>
          </div>
        </div>
      </section>

      {/* ----------------- TAB 1: SUBMIT INCIDENT REPORT (FORM WITH PHOTOS) ----------------- */}
      {portalTab === 'submit' && (
        <div className="space-y-6">
          {/* Submission Success Banner */}
          {submittedSuccessCaseId && (
            <div className="bg-paper border border-accent rounded-xl p-5 shadow-xs space-y-3 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="p-2 bg-paper-2 border border-rule text-accent rounded-md shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-ink">
                    Incident report submitted successfully
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Your report has been officially forwarded to the Barangay {reportBarangay} Desk Officer and MDRRMO Operations Center. Assigned tracking reference number:
                  </p>

                  <div className="inline-flex items-center gap-2 bg-paper-2 px-3 py-1.5 rounded-md border border-rule mt-1">
                    <span className="text-xs text-muted font-medium">Reference code:</span>
                    <span className="text-xs font-bold font-mono text-ink num">{submittedSuccessCaseId}</span>
                  </div>

                  {(() => {
                    const matchedCase = cases.find((c) => c.id === submittedSuccessCaseId);
                    if (matchedCase && isConsolidatedCase(matchedCase)) {
                      return (
                        <div className="mt-2.5 p-3 bg-paper-2 border border-rule rounded-md text-ink text-xs flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <div>
                            <strong className="block font-semibold">Unified Report (Auto-Consolidated)</strong>
                            <span className="text-xs text-muted leading-relaxed block mt-0.5">
                              The system detected a similar existing report for this incident. Your submission has been automatically merged into active docket {submittedSuccessCaseId} to prevent duplicate reports and redundant responder dispatch.
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setSelectedCaseId(submittedSuccessCaseId)}
                  className="px-3.5 py-1.5 bg-accent text-accent-ink rounded-md text-xs font-semibold transition-opacity hover:opacity-90 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap"
                >
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View case details</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchTab('my_reports')}
                  className="px-3.5 py-1.5 bg-paper-2 hover:bg-paper-3 text-ink border border-rule rounded-md text-xs font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap"
                >
                  <span>View in my reports</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubmittedSuccessCaseId(null)}
                  className="px-3 py-1.5 text-muted hover:text-ink text-xs font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap"
                >
                  <span>File another report</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Reporting Form */}
          <div className="bg-paper border border-rule rounded-xl p-5 sm:p-7 shadow-xs space-y-6">
            <div className="border-b border-rule pb-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-ink flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent" />
                    <span>Incident and complaint reporting form</span>
                  </h2>
                </div>
                <span className="text-xs text-muted hidden sm:block">
                  Fields marked with (<span className="text-error font-bold">*</span>) are mandatory
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-5">
              {/* 1. Incident Title / Summary */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-report-title" className="block text-xs font-semibold text-ink">
                    Incident title or summary <span className="text-error">*</span>
                  </label>
                  {liveClassification && (
                    <span className="text-xs text-muted">
                      Predicted category: <strong className="text-ink font-semibold">{liveClassification.category}</strong>
                    </span>
                  )}
                </div>
                <input
                  id="input-report-title"
                  type="text"
                  required
                  placeholder="e.g., Vehicular collision along highway Sitio Mahabak, or downed powerline"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-paper-2 border border-rule rounded-md px-3 py-2 text-xs text-ink placeholder:text-muted focus:bg-paper focus:ring-2 focus:ring-focus focus:outline-hidden transition-colors"
                />
              </div>

              {/* 2. Location & Date/Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="select-report-barangay" className="block text-xs font-semibold text-ink">
                    Barangay jurisdiction <span className="text-error">*</span>
                  </label>
                  {currentUser.role === 'RESIDENT' || currentUser.agencyType === 'RESIDENT' ? (
                    <div className="w-full bg-paper-2 border border-rule rounded-md px-3 py-2 text-xs text-ink font-medium flex items-center justify-between">
                      <span>Barangay {currentUser.barangay || 'San Aquilino'}</span>
                      <span className="text-xs text-muted bg-paper px-2 py-0.5 rounded border border-rule">
                        Home barangay locked
                      </span>
                    </div>
                  ) : (
                    <select
                      id="select-report-barangay"
                      value={reportBarangay}
                      onChange={(e) => setReportBarangay(e.target.value)}
                      className="w-full bg-paper-2 border border-rule rounded-md px-3 py-2 text-xs text-ink font-medium focus:bg-paper focus:ring-2 focus:ring-focus focus:outline-hidden transition-colors cursor-pointer"
                    >
                      {ROXAS_BARANGAYS.map((b) => (
                        <option key={b} value={b}>
                          Barangay {b}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="input-report-sitio" className="block text-xs font-semibold text-ink">
                    Sitio / Purok landmark <span className="text-error">*</span>
                  </label>
                  <input
                    id="input-report-sitio"
                    type="text"
                    required
                    placeholder="e.g., Sitio Mahabak, near public market or bridge"
                    value={reportSitio}
                    onChange={(e) => setReportSitio(e.target.value)}
                    className="w-full px-3 py-2 bg-paper-2 border border-rule rounded-md text-xs text-ink placeholder:text-muted focus:bg-paper focus:ring-2 focus:ring-focus focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    <span>Incident date</span>
                  </label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full bg-paper-2 border border-rule rounded-md px-3 py-1.5 text-xs text-ink focus:bg-paper focus:ring-2 focus:ring-focus focus:outline-hidden transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-ink flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted" />
                      <span>Estimated time</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setReportTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
                      }}
                      className="text-xs text-accent hover:underline font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
                      title="Set to current device time"
                    >
                      Current time
                    </button>
                  </div>
                  <input
                    type="time"
                    value={reportTime}
                    onChange={(e) => setReportTime(e.target.value)}
                    className="w-full bg-paper-2 border border-rule rounded-md px-3 py-1.5 text-xs text-ink focus:bg-paper focus:ring-2 focus:ring-focus focus:outline-hidden transition-colors font-medium num"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">
                    Urgency level
                  </label>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsUrgent(false)}
                      className={`flex-1 py-1.5 px-3 rounded-md border text-xs font-semibold cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] ${
                        !isUrgent
                          ? 'bg-paper-2 border-accent text-ink font-semibold'
                          : 'bg-paper border-rule text-muted hover:bg-paper-2'
                      }`}
                    >
                      <span>Standard</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsUrgent(true)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-md border text-xs font-semibold cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] ${
                        isUrgent
                          ? 'bg-paper-2 border-warning text-ink font-semibold'
                          : 'bg-paper border-rule text-muted hover:bg-paper-2'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3 text-warning" />
                      <span>Urgent rescue</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Photo / Evidence Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">
                  Attach photo evidence (optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-2 bg-paper-2 hover:bg-paper-3 text-ink px-3.5 py-2 rounded-md text-xs font-medium transition-colors border border-rule focus-within:ring-2 focus-within:ring-focus active:scale-[0.98]">
                    <Upload className="w-3.5 h-3.5 text-accent" />
                    <span>Select photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          setSelectedFiles(Array.from(e.target.files));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-muted">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) attached` : 'No photos selected'}
                  </span>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="px-2.5 py-1 bg-paper-2 border border-rule text-xs text-ink rounded-md flex items-center gap-1.5"
                      >
                        <ImageIcon className="w-3 h-3 text-muted" />
                        <span className="truncate max-w-[140px] text-xs">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-muted hover:text-error ml-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
                          aria-label={`Remove photo ${f.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-rule">
                <button
                  type="button"
                  onClick={() => handleSwitchTab('overview')}
                  className="w-full sm:w-auto px-4 py-2 border border-rule rounded-md text-xs font-medium text-ink bg-paper hover:bg-paper-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap"
                >
                  <span>Cancel</span>
                </button>
                <button
                  id="btn-submit-resident-report"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2 bg-accent hover:opacity-90 text-accent-ink rounded-md text-xs font-semibold transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting…' : 'Submit report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: MY FILED REPORTS (LIVE TRACKER) ----------------- */}
      {portalTab === 'my_reports' && (
        <div className="space-y-6">
          <div className="bg-paper border border-rule rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-4">
              <div>
                <h2 className="text-base font-bold text-ink flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>My submitted incident reports & resolution status</span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Search by case code or keyword…"
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-paper-2 border border-rule rounded-md text-xs text-ink placeholder:text-muted focus:bg-paper focus:ring-2 focus:ring-focus focus:outline-hidden transition-colors w-48 sm:w-60"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSwitchTab('submit')}
                  className="px-3 py-1.5 bg-accent hover:opacity-90 text-accent-ink rounded-md text-xs font-semibold flex items-center gap-1.5 transition-opacity cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>File new report</span>
                </button>
              </div>
            </div>

            {/* List of Reports with 4-State Hygiene */}
            {filteredMyReports.length === 0 ? (
              myReports.length === 0 ? (
                /* Empty state: No reports submitted yet */
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="p-3 bg-paper-2 border border-rule rounded-lg w-12 h-12 mx-auto flex items-center justify-center text-muted">
                    <FileText className="w-6 h-6 text-muted" />
                  </div>
                  <h3 className="text-sm font-semibold text-ink">No incident reports filed yet</h3>
                  <p className="text-xs text-muted max-w-md mx-auto">
                    You have not submitted any incident reports. If you witness a vehicular accident or require Lupon assistance, file a report below.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('submit')}
                    className="px-4 py-2 bg-accent hover:opacity-90 text-accent-ink rounded-md text-xs font-semibold transition-opacity cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap"
                  >
                    <span>Submit first report</span>
                  </button>
                </div>
              ) : (
                /* Empty search results state */
                <div className="text-center py-8 px-4 space-y-2">
                  <p className="text-xs text-muted">
                    No reports match your search query &ldquo;{reportSearch}&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setReportSearch('')}
                    className="text-xs text-accent hover:underline font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
                  >
                    Clear search filter
                  </button>
                </div>
              )
            ) : (
              <div className="space-y-3.5">
                {filteredMyReports.map((c) => {
                  const isResolved = c.status === 'Resolved' || c.status === 'Closed';

                  return (
                    <article
                      key={c.id}
                      className="p-4 sm:p-5 rounded-lg border border-rule bg-paper hover:bg-paper-2/60 transition-colors shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-ink px-2 py-0.5 bg-paper-2 border border-rule rounded num">
                            {c.id}
                          </span>
                          <StatusBadge status={c.status} />
                          <PriorityBadge priority={c.priority} />
                          {isConsolidatedCase(c) && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-paper-2 border border-rule text-ink">
                              Unified report (Consolidated)
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-muted flex items-center gap-1 num">
                          <Calendar className="w-3 h-3 text-muted" />
                          <span>Reported on {formatDateShort(c.dateReported || c.dateCreated || c.incidentDate)}</span>
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-ink">
                          {c.title}
                        </h3>
                        {c.initialNarrative && (
                          <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
                            {c.initialNarrative}
                          </p>
                        )}
                        {c.specificLocation && (
                          <div className="flex items-center gap-1 text-xs text-muted mt-1.5">
                            <MapPin className="w-3 h-3 text-muted shrink-0" />
                            <span className="truncate">{c.specificLocation}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Progress Milestones */}
                      <div className="bg-paper-2 rounded-md p-3 border border-rule space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted font-medium">
                          <span>Current status:</span>
                          <span className="text-ink font-semibold">
                            {c.lastActionTaken || (isResolved ? 'Resolved' : 'Under active review by Barangay Lupon / MDRRMO')}
                          </span>
                        </div>

                        {/* Visual Progress Steps */}
                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                          <div>
                            <div className="h-1 rounded-full bg-accent" />
                            <span className="text-xs text-ink font-medium mt-1 block">1. Received & dispatched</span>
                          </div>
                          <div>
                            <div className={`h-1 rounded-full ${isResolved ? 'bg-accent' : 'bg-rule'}`} />
                            <span className="text-xs text-muted font-medium mt-1 block">2. Investigation & resolution</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-rule">
                        <span className="text-xs text-muted">
                          Assigned agency: <strong className="text-ink font-semibold">{c.currentHandlingAgency}</strong>
                        </span>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete report ${c.id} ("${c.title}")? This action cannot be undone.`)) {
                                deleteCase(c.id);
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-error hover:bg-paper-2 border border-rule rounded-md transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap"
                            title="Delete this incident report"
                          >
                            <span className="flex items-center gap-1">
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedCaseId(c.id)}
                            className="px-3 py-1 bg-paper-2 hover:bg-paper-3 text-ink border border-rule rounded-md text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap"
                          >
                            <Eye className="w-3 h-3 text-muted" />
                            <span>Open case dossier</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB 0: OVERVIEW PORTAL HUB ----------------- */}
      {portalTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Quick Action Card 1: File Report */}
            <div className="p-5 rounded-xl bg-paper border border-rule hover:border-accent/40 transition-colors shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="p-2.5 w-10 h-10 rounded-lg bg-paper-2 border border-rule text-accent flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-ink">Report an incident</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Submit a new road accident, Barangay grievance, or public safety incident with photo evidence.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSwitchTab('submit')}
                className="w-full py-2 bg-accent hover:opacity-90 text-accent-ink rounded-md text-xs font-semibold transition-opacity flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap"
              >
                <span>Start incident report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Action Card 2: Track Reports */}
            <div className="p-5 rounded-xl bg-paper border border-rule hover:border-accent/40 transition-colors shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="p-2.5 w-10 h-10 rounded-lg bg-paper-2 border border-rule text-accent flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-ink">Track reports & status</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Monitor Lupon review, MDRRMO rescue dispatch, and resolution milestones for your submitted reports.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSwitchTab('my_reports')}
                className="w-full py-2 bg-paper-2 hover:bg-paper-3 text-ink border border-rule rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap"
              >
                <span>View my reports (<span className="num font-bold">{myReports.length}</span>)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Action Card 3: Emergency Contacts */}
            <div className="p-5 rounded-xl bg-paper border border-rule hover:border-accent/40 transition-colors shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="p-2.5 w-10 h-10 rounded-lg bg-paper-2 border border-rule text-warning flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-ink">Emergency dispatch hotlines</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Direct telephone hotlines for MDRRMO rescue, Roxas municipal police, and fire station.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEmergencyContacts(!showEmergencyContacts)}
                className="w-full py-2 bg-paper-2 hover:bg-paper-3 text-ink border border-rule rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap"
              >
                <span>{showEmergencyContacts ? 'Hide hotlines' : 'View hotlines'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Emergency Hotlines Accordion */}
          {showEmergencyContacts && (
            <div className="bg-paper-2 border border-rule rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-accent" />
                  <span>Municipality of Roxas emergency dispatch lines</span>
                </h4>
                <span className="text-xs text-muted">24/7 Operations</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-paper border border-rule rounded-lg">
                  <span className="text-xs text-muted block">MDRRMO Rescue</span>
                  <span className="text-xs font-bold text-ink font-mono num">0917-123-4567</span>
                </div>
                <div className="p-3 bg-paper border border-rule rounded-lg">
                  <span className="text-xs text-muted block">PNP Roxas Station</span>
                  <span className="text-xs font-bold text-ink font-mono num">0998-765-4321</span>
                </div>
                <div className="p-3 bg-paper border border-rule rounded-lg">
                  <span className="text-xs text-muted block">BFP Fire Station</span>
                  <span className="text-xs font-bold text-ink font-mono num">0920-555-0123</span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Reports in Barangay */}
          <div className="bg-paper border border-rule rounded-xl p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-accent" />
                  <span>Recent incident reports</span>
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleSwitchTab('my_reports')}
                className="text-xs font-medium text-accent hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap"
              >
                <span>View all reports</span>
              </button>
            </div>

            {myReports.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted">
                You have not submitted any incident reports yet.
              </div>
            ) : (
              <div className="divide-y divide-rule">
                {myReports.slice(0, 3).map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ink num">{c.id}</span>
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                      <h4 className="text-xs font-semibold text-ink truncate">{c.title}</h4>
                      {c.specificLocation && (
                        <span className="text-xs text-muted truncate block">{c.specificLocation}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCaseId(c.id)}
                      className="px-3 py-1 bg-paper-2 hover:bg-paper-3 text-ink border border-rule rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] whitespace-nowrap"
                    >
                      <span>Details</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
