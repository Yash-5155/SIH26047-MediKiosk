import React from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { Touchpad, Mic, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

export function InteractionMode() {
  const { interactionMode, setInteractionMode, setCurrentStep, t } = useKiosk();

  const handleSelectMode = (mode) => {
    setInteractionMode(mode);
  };

  const handleContinue = () => {
    setCurrentStep('details');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"
    >
      {/* Title */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kiosk-peach text-kiosk-coral font-bold text-xs uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Interaction Preference
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-kiosk-charcoal tracking-tight mb-3">
          {t('modeTitle')}
        </h1>
        <p className="text-slate-600 text-lg sm:text-2xl max-w-xl mx-auto">
          {t('modeSubtitle')}
        </p>
      </div>

      {/* Touch vs Voice Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-10">
        
        {/* Touch Mode Card */}
        <motion.button
          onClick={() => handleSelectMode('touch')}
          whileTap={{ scale: 0.98 }}
          className={`
            p-8 rounded-3xl text-left border-2 transition-all flex flex-col justify-between min-h-[220px] relative touch-manipulation select-none
            ${interactionMode === 'touch'
              ? 'border-kiosk-blue bg-gradient-to-br from-white to-sky-50/60 shadow-kiosk-lg ring-2 ring-kiosk-blue/20'
              : 'border-slate-200 bg-white hover:border-slate-300 shadow-kiosk-sm'
            }
          `}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-kiosk-blue flex items-center justify-center">
              <Touchpad className="w-9 h-9 stroke-[2.5]" />
            </div>
            {interactionMode === 'touch' && (
              <div className="w-8 h-8 rounded-full bg-kiosk-blue text-white flex items-center justify-center">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal mb-2">
              {t('touchModeTitle')}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              {t('touchModeDesc')}
            </p>
          </div>
        </motion.button>

        {/* Voice + Touch Mode Card */}
        <motion.button
          onClick={() => handleSelectMode('voice')}
          whileTap={{ scale: 0.98 }}
          className={`
            p-8 rounded-3xl text-left border-2 transition-all flex flex-col justify-between min-h-[220px] relative touch-manipulation select-none
            ${interactionMode === 'voice'
              ? 'border-kiosk-coral bg-gradient-to-br from-white to-kiosk-peach/50 shadow-kiosk-lg ring-2 ring-kiosk-coral/20'
              : 'border-slate-200 bg-white hover:border-slate-300 shadow-kiosk-sm'
            }
          `}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 rounded-2xl bg-kiosk-peach text-kiosk-coral flex items-center justify-center">
              <Mic className="w-9 h-9 stroke-[2.5]" />
            </div>
            {interactionMode === 'voice' && (
              <div className="w-8 h-8 rounded-full bg-kiosk-coral text-white flex items-center justify-center">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal">
                {t('voiceModeTitle')}
              </h2>
              <span className="bg-kiosk-coral text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                AI Voice
              </span>
            </div>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              {t('voiceModeDesc')}
            </p>
          </div>
        </motion.button>

      </div>

      {/* Navigation Buttons */}
      <div className="w-full flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentStep('welcome')}
          icon={ArrowLeft}
          iconPosition="left"
        >
          {t('backBtn')}
        </Button>

        <Button
          variant="coral"
          size="xl"
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
