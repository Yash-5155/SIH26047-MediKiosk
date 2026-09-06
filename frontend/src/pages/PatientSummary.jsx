import React from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { 
  FileText, 
  User, 
  Stethoscope, 
  Pill, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Edit3, 
  FileCheck2,
  HeartPulse,
  Info,
  Activity,
  Calendar
} from 'lucide-react';

/**
 * SCREEN 14 — Patient Intake Summary / Review
 * 
 * Clean, structured final review of the patient's intake information
 * prior to clinical triage evaluation.
 * 
 * Contains:
 *  - Step 3 Header & Patient Demographics
 *  - Primary Chief Complaint
 *  - History of Present Illness (HPI)
 *  - Reported Symptoms & Intake Responses
 *  - Past Medical History & Pre-existing conditions
 *  - Current Medications & Known Allergies
 *  - Family & Personal History
 *  - Attached Medical Documents with OCR extractions
 *  - Non-diagnostic clinical notice
 *  - Action: "Continue to Triage →"
 * 
 * NOTE: All triage-specific scoring, priority badges, and queue tokens
 * have been moved to Screen 15 (TriageAssessment).
 */
export function PatientSummary() {
  const { 
    language, 
    setCurrentStep, 
    patient, 
    clinicalSummary, 
    medicalDocuments,
    answers,
    t 
  } = useKiosk();

  const isHindi = language === 'hi';

  const summary = clinicalSummary || {
    chiefComplaint: answers?.[1] || answers?.chief_complaint || "Fever with Cough & Body Aches",
    hpi: "Patient reports onset 2 to 3 days ago. Severity Level 2/4. Daily mobility is manageable.",
    pastMedicalHistory: "None reported",
    medications: "Paracetamol 650mg SOS",
    allergies: "No known drug or food allergies",
    familyHistory: "No immediate cardiovascular or hereditary conditions reported",
    personalHistory: "Non-smoker, non-alcoholic",
    relevantSymptoms: [
      "Primary Complaint: Fever & Body Pain",
      "Duration: 2 to 3 days",
      "Pain Scale: Level 2 (Moderate)",
      "Fever: Reported / Fluctuating"
    ]
  };

  const handleContinueToTriage = () => {
    setCurrentStep('triage');
  };

  const handleEditResponses = () => {
    setCurrentStep('conversation');
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
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-50 text-kiosk-blue font-bold text-xs uppercase tracking-wider border border-sky-200 shadow-xs">
          <FileText className="w-3.5 h-3.5 text-kiosk-blue" />
          {isHindi ? 'चरण 3: मरीज इनटेक सारांश' : 'Step 3: Patient Intake Summary'}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-kiosk-charcoal tracking-tight">
          {isHindi ? 'मरीज इनटेक सारांश' : 'Patient Intake Summary'}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {isHindi
            ? 'कृपया ट्राइएज मूल्यांकन और कतार आवंटन से पहले अपने लक्षणों, उत्तरों और रिकॉर्ड की समीक्षा करें।'
            : 'Review your presenting symptoms, interview responses, and medical records before continuing to triage assessment.'}
        </p>
      </div>

      {/* Patient Profile & Demographics Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-kiosk-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-kiosk-blue text-white flex items-center justify-center font-bold text-2xl shadow-kiosk-sm shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal tracking-tight">
                {patient?.fullName || patient?.name || (isHindi ? "मरीज इनटेक सारांश" : "Patient Intake Summary")}
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {isHindi ? 'समीक्षा हेतु तैयार' : 'Ready for Triage'}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {patient?.age ? `${patient.age} yrs` : 'Age: 34'} • {patient?.gender || 'Gender: Female'} • Phone: {patient?.phone || '9876543210'}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200/80 text-left sm:text-right w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {isHindi ? 'इनटेक स्थिति' : 'Intake Status'}
          </span>
          <span className="text-sm font-extrabold text-kiosk-charcoal flex items-center sm:justify-end gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-kiosk-blue" />
            {new Date().toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Clinical Intake Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: Chief Complaint */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-kiosk-sm space-y-2 hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-kiosk-coral" />
            {isHindi ? 'मुख्य स्वास्थ्य समस्या' : 'Chief Complaint'}
          </span>
          <p className="text-xl font-extrabold text-kiosk-charcoal">
            {summary.chiefComplaint}
          </p>
        </div>

        {/* Card 2: History of Present Illness (HPI) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-kiosk-sm space-y-2 hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-kiosk-blue" />
            {isHindi ? 'वर्तमान बीमारी का इतिहास (HPI)' : 'History of Present Illness (HPI)'}
          </span>
          <p className="text-sm font-medium text-slate-700 leading-relaxed">
            {summary.hpi}
          </p>
        </div>

        {/* Card 3: Reported Symptoms & Functional Impact */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-kiosk-sm space-y-2.5 hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600" />
            {isHindi ? 'लक्षण विवरण एवं प्रभाव' : 'Symptom Evaluation & Impact'}
          </span>
          {Array.isArray(summary.relevantSymptoms) && summary.relevantSymptoms.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {summary.relevantSymptoms.map((sym, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
                >
                  {sym}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm font-medium text-slate-600">
              {isHindi ? 'सामान्य लक्षण दर्ज किए गए।' : 'Standard presenting symptoms recorded.'}
            </p>
          )}
        </div>

        {/* Card 4: Past Medical History & Pre-existing */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-kiosk-sm space-y-2 hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-purple-600" />
            {isHindi ? 'पूर्व चिकित्सीय इतिहास' : 'Past Medical History'}
          </span>
          <p className="text-base font-bold text-kiosk-charcoal">
            {summary.pastMedicalHistory}
          </p>
        </div>

        {/* Card 5: Current Medications */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-kiosk-sm space-y-2 hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-rose-500" />
            {isHindi ? 'वर्तमान नियमित दवाइयां' : 'Current Medications'}
          </span>
          <p className="text-sm font-semibold text-slate-700 leading-relaxed">
            {summary.medications}
          </p>
        </div>

        {/* Card 6: Known Allergies */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-kiosk-sm space-y-2 hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            {isHindi ? 'ज्ञात एलर्जी (Allergies)' : 'Known Allergies'}
          </span>
          <p className="text-base font-bold text-kiosk-charcoal">
            {summary.allergies}
          </p>
        </div>

        {/* Card 7: Family & Personal History */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-kiosk-sm space-y-2 md:col-span-2 hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-600" />
            {isHindi ? 'पारिवारिक एवं व्यक्तिगत इतिहास' : 'Family & Personal History'}
          </span>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            {summary.familyHistory} • {summary.personalHistory}
          </p>
        </div>

      </div>

      {/* Card 8: Attached Medical Documents & Records */}
      {medicalDocuments && medicalDocuments.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-kiosk-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-kiosk-blue" />
              {isHindi ? 'संलग्न चिकित्सीय दस्तावेज़' : 'Attached Medical Records'} ({medicalDocuments.length})
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              ✓ {isHindi ? 'सत्यापित क्लिनिकल रिकॉर्ड' : 'Verified Clinical Records'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {medicalDocuments.map((doc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between text-xs sm:text-sm space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-kiosk-coral" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-kiosk-charcoal block truncate">
                        {doc.documentType} {doc.backendDocumentId ? `(#${doc.backendDocumentId})` : ''}
                      </span>
                      <span className="text-slate-400 text-xs truncate block">
                        {doc.documentName || doc.date || 'Medical Document'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded shrink-0">
                    ✓ Verified
                  </span>
                </div>

                {doc.extractedText && (
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 font-mono line-clamp-2">
                    {doc.extractedText.slice(0, 150)}…
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pre-Consultation Non-Diagnostic Notice */}
      <div className="flex items-start gap-3 bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 text-left shadow-xs">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed font-medium">
          {isHindi
            ? 'पूर्व-परामर्श सूचना: यह सारांश आपके द्वारा दिए गए उत्तरों और सत्यापित दस्तावेज़ों से तैयार किया गया है। यह कोई अंतिम चिकित्सा निदान नहीं है। अगले चरण में आपकी देखभाल प्राथमिकता निर्धारित करने हेतु ट्राइएज मूल्यांकन किया जाएगा।'
            : 'Pre-consultation Notice: This summary compiles your self-reported responses and verified medical records. It does NOT constitute a final medical diagnosis. Next, proceed to triage assessment to determine your care priority and queue.'}
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={handleEditResponses}
          icon={Edit3}
          iconPosition="left"
          className="w-full sm:w-auto"
        >
          {isHindi ? 'लक्षणों में संशोधन करें' : 'Edit Responses'}
        </Button>

        <Button
          variant="coral"
          size="xl"
          onClick={handleContinueToTriage}
          icon={ArrowRight}
          iconPosition="right"
          className="w-full sm:w-auto min-w-[220px]"
        >
          {isHindi ? 'ट्राइएज पर आगे बढ़ें →' : 'Continue to Triage →'}
        </Button>
      </div>
    </motion.div>
  );
}
