import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';

export function PatientRegistration() {
  const { language, setCurrentStep, patient, updatePatient } = useKiosk();

  const [fullName, setFullName] = useState(patient?.fullName || patient?.name || '');
  const [age, setAge] = useState(patient?.age || '');
  const [gender, setGender] = useState(patient?.gender || 'Male');
  const [phone, setPhone] = useState(patient?.phone || '');
  const [address, setAddress] = useState(patient?.address || '');
  const [errorMsg, setErrorMsg] = useState('');

  const isHindi = language === 'hi';

  const t = {
    back: isHindi ? 'पीछे' : 'Back',
    step: isHindi ? 'चरण 3 / 4: पंजीकरण' : 'Step 3 of 4: Registration',
    title: isHindi ? 'नए रोगी का पंजीकरण' : 'New Patient Registration',
    desc: isHindi ? 'टोकन प्राप्त करने के लिए अपनी बुनियादी जानकारी दर्ज करें' : 'Enter your basic demographics to generate your triage token',
    nameLabel: isHindi ? 'पूरा नाम *' : 'Full Name *',
    namePlaceholder: isHindi ? 'उदा. सत्यम पाण्डेय' : 'e.g. Satya Pandey',
    ageLabel: isHindi ? 'उम्र (वर्ष) *' : 'Age (Years) *',
    agePlaceholder: isHindi ? 'उम्र' : 'Age',
    genderLabel: isHindi ? 'लिंग *' : 'Gender *',
    male: isHindi ? 'पुरुष' : 'Male',
    female: isHindi ? 'महिला' : 'Female',
    other: isHindi ? 'अन्य' : 'Other',
    phoneLabel: isHindi ? 'मोबाइल नंबर *' : 'Mobile Phone Number *',
    phonePlaceholder: isHindi ? '10-अंकीय मोबाइल नंबर' : '10-digit mobile number',
    phoneHelp: isHindi ? 'टोकन नंबर और डिजिटल पर्ची भेजने के लिए उपयोग किया जाता है।' : 'Used to send token number and digital prescription via SMS.',
    cityLabel: isHindi ? 'शहर / ज़िला (वैकल्पिक)' : 'City / District (Optional)',
    cityPlaceholder: isHindi ? 'उदा. लखनऊ' : 'e.g. Lucknow',
    btnSubmit: isHindi ? 'सहमति के लिए आगे बढ़ें' : 'Proceed to Consent',
    errName: isHindi ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.',
    errAge: isHindi ? 'कृपया 1 से 120 के बीच मान्य उम्र दर्ज करें।' : 'Please enter a valid age between 1 and 120.',
    errPhone: isHindi ? 'कृपया 10-अंकीय मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.'
  };

  const handleSubmit = () => {
    const trimmedName = fullName.trim();
    const trimmedAge = String(age).trim();
    const cleanPhone = phone.trim().replace(/\D/g, '');

    if (!trimmedName) {
      setErrorMsg(t.errName);
      return;
    }
    const ageNum = parseInt(trimmedAge, 10);
    if (!trimmedAge || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setErrorMsg(t.errAge);
      return;
    }
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg(t.errPhone);
      return;
    }

    setErrorMsg('');

    // Save into KioskContext
    if (updatePatient) {
      updatePatient('fullName', trimmedName);
      updatePatient('name', trimmedName);
      updatePatient('age', trimmedAge);
      updatePatient('gender', gender);
      updatePatient('phone', cleanPhone);
      updatePatient('address', address.trim());
      updatePatient('preferredLanguage', language);
    }

    setCurrentStep('consent');
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
          onClick={() => setCurrentStep('identify')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span>{t.back}</span>
        </button>
        <span className="step-indicator">{t.step}</span>
      </div>

      <div className="tab-header-center">
        <div className="icon-bubble-soft">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        <h1 className="tab-main-title">{t.title}</h1>
        <p className="tab-main-desc">{t.desc}</p>
      </div>

      {/* Registration Form Container */}
      <form className="registration-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        
        {/* Full Name */}
        <div className="input-field-group">
          <label className="input-label" htmlFor="regFullName">{t.nameLabel}</label>
          <div className="input-wrapper">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <input 
              type="text" 
              id="regFullName" 
              className="kiosk-input" 
              placeholder={t.namePlaceholder} 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
          </div>
        </div>

        {/* Age & Gender Grid */}
        <div className="form-row-2col">
          {/* Age */}
          <div className="input-field-group">
            <label className="input-label" htmlFor="regAge">{t.ageLabel}</label>
            <div className="input-wrapper">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              <input 
                type="number" 
                id="regAge" 
                className="kiosk-input" 
                placeholder={t.agePlaceholder} 
                min="1" 
                max="120" 
                inputMode="numeric" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* Gender Touch Pills */}
          <div className="input-field-group">
            <label className="input-label">{t.genderLabel}</label>
            <div className="gender-pill-group">
              {['Male', 'Female', 'Other'].map((g) => (
                <button 
                  key={g}
                  type="button" 
                  className={`gender-pill ${gender === g ? 'active' : ''}`}
                  onClick={() => setGender(g)}
                >
                  {g === 'Male' ? t.male : g === 'Female' ? t.female : t.other}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Phone Number */}
        <div className="input-field-group">
          <label className="input-label" htmlFor="regPhone">{t.phoneLabel}</label>
          <div className="input-wrapper phone-prefix-wrapper">
            <span className="phone-country-code">+91</span>
            <input 
              type="tel" 
              id="regPhone" 
              className="kiosk-input phone-input" 
              placeholder={t.phonePlaceholder} 
              maxLength={10} 
              inputMode="numeric" 
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              required 
            />
          </div>
          <span className="input-help-text">{t.phoneHelp}</span>
        </div>

        {/* Address / District (Optional Demographics) */}
        <div className="input-field-group">
          <label className="input-label" htmlFor="regAddress">{t.cityLabel}</label>
          <div className="input-wrapper">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <input 
              type="text" 
              id="regAddress" 
              className="kiosk-input" 
              placeholder={t.cityPlaceholder}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="text-sm font-semibold text-rose-600 mb-3 block">
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        <div className="cta-action-group form-submit-group">
          <button 
            className="btn btn-primary" 
            id="btnSubmitRegistration" 
            type="submit"
          >
            <span>{t.btnSubmit}</span>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

      </form>
    </motion.div>
  );
}
