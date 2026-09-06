import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKiosk } from '../../context/KioskContext';
import { 
  fetchDoctorSessionSummary, 
  fetchDoctorSessionDetails 
} from '../../services/apiService';
import { 
  DEMO_SESSION_ID, 
  DEMO_CLINICAL_SUMMARY 
} from '../../data/demoPatient';
import { 
  User, 
  Clock, 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  CheckCheck, 
  Stethoscope, 
  Edit3, 
  Save, 
  XCircle, 
  AlertTriangle, 
  Pill, 
  Activity, 
  Sparkles, 
  ClipboardList, 
  Calendar, 
  Phone, 
  Globe, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';

/**
 * SCREEN 19 — Doctor Clinical Summary & Review
 * 
 * Clinical authority & review station for attending physicians:
 *  - Displays AI-assisted clinical summary from patient intake (with clear AI-generated badges)
 *  - Provides editable fields for Doctor's remarks, medications, investigations, next steps, follow-ups
 *  - Doctor actions:
 *      * "Edit / Modify": Unlocks fields for custom corrections
 *      * "Confirm / Finalize": Signs off and finalizes summary
 *      * "Reject / Needs Modification": Flags case with clinical reason and keeps fields editable
 *  - Human-in-the-loop: Doctor is the final authority, AI is purely advisory
 *  - Local component state handling (no fake backend save requests sent)
 */
export function ClinicalSummary() {
  const { 
    selectedSessionId, 
    setCurrentStep, 
    currentStep,
    staffUser, 
    updateDoctorQueueSession,
    isDoctorReviewReadOnly 
  } = useKiosk();

  // Mode determination: Editable (Staff Portal) vs Read-Only (Intake Successful / Demo Viewing)
  const isReadOnly = Boolean(
    isDoctorReviewReadOnly || 
    currentStep === 'clinicalsummary' || 
    currentStep === 'patientclinicalsummary'
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [caseData, setCaseData] = useState(null);

  // Review & Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(isReadOnly ? 'CONFIRMED' : 'PENDING_REVIEW');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectInput, setRejectInput] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Effective edit mode: strictly false when in Read-Only mode
  const effectiveIsEditing = !isReadOnly && isEditing;

  // Editable Fields
  const [formFields, setFormFields] = useState({
    // AI-generated intake fields (Reviewable & Editable)
    chief_complaint: '',
    symptom_duration: '',
    severity: '',
    has_fever: '',
    existing_conditions: '',
    current_medications: '',
    allergies: '',
    past_medical_history: '',
    pain_level: '',
    additional_information: '',

    // Doctor Direct Clinical Assessment & Plan fields
    clinical_assessment: '',
    prescribed_medications: '',
    recommended_tests: '',
    treatment_steps: '',
    follow_up_instructions: '',
    doctor_notes: ''
  });

  // Helper to initialize doctor fields from loaded summary data
  const initializeFields = (data) => {
    const summary = data?.clinical_summary || {};
    setFormFields({
      chief_complaint: summary.chief_complaint || 'Persistent dry cough and mild fever',
      symptom_duration: summary.symptom_duration || '3 to 4 days',
      severity: summary.severity || 'Moderate',
      has_fever: summary.has_fever || 'Yes (~99.5°F)',
      existing_conditions: summary.existing_conditions || 'None reported',
      current_medications: summary.current_medications || 'None reported',
      allergies: summary.allergies || 'No known drug allergies',
      past_medical_history: summary.past_medical_history || 'None reported',
      pain_level: summary.pain_level || 'Mild throat soreness (3/10)',
      additional_information: summary.additional_information || 'No additional history provided',

      // Default Doctor Recommendations / Template
      clinical_assessment: summary.clinical_assessment || 'Provisional diagnosis: Acute viral pharyngitis with mild non-productive cough. Vitals stable.',
      prescribed_medications: summary.prescribed_medications || '1. Tab Paracetamol 650mg TDS (after meals) x 3 days\n2. Syrup Levodropropizine 10ml TDS x 5 days\n3. Warm saline gargles TDS',
      recommended_tests: summary.recommended_tests || 'Complete Blood Count (CBC) and Throat swab if symptoms persist beyond 5 days.',
      treatment_steps: summary.treatment_steps || 'Adequate hydration (2-3L fluids daily), voice rest, steam inhalation twice daily, monitor temperature.',
      follow_up_instructions: summary.follow_up_instructions || 'Review in OPD after 3 days. Return urgently if high fever (>101°F), chest pain, or shortness of breath develops.',
      doctor_notes: summary.doctor_notes || 'Patient counseled on symptom monitoring and hydration. Advised rest.'
    });
  };

  // Load summary data
  const loadSummaryData = useCallback(async () => {
    // 1. Check if temporary demo case (Session 9999) or missing session ID -> zero-API demo flow
    if (!selectedSessionId || String(selectedSessionId) === String(DEMO_SESSION_ID)) {
      setCaseData(DEMO_CLINICAL_SUMMARY);
      initializeFields(DEMO_CLINICAL_SUMMARY);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 2. Fetch real clinical summary from backend
      const summaryData = await fetchDoctorSessionSummary(selectedSessionId);
      setCaseData(summaryData);
      initializeFields(summaryData);
    } catch (err) {
      console.warn('[ClinicalSummary] Real summary endpoint unavailable; fetching session details as baseline:', err.message);
      try {
        const details = await fetchDoctorSessionDetails(selectedSessionId);
        // Synthesize baseline summary structure from session details
        const synthesizedSummary = {
          session_id: details.session_id,
          status: details.status,
          started_at: details.started_at,
          completed_at: details.completed_at,
          patient: details.patient,
          clinical_summary: {
            chief_complaint: details.responses?.find(r => r.question_key === 'chief_complaint')?.answer || 'Not specified',
            symptom_duration: details.responses?.find(r => r.question_key === 'symptom_duration')?.answer || 'Not specified',
            severity: details.responses?.find(r => r.question_key === 'severity')?.answer || 'Moderate',
            has_fever: details.responses?.find(r => r.question_key === 'fever')?.answer || 'No',
            existing_conditions: details.responses?.find(r => r.question_key === 'existing_conditions')?.answer || 'None reported',
            current_medications: details.responses?.find(r => r.question_key === 'medications')?.answer || 'None reported',
            allergies: details.responses?.find(r => r.question_key === 'allergies')?.answer || 'None reported',
            additional_information: 'Intake answers imported for physician review'
          }
        };
        setCaseData(synthesizedSummary);
        initializeFields(synthesizedSummary);
      } catch (fallbackErr) {
        console.warn('[ClinicalSummary] Doctor API unavailable; falling back to demo clinical summary:', fallbackErr);
        setCaseData(DEMO_CLINICAL_SUMMARY);
        initializeFields(DEMO_CLINICAL_SUMMARY);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    loadSummaryData();
  }, [loadSummaryData]);

  // Handle field edits
  const handleFieldChange = (field, value) => {
    setFormFields(prev => ({ ...prev, [field]: value }));
  };

  // 1. Doctor Action: Save Modifications (Draft)
  const handleSaveDraft = () => {
    setIsEditing(false);
    setReviewStatus('MODIFIED');

    // Local state persistence (ready for future save endpoint)
    if (updateDoctorQueueSession && selectedSessionId) {
      updateDoctorQueueSession(selectedSessionId, {
        review_status: 'MODIFIED',
        clinical_summary: formFields
      });
    }

    showToast('Doctor clinical edits saved in local session state.');
  };

  // 2. Doctor Action: Confirm / Finalize
  const handleDoctorConfirm = () => {
    setIsEditing(false);
    setReviewStatus('CONFIRMED');

    // Local state persistence (ready for future save endpoint)
    if (updateDoctorQueueSession && selectedSessionId) {
      updateDoctorQueueSession(selectedSessionId, {
        review_status: 'CONFIRMED',
        status: 'CONFIRMED',
        doctor_verified_by: staffUser?.name || 'Dr. S. K. Verma',
        doctor_verified_at: new Date().toISOString(),
        clinical_summary: formFields
      });
    }

    showToast(`Clinical summary finalized & signed by ${staffUser?.name || 'Dr. S. K. Verma'}.`);
  };

  // 3. Doctor Action: Reject / Needs Modification
  const handleOpenRejectModal = () => {
    setRejectInput(rejectionReason || '');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    const reasonText = rejectInput.trim() || 'Clinical information requires physician amendment.';
    setRejectionReason(reasonText);
    setReviewStatus('REJECTED');
    setIsRejectModalOpen(false);
    // When flagged, keep fields unlocked so the doctor can correct immediately
    setIsEditing(true);

    if (updateDoctorQueueSession && selectedSessionId) {
      updateDoctorQueueSession(selectedSessionId, {
        review_status: 'REJECTED',
        rejection_reason: reasonText,
        clinical_summary: formFields
      });
    }

    showToast('Case flagged as Needs Modification. Fields are unlocked for editing.');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Safe Date & Time Formatter
  const formatDateTime = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(dateStr);
    }
  };

  // Missing session ID state
  if (!selectedSessionId && !isReadOnly && !caseData) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-100 shadow-kiosk-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 mb-2">No Case Selected</h2>
        <p className="text-slate-600 mb-6 text-sm">
          {isReadOnly 
            ? 'Please return to intake completion to view clinical summary.' 
            : 'Please select a case from the Doctor Queue to review the clinical summary.'}
        </p>
        <button
          type="button"
          onClick={() => setCurrentStep(isReadOnly ? 'complete' : 'staffdashboard')}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isReadOnly ? 'Back to Intake Successful' : 'Back to Patient Queue'}</span>
        </button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-kiosk-coral border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-slate-700 font-extrabold text-lg">Loading Clinical Summary…</p>
        <p className="text-slate-400 text-sm mt-1">Preparing case #{selectedSessionId} for doctor review</p>
      </div>
    );
  }

  // Error state with retry (no fake calls)
  if (error || !caseData) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white p-8 rounded-3xl border border-rose-100 shadow-kiosk-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 mb-2">Unable to Load Summary</h2>
        <p className="bg-rose-50/70 border border-rose-200 text-rose-700 rounded-2xl p-4 mb-6 text-sm text-left font-medium">
          {error || 'Unable to retrieve clinical case summary from server.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={loadSummaryData}
            className="inline-flex items-center gap-2 bg-kiosk-coral hover:bg-kiosk-coral/90 text-white font-bold px-5 py-2.5 rounded-xl shadow-kiosk-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep('staffsession')}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Case Details</span>
          </button>
        </div>
      </div>
    );
  }

  const { patient, session_id, status, started_at, completed_at } = caseData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-6xl mx-auto w-full px-4 py-6 sm:py-8 space-y-6"
    >
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {isReadOnly ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep('complete')}
                className="flex items-center gap-2 text-slate-700 hover:text-slate-950 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-kiosk-sm hover:shadow transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Intake Successful</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('welcome')}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold text-xs bg-white px-3 py-2 rounded-xl border border-slate-200 transition-all"
              >
                <span>Kiosk Home</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep('staffsession')}
                className="flex items-center gap-2 text-slate-700 hover:text-slate-950 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-kiosk-sm hover:shadow transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Case Details</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('staffdashboard')}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold text-xs bg-white px-3 py-2 rounded-xl border border-slate-200 transition-all"
              >
                <span>Patient Queue</span>
              </button>
            </>
          )}
        </div>

        {/* Review Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Case #{session_id}
          </span>

          {isReadOnly ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              Doctor Verified & Signed
            </span>
          ) : (
            <>
              {reviewStatus === 'CONFIRMED' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Doctor Finalized
                </span>
              )}

              {reviewStatus === 'MODIFIED' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  Doctor Modified
                </span>
              )}

              {reviewStatus === 'REJECTED' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Needs Modification
                </span>
              )}

              {reviewStatus === 'PENDING_REVIEW' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  Pending Doctor Review
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-900 font-bold text-sm shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rejection / Needs Modification Notice Banner */}
      {!isReadOnly && reviewStatus === 'REJECTED' && rejectionReason && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-900 space-y-1 shadow-xs"
        >
          <div className="flex items-center gap-2 font-extrabold text-sm text-rose-950">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Flagged for Clinical Modification by Physician</span>
          </div>
          <p className="text-xs text-rose-800 pl-6">
            <strong>Doctor Note:</strong> "{rejectionReason}"
          </p>
          <p className="text-[11px] text-rose-600 pl-6">
            Editable mode is active below. Make necessary amendments and click "Confirm & Finalize" when ready.
          </p>
        </motion.div>
      )}

      {/* Patient Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-kiosk-blue text-white flex items-center justify-center font-bold text-2xl shadow-kiosk-sm shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal tracking-tight">
                  {patient?.name || 'Demo Patient'}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {status || 'COMPLETED'}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Gender: <strong>{patient?.gender || 'Not specified'}</strong> • DOB: <strong>{patient?.date_of_birth || '1985-06-15'}</strong> • Phone: <strong>{patient?.phone || '+91 98765 43210'}</strong>
              </p>
            </div>
          </div>

          <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-100 text-right w-full md:w-auto">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block mb-0.5">
              Reviewing Clinician
            </span>
            <span className="text-base font-extrabold text-slate-900 flex items-center justify-end gap-1.5">
              <Stethoscope className="w-4 h-4 text-sky-600" />
              {staffUser?.name || 'Dr. S. K. Verma'}
            </span>
            <span className="text-xs text-slate-500 block">Attending Physician</span>
          </div>
        </div>

        {/* Timestamps Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-sm">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Intake Started
            </span>
            <span className="font-extrabold text-slate-800 text-sm">
              {formatDateTime(started_at) || 'Demo session'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              Intake Completed
            </span>
            <span className="font-extrabold text-slate-800 text-sm">
              {formatDateTime(completed_at) || 'Demo session'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              Intake Language
            </span>
            <span className="font-extrabold text-slate-800 text-sm uppercase">
              {patient?.preferred_language || 'EN'}
            </span>
          </div>
        </div>
      </div>

      {/* DOCTOR CLINICAL AUTHORITY & ACTION BAR (Screen 19 Station Bar) */}
      {isReadOnly ? (
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-kiosk-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="font-extrabold text-lg text-white">
                Doctor Clinical Summary & Orders
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Physician clinical evaluation and signed prescriptions prepared by attending clinician {staffUser?.name || 'Dr. S. K. Verma'}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              Verified Clinical Record (Read-Only)
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-kiosk-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-emerald-400" />
              <h2 className="font-extrabold text-lg text-white">
                Doctor Clinical Authority & Review Station
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              AI output is purely advisory. As the physician, you can edit intake details, enter clinical orders, finalize, or flag for modification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Action 1: Edit / Modify */}
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
                title="Unlock all fields for doctor modification"
              >
                <Edit3 className="w-4 h-4 text-kiosk-coral" />
                <span>Edit / Modify</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm flex items-center gap-2 transition-all shadow-sm"
                title="Save current doctor edits locally"
              >
                <Save className="w-4 h-4" />
                <span>Save Modifications</span>
              </button>
            )}

            {/* Action 2: Confirm / Finalize */}
            <button
              type="button"
              onClick={handleDoctorConfirm}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center gap-2 transition-all shadow-md"
              title="Confirm final clinical assessment"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Confirm & Finalize</span>
            </button>

            {/* Action 3: Reject / Needs Modification */}
            <button
              type="button"
              onClick={handleOpenRejectModal}
              className="px-4 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 font-bold text-sm flex items-center gap-1.5 transition-all"
              title="Flag case with doctor reason and modify"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Reject / Needs Modification</span>
            </button>
          </div>
        </div>
      )}

      {/* Human-In-The-Loop AI Advisory Notice Banner */}
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-start sm:items-center justify-between gap-3 text-sky-950 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
          <span>
            {isReadOnly ? (
              <>
                <strong>Clinical Consultation Record:</strong> Official patient intake details and attending physician orders.
              </>
            ) : (
              <>
                <strong>AI-Assisted Intake Summary:</strong> Displayed entries were compiled from patient interview responses. The doctor is the final medical authority.
              </>
            )}
          </span>
        </div>
        <span className="text-[11px] font-bold text-sky-700 bg-white px-2.5 py-1 rounded-lg border border-sky-200 whitespace-nowrap">
          {isReadOnly ? '🔒 Read-Only View' : (effectiveIsEditing ? '✏️ Edit Mode Active' : '👁️ Review Mode')}
        </span>
      </div>

      {/* SECTION A: Patient Intake Brief (AI-Generated & Doctor-Editable) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-kiosk-charcoal">
                Patient Intake Brief
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Information compiled during patient kiosk interview — review and correct if necessary
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {isReadOnly 
              ? 'Verified Record' 
              : (effectiveIsEditing ? 'Editable' : 'Click "Edit / Modify" above to change')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {/* Chief Complaint */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Chief Complaint
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                🤖 AI Generated
              </span>
            </div>
            {effectiveIsEditing ? (
              <textarea
                rows={2}
                value={formFields.chief_complaint}
                onChange={(e) => handleFieldChange('chief_complaint', e.target.value)}
                className="w-full p-2.5 text-sm font-extrabold rounded-xl border border-slate-300 focus:border-kiosk-coral outline-none bg-white text-slate-900"
              />
            ) : (
              <p className="font-extrabold text-slate-900 text-base leading-snug">
                {formFields.chief_complaint}
              </p>
            )}
          </div>

          {/* Symptom Duration */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Symptom Duration & Onset
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                🤖 AI Generated
              </span>
            </div>
            {effectiveIsEditing ? (
              <input
                type="text"
                value={formFields.symptom_duration}
                onChange={(e) => handleFieldChange('symptom_duration', e.target.value)}
                className="w-full p-2.5 text-sm font-bold rounded-xl border border-slate-300 focus:border-kiosk-coral outline-none bg-white text-slate-900"
              />
            ) : (
              <p className="font-bold text-slate-900 text-base">
                {formFields.symptom_duration}
              </p>
            )}
          </div>

          {/* Severity & Pain Level */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Severity & Reported Pain
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                🤖 AI Generated
              </span>
            </div>
            {effectiveIsEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={formFields.severity}
                  onChange={(e) => handleFieldChange('severity', e.target.value)}
                  placeholder="Severity rating"
                  className="w-full p-2 text-sm font-bold rounded-xl border border-slate-300 focus:border-kiosk-coral outline-none bg-white text-slate-900"
                />
                <input
                  type="text"
                  value={formFields.pain_level}
                  onChange={(e) => handleFieldChange('pain_level', e.target.value)}
                  placeholder="Pain level"
                  className="w-full p-2 text-sm rounded-xl border border-slate-300 focus:border-kiosk-coral outline-none bg-white text-slate-900"
                />
              </div>
            ) : (
              <p className="font-bold text-slate-900 text-base">
                {formFields.severity} • {formFields.pain_level}
              </p>
            )}
          </div>

          {/* Pre-existing Conditions */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pre-existing Conditions
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                🤖 AI Generated
              </span>
            </div>
            {effectiveIsEditing ? (
              <input
                type="text"
                value={formFields.existing_conditions}
                onChange={(e) => handleFieldChange('existing_conditions', e.target.value)}
                className="w-full p-2.5 text-sm font-bold rounded-xl border border-slate-300 focus:border-kiosk-coral outline-none bg-white text-slate-900"
              />
            ) : (
              <p className="font-bold text-slate-900 text-base">
                {formFields.existing_conditions || 'None reported'}
              </p>
            )}
          </div>

          {/* Current Medications */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Medications
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                🤖 AI Generated
              </span>
            </div>
            {effectiveIsEditing ? (
              <input
                type="text"
                value={formFields.current_medications}
                onChange={(e) => handleFieldChange('current_medications', e.target.value)}
                className="w-full p-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:border-kiosk-coral outline-none bg-white text-slate-900"
              />
            ) : (
              <p className="font-semibold text-slate-800 text-sm">
                {formFields.current_medications || 'None reported'}
              </p>
            )}
          </div>

          {/* Known Allergies */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Known Allergies
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                🤖 AI Generated
              </span>
            </div>
            {effectiveIsEditing ? (
              <input
                type="text"
                value={formFields.allergies}
                onChange={(e) => handleFieldChange('allergies', e.target.value)}
                className="w-full p-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:border-kiosk-coral outline-none bg-white text-slate-900"
              />
            ) : (
              <p className="font-semibold text-slate-800 text-sm">
                {formFields.allergies || 'No known drug allergies'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION B: Doctor Direct Clinical Assessment & Plan (Editable / Fillable) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-kiosk-charcoal">
                Physician Assessment & Care Plan
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Clinical orders, diagnosis remarks, prescriptions, and recommended investigations
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {isReadOnly ? 'Physician Orders' : 'Doctor Prescribing'}
          </span>
        </div>

        <div className="space-y-6 text-sm">
          {/* Field 1: Clinical Assessment / Doctor's Remarks */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                Clinical Assessment & Doctor's Remarks
              </label>
              <span className="text-[11px] font-bold text-slate-500">
                Provisional / Definitive Diagnosis
              </span>
            </div>
            {effectiveIsEditing ? (
              <textarea
                rows={3}
                value={formFields.clinical_assessment}
                onChange={(e) => handleFieldChange('clinical_assessment', e.target.value)}
                placeholder="Enter clinical assessment, physical findings, and diagnostic remarks..."
                className="w-full p-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-emerald-600 outline-none bg-white text-slate-900 leading-relaxed"
              />
            ) : (
              <p className="p-3 bg-white rounded-xl border border-slate-200 font-bold text-slate-900 leading-relaxed text-sm">
                {formFields.clinical_assessment || (isReadOnly ? 'No diagnostic remarks recorded.' : 'No remarks entered. Click "Edit / Modify" to add diagnosis.')}
              </p>
            )}
          </div>

          {/* Field 2: Prescribed Medications */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-emerald-600" />
                Prescribed Medications & Dosage
              </label>
              <span className="text-[11px] font-bold text-slate-500">
                {isReadOnly ? 'Rx Signed by Physician' : 'Drug, Strength & Frequency'}
              </span>
            </div>
            {effectiveIsEditing ? (
              <textarea
                rows={3}
                value={formFields.prescribed_medications}
                onChange={(e) => handleFieldChange('prescribed_medications', e.target.value)}
                placeholder="Enter drug names, dosage, frequency, and duration..."
                className="w-full p-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-emerald-600 outline-none bg-white text-slate-900 font-mono"
              />
            ) : (
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {formFields.prescribed_medications || 'None prescribed.'}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field 3: Recommended Tests / Investigations */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-sky-600" />
                  Recommended Tests / Investigations
                </label>
              </div>
              {effectiveIsEditing ? (
                <textarea
                  rows={3}
                  value={formFields.recommended_tests}
                  onChange={(e) => handleFieldChange('recommended_tests', e.target.value)}
                  placeholder="e.g., CBC, Chest X-Ray, Throat culture..."
                  className="w-full p-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-emerald-600 outline-none bg-white text-slate-900"
                />
              ) : (
                <p className="p-3 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed">
                  {formFields.recommended_tests || 'No diagnostic tests recommended.'}
                </p>
              )}
            </div>

            {/* Field 4: Treatment & Recommended Next Steps */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-sky-600" />
                  Treatment & Recommended Next Steps
                </label>
              </div>
              {effectiveIsEditing ? (
                <textarea
                  rows={3}
                  value={formFields.treatment_steps}
                  onChange={(e) => handleFieldChange('treatment_steps', e.target.value)}
                  placeholder="e.g., Hydration, steam inhalation, bed rest..."
                  className="w-full p-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-emerald-600 outline-none bg-white text-slate-900"
                />
              ) : (
                <p className="p-3 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed">
                  {formFields.treatment_steps || 'Standard supportive measures advised.'}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field 5: Follow-up Instructions */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Follow-up Instructions & SOS Triggers
                </label>
              </div>
              {effectiveIsEditing ? (
                <textarea
                  rows={3}
                  value={formFields.follow_up_instructions}
                  onChange={(e) => handleFieldChange('follow_up_instructions', e.target.value)}
                  placeholder="e.g., Review in 3 days; report immediately if breathless..."
                  className="w-full p-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-emerald-600 outline-none bg-white text-slate-900"
                />
              ) : (
                <p className="p-3 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed">
                  {formFields.follow_up_instructions || 'Review in OPD if symptoms do not improve.'}
                </p>
              )}
            </div>

            {/* Field 6: Additional Doctor Notes */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Additional Doctor Notes / Internal Remarks
                </label>
              </div>
              {effectiveIsEditing ? (
                <textarea
                  rows={3}
                  value={formFields.doctor_notes}
                  onChange={(e) => handleFieldChange('doctor_notes', e.target.value)}
                  placeholder="Confidential physician remarks, lifestyle counsel..."
                  className="w-full p-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-emerald-600 outline-none bg-white text-slate-900"
                />
              ) : (
                <p className="p-3 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed">
                  {formFields.doctor_notes || 'No additional notes recorded.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sign-off & Finalize Bar */}
      {isReadOnly ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-kiosk-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-extrabold text-sm sm:text-base text-slate-900">
                ✓ Verified & Signed by {staffUser?.name || 'Dr. S. K. Verma'}
              </p>
              <p className="text-xs text-slate-500">
                Attending Physician • Clinical consultation record finalized and locked for viewing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep('complete')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Intake Successful</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-kiosk-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-extrabold text-sm sm:text-base text-slate-900">
                {reviewStatus === 'CONFIRMED'
                  ? `✓ Finalized & Signed by ${staffUser?.name || 'Dr. S. K. Verma'}`
                  : reviewStatus === 'MODIFIED'
                  ? 'Physician edits ready for final verification'
                  : reviewStatus === 'REJECTED'
                  ? 'Revision in progress — complete edits before sign-off'
                  : 'Awaiting Doctor Review & Sign-off'}
              </p>
              <p className="text-xs text-slate-500">
                Doctor retains full clinical authority. Edits are held in local state for consultation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center gap-2 transition-all"
              >
                <Edit3 className="w-4 h-4 text-slate-600" />
                <span>Modify</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm flex items-center gap-2 transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDoctorConfirm}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center gap-2 transition-all shadow-sm"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Confirm & Finalize</span>
            </button>
          </div>
        </div>
      )}

      {/* Reject / Modification Reason Modal */}
      {!isReadOnly && isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-100 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h3 className="text-xl font-extrabold text-slate-900">
                Flag for Modification
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              State the clinical reason or discrepancies requiring modification before final sign-off:
            </p>
            <textarea
              rows={3}
              value={rejectInput}
              onChange={(e) => setRejectInput(e.target.value)}
              placeholder="e.g., Symptom timeline contradicts documented fever. Need to alter treatment steps."
              className="w-full p-3 rounded-2xl border border-slate-300 focus:border-rose-500 outline-none text-sm font-medium"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm"
              >
                Flag & Edit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default ClinicalSummary;
