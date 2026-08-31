import React from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { AlertTriangle, ShieldAlert, CheckCircle, Clock, ArrowRight, Info } from 'lucide-react';

export function TriageResult() {
  const { language, triageResult, setCurrentStep, t } = useKiosk();
  const isHindi = language === 'hi';

  if (!triageResult) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <p className="text-slate-600 font-bold">No triage result available.</p>
        <Button onClick={() => setCurrentStep('welcome')} className="mt-4">
          Start Again
        </Button>
      </div>
    );
  }

  const { priority, redFlags } = triageResult;

  const cardVariants = {
    HIGH: {
      bg: 'bg-rose-50 border-rose-200 text-rose-950',
      badge: 'bg-rose-600 text-white',
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
      title: t('highPriorityTitle'),
      desc: isHindi ? triageResult.summaryHi : triageResult.summaryEn,
      cta: t('highPriorityCTA'),
      ctaVariant: 'coral'
    },
    MODERATE: {
      bg: 'bg-sky-50 border-sky-200 text-sky-950',
      badge: 'bg-kiosk-blue text-white',
      icon: Clock,
      iconColor: 'text-kiosk-blue',
      title: t('moderatePriorityTitle'),
      desc: isHindi ? triageResult.summaryHi : triageResult.summaryEn,
      cta: t('moderatePriorityCTA'),
      ctaVariant: 'blue'
    },
    ROUTINE: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      badge: 'bg-emerald-600 text-white',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      title: t('routinePriorityTitle'),
      desc: isHindi ? triageResult.summaryHi : triageResult.summaryEn,
      cta: t('routinePriorityCTA'),
      ctaVariant: 'coral'
    }
  };

  const config = cardVariants[priority] || cardVariants.ROUTINE;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-3xl mx-auto w-full px-4 py-6 sm:py-10"
    >
      <div className="text-center mb-6">
        <span className="text-slate-500 text-sm font-bold uppercase tracking-widest block mb-1">
          {t('resultTitle')}
        </span>
      </div>

      {/* Main Priority Outcome Card */}
      <div className={`rounded-3xl p-6 sm:p-10 border-2 shadow-kiosk-lg mb-6 ${config.bg} relative overflow-hidden`}>
        
        {/* Top Header Badge */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <span className={`px-4 py-1.5 rounded-full font-black text-sm uppercase tracking-wider shadow-sm ${config.badge}`}>
            {priority} PRIORITY
          </span>

          <div className={`w-14 h-14 rounded-2xl bg-white shadow-kiosk-md flex items-center justify-center ${config.iconColor}`}>
            <Icon className="w-8 h-8 stroke-[2.5]" />
          </div>
        </div>

        {/* Priority Title */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-slate-900">
          {config.title}
        </h1>

        {/* Priority Description */}
        <p className="text-lg sm:text-xl font-medium leading-relaxed mb-6 text-slate-800">
          {config.desc}
        </p>

        {/* Red Flag List if High Priority */}
        {redFlags && redFlags.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-rose-200 mb-6">
            <span className="font-extrabold text-rose-800 text-sm block mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Key Warning Symptoms Noted:
            </span>
            <ul className="list-disc list-inside space-y-1 text-sm font-bold text-rose-900">
              {redFlags.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Location & Wait Estimate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/90 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
              {t('assignedDesk')}
            </span>
            <span className="font-extrabold text-slate-900 text-base sm:text-lg">
              {isHindi ? triageResult.deskNameHi : triageResult.deskNameEn}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
              {t('estimatedWait')}
            </span>
            <span className="font-extrabold text-slate-900 text-base sm:text-lg">
              {isHindi ? triageResult.estimatedWaitHi : triageResult.estimatedWaitEn}
            </span>
          </div>
        </div>

      </div>

      {/* Mandatory Non-Diagnostic Disclaimer Box */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 mb-8">
        <Info className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm font-medium text-amber-900 leading-relaxed">
          {t('medicalDisclaimer')}
        </p>
      </div>

      {/* Action CTA */}
      <div className="w-full">
        <Button
          variant={config.ctaVariant}
          size="xl"
          fullWidth
          onClick={() => setCurrentStep('nextstep')}
          icon={ArrowRight}
          iconPosition="right"
        >
          {config.cta}
        </Button>
      </div>
    </motion.div>
  );
}
