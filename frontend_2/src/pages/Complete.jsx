import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { CheckCircle2, Ticket, Printer, RefreshCw, Smartphone, Check } from 'lucide-react';

export function Complete() {
  const { token, resetSession, t } = useKiosk();
  const [printed, setPrinted] = useState(false);

  const handlePrint = () => {
    setPrinted(true);
    setTimeout(() => setPrinted(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-3xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col items-center justify-center text-center min-h-[calc(100vh-10rem)]"
    >
      {/* Animated Success Icon */}
      <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-kiosk-md border-4 border-emerald-200/60 animate-bounce">
        <CheckCircle2 className="w-14 h-14 stroke-[2.5]" />
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="text-3xl sm:text-5xl font-black text-kiosk-charcoal tracking-tight mb-3">
        {t('completeHeading')}
      </h1>
      <p className="text-slate-600 text-lg sm:text-xl max-w-xl mb-8 leading-relaxed">
        {t('completeSubtitle')}
      </p>

      {/* Big Display Token Card */}
      <div className="bg-gradient-to-br from-white via-kiosk-peach/30 to-white rounded-3xl p-8 sm:p-12 border-2 border-kiosk-coral/30 shadow-kiosk-lg mb-8 w-full max-w-md relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 text-kiosk-coral font-extrabold text-sm uppercase tracking-widest mb-2">
          <Ticket className="w-4 h-4" />
          <span>{t('tokenBigLabel')}</span>
        </div>

        <div className="text-6xl sm:text-7xl font-black text-kiosk-coral tracking-tight font-mono my-2">
          {token || 'A-104'}
        </div>

        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-3">
          Keep this token number handy when your turn is announced.
        </p>
      </div>

      {/* Action Options: Print Token / Start New Session */}
      <div className="w-full max-w-md space-y-4">
        
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={handlePrint}
          icon={printed ? Check : Printer}
          iconPosition="left"
        >
          {printed ? 'Token Sent to Printer!' : 'Print Paper Receipt'}
        </Button>

        <Button
          variant="coral"
          size="xl"
          fullWidth
          onClick={resetSession}
          icon={RefreshCw}
          iconPosition="left"
        >
          {t('startNewSession')}
        </Button>
      </div>
    </motion.div>
  );
}
