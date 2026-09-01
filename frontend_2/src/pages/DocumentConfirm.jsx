import React from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { CheckCircle2, User, Calendar, Phone, ShieldCheck, Edit2, ArrowRight, ArrowLeft, CreditCard } from 'lucide-react';

export function DocumentConfirm() {
  const { scannedDocumentData, setPatient, setCurrentStep, t } = useKiosk();

  // Extracted mock OCR data or defaults
  const extracted = scannedDocumentData?.extractedData || {
    fullName: "Priya Sharma",
    age: "34",
    gender: "female",
    phone: "9876543210",
    conditions: ["hypertension"]
  };

  const handleConfirm = () => {
    // Populate patient context state
    setPatient({
      fullName: extracted.fullName,
      age: extracted.age,
      gender: extracted.gender,
      phone: extracted.phone || '',
      conditions: extracted.conditions || []
    });
    // Move to next step (conversational AI or questionnaire)
    setCurrentStep('conversation');
  };

  const handleEdit = () => {
    // Pre-fill patient context state and navigate to manual entry
    setPatient({
      fullName: extracted.fullName,
      age: extracted.age,
      gender: extracted.gender,
      phone: extracted.phone || '',
      conditions: extracted.conditions || []
    });
    setCurrentStep('details');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-3xl mx-auto w-full px-4 py-6 sm:py-8"
    >
      {/* Title */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-kiosk-sm border-2 border-emerald-200">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-kiosk-charcoal tracking-tight mb-2">
          {t('confirmDetailsTitle')}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          {t('confirmDetailsSubtitle')}
        </p>
      </div>

      {/* Extracted Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-kiosk-md mb-8">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-kiosk-blue" />
            <span className="font-extrabold text-slate-800 text-lg">
              {scannedDocumentData?.documentType || 'Health / ABHA Card'}
            </span>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
            OCR Confidence: {scannedDocumentData?.confidenceScore || '98.4%'}
          </span>
        </div>

        {/* Form Fields Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t('fullNameLabel')}
            </span>
            <span className="font-extrabold text-kiosk-charcoal text-xl">
              {extracted.fullName}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t('ageLabel')}
            </span>
            <span className="font-extrabold text-kiosk-charcoal text-xl">
              {extracted.age} yrs
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t('genderLabel')}
            </span>
            <span className="font-extrabold text-kiosk-charcoal text-xl capitalize">
              {extracted.gender}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t('phoneLabel')}
            </span>
            <span className="font-extrabold text-kiosk-charcoal text-xl">
              {extracted.phone || '—'}
            </span>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{t('docPrivacyNotice')}</span>
        </div>

      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleEdit}
          icon={Edit2}
          iconPosition="left"
          className="w-full sm:w-auto"
        >
          {t('editDetails')}
        </Button>

        <Button
          variant="coral"
          size="xl"
          onClick={handleConfirm}
          icon={ArrowRight}
          iconPosition="right"
          className="w-full sm:w-auto"
        >
          {t('confirmAndContinue')}
        </Button>
      </div>
    </motion.div>
  );
}
