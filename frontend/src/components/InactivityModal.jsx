import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from './Button';
import { Clock, RefreshCw } from 'lucide-react';
import { KIOSK_CONFIG } from '../config/kioskConfig';

export function InactivityModal() {
  const { isInactivityWarningOpen, setIsInactivityWarningOpen, resetSession, t } = useKiosk();
  const [timeLeft, setTimeLeft] = useState(KIOSK_CONFIG.warningCountdownSeconds);

  useEffect(() => {
    let interval;
    if (isInactivityWarningOpen) {
      setTimeLeft(KIOSK_CONFIG.warningCountdownSeconds);
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            resetSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isInactivityWarningOpen, resetSession]);

  if (!isInactivityWarningOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-kiosk-lg border border-slate-100 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-6 border-4 border-amber-200/50 animate-bounce">
            <Clock className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal mb-3">
            {t('inactivityTitle')}
          </h2>

          <p className="text-slate-600 text-base sm:text-lg mb-4">
            {t('inactivityMessage')}
          </p>

          <div className="text-5xl font-black text-kiosk-coral my-6 tracking-tight font-mono">
            {timeLeft}s
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="coral"
              size="xl"
              fullWidth
              onClick={() => setIsInactivityWarningOpen(false)}
            >
              {t('keepSessionBtn')}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              fullWidth
              icon={RefreshCw}
              iconPosition="left"
              onClick={resetSession}
            >
              {t('resetNowBtn')}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
