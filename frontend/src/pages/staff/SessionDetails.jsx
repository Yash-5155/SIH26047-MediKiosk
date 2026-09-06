import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../../context/KioskContext';
import { fetchDoctorSessionDetails } from '../../services/apiService';
import { DEMO_SESSION_ID, DEMO_CASE_DETAILS } from '../../data/demoPatient';
import { 
  User, 
  Clock, 
  FileText, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2, 
  Stethoscope, 
  MousePointer, 
  Mic,
  Keyboard,
  Calendar,
  Phone,
  Globe,
  AlertCircle,
  RefreshCw,
  Hash
} from 'lucide-react';

/**
 * SCREEN 18 — Doctor Case Details
 * 
 * Connected to GET /api/doctor/sessions/{session_id}.
 * Displays:
 *  1. Case Header: Patient Name, Session ID, Status, Started At, Completed At.
 *  2. Patient Demographics: Actual backend fields only (Name, DOB, Gender, Phone, Preferred Language).
 *  3. Patient Intake / Case Responses: Doctor-readable list of questions, patient answers, and input mode badges.
 *  4. Navigation: "View Clinical Summary →" (handoff to staffsummary) and "Back to Patient Queue".
 *  5. Robust States: Loading, Error with Retry, Missing Session ID, Empty Responses, Null guards.
 */
