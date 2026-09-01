import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from './Button';
import { ShieldAlert, Clock, User, FileText, AlertTriangle, X, CheckCircle, MapPin } from 'lucide-react';

export function PatientSummaryModal() {
  const { selectedPatientForSummary, setSelectedPatientForSummary, t } = useKiosk();

  if (!selectedPatientForSummary) return null;

  const patient = selectedPatientForSummary;

  const priorityBadges = {
    HIGH: 'bg-rose-600 text-white',
    MODERATE: 'bg-kiosk-blue text-white',
    ROUTINE: 'bg-emerald-600 text-white'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-kiosk-lg border border-slate-100 relative max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedPatientForSummary(null)}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6 pr-8">
            <div className="w-14 h-14 rounded-2xl bg-kiosk-blue-light text-kiosk-blue flex items-center justify-center font-black text-xl shadow-kiosk-sm">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal">
                  {patient.fullName}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${priorityBadges[patient.priority] || 'bg-slate-500 text-white'}`}>
                  {patient.priority}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                Token: <strong className="font-mono text-kiosk-coral">{patient.token}</strong> • {patient.age} yrs, {patient.gender} • Arrived {patient.arrivalTime}
              </p>
            </div>
          </div>

          {/* Red Flag Warning Box (if High Priority) */}
          {patient.redFlags && patient.redFlags.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl mb-6">
              <span className="font-bold text-rose-800 text-sm flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                {t('redFlagsNoted')}
              </span>
              <ul className="list-disc list-inside space-y-1 text-sm font-semibold text-rose-900">
                {patient.redFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Presenting Symptoms */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-kiosk-blue" />
              {t('presentingSymptoms')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {patient.symptoms.map((sym, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-800 text-sm font-bold px-3 py-1.5 rounded-xl border border-slate-200">
                  {sym}
                </span>
              ))}
            </div>
          </div>

          {/* Clinical Triage Summary Narrative */}
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('clinicalSummaryTitle')} (Demo Generated)
            </h3>
            <p className="text-slate-800 font-medium text-base leading-relaxed">
              {patient.summary}
            </p>
          </div>

          {/* Assigned Location & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-kiosk-peach/50 p-4 rounded-2xl border border-kiosk-peach-dark/30 mb-6">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                {t('assignedAction')}
              </span>
              <span className="font-extrabold text-kiosk-charcoal text-base flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-kiosk-coral" />
                {patient.assignedDesk}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Queue Status
              </span>
              <span className="font-extrabold text-kiosk-charcoal text-base flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-kiosk-blue" />
                {patient.status}
              </span>
            </div>
          </div>

          <Button
            variant="coral"
            size="lg"
            fullWidth
            onClick={() => setSelectedPatientForSummary(null)}
          >
            {t('closeBtn')}
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
