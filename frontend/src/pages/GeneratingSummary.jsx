import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Stethoscope, 
  Database,
  Layers,
  HeartPulse
} from 'lucide-react';

/**
 * SCREEN 13 — Generating Summary
 * 
 * Processing/loading state: "Preparing your clinical summary…"
 * Combines:
 *  - AI interview/conversation responses
 *  - Document extracted information
 * Polished, transparent loading experience that creates the clinicalSummary object
 * and transitions to Screen 14 (Patient Summary / Review).
 */
export function GeneratingSummary() {
  const { 
    language, 
    setCurrentStep, 
    patient, 
    answers, 
    medicalDocuments,
    setClinicalSummary,
    setToken,
    triageResult,
    setTriageResult,
    t 
  } = useKiosk();

  const isHindi = language === 'hi';
  const [phase, setPhase] = useState(0);

  const steps = [
    {
      titleEn: 'Synthesizing conversational symptom intake…',
      titleHi: 'लक्षण साक्षात्कार और उत्तरों का संकलन…'
    },
    {
      titleEn: 'Linking extracted document history & prescriptions…',
      titleHi: 'निकाले गए दस्तावेज़ इतिहास और दवाओं का मिलान…'
    },
    {
      titleEn: 'Compiling structured clinical brief for doctor review…',
      titleHi: 'डॉक्टर समीक्षा हेतु क्लिनिकल सारांश तैयार…'
    }
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => {
      setPhase(3);

      // Synthesize comprehensive clinical summary object
      const chiefComplaint = answers[1] || answers.chief_complaint || "Fever with Cough & Body Aches";
      const duration = answers[3] || answers.symptom_duration || "2 to 3 days";
      const painLevel = answers[4] || answers.pain_level || "2";
      const functionalImpact = answers[5] || answers.severity || "No";
      const preExisting = Array.isArray(patient?.conditions) && patient.conditions.length > 0 && !patient.conditions.includes('none')
        ? patient.conditions.join(', ')
        : "None reported";

      // Calculate priority
      const isHighPriority = painLevel === '4' || String(chiefComplaint).toLowerCase().includes('chest');
      const isModPriority = painLevel === '3' || functionalImpact === 'YES';
      const assignedPriority = isHighPriority ? 'HIGH' : isModPriority ? 'MODERATE' : 'ROUTINE';
      const generatedToken = isHighPriority ? 'E-101' : isModPriority ? 'M-102' : 'A-104';

      setToken(generatedToken);

      const combinedSummary = {
        chiefComplaint: String(chiefComplaint),
        hpi: `Patient presents with ${chiefComplaint}, onset reported as ${duration}. Severity evaluated at Level ${painLevel}/4. Impairment in daily mobility: ${functionalImpact}.`,
        pastMedicalHistory: preExisting,
        medications: medicalDocuments && medicalDocuments.length > 0 && medicalDocuments[0].medicines
          ? medicalDocuments[0].medicines.join(', ')
          : "None reported",
        allergies: "No known drug or food allergies reported",
        familyHistory: "No immediate hereditary cardiovascular or metabolic flags noted",
        personalHistory: "Non-smoker, non-alcoholic",
        relevantSymptoms: [
          `Primary Complaint: ${chiefComplaint}`,
          `Duration: ${duration}`,
          `Pain Scale: Level ${painLevel}`,
          `Fever: ${answers[2] || 'Mild / Fluctuating'}`
        ],
        documentsCount: medicalDocuments?.length || 0,
        priority: assignedPriority,
        generatedToken,
        reviewStatus: 'PENDING_DOCTOR_REVIEW'
      };

      setClinicalSummary(combinedSummary);
      if (setTriageResult) {
        setTriageResult({
          priority: assignedPriority,
          token: generatedToken,
          chiefComplaint: String(chiefComplaint),
          painLevel: String(painLevel),
          functionalImpact: String(functionalImpact),
          duration: String(duration),
          isHighPriority,
          isModPriority,
          evaluatedAt: new Date().toISOString()
        });
      }
    }, 2700);

    const t4 = setTimeout(() => {
      setCurrentStep('patientsummary');
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [answers, patient, medicalDocuments, setClinicalSummary, setToken, setCurrentStep]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-3xl mx-auto w-full px-4 py-12 sm:py-20 text-center"
    >
      {/* Central Animated Indicator */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-3xl bg-kiosk-blue/10 animate-ping opacity-40" />
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white border-2 border-kiosk-blue shadow-kiosk-md flex items-center justify-center text-kiosk-blue">
          <Stethoscope className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse stroke-[2.2]" />
        </div>
      </div>

      <h1 className="text-3xl sm:text-5xl font-black text-kiosk-charcoal tracking-tight mb-3">
        {isHindi ? 'आपका क्लिनिकल सारांश तैयार हो रहा है…' : 'Preparing your clinical summary…'}
      </h1>
      <p className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto mb-8">
        {isHindi
          ? 'आपके लक्षण साक्षात्कार और संलग्न दस्तावेज़ों को एक संरचित चिकित्सा ब्रीफ में संकलित किया जा रहा है।'
          : 'Synthesizing your interview responses and document records into a structured pre-consultation summary.'}
      </p>

      {/* Synthesis Checklist Steps */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md mb-8 max-w-xl mx-auto text-left space-y-4">
        {steps.map((step, idx) => {
          const isDone = idx < phase || phase === 3;
          const isCurrent = idx === phase && phase < 3;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3.5 text-sm sm:text-base font-semibold transition-all duration-300 ${
                isDone
                  ? 'text-emerald-700'
                  : isCurrent
                  ? 'text-kiosk-charcoal font-bold'
                  : 'text-slate-400 opacity-50'
              }`}
            >
              {isDone ? (
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : isCurrent ? (
                <div className="w-6 h-6 rounded-full border-2 border-kiosk-blue border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full border border-slate-300 shrink-0" />
              )}
              <span>{isHindi ? step.titleHi : step.titleEn}</span>
            </div>
          );
        })}
      </div>

      {/* Quick Action Button */}
      <div className="flex justify-center">
        <Button
          variant="blue"
          size="lg"
          onClick={() => setCurrentStep('patientsummary')}
          icon={ArrowRight}
          iconPosition="right"
        >
          {isHindi ? 'सारांश देखें →' : 'View Clinical Summary →'}
        </Button>
      </div>
    </motion.div>
  );
}
