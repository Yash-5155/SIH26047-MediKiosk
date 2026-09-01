import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { mockApi } from '../services/mockApi';
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react';

export function Processing() {
  const { answers, patient, setTriageResult, setToken, setCurrentStep, t } = useKiosk();
  const [stepIndex, setStepIndex] = useState(0);

  const messages = [
    t('processingHeading'),
    t('processingSub1'),
    t('processingSub2'),
    t('processingSub3')
  ];

  useEffect(() => {
    // Cycle through messages every 700ms
    const msgInterval = setInterval(() => {
      setStepIndex(prev => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 700);

    // Call mock API
    mockApi.processTriage(answers, patient).then((res) => {
      setTriageResult(res.assessment);
      setToken(res.token);
      setTimeout(() => {
        clearInterval(msgInterval);
        setCurrentStep('result');
      }, 500);
    });

    return () => clearInterval(msgInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-2xl mx-auto w-full px-4 py-16 flex flex-col items-center justify-center text-center min-h-[calc(100vh-10rem)]"
    >
      {/* Animated Pulse Ring */}
      <div className="relative w-40 h-40 flex items-center justify-center mb-10">
        <div className="absolute inset-0 rounded-full bg-kiosk-coral/20 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-kiosk-peach animate-pulse" />
        <div className="relative w-28 h-28 rounded-full bg-white shadow-kiosk-lg border-2 border-kiosk-coral/30 flex items-center justify-center text-kiosk-coral">
          <HeartPulse className="w-14 h-14 animate-pulse stroke-[2.5]" />
        </div>
      </div>

      {/* Step Message Carousel */}
      <div className="h-20 flex items-center justify-center mb-6">
        <AnimatePresence mode="wait">
          <motion.h2
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-2xl sm:text-4xl font-extrabold text-kiosk-charcoal tracking-tight"
          >
            {messages[stepIndex]}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-3">
        {messages.map((_, idx) => (
          <div
            key={idx}
            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
              idx <= stepIndex ? 'bg-kiosk-coral scale-110' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <p className="text-slate-400 text-sm font-medium mt-10 flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        Secure local triage computation
      </p>
    </motion.div>
  );
}
