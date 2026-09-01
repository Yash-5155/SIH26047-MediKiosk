import React from 'react';
import { useKiosk } from '../context/KioskContext';
import { KIOSK_CONFIG } from '../config/kioskConfig';
import { AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

export function Footer() {
  const { t } = useKiosk();

  return (
    <footer className="bg-white border-t border-slate-200/80 py-4 px-4 sm:px-8 mt-auto z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
        
        {/* Emergency Alert Note */}
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/60 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{t('emergencyAlert')}</span>
        </div>

        {/* Info & Privacy */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {t('privacyNotice')}
          </span>
          <span className="hidden lg:inline text-slate-300">|</span>
          <span className="hidden lg:flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {KIOSK_CONFIG.locationName} ({KIOSK_CONFIG.kioskId})
          </span>
        </div>

      </div>
    </footer>
  );
}
