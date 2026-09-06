import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';

export function Identity() {
  const { language, setCurrentStep, patient, updatePatient, setPatient } = useKiosk();
  const [patientType, setPatientType] = useState('existing'); // 'existing' | 'new'
  const [selectedIdOption, setSelectedIdOption] = useState('abha'); // 'abha' | 'aadhaar'
  const [idInput, setIdInput] = useState(patient?.id || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isHindi = language === 'hi';

  const t = {
    back: isHindi ? 'पीछे' : 'Back',
    title: isHindi ? 'रोगी पहचान (लॉग इन)' : 'Patient Identification',
    desc: isHindi ? 'अपनी जांच आगे बढ़ाने के लिए एक विकल्प चुनें' : 'Select an option to proceed with your clinical intake',
    existingTitle: isHindi ? 'पुराने मरीज' : 'Existing Patient',
    existingSub: isHindi ? 'ABHA / आधार आईडी द्वारा जांचें' : 'Check in using ABHA / Aadhaar ID',
    newTitle: isHindi ? 'नए मरीज' : 'New Patient',
    newSub: isHindi ? 'पहली बार आगमन / नया प्रोफ़ाइल बनाएं' : 'First time visit / Create profile',
    labelId: isHindi ? 'ABHA आईडी या आधार आईडी' : 'ABHA ID or Aadhaar ID',
    btnAbha: 'ABHA ID',
    btnAadhaar: 'Aadhaar ID',
    placeholderAbha: isHindi ? '14-अंकों का ABHA ID दर्ज करें (उदा. 12-3456-7890-1234)' : 'Enter 14-digit ABHA ID (e.g. 12-3456-7890-1234)',
    placeholderAadhaar: isHindi ? '12-अंकों का आधार ID दर्ज करें (उदा. 1234-5678-9012)' : 'Enter 12-digit Aadhaar ID (e.g. 1234-5678-9012)',
    helpAbha: isHindi ? 'प्रोटोटाइप परीक्षण के लिए, कोई भी 14-अंकीय ABHA ID दर्ज करें।' : 'For prototype testing, enter any valid 14-digit ABHA ID.',
    helpAadhaar: isHindi ? 'प्रोटोटाइप परीक्षण के लिए, कोई भी 12-अंकीय आधार ID दर्ज करें।' : 'For prototype testing, enter any valid 12-digit Aadhaar ID.',
    errAbha: isHindi ? 'ABHA आईडी ठीक 14 अंकों की होनी चाहिए।' : 'ABHA ID must be exactly 14 digits.',
    errAadhaar: isHindi ? 'आधार आईडी ठीक 12 अंकों की होनी चाहिए।' : 'Aadhaar ID must be exactly 12 digits.',
    btnVerify: isHindi ? 'सत्यापित करें और आगे बढ़ें' : 'Verify & Continue',
    verifying: isHindi ? 'सत्यापित कर रहा है...' : 'Verifying with Registry...',
    newPatientTitle: isHindi ? 'नए रोगी का पंजीकरण' : 'New Patient Registration',
    newPatientDesc: isHindi ? 'हम अगली स्क्रीन पर आपकी बुनियादी जानकारी (नाम, उम्र, लिंग, और संपर्क) एकत्र करेंगे।' : 'We will collect your basic profile details (Name, Age, Gender, and Contact) on the next screen.',
    btnRegister: isHindi ? 'पंजीकरण के लिए आगे बढ़ें' : 'Proceed to Registration'
  };

  const handleVerify = () => {
    const rawInput = idInput.replace(/[^0-9]/g, '');
    const isAadhaar = selectedIdOption === 'aadhaar';
    const requiredLength = isAadhaar ? 12 : 14;

    if (rawInput.length !== requiredLength) {
      setErrorMsg(isAadhaar ? t.errAadhaar : t.errAbha);
      return;
    }

    setErrorMsg('');
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      if (rawInput === '000000000000' || rawInput === '111111111111' || rawInput === '00000000000000' || rawInput === '11111111111111') {
        setErrorMsg(isHindi ? 'रिकॉर्ड नहीं मिला: कृपया नए रोगी के रूप में पंजीकरण करें।' : 'Record Not Found: Please register as New Patient.');
      } else {
        if (updatePatient) {
          updatePatient('id', rawInput);
          updatePatient('idType', isAadhaar ? 'Aadhaar' : 'ABHA');
          if (!patient?.name) {
            const verifiedLabel = isAadhaar ? 'Aadhaar Verified Patient' : 'ABHA Verified Patient';
            updatePatient('name', verifiedLabel);
            updatePatient('fullName', verifiedLabel);
          }
        }
        setCurrentStep('consent');
      }
    }, 800);
  };

  const handleProceedNew = () => {
    setCurrentStep('registration');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="kiosk-tab active-tab w-full flex flex-col items-center justify-center py-2"
    >
      {/* Top Bar with Back Navigation */}
      <div className="tab-top-nav">
        <button 
          type="button" 
          className="btn-back"
          onClick={() => setCurrentStep('language')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span>{t.back}</span>
        </button>
        <span className="step-indicator">Step 2 of 4</span>
      </div>

      <div className="tab-header-center">
        <div className="icon-bubble-soft">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h1 className="tab-main-title">{t.title}</h1>
        <p className="tab-main-desc">{t.desc}</p>
      </div>

      {/* 2 Big Choice Cards */}
      <div className="id-options-grid">
        <div 
          className={`id-type-card ${patientType === 'existing' ? 'active' : ''}`}
          id="cardExistingPatient"
          onClick={() => {
            setPatientType('existing');
            setErrorMsg('');
          }}
          role="button"
          tabIndex={0}
        >
          <div className="id-card-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="3"/>
              <circle cx="9" cy="10" r="2"/>
              <path d="M15 8h2M15 12h2M7 16h10"/>
            </svg>
          </div>
          <div className="id-card-content">
            <strong className="id-card-title">{t.existingTitle}</strong>
            <span className="id-card-sub">{t.existingSub}</span>
          </div>
          <div className="radio-indicator"></div>
        </div>

        <div 
          className={`id-type-card ${patientType === 'new' ? 'active' : ''}`}
          id="cardNewPatient"
          onClick={() => {
            setPatientType('new');
            setErrorMsg('');
          }}
          role="button"
          tabIndex={0}
        >
          <div className="id-card-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <div className="id-card-content">
            <strong className="id-card-title">{t.newTitle}</strong>
            <span className="id-card-sub">{t.newSub}</span>
          </div>
          <div className="radio-indicator"></div>
        </div>
      </div>

      {/* Existing Patient Sub-panel */}
      {patientType === 'existing' && (
        <div className="id-subpanel" id="panelExisting">
          <div className="input-field-group">
            <label className="input-label" htmlFor="inputPatientId">{t.labelId}</label>
            
            {/* Touch pills to choose between ABHA ID and Aadhaar ID */}
            <div className="gender-pill-group" style={{ gridTemplateColumns: '1fr 1fr', height: '48px', marginBottom: '1.25rem' }}>
              <button 
                type="button" 
                className={`gender-pill ${selectedIdOption === 'abha' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedIdOption('abha');
                  setErrorMsg('');
                }}
              >
                {t.btnAbha}
              </button>
              <button 
                type="button" 
                className={`gender-pill ${selectedIdOption === 'aadhaar' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedIdOption('aadhaar');
                  setErrorMsg('');
                }}
              >
                {t.btnAadhaar}
              </button>
            </div>

            <div className="input-wrapper">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon">
                <rect x="3" y="4" width="18" height="16" rx="3"/>
                <circle cx="8" cy="10" r="2"/>
                <path d="M14 10h4M14 14h4"/>
              </svg>
              <input 
                type="text" 
                id="inputPatientId" 
                className="kiosk-input" 
                placeholder={selectedIdOption === 'aadhaar' ? t.placeholderAadhaar : t.placeholderAbha}
                maxLength={selectedIdOption === 'aadhaar' ? 14 : 17}
                inputMode="numeric"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerify();
                }}
              />
            </div>
            {errorMsg && (
              <span className="text-sm font-semibold text-rose-600 mt-2 block">{errorMsg}</span>
            )}
            <span className="input-help-text">
              {selectedIdOption === 'aadhaar' ? t.helpAadhaar : t.helpAbha}
            </span>
          </div>

          <div className="cta-action-group">
            <button 
              className="btn btn-primary" 
              id="btnVerifyExisting" 
              type="button"
              onClick={handleVerify}
              disabled={isVerifying}
            >
              <span>{isVerifying ? t.verifying : t.btnVerify}</span>
              {!isVerifying && (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* New Patient Sub-panel */}
      {patientType === 'new' && (
        <div className="id-subpanel" id="panelNew">
          <div className="info-banner-card">
            <div className="banner-icon">ℹ️</div>
            <div className="banner-text">
              <strong>{t.newPatientTitle}</strong>
              <p>{t.newPatientDesc}</p>
            </div>
          </div>

          <div className="cta-action-group">
            <button 
              className="btn btn-primary" 
              id="btnGoToRegister" 
              type="button"
              onClick={handleProceedNew}
            >
              <span>{t.btnRegister}</span>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
