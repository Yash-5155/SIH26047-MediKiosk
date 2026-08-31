import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { mockApi } from '../../services/mockApi';
import { Button } from '../../components/Button';
import { 
  User, 
  Clock, 
  FileText, 
  ShieldAlert, 
  MapPin, 
  ArrowLeft, 
  CheckCircle, 
  Stethoscope, 
  Touchpad, 
  Mic 
} from 'lucide-react';

export function SessionDetails() {
  const { selectedSessionId, setCurrentStep, t } = useApp();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getCaseSummary(selectedSessionId || 'SES-89201').then((res) => {
      setCaseData(res);
      setLoading(false);
    });
  }, [selectedSessionId]);

  if (loading || !caseData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-kiosk-coral border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-bold text-lg">Loading session case details…</p>
      </div>
    );
  }

  const { patient, responses, clinical_summary, session_id, token, priority, status, started_at, completed_at } = caseData;

  const priorityBadges = {
    HIGH: 'bg-rose-600 text-white',
    MODERATE: 'bg-kiosk-blue text-white',
    ROUTINE: 'bg-emerald-600 text-white'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-6xl mx-auto w-full px-4 py-6 sm:py-8"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentStep('staffdashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-kiosk-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard Queue</span>
        </button>

        <span className="text-xs font-mono font-bold text-slate-400">
          Session ID: {session_id}
        </span>
      </div>

      {/* Patient & Session Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-kiosk-blue text-white flex items-center justify-center font-bold text-2xl shadow-kiosk-sm shrink-0">
              <User className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-kiosk-charcoal tracking-tight">
                  {patient.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${priorityBadges[priority]}`}>
                  {priority} PRIORITY
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1">
                DOB: <strong>{patient.date_of_birth}</strong> ({patient.age} yrs) • Gender: <strong>{patient.gender}</strong> • Phone: <strong>{patient.phone || 'N/A'}</strong>
              </p>
            </div>
          </div>

          <div className="bg-kiosk-peach/50 p-4 rounded-2xl border border-kiosk-peach-dark/30 text-right w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Queue Token</span>
            <span className="text-3xl font-black text-kiosk-coral font-mono">{token || 'A-104'}</span>
          </div>
        </div>

        {/* Session Timestamps & Status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Session Status</span>
            <span className="font-extrabold text-slate-800">{status}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Started At</span>
            <span className="font-semibold text-slate-700">{started_at ? new Date(started_at).toLocaleTimeString() : '—'}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Completed At</span>
            <span className="font-semibold text-slate-700">{completed_at ? new Date(completed_at).toLocaleTimeString() : '—'}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Preferred Language</span>
            <span className="font-extrabold text-slate-800 uppercase">{patient.preferred_language || 'EN'}</span>
          </div>
        </div>
      </div>

      {/* Clinical Intake Summary Card (Backend ClinicalSummary Schema) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md mb-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
          <Stethoscope className="w-6 h-6 text-kiosk-coral" />
          <h2 className="text-2xl font-extrabold text-kiosk-charcoal">
            Clinical Intake Summary (Demo Generated)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Chief Complaint</span>
            <span className="font-extrabold text-kiosk-charcoal text-base">{clinical_summary?.chief_complaint || 'N/A'}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Symptom Duration</span>
            <span className="font-extrabold text-kiosk-charcoal text-base">{clinical_summary?.symptom_duration || 'N/A'}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Severity & Pain Level</span>
            <span className="font-extrabold text-kiosk-coral text-base">{clinical_summary?.severity} (Level {clinical_summary?.pain_level})</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Fever Presence</span>
            <span className="font-extrabold text-kiosk-charcoal text-base">{clinical_summary?.has_fever || 'No'}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Pre-existing Conditions</span>
            <span className="font-semibold text-slate-800 text-base">{clinical_summary?.existing_conditions || 'None reported'}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Current Medications</span>
            <span className="font-semibold text-slate-800 text-base">{clinical_summary?.current_medications || 'None'}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Known Allergies</span>
            <span className="font-semibold text-slate-800 text-base">{clinical_summary?.allergies || 'None reported'}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Past Medical History</span>
            <span className="font-semibold text-slate-800 text-base">{clinical_summary?.past_medical_history || 'None'}</span>
          </div>
        </div>

        {clinical_summary?.additional_information && (
          <div className="mt-4 bg-sky-50 border border-sky-200 p-4 rounded-2xl text-sky-900 text-sm font-medium">
            <strong>Clinical Note:</strong> {clinical_summary.additional_information}
          </div>
        )}
      </div>

      {/* Intake Responses Table (Backend DoctorCaseResponse Schema) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-kiosk-md overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-kiosk-charcoal flex items-center gap-2">
            <FileText className="w-5 h-5 text-kiosk-blue" />
            Intake Responses (DoctorCaseResponse)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Q#</th>
                <th className="py-4 px-6">Question Key</th>
                <th className="py-4 px-6">Question Text</th>
                <th className="py-4 px-6">Patient Answer</th>
                <th className="py-4 px-6">Input Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {responses && responses.length > 0 ? (
                responses.map((resp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-400">{resp.question_id || idx + 1}</td>
                    <td className="py-4 px-6 font-mono font-bold text-kiosk-blue text-xs">{resp.question_key}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{resp.question}</td>
                    <td className="py-4 px-6 font-extrabold text-kiosk-charcoal text-base">{resp.answer}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold inline-flex items-center gap-1 uppercase ${
                        resp.input_mode === 'VOICE' ? 'bg-kiosk-peach text-kiosk-coral' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {resp.input_mode === 'VOICE' ? <Mic className="w-3 h-3" /> : <Touchpad className="w-3 h-3" />}
                        {resp.input_mode || 'TOUCH'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 font-semibold">
                    No individual responses recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
