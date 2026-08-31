import React from 'react';
import { useKiosk } from '../context/KioskContext';
import { HelpCircle, Eye, Activity, Globe, UserCog, Mic, Touchpad } from 'lucide-react';
import { LANGUAGES } from '../data/languages';

export function Header() {
  const { 
    language, 
    setLanguage, 
    setIsHelpModalOpen, 
    setIsAccessibilityModalOpen, 
    setCurrentStep,
    currentStep,
    interactionMode,
    staffAuthenticated,
    t
  } = useKiosk();

  const currentLangObj = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];
  const isStaffView = currentStep === 'staffdashboard' || currentStep === 'stafflogin';

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shadow-kiosk-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentStep('welcome')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-12 h-12 rounded-2xl bg-kiosk-coral flex items-center justify-center shadow-kiosk-coral text-white font-bold text-xl group-hover:scale-105 transition-transform">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl text-kiosk-charcoal tracking-tight">MediKiosk</span>
              <span className="bg-kiosk-peach text-kiosk-coral text-xs px-2.5 py-0.5 rounded-full font-semibold border border-kiosk-peach-dark/40">
                2.0 MVP
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 hidden sm:block">
              {isStaffView ? 'Clinical Staff Portal' : t('headerSubtitle')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Active Mode Indicator Badge (when in patient flow) */}
          {!isStaffView && currentStep !== 'language' && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-700">
              {interactionMode === 'voice' ? (
                <>
                  <Mic className="w-3.5 h-3.5 text-kiosk-coral animate-pulse" />
                  <span>Voice + Touch Mode</span>
                </>
              ) : (
                <>
                  <Touchpad className="w-3.5 h-3.5 text-kiosk-blue" />
                  <span>Touch Mode</span>
                </>
              )}
            </div>
          )}

          {/* Active Language Selector */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm font-bold text-kiosk-charcoal transition-all active:scale-95"
            title="Toggle Language / भाषा बदलें"
          >
            <Globe className="w-4 h-4 text-kiosk-blue" />
            <span>{currentLangObj.nativeName}</span>
            <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.5 rounded uppercase">
              {language}
            </span>
          </button>

          {/* Accessibility Options Button */}
          <button
            onClick={() => setIsAccessibilityModalOpen(true)}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all active:scale-95 flex items-center gap-1.5 font-medium text-sm"
            aria-label={t('accessibilityBtn')}
          >
            <Eye className="w-5 h-5 text-slate-600" />
            <span className="hidden md:inline">{t('accessibilityBtn')}</span>
          </button>

          {/* Help Button (for patient flow) */}
          {!isStaffView && (
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-kiosk-blue-light hover:bg-sky-100 border border-sky-200 text-kiosk-blue font-bold transition-all active:scale-95 flex items-center gap-2 text-sm"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="hidden sm:inline">{t('helpBtn')}</span>
            </button>
          )}

          {/* Staff Portal Toggle Button */}
          <button
            onClick={() => {
              if (staffAuthenticated) {
                setCurrentStep('staffdashboard');
              } else {
                setCurrentStep('stafflogin');
              }
            }}
            className={`px-3.5 py-2.5 rounded-xl border text-sm font-bold transition-all active:scale-95 flex items-center gap-2 ${
              isStaffView
                ? 'bg-kiosk-coral text-white border-kiosk-coral shadow-kiosk-coral'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Switch to Staff Clinical Dashboard"
          >
            <UserCog className="w-5 h-5" />
            <span className="hidden sm:inline">{t('staffPortalBtn')}</span>
          </button>

        </div>

      </div>
    </header>
  );
}
