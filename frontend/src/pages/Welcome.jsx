import React from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';

export function Welcome() {
  const { language, setCurrentStep, setIsHowItWorksOpen } = useKiosk();

  const isHindi = language === 'hi';

  const t = {
    triageTag: isHindi ? 'त्वरित और सरल प्राथमिक स्वास्थ्य जांच' : 'Fast & Friendly Self-Service Triage',
    heroHeading: isHindi ? 'आपका स्वास्थ्य। आपका पहला कदम।' : 'Your health. Your first step.',
    heroDesc: isHindi 
      ? 'अपने लक्षणों को समझने और सही डॉक्टर तक पहुँचने के लिए कुछ सरल प्रश्नों के उत्तर दें।'
      : 'Answer a few simple questions to help us understand your symptoms and guide you to the right care.',
    privateSecure: isHindi ? 'निजी एवं सुरक्षित' : 'Private & Secure',
    nurseAssisted: isHindi ? 'नर्स द्वारा सहायता प्राप्त' : 'Nurse Assisted',
    quickCheck: isHindi ? 'त्वरित ~2 मिनट जांच' : 'Quick ~2 Min Check',
    smartTriage: isHindi ? 'स्मार्ट ट्राइएज' : 'Smart Triage',
    instantGuidance: isHindi ? 'त्वरित मार्गदर्शन' : 'Instant Desk Guidance',
    noLongForms: isHindi ? 'कोई लंबा फॉर्म नहीं' : 'No Long Forms',
    btnStart: isHindi ? 'स्वास्थ्य जांच शुरू करें' : 'Start Health Check',
    btnHelp: isHindi ? 'यह कैसे काम करता है?' : 'How does this work?'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="kiosk-tab active-tab w-full flex flex-col items-center justify-center py-2"
    >
      <div className="hero-card">
        <div className="hero-left">
          <div className="pill-tag triage-tag">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span>{t.triageTag}</span>
          </div>

          <h1 className="hero-heading">{t.heroHeading}</h1>
          <p className="hero-description">{t.heroDesc}</p>

          <div className="feature-pills-group">
            <div className="pill-tag feature-tag">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>{t.privateSecure}</span>
            </div>
            <div className="pill-tag feature-tag">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
              </svg>
              <span>{t.nurseAssisted}</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="graphic-badge badge-top">
            <span className="status-dot"></span>
            <span>{t.quickCheck}</span>
          </div>

          <div className="graphic-card">
            <div className="icon-bubble">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
                <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
                <circle cx="20" cy="10" r="2"/>
              </svg>
            </div>
            <div className="graphic-text">
              <strong>{t.smartTriage}</strong>
              <span>{t.instantGuidance}</span>
            </div>
          </div>

          <div className="graphic-badge badge-bottom">
            <span className="status-dot dot-red"></span>
            <span>{t.noLongForms}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="cta-action-group">
        <button 
          className="btn btn-primary" 
          id="btnStart" 
          type="button"
          onClick={() => setCurrentStep('language')}
        >
          <span>{t.btnStart}</span>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>

        <button 
          className="btn btn-secondary" 
          id="btnHelp" 
          type="button"
          onClick={() => {
            if (setIsHowItWorksOpen) {
              setIsHowItWorksOpen(true);
            } else {
              alert("MediKiosk guides you through basic intake questions and document scans before you meet the doctor.");
            }
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>{t.btnHelp}</span>
        </button>
      </div>
    </motion.div>
  );
}