export function SessionDetails() {
  const { 
    selectedSessionId, 
    setSelectedSessionId, 
    setCurrentStep, 
    setIsDoctorReviewReadOnly,
    staffUser 
  } = useKiosk();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real case details from backend (or temporary demo patient case)
  const loadCaseDetails = useCallback(async () => {
    if (!selectedSessionId) {
      setLoading(false);
      return;
    }

    // Handle temporary frontend test case (Session ID: 9999)
    if (String(selectedSessionId) === String(DEMO_SESSION_ID)) {
      setCaseData(DEMO_CASE_DETAILS);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchDoctorSessionDetails(selectedSessionId);
      setCaseData(data);
    } catch (err) {
      console.error('[SessionDetails] Failed to fetch case details:', err);
      setError(err?.message || 'Unable to connect to doctor case service.');
    } finally {
      setLoading(false);
    }
  }, [selectedSessionId]);


  useEffect(() => {
    loadCaseDetails();
  }, [loadCaseDetails]);

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

  // Safe Date Only Formatter
  const formatDateOnly = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return String(dateStr);
    }
  };

  // Status Badge Renderer
  const renderStatusBadge = (status) => {
    const norm = (status || 'UNKNOWN').toUpperCase();
    if (norm === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Completed
        </span>
      );
    }
    if (norm === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
        {norm}
      </span>
    );
  };

  // Input Mode Badge Renderer
  const renderInputModeBadge = (mode) => {
    const normalized = (mode || 'TOUCH').toUpperCase();
    if (normalized === 'VOICE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Mic className="w-3.5 h-3.5 text-amber-600" />
          Voice
        </span>
      );
    }
    if (normalized === 'TEXT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
          <Keyboard className="w-3.5 h-3.5 text-purple-600" />
          Text
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
        <MousePointer className="w-3.5 h-3.5 text-sky-600" />
        {normalized || 'Touch'}
      </span>
    );
  };

  // Navigation Handlers
  const handleBackToQueue = () => {
    setCurrentStep('staffdashboard');
  };

  const handleViewClinicalSummary = () => {
    if (caseData?.session_id) {
      setSelectedSessionId(caseData.session_id);
    }
    // Staff Portal workflow: Ensure Editable mode
    if (setIsDoctorReviewReadOnly) {
      setIsDoctorReviewReadOnly(false);
    }
    setCurrentStep('staffsummary');
  };

  // 1. Missing Session ID State
  if (!selectedSessionId) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-100 shadow-kiosk-md text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 mb-2">No Case Selected</h2>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
          Please select a patient case from the Doctor Dashboard queue to inspect intake details.
        </p>
        <button
          type="button"
          onClick={handleBackToQueue}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Queue</span>
        </button>
      </motion.div>
    );
  }

  // 2. Loading State
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-kiosk-coral border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-slate-700 font-extrabold text-lg">Loading Case Details…</p>
        <p className="text-slate-400 text-sm mt-1">Retrieving intake session record #{selectedSessionId}</p>
      </div>
    );
  }

  // 3. Error State with Retry (strictly no mock fallback on error)
  if (error || !caseData) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto my-12 bg-white p-8 rounded-3xl border border-rose-100 shadow-kiosk-md text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 mb-2">Unable to Load Case Details</h2>
        <div className="bg-rose-50/70 border border-rose-200 text-rose-700 rounded-2xl p-4 mb-6 text-sm text-left font-medium">
          {error || 'An unexpected error occurred while fetching case data from the backend.'}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={loadCaseDetails}
            className="inline-flex items-center gap-2 bg-kiosk-coral hover:bg-kiosk-coral/90 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-kiosk-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
          <button
            type="button"
            onClick={handleBackToQueue}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Patient Queue</span>
          </button>
        </div>
      </motion.div>
    );
  }

  const { patient, responses = [], session_id, status, started_at, completed_at } = caseData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-5xl mx-auto w-full px-4 py-6 sm:py-8 space-y-6"
    >
      {/* Top Action / Breadcrumbs Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBackToQueue}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-950 font-bold text-sm bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-kiosk-sm hover:shadow transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Queue</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            Session {session_id}
          </span>
          {renderStatusBadge(status)}
        </div>
      </div>

      {/* SECTION 1: Case Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-kiosk-blue text-white flex items-center justify-center font-bold text-2xl shadow-kiosk-sm shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal tracking-tight">
                  {patient?.name || 'Unknown Patient'}
                </h1>
                {renderStatusBadge(status)}
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                <span>Case #{session_id}</span>
                <span>•</span>
                <span>Doctor Portal Intake Review</span>
              </p>
            </div>
          </div>

          {/* Quick Doctor Handoff Button (Top Action) */}
          <button
            type="button"
            onClick={handleViewClinicalSummary}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-kiosk-coral hover:bg-kiosk-coral/90 text-white font-extrabold text-sm shadow-kiosk-md transition-all shrink-0 hover:translate-x-0.5"
          >
            <span>View Clinical Summary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Timestamps Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 text-sm">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Started At
            </span>
            <span className="font-extrabold text-slate-800 text-sm">
              {formatDateTime(started_at) || '—'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              Completed At
            </span>
            <span className={`font-extrabold text-sm ${completed_at ? 'text-slate-800' : 'text-amber-600 italic'}`}>
              {formatDateTime(completed_at) || 'Active / In Progress'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 sm:col-span-2 lg:col-span-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              Preferred Language
            </span>
            <span className="font-extrabold text-slate-800 text-sm uppercase">
              {patient?.preferred_language || 'EN'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Patient Demographics (Backend actual fields only) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md">
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-kiosk-charcoal">
              Patient Demographics
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Registered patient details provided at intake registration
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {/* Patient Name */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Full Name
            </span>
            <p className="font-extrabold text-slate-800 text-base">
              {patient?.name || 'Unknown'}
            </p>
          </div>

          {/* Date of Birth */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date of Birth
            </span>
            <p className="font-bold text-slate-800 text-base">
              {formatDateOnly(patient?.date_of_birth) || 'N/A'}
            </p>
          </div>

          {/* Gender */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Gender
            </span>
            <p className="font-bold text-slate-800 text-base capitalize">
              {patient?.gender || 'Not specified'}
            </p>
          </div>

          {/* Phone Number */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Phone
            </span>
            <p className="font-bold text-slate-800 text-base">
              {patient?.phone || 'Not provided'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Patient Intake / Case Responses */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-kiosk-charcoal">
                Intake Questionnaire Responses
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Recorded patient answers in chronological questionnaire sequence
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {responses.length} {responses.length === 1 ? 'Response' : 'Responses'}
          </span>
        </div>

        {/* Empty Responses State */}
        {responses.length === 0 ? (
          <div className="py-12 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-bold text-sm">
              No intake responses recorded for this session.
            </p>
            <p className="text-slate-400 text-xs mt-1">
              The patient may have completed registration without questionnaire answers.
            </p>
          </div>
        ) : (
          /* Doctor-Readable List of Responses */
          <div className="space-y-3 pt-2">
            {responses.map((item, index) => {
              const hasAnswer = item.answer && String(item.answer).trim() !== '';
              return (
                <div
                  key={item.question_key || index}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                        Q{index + 1}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                        {item.question}
                      </h3>
                    </div>

                    <div className="pl-0 sm:pl-7">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        Patient Answer:
                      </p>
                      {hasAnswer ? (
                        <p className="text-base font-extrabold text-kiosk-charcoal leading-relaxed">
                          {item.answer}
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-slate-400 italic">
                          No response recorded / Skipped
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="self-start sm:self-center shrink-0 pt-1 sm:pt-0 sm:pl-4">
                    {renderInputModeBadge(item.input_mode)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 4: Navigation / Action Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-kiosk-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-white">
              Ready for Clinical Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Proceed to inspect clinical summary findings and physician review.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleBackToQueue}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Patient Queue</span>
          </button>

          <button
            type="button"
            onClick={handleViewClinicalSummary}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-kiosk-coral hover:bg-kiosk-coral/90 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-kiosk-sm hover:translate-x-0.5"
          >
            <span>View Clinical Summary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
export default SessionDetails;

