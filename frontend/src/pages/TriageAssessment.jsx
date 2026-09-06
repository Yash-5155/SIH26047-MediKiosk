import React from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { 
  Activity, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Ticket, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  Info,
  Stethoscope,
  HeartPulse,
  FileCheck2
} from 'lucide-react';

/**
 * SCREEN 15 — Triage Assessment
 * 
 * Dedicated clinical triage screen separated from Patient Intake Summary.
 * Evaluates patient's presenting symptoms and medical records for care urgency.
 * 
 * Displays:
 *  - Header & Step 4: Triage Assessment
 *  - Prominent visual priority status indicator (High / Moderate / Routine)
 *  - Clear clinical explanation of assessed priority
 *  - Assigned Consultation Room & Queue Token
 *  - Evaluated key clinical factors
 *  - Non-diagnostic hospital queue disclaimer
 *  - Navigation: "← Back to Summary" and "Continue / Submit to Doctor →"
 */
export function TriageAssessment() {
  const { 
    language, 
    setCurrentStep, 
    clinicalSummary, 
    triageResult,
    token, 
    answers,
    medicalDocuments,
    patient,
    t 
  } = useKiosk();

  const isHindi = language === 'hi';

  // Determine active priority strictly from existing clinicalSummary or triageResult
  const priority = 
    triageResult?.priority || 
    clinicalSummary?.priority || 
    'ROUTINE';

  const assignedToken = 
    token || 
    triageResult?.token || 
    clinicalSummary?.generatedToken || 
    (priority === 'HIGH' ? 'E-101' : priority === 'MODERATE' ? 'M-102' : 'A-104');

  // Priority Visual Configurations
  const priorityConfigs = {
    HIGH: {
      cardBorder: 'border-rose-300',
      cardBg: 'bg-gradient-to-br from-rose-50/90 via-white to-rose-50/50',
      badgeBg: 'bg-rose-600 text-white',
      ringColor: 'ring-rose-500/20',
      iconBg: 'bg-rose-100 text-rose-700',
      iconBorder: 'border-rose-200',
      titleEn: 'High Priority Triage',
      titleHi: 'उच्च प्राथमिकता ट्राइएज',
      statusSubEn: 'Urgent Care Required',
      statusSubHi: 'त्वरित देखभाल आवश्यक',
      advisoryEn: 'Based on presenting symptom severity or reported acute discomfort, clinical staff has been alerted for priority assessment.',
      advisoryHi: 'लक्षणों की गंभीरता या तीव्र दर्द के आधार पर क्लिनिकल स्टाफ को प्राथमिकता से जांच हेतु सतर्क किया गया है।',
      roomEn: 'Emergency Triage Room — Room E-01',
      roomHi: 'आपातकालीन ट्राइएज कक्ष — कमरा E-01',
      waitEn: 'Immediate (< 5 mins)',
      waitHi: 'तत्काल (0-5 मिनट)',
      icon: ShieldAlert
    },
    MODERATE: {
      cardBorder: 'border-sky-300',
      cardBg: 'bg-gradient-to-br from-sky-50/90 via-white to-sky-50/50',
      badgeBg: 'bg-kiosk-blue text-white',
      ringColor: 'ring-kiosk-blue/20',
      iconBg: 'bg-sky-100 text-kiosk-blue',
      iconBorder: 'border-sky-200',
      titleEn: 'Moderate Priority Queue',
      titleHi: 'मध्यम प्राथमिकता कतार',
      statusSubEn: 'Priority Physician Review',
      statusSubHi: 'प्राथमिकता डॉक्टर समीक्षा',
      advisoryEn: 'Your symptoms indicate that timely medical evaluation is recommended. You have been placed in the priority consultation queue.',
      advisoryHi: 'आपके लक्षण समय पर चिकित्सीय मूल्यांकन की अनुशंसा करते हैं। आपको प्राथमिकता कतार में रखा गया है।',
      roomEn: 'Priority Consultation Desk — Room 102',
      roomHi: 'प्राथमिकता परामर्श डेस्क — कमरा 102',
      waitEn: '10 to 15 minutes',
      waitHi: '10 से 15 मिनट',
      icon: Clock
    },
    ROUTINE: {
      cardBorder: 'border-emerald-300',
      cardBg: 'bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/50',
      badgeBg: 'bg-emerald-600 text-white',
      ringColor: 'ring-emerald-500/20',
      iconBg: 'bg-emerald-100 text-emerald-700',
      iconBorder: 'border-emerald-200',
      titleEn: 'Routine Consultation',
      titleHi: 'सामान्य परामर्श',
      statusSubEn: 'Standard Outpatient OPD',
      statusSubHi: 'मानक बाह्य रोगी ओपीडी',
      advisoryEn: 'Your vitals and self-reported symptoms are clinically stable. Your intake has been queued for regular physician consultation.',
      advisoryHi: 'आपके लक्षण स्थिर हैं। आपका परामर्श सामान्य ओपीडी कतार में निर्धारित किया गया है।',
      roomEn: 'General Consultation Desk — Room 204',
      roomHi: 'सामान्य परामर्श डेस्क — कमरा 204',
      waitEn: '15 to 25 minutes',
      waitHi: '15 से 25 मिनट',
      icon: CheckCircle2
    }
  };

  const config = priorityConfigs[priority] || priorityConfigs.ROUTINE;
  const StatusIcon = config.icon;

  const chiefComplaintText = 
    clinicalSummary?.chiefComplaint || 
    answers?.[1] || 
    answers?.chief_complaint || 
    'Fever with Cough & Body Aches';

  const painLevelVal = 
    answers?.[4] || 
    answers?.pain_level || 
    'Level 2 (Moderate)';

  const functionalImpactVal = 
    answers?.[5] || 
    answers?.severity || 
    'Normal mobility';

  const documentsCount = medicalDocuments?.length || 0;

  // Handlers
  const handleProceedToDoctor = () => {
    setCurrentStep('complete');
  };

  const handleBackToSummary = () => {
    setCurrentStep('patientsummary');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto w-full px-4 py-6 sm:py-8 space-y-6"
    >
      {/* Step Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 text-kiosk-coral font-bold text-xs uppercase tracking-wider border border-rose-200 shadow-xs">
          <Activity className="w-3.5 h-3.5 text-kiosk-coral" />
          {isHindi ? 'चरण 4: ट्राइएज प्राथमिकता मूल्यांकन' : 'Step 4: Clinical Triage Assessment'}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-kiosk-charcoal tracking-tight">
          {isHindi ? 'ट्राइएज प्राथमिकता मूल्यांकन' : 'Triage Assessment'}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {isHindi
            ? 'आपके एकत्रित लक्षणों और क्लिनिकल रिकॉर्ड का विश्लेषण कर प्राथमिकता स्तर और परामर्श कतार निर्धारित की गई है।'
            : "Your collected symptoms, questionnaire responses, and medical records have been evaluated to prioritize your care queue."}
        </p>
      </div>

      {/* Main Hero Triage Priority Card */}
      <div className={`rounded-3xl p-6 sm:p-8 border-2 ${config.cardBorder} ${config.cardBg} shadow-kiosk-md space-y-6 relative overflow-hidden ring-4 ${config.ringColor}`}>
        
        {/* Top Status Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${config.iconBg} border-2 ${config.iconBorder} flex items-center justify-center shrink-0 shadow-md`}>
              <StatusIcon className="w-9 h-9 sm:w-11 sm:h-11 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${config.badgeBg}`}>
                  {isHindi ? config.titleHi : config.titleEn}
                </span>
                <span className="text-xs font-extrabold text-slate-500 bg-white/90 border border-slate-200 px-2.5 py-0.5 rounded-full">
                  {isHindi ? config.statusSubHi : config.statusSubEn}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-kiosk-charcoal tracking-tight mt-1.5">
                {isHindi ? config.titleHi : config.titleEn}
              </h2>
            </div>
          </div>

          {/* Assigned Queue Token Box */}
          <div className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-kiosk-sm text-right sm:text-right flex sm:flex-col justify-between items-center sm:items-end shrink-0 min-w-[160px]">
            <div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                {isHindi ? 'कतार टोकन' : 'Queue Token'}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-kiosk-coral font-mono tracking-tight block">
                {assignedToken}
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1">
              ✓ {isHindi ? 'सक्रिय' : 'Active'}
            </span>
          </div>
        </div>

        {/* Clinical Assessment Explanation */}
        <div className="bg-white/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
            {isHindi ? config.advisoryHi : config.advisoryEn}
          </p>
        </div>

        {/* Routing Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Assigned Room */}
          <div className="bg-white/90 rounded-2xl p-4 border border-slate-200/80 flex items-start gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-kiosk-blue flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {isHindi ? 'निर्धारित परामर्श कक्ष' : 'Assigned Consultation Desk'}
              </span>
              <p className="text-base font-extrabold text-kiosk-charcoal mt-0.5">
                {isHindi ? config.roomHi : config.roomEn}
              </p>
              <span className="text-xs font-medium text-slate-500 mt-0.5 block">
                {isHindi ? 'टोकन स्क्रीन पर अपनी बारी देखें' : 'Watch displays in the waiting area for your token'}
              </span>
            </div>
          </div>

          {/* Estimated Wait Time */}
          <div className="bg-white/90 rounded-2xl p-4 border border-slate-200/80 flex items-start gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {isHindi ? 'अनुमानित प्रतीक्षा समय' : 'Estimated Wait Time'}
              </span>
              <p className="text-base font-extrabold text-kiosk-charcoal mt-0.5">
                {isHindi ? config.waitHi : config.waitEn}
              </p>
              <span className="text-xs font-medium text-slate-500 mt-0.5 block">
                {priority === 'HIGH'
                  ? (isHindi ? 'प्राथमिकता के आधार पर तुरंत उपस्थित हों' : 'Clinical team alerted for priority examination')
                  : (isHindi ? 'सामान्य ओपीडी प्रतीक्षा समय' : 'Standard outpatient rotation in effect')}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Evaluated Clinical Factors Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-kiosk-coral" />
            {isHindi ? 'मूल्यांकन किए गए प्रमुख क्लिनिकल कारक' : 'Evaluated Clinical Factors'}
          </span>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {isHindi ? 'स्वचालित एल्गोरिदम द्वारा सत्यापित' : 'Pre-screened by Intake Engine'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
              {isHindi ? 'लक्षण / समस्या' : 'Primary Complaint'}
            </span>
            <p className="font-extrabold text-sm text-kiosk-charcoal truncate">
              {chiefComplaintText}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
              {isHindi ? 'दर्द / गंभीरता' : 'Pain Severity'}
            </span>
            <p className="font-extrabold text-sm text-kiosk-charcoal">
              {painLevelVal}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
              {isHindi ? 'दैनिक प्रभाव' : 'Functional Impact'}
            </span>
            <p className="font-extrabold text-sm text-kiosk-charcoal">
              {functionalImpactVal}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
              {isHindi ? 'संलग्न दस्तावेज़' : 'Medical Records'}
            </span>
            <p className="font-extrabold text-sm text-kiosk-charcoal">
              {documentsCount > 0 ? `${documentsCount} Verified` : 'None attached'}
            </p>
          </div>

        </div>
      </div>

      {/* Non-Diagnostic Disclaimer */}
      <div className="flex items-start gap-3 bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 text-left shadow-xs">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed font-medium">
          {isHindi
            ? 'क्लिनिकल ट्राइएज सूचना: यह स्वचालित मूल्यांकन केवल अस्पताल कतार और कक्ष आवंटन के लिए है। यह कोई अंतिम चिकित्सा निदान नहीं है। डॉक्टर परामर्श के दौरान आपके मामले की पूरी जांच करेंगे।'
            : 'Clinical Triage Notice: Automated triage assists in clinical intake organization and hospital queue prioritization only. Final medical diagnosis and treatment plans are determined exclusively by your attending physician.'}
        </p>
      </div>

      {/* Action Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={handleBackToSummary}
          icon={ArrowLeft}
          iconPosition="left"
          className="w-full sm:w-auto"
        >
          {isHindi ? '← सारांश पर वापस' : '← Back to Summary'}
        </Button>

        <Button
          variant="coral"
          size="xl"
          onClick={handleProceedToDoctor}
          icon={ArrowRight}
          iconPosition="right"
          className="w-full sm:w-auto min-w-[240px]"
        >
          {isHindi ? 'डॉक्टर को सबमिट करें →' : 'Continue / Submit to Doctor →'}
        </Button>
      </div>
    </motion.div>
  );
}
