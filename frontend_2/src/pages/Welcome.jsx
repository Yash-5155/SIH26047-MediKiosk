import React from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { ArrowRight, HelpCircle, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';

export function Welcome() {
  const { setCurrentStep, setIsHowItWorksOpen, t } = useKiosk();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-5xl mx-auto w-full px-4 py-6 sm:py-10 flex flex-col items-center justify-between min-h-[calc(100vh-10rem)]"
    >
      {/* Top Banner Graphic Composition */}
      <div className="w-full bg-gradient-to-br from-kiosk-peach/60 via-white to-sky-50 rounded-3xl p-6 sm:p-12 border border-slate-100 shadow-kiosk-md flex flex-col md:flex-row items-center justify-between gap-8 mb-8 relative overflow-hidden">
        
        {/* Decorative Background Circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-kiosk-pink/30 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-sky-100/50 blur-2xl pointer-events-none" />

        {/* Text Content */}
        <div className="max-w-xl text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-kiosk-peach-dark/30 shadow-kiosk-sm mb-4 text-kiosk-coral font-bold text-sm">
            <HeartPulse className="w-4 h-4 animate-pulse" />
            <span>Fast & Friendly Self-Service Triage</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-kiosk-charcoal tracking-tight mb-4 leading-tight">
            {t('welcomeHeading')}
          </h1>

          <p className="text-slate-600 text-lg sm:text-xl leading-relaxed mb-6">
            {t('welcomeSubheading')}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Private & Secure
            </span>
              <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <Stethoscope className="w-4 h-4 text-kiosk-blue" />
              Nurse Assisted
            </span>
          </div>
        </div>

        {/* Visual Healthcare Graphic (Custom Graphic Composition) */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 shrink-0 flex items-center justify-center z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-kiosk-coral/10 to-kiosk-blue/10 rounded-full animate-spin-slow" />
          
          <div className="relative w-48 h-48 rounded-3xl bg-white shadow-kiosk-lg border border-slate-100 flex flex-col items-center justify-center p-6 text-center transform rotate-3">
            <div className="w-20 h-20 rounded-2xl bg-kiosk-coral text-white flex items-center justify-center mb-3 shadow-kiosk-coral">
              <Stethoscope className="w-11 h-11" />
            </div>
            <span className="font-extrabold text-kiosk-charcoal text-lg">Smart Triage</span>
            <span className="text-xs text-slate-500 font-medium mt-1">Instant Desk Guidance</span>
          </div>

          {/* Floating Pill Badges */}
          <div className="absolute top-2 left-0 bg-white px-3 py-1.5 rounded-2xl shadow-kiosk-md text-xs font-bold text-slate-700 flex items-center gap-1.5 border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Quick ~2 Min Check
          </div>

          <div className="absolute bottom-2 right-0 bg-white px-3 py-1.5 rounded-2xl shadow-kiosk-md text-xs font-bold text-slate-700 flex items-center gap-1.5 border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-kiosk-coral" />
            No Long Forms
          </div>
        </div>

      </div>

      {/* Action Buttons Container */}
      <div className="w-full max-w-md flex flex-col gap-4">
        <Button
          variant="coral"
          size="xl"
          fullWidth
          onClick={() => setCurrentStep('details')}
          icon={ArrowRight}
          iconPosition="right"
        >
          {t('startHealthCheck')}
        </Button>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => setIsHowItWorksOpen(true)}
          icon={HelpCircle}
          iconPosition="left"
        >
          {t('howItWorks')}
        </Button>
      </div>
    </motion.div>
  );
}
