import React from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { MapPin, Clock, Ticket, ArrowRight, Compass } from 'lucide-react';

export function NextStep() {
  const { language, triageResult, token, setCurrentStep, t } = useKiosk();
  const isHindi = language === 'hi';

  const deskName = isHindi ? triageResult?.deskNameHi : triageResult?.deskNameEn;
  const waitTime = isHindi ? triageResult?.estimatedWaitHi : triageResult?.estimatedWaitEn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto w-full px-4 py-6 sm:py-10"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-kiosk-blue-light text-kiosk-blue flex items-center justify-center mx-auto mb-4 shadow-kiosk-sm">
          <Compass className="w-9 h-9 stroke-[2.5]" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-kiosk-charcoal tracking-tight mb-2">
          {t('nextStepTitle')}
        </h1>
        <p className="text-slate-600 text-lg sm:text-xl">
          {t('nextStepSubtitle')}
        </p>
      </div>

      {/* Large Visible Direction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Token Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-kiosk-coral/20 shadow-kiosk-md flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-kiosk-peach text-kiosk-coral flex items-center justify-center mb-3">
            <Ticket className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
            {t('tokenNumberLabel')}
          </span>
          <span className="text-4xl sm:text-5xl font-black text-kiosk-coral tracking-tight font-mono">
            {token || 'A-104'}
          </span>
        </div>

        {/* Location Desk Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-kiosk-md flex flex-col items-center justify-center text-center md:col-span-2">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-kiosk-blue flex items-center justify-center mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
            {t('assignedDesk')}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal tracking-tight leading-tight">
            {deskName || 'General Consultation — Room 102'}
          </span>
        </div>

      </div>

      {/* Secondary Info banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-kiosk-sm flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {t('estimatedWait')}
            </span>
            <span className="font-extrabold text-slate-800 text-lg sm:text-xl">
              {waitTime || '10-15 minutes'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full">
        <Button
          variant="coral"
          size="xl"
          fullWidth
          onClick={() => setCurrentStep('complete')}
          icon={ArrowRight}
          iconPosition="right"
        >
          {t('proceedToComplete')}
        </Button>
      </div>
    </motion.div>
  );
}
