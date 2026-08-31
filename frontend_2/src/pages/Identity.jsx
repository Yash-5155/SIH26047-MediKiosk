import React from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { ShieldCheck, CreditCard, User, ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export function Identity() {
  const { setCurrentStep, setScannedDocumentData, t } = useKiosk();

  const handleSelectOption = (optionType) => {
    if (optionType === 'manual') {
      setCurrentStep('details');
    } else {
      // Set identity type and trigger scanner
      setScannedDocumentData({
        documentType: optionType === 'aadhaar' ? 'Aadhaar Card' : 'ABHA Health ID',
        confidenceScore: '99.2%'
      });
      setCurrentStep('documentscan');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"
    >
      {/* Title */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-kiosk-blue font-bold text-xs uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Identity & Registration
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-kiosk-charcoal tracking-tight mb-3">
          Verify Your Details
        </h1>
        <p className="text-slate-600 text-lg sm:text-xl max-w-xl mx-auto">
          Scan your official Indian healthcare card or enter information manually to start your intake session.
        </p>
      </div>

      {/* 3 Large Touch Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
        
        {/* Aadhaar Option */}
        <motion.button
          onClick={() => handleSelectOption('aadhaar')}
          whileTap={{ scale: 0.98 }}
          className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-kiosk-coral shadow-kiosk-sm hover:shadow-kiosk-md transition-all text-left flex flex-col justify-between min-h-[220px] touch-manipulation select-none group"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-kiosk-coral flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CreditCard className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-kiosk-charcoal mb-2">
              Use Aadhaar Card
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Scan your Aadhaar QR or card to verify identity details
            </p>
          </div>
          <span className="text-xs font-bold text-kiosk-coral flex items-center gap-1 mt-4">
            Scan Aadhaar <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </motion.button>

        {/* ABHA Health ID Option */}
        <motion.button
          onClick={() => handleSelectOption('abha')}
          whileTap={{ scale: 0.98 }}
          className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-kiosk-blue shadow-kiosk-sm hover:shadow-kiosk-md transition-all text-left flex flex-col justify-between min-h-[220px] touch-manipulation select-none group"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-kiosk-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-kiosk-charcoal mb-2">
              Use ABHA Health ID
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Scan Ayushman Bharat Digital Health Card / ABHA Number
            </p>
          </div>
          <span className="text-xs font-bold text-kiosk-blue flex items-center gap-1 mt-4">
            Scan ABHA Card <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </motion.button>

        {/* Manual Entry Option */}
        <motion.button
          onClick={() => handleSelectOption('manual')}
          whileTap={{ scale: 0.98 }}
          className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-slate-400 shadow-kiosk-sm hover:shadow-kiosk-md transition-all text-left flex flex-col justify-between min-h-[220px] touch-manipulation select-none group"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-kiosk-charcoal mb-2">
              Enter Manually
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Fill in your name, age, and details using the touchscreen keyboard
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-4">
            Manual Form <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </motion.button>

      </div>

      {/* Navigation Buttons */}
      <div className="w-full flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentStep('welcome')}
          icon={ArrowLeft}
          iconPosition="left"
        >
          {t('backBtn')}
        </Button>
      </div>
    </motion.div>
  );
}
