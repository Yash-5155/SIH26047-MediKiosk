import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from './Button';
import { Eye, Type, Sun, X, Check } from 'lucide-react';

export function AccessibilityModal() {
  const { 
    isAccessibilityModalOpen, 
    setIsAccessibilityModalOpen, 
    fontSize, 
    setFontSize, 
    highContrast, 
    setHighContrast,
    t 
  } = useKiosk();

  if (!isAccessibilityModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-kiosk-lg border border-slate-100 relative overflow-hidden"
        >
          <button
            onClick={() => setIsAccessibilityModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-kiosk-peach text-kiosk-coral flex items-center justify-center mb-6">
            <Eye className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal mb-6">
            {t('accessibilityBtn')} Options
          </h2>

          {/* Text Size Control */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-base font-bold text-kiosk-charcoal mb-3">
              <Type className="w-5 h-5 text-kiosk-blue" />
              Text Size / अक्षर का आकार
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: 'Normal' },
                { id: 'large', label: 'Large (+15%)' },
                { id: 'xlarge', label: 'Extra Large (+30%)' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFontSize(opt.id)}
                  className={`p-3 rounded-2xl border-2 font-bold text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                    fontSize === opt.id
                      ? 'border-kiosk-coral bg-kiosk-coral-light text-kiosk-coral'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  {fontSize === opt.id && <Check className="w-4 h-4" />}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Control */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-base font-bold text-kiosk-charcoal mb-3">
              <Sun className="w-5 h-5 text-amber-500" />
              Contrast Mode / उच्च कंट्रास्ट
            </label>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`w-full p-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-between ${
                highContrast
                  ? 'border-kiosk-coral bg-kiosk-coral-light text-kiosk-coral'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
              }`}
            >
              <span>High Contrast Colors</span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${highContrast ? 'bg-kiosk-coral text-white' : 'bg-slate-100 text-slate-600'}`}>
                {highContrast ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          <Button
            variant="coral"
            size="lg"
            fullWidth
            onClick={() => setIsAccessibilityModalOpen(false)}
          >
            {t('closeBtn')}
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
