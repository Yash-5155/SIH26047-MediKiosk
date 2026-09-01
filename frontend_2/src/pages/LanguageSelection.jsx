import React from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { LANGUAGES } from '../data/languages';
import { Button } from '../components/Button';
import { Check, ArrowRight, Globe2 } from 'lucide-react';

export function LanguageSelection() {
  const { language, setLanguage, setCurrentStep, t } = useKiosk();

  const handleSelectLanguage = (langId, available) => {
    if (!available) return;
    setLanguage(langId);
  };

  const handleContinue = () => {
    setCurrentStep('welcome');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"
    >
      {/* Icon Badge */}
      <div className="w-20 h-20 rounded-3xl bg-kiosk-peach text-kiosk-coral flex items-center justify-center mb-6 shadow-kiosk-sm border border-kiosk-peach-dark/30">
        <Globe2 className="w-10 h-10 stroke-[2]" />
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="text-3xl sm:text-5xl font-black text-kiosk-charcoal text-center tracking-tight mb-4">
        {t('langSelectTitle')}
      </h1>
      <p className="text-slate-600 text-lg sm:text-2xl text-center max-w-2xl mb-10 leading-relaxed">
        {t('langSelectSubtitle')}
      </p>

      {/* Language Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full mb-10">
        {LANGUAGES.map((lang) => {
          const isSelected = language === lang.id;
          const isAvailable = lang.available;

          return (
            <motion.button
              key={lang.id}
              onClick={() => handleSelectLanguage(lang.id, isAvailable)}
              disabled={!isAvailable}
              whileTap={isAvailable ? { scale: 0.98 } : {}}
              className={`
                relative p-6 sm:p-8 rounded-3xl text-left border-2 transition-all flex flex-col justify-between min-h-[140px] select-none touch-manipulation
                ${isSelected
                  ? 'border-kiosk-coral bg-gradient-to-br from-white to-kiosk-peach/50 shadow-kiosk-lg ring-2 ring-kiosk-coral/20'
                  : isAvailable
                    ? 'border-slate-200 bg-white hover:border-slate-300 shadow-kiosk-sm hover:shadow-kiosk-md'
                    : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                }
              `}
            >
              {/* Card Header: Flag & Selection indicator */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{lang.flag}</span>
                {isSelected && (
                  <div className="w-8 h-8 rounded-full bg-kiosk-coral text-white flex items-center justify-center shadow-kiosk-coral">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Language Names */}
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal">
                    {lang.nativeName}
                  </span>
                  <span className="text-base text-slate-500 font-medium">
                    ({lang.name})
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {lang.subtitle}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Action Footer Button */}
      <div className="w-full sm:w-80">
        <Button
          variant="coral"
          size="xl"
          fullWidth
          onClick={handleContinue}
          icon={ArrowRight}
          iconPosition="right"
        >
          {t('continueBtn')}
        </Button>
      </div>
    </motion.div>
  );
}
