import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { 
  CheckCircle2, 
  Ticket, 
  Printer, 
  RefreshCw, 
  Check, 
  UserCog, 
  MapPin, 
  Clock, 
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';
import { DEMO_SESSION_ID } from '../data/demoPatient';

/**
 * SCREEN 15 — Submission / Completion
 * 
 * Final submission/completion state after patient reviews summary.
 *  - Confirms successful submission
 *  - Indicates information has been sent for doctor review
 *  - Displays queue token and assigned room
 *  - Non-diagnostic clinical disclaimer
 *  - Clean kiosk controls: Print receipt, New session, and View Doctor Portal
 */
export function Complete() {
  const { 
    language, 
    token, 
    resetSession, 
    clinicalSummary, 
    setCurrentStep, 
    setStaffAuthenticated,
    setStaffUser,
    session,
    setSelectedSessionId,
    setIsDoctorReviewReadOnly,
    t 
  } = useKiosk();

  const isHindi = language === 'hi';
  const [printed, setPrinted] = useState(false);

  const displayToken = token || clinicalSummary?.generatedToken || 'A-104';
  const isHighPriority = displayToken.startsWith('E') || clinicalSummary?.priority === 'HIGH';

  const assignedRoom = isHighPriority
    ? (isHindi ? 'आपातकालीन ट्राइएज कक्ष — कमरा E-01' : 'Emergency Triage Room — Room E-01')
    : (isHindi ? 'सामान्य परामर्श कक्ष — कमरा 204' : 'Consultation Desk — Room 204');

  const waitTime = isHighPriority
    ? (isHindi ? 'तत्काल (0-5 मिनट)' : 'Immediate (0-5 mins)')
    : (isHindi ? '15 से 20 मिनट' : '15 to 20 minutes');

  const handlePrint = () => {
    setPrinted(true);
    setTimeout(() => setPrinted(false), 3500);
  };

  const handleGoToDoctor = () => {
    // Automatically authenticate demo staff for quick testing
    setStaffUser({ name: 'Dr. S. K. Verma', role: 'Attending Physician', id: 'DR-4091' });
    setStaffAuthenticated(true);
    // For frontend demo flow from Intake Successful, activate Read-Only mode
    if (setIsDoctorReviewReadOnly) {
      setIsDoctorReviewReadOnly(true);
    }
    // Directly open the demo clinical summary without backend calls
    if (setSelectedSessionId) {
      setSelectedSessionId(DEMO_SESSION_ID);
    }
    setCurrentStep('clinicalsummary');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-3xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col items-center justify-center text-center"
    >
      {/* Animated Success Badge */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-kiosk-md border-4 border-emerald-200/70">
        <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.5]" />
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl sm:text-5xl font-black text-kiosk-charcoal tracking-tight mb-2">
        {isHindi ? 'इनटेक सफलतापूर्वक सबमिट हुआ!' : 'Intake Successfully Submitted!'}
      </h1>
      <p className="text-slate-600 text-base sm:text-lg max-w-lg mb-6 leading-relaxed">
        {isHindi
          ? 'आपकी जानकारी और लक्षण सारांश डॉक्टर के परामर्श पोर्टल पर सुरक्षित रूप से भेज दिए गए हैं।'
          : 'Your clinical responses and extracted documents have been sent to the attending physician for review.'}
      </p>

      {/* Token Card */}
      <div className="bg-gradient-to-br from-white via-kiosk-peach/20 to-white rounded-3xl p-6 sm:p-8 border-2 border-kiosk-coral/30 shadow-kiosk-lg mb-6 w-full max-w-md relative">
        <div className="flex items-center justify-center gap-1.5 text-kiosk-coral font-extrabold text-xs sm:text-sm uppercase tracking-widest mb-1">
          <Ticket className="w-4 h-4" />
          <span>{isHindi ? 'आपका कतार टोकन' : 'YOUR QUEUE TOKEN'}</span>
        </div>

        <div className="text-6xl sm:text-7xl font-black text-kiosk-coral tracking-tight font-mono my-2">
          {displayToken}
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-left">
          <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3 text-kiosk-blue" />
              {isHindi ? 'कक्ष / डेस्क' : 'Assigned Desk'}
            </span>
            <p className="font-extrabold text-xs sm:text-sm text-kiosk-charcoal mt-0.5 leading-tight">
              {assignedRoom}
            </p>
          </div>

          <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600" />
              {isHindi ? 'प्रतीक्षा समय' : 'Est. Wait'}
            </span>
            <p className="font-extrabold text-xs sm:text-sm text-kiosk-charcoal mt-0.5 leading-tight">
              {waitTime}
            </p>
          </div>
        </div>
      </div>

      {/* Non-Diagnostic Disclaimer */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-2.5 max-w-md text-left mb-6">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed font-medium">
          {isHindi
            ? 'सूचना: यह केवल क्लिनिकल कतार प्रबंधन है। कोई अंतिम निदान या उपचार निर्णय नहीं लिया गया है।'
            : 'Notice: This screening assists triage only. No diagnosis or treatment decision has been finalized.'}
        </p>
      </div>

      {/* Primary Actions */}
      <div className="w-full max-w-md space-y-3">
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={handlePrint}
          icon={printed ? Check : Printer}
          iconPosition="left"
        >
          {printed
            ? (isHindi ? 'रसीद प्रिंटर पर भेजी गई!' : 'Receipt Sent to Printer!')
            : (isHindi ? 'कागजी पर्ची प्रिंट करें' : 'Print Paper Token Receipt')}
        </Button>

        <Button
          variant="coral"
          size="xl"
          fullWidth
          onClick={resetSession}
          icon={RefreshCw}
          iconPosition="left"
        >
          {isHindi ? 'नया मरीज इनटेक शुरू करें' : 'Start New Intake Session'}
        </Button>

        {/* Seamless Doctor Side Demo Transition */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGoToDoctor}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <UserCog className="w-4 h-4 text-emerald-400" />
            <span>
              {isHindi ? 'डॉक्टर समीक्षा पोर्टल खोलें →' : 'Open Doctor Review Portal →'}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
