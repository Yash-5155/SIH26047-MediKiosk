import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from './Button';
import { UserCheck, Stethoscope, Ticket, X } from 'lucide-react';

export function HowItWorksModal() {
  const { isHowItWorksOpen, setIsHowItWorksOpen, t } = useKiosk();

  if (!isHowItWorksOpen) return null;

  const steps = [
    {
      icon: UserCheck,
      color: 'bg-rose-100 text-kiosk-coral border-rose-200',
      title: t('step1Title'),
      desc: t('step1Desc')
    },
    {
      icon: Stethoscope,
      color: 'bg-sky-100 text-kiosk-blue border-sky-200',
      title: t('step2Title'),
      desc: t('step2Desc')
    },
    {
      icon: Ticket,
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      title: t('step3Title'),
      desc: t('step3Desc')
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-kiosk-lg border border-slate-100 relative"
        >
          <button
            onClick={() => setIsHowItWorksOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal mb-6">
            {t('howItWorksTitle')}
          </h2>

          <div className="space-y-4 mb-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${step.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-kiosk-charcoal">{step.title}</h3>
                    <p className="text-slate-600 text-sm sm:text-base mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            variant="coral"
            size="lg"
            fullWidth
            onClick={() => setIsHowItWorksOpen(false)}
          >
            {t('closeBtn')}
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
