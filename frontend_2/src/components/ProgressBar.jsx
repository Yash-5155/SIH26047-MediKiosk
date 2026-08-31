import React from 'react';
import { motion } from 'framer-motion';

export function ProgressBar({ current, total, label = '' }) {
  const percentage = Math.min(100, Math.max(0, Math.round((current / total) * 100)));

  return (
    <div className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-kiosk-sm mb-6">
      <div className="flex items-center justify-between text-sm sm:text-base font-bold text-kiosk-charcoal mb-2">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-kiosk-coral animate-pulse"></span>
          {label}
        </span>
        <span className="text-kiosk-coral font-extrabold">{percentage}%</span>
      </div>
      
      <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5">
        <motion.div
          className="h-full bg-gradient-to-r from-kiosk-coral to-rose-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
