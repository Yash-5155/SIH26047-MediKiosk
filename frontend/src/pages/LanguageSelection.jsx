import React from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';

export const LANGUAGES = [
  {
    id: 'en',
    countryCode: 'GB',
    name: 'English',
    sub: '(English)',
    hint: 'Select English to proceed',
    available: true
  },
  {
    id: 'hi',
    countryCode: 'IN',
    name: 'हिन्दी',
    sub: '(Hindi)',
    hint: 'आगे बढ़ने के लिए हिन्दी चुनें',
    available: true
  },
  {
    id: 'ta',
    countryCode: 'IN',
    name: 'தமிழ்',
    sub: '(Tamil)',
    hint: 'Coming soon / जल्द उपलब्ध',
    available: false
  },
  {
    id: 'bn',
    countryCode: 'IN',
    name: 'বাংলা',
    sub: '(Bengali)',
    hint: 'Coming soon / जल्द उपलब्ध',
    available: false
  }
];

export const SCREEN2_TRANSLATIONS = {
  en: {
    title: 'Welcome to MediKiosk',
    desc: 'Choose your preferred language to begin your health check',
    continueBtn: 'Continue'
  },
  hi: {
    title: 'MediKiosk में आपका स्वागत है',
    desc: 'स्वास्थ्य जांच शुरू करने के लिए अपनी पसंदीदा भाषा चुनें',
    continueBtn: 'आगे बढ़ें'
  }
};

export function LanguageSelection() {
  const { language, setLanguage, setCurrentStep } = useKiosk();

  const handleSelectLanguage = (langId, available) => {
    if (!available) return;
    setLanguage(langId);
  };

  const handleContinueClick = () => {
    setCurrentStep('identify');
  };

  const t = SCREEN2_TRANSLATIONS[language] || SCREEN2_TRANSLATIONS.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="kiosk-tab active-tab w-full flex flex-col items-center justify-center py-2"
    >
      {/* Centered Tab Header */}
      <div className="tab-header-center">
        <div className="icon-bubble-soft">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <h1 className="tab-main-title">{t.title}</h1>
        <p className="tab-main-desc">{t.desc}</p>
      </div>

      {/* Language Selection Grid */}
      <div className="language-grid">
        {LANGUAGES.map((lang) => {
          const isSelected = language === lang.id;
          const isAvailable = lang.available;

          return (
            <div
              key={lang.id}
              className={`lang-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
              data-lang={lang.id}
              onClick={() => handleSelectLanguage(lang.id, isAvailable)}
              role="button"
              tabIndex={isAvailable ? 0 : -1}
              onKeyDown={(e) => {
                if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleSelectLanguage(lang.id, isAvailable);
                }
              }}
            >
              <div className="lang-card-top">
                <span className="country-code">{lang.countryCode}</span>
                {isAvailable && (
                  <div className="check-badge">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#FFFFFF" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="lang-card-body">
                <strong className="lang-name">
                  {lang.name} <span className="lang-sub">{lang.sub}</span>
                </strong>
                <span className="lang-hint">{lang.hint}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="cta-action-group">
        <button
          className="btn btn-primary"
          id="btnContinue"
          type="button"
          onClick={handleContinueClick}
        >
          <span>{t.continueBtn}</span>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
