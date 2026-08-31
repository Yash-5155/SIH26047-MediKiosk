import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from './Button';
import { HelpCircle, PhoneCall, CheckCircle2, X } from 'lucide-react';

export function HelpModal() {
  const { isHelpModalOpen, setIsHelpModalOpen, t } = useKiosk();
  const [called, setCalled] = useState(false);

  if (!isHelpModalOpen) return null;

  const handleCallStaff = () => {
    setCalled(true);
    setTimeout(() => {
      setCalled(false);
      setIsHelpModalOpen(false);
    }, 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-kiosk-lg border border-slate-100 relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => setIsHelpModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-kiosk-blue-light text-kiosk-blue flex items-center justify-center mb-6">
            <HelpCircle className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal mb-3">
            {t('helpTitle')}
          </h2>

          <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed">
            {t('helpMessage')}
          </p>

          {called ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 font-semibold text-lg"
            >
              <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
              <span>{t('staffCalledMessage')}</span>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                variant="coral"
                size="xl"
                fullWidth
                icon={PhoneCall}
                iconPosition="left"
                onClick={handleCallStaff}
              >
                {t('callStaffBtn')}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => setIsHelpModalOpen(false)}
              >
                {t('closeBtn')}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
