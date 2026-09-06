import React from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { 
  Calendar, 
  FileText, 
  Stethoscope, 
  Pill, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  FileCheck2,
  Activity,
  Hospital
} from 'lucide-react';

/**
 * SCREEN 12 — Extracted Documents / Medical History
 * 
 * Displays processed document information in a clean medical-history timeline.
 * Timeline entries:
 *  - Document date
 *  - Document type (Prescription / Lab report / Discharge summary)
 *  - Diagnosis
 *  - Medicines & dosages
 *  - Lab values
 *  - Relevant abnormal values
 */
export function ExtractedHistory() {
  const { 
    language, 
    setCurrentStep, 
    medicalDocuments,
    t 
  } = useKiosk();

  const isHindi = language === 'hi';

  const handleAddMore = () => {
    setCurrentStep('documents');
  };

  const handleContinue = () => {
    setCurrentStep('generatingsummary');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto w-full px-4 py-6 sm:py-8"
    >
      {/* Title */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs uppercase tracking-wider mb-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {isHindi ? 'दस्तावेज़ सफलतापूर्वक संसाधित' : 'Documents Successfully Extracted'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-kiosk-charcoal tracking-tight mb-2">
          {isHindi ? 'निकाला गया चिकित्सीय इतिहास' : 'Extracted Medical History'}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
          {isHindi
            ? 'आपके अपलोड किए गए दस्तावेज़ों से निकाली गई जानकारी नीचे समयरेखा के रूप में व्यवस्थित है।'
            : 'Clinical details identified from your uploaded records organized chronologically.'}
        </p>
      </div>

      {/* Medical History Timeline */}
      <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8 mb-8">
        {medicalDocuments && medicalDocuments.length > 0 ? (
          medicalDocuments.map((doc, idx) => (
            <motion.div
              key={doc.id || idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative group"
            >
              {/* Timeline Pin Node */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-white border-4 border-kiosk-coral shadow-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-kiosk-coral" />
              </div>

              {/* Document Record Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-kiosk-md hover:border-slate-300 transition-all space-y-5">
                
                {/* Header: Date, Issuer, Document Type Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-kiosk-peach text-kiosk-coral flex items-center justify-center font-bold shadow-xs shrink-0">
                      <FileCheck2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-lg text-kiosk-charcoal">
                          {doc.documentType}
                        </span>
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {doc.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-kiosk-blue" />
                          {doc.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Hospital className="w-3.5 h-3.5 text-slate-400" />
                          {doc.issuer || 'General Healthcare Clinic'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {doc.documentName || 'Scanned Document'}
                  </span>
                </div>

                {/* Section 1: Diagnosis */}
                {doc.diagnosis && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                      <Stethoscope className="w-3.5 h-3.5 text-kiosk-coral" />
                      {isHindi ? 'पहचाना गया निदान / स्थिति' : 'Detected Diagnosis'}
                    </span>
                    <p className="font-extrabold text-kiosk-charcoal text-base">
                      {doc.diagnosis}
                    </p>
                  </div>
                )}

                {/* Section 2: Prescribed Medicines */}
                {doc.medicines && doc.medicines.length > 0 && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                      <Pill className="w-3.5 h-3.5 text-kiosk-blue" />
                      {isHindi ? 'निर्धारित दवाइयां' : 'Prescribed Medicines'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {doc.medicines.map((med, mIdx) => (
                        <div
                          key={mIdx}
                          className="bg-sky-50/60 border border-sky-100 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-sky-950 flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-kiosk-blue mt-1.5 shrink-0" />
                          <span>{med}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 3: Lab Values & Detected Abnormal Values */}
                {doc.labValues && doc.labValues.length > 0 && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      {isHindi ? 'प्रयोगशाला पैरामीटर' : 'Key Lab Values'}
                    </span>
                    <div className="space-y-1.5">
                      {doc.labValues.map((lab, lIdx) => (
                        <div
                          key={lIdx}
                          className="bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 flex items-center justify-between"
                        >
                          <span>{lab}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Abnormal Values Warning Callout if present */}
                {doc.abnormalValues && doc.abnormalValues.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wide block mb-1">
                        {isHindi ? 'असामान्य मान नोट किए गए (Abnormal Values)' : 'Abnormal Lab Values Highlighted'}
                      </span>
                      <ul className="text-xs sm:text-sm font-semibold text-amber-800 space-y-0.5 list-disc list-inside">
                        {doc.abnormalValues.map((abn, aIdx) => (
                          <li key={aIdx}>{abn}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Doctor Clinical Notes */}
                {doc.doctorNotes && (
                  <div className="text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-slate-100">
                    <strong>{isHindi ? 'डॉक्टर नोट:' : 'Doctor Note:'}</strong> {doc.doctorNotes}
                  </div>
                )}

                {/* OCR Extracted Text (From Backend Tesseract / PDF Processing) */}
                {doc.extractedText && (
                  <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-kiosk-blue" />
                        {isHindi ? 'ओसीआर द्वारा निकाला गया मूल पाठ:' : 'OCR Extracted Document Text:'}
                      </span>
                      {doc.extractionEngine && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {doc.extractionEngine}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-36 overflow-y-auto bg-white p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      {doc.extractedText}
                    </p>
                  </div>
                )}

              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-400">
            <p>{isHindi ? 'कोई निकाला गया दस्तावेज़ उपलब्ध नहीं है।' : 'No processed document records available.'}</p>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleAddMore}
          icon={Plus}
          iconPosition="left"
          className="w-full sm:w-auto"
        >
          {isHindi ? '+ अन्य दस्तावेज़ जोड़ें' : '+ Add Another Document'}
        </Button>

        <Button
          variant="coral"
          size="xl"
          onClick={handleContinue}
          icon={ArrowRight}
          iconPosition="right"
          className="w-full sm:w-auto"
        >
          {isHindi ? 'क्लिनिकल सारांश बनाएं →' : 'Continue to Summary →'}
        </Button>
      </div>
    </motion.div>
  );
}
