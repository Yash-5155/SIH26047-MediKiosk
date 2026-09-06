import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';

export function PatientConsent() {
  const { language, setCurrentStep, patient } = useKiosk();
  const [isChecked, setIsChecked] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const isHindi = language === 'hi';

  const t = {
    back: isHindi ? 'पीछे' : 'Back',
    step: isHindi ? 'चरण 4 / 4: सहमति' : 'Step 4 of 4: Consent',
    title: isHindi ? 'सहमति एवं डेटा गोपनीयता' : 'Consent & Data Privacy',
    desc: isHindi ? 'समीक्षा करें कि आपकी स्वास्थ्य जानकारी कैसे उपयोग की जाएगी' : 'Please review how MediKiosk processes your health information',
    audioTitle: isHindi ? 'सहमति सुनें (ऑडियो सहायता)' : 'Listen to Consent (Audio Guidance)',
    audioTap: isHindi ? 'अपनी चुनी हुई भाषा में आवाज़ सुनने के लिए टैप करें' : 'Tap to play spoken explanation in your selected language',
    audioPlayingMsg: isHindi ? 'चल रहा है: "MediKiosk अब आपके लक्षणों को रिकॉर्ड करेगा..."' : 'Playing: "MediKiosk will now record your symptoms..."',
    item1Title: isHindi ? 'आवाज़ एवं लक्षण प्रलेखन' : 'Voice & Symptom Documentation',
    item1Desc: isHindi ? 'आपके बोले गए और लिखे गए लक्षणों को आपके डॉक्टर के लिए मेडिकल नोट्स में बदला जाएगा।' : 'Your spoken responses and typed complaints will be converted into structured medical notes for your doctor.',
    item2Title: isHindi ? 'मेडिकल दस्तावेज़ डिजिटलीकरण' : 'Medical Document Digitization',
    item2Desc: isHindi ? 'अपलोड किए गए पर्चे, टेस्ट रिपोर्ट और डिस्चार्ज सारांश आपकी मेडिकल टाइमलाइन बनाने के लिए स्कैन किए जाएंगे।' : 'Uploaded prescriptions, test reports, and discharge summaries will be scanned to reconstruct your timeline.',
    item3Title: isHindi ? 'चिकित्सक समीक्षा आवश्यक' : 'Physician Review Required',
    item3Desc: isHindi ? 'MediKiosk अपने आप दवा या निदान तय नहीं करता। आपके डॉक्टर सभी रिकॉर्ड की समीक्षा, संपादन और पुष्टि करेंगे।' : 'MediKiosk does not autonomously diagnose or prescribe. Your doctor will review, edit, and confirm all records.',
    consentStatement: isHindi ? 'मैं समझता/समझती हूँ कि मेरी जानकारी कैसे ली जाएगी और मैं इस AI स्वास्थ्य जांच के लिए सहमत हूँ।' : 'I understand how my information will be collected and agree to proceed with this AI-assisted clinical intake.',
    btnAccept: isHindi ? 'स्वीकार करें और जांच शुरू करें' : 'Accept & Begin Intake',
    btnDecline: isHindi ? 'अस्वीकार करें / कर्मचारी से बात करें' : 'Decline / Speak with Staff',
    declineAlert: isHindi ? 'एक ट्रायज नर्स को आपकी सहायता के लिए सूचित कर दिया गया है।' : 'A triage nurse has been alerted to assist you with manual paper intake.'
  };

  const handleAudioToggle = () => {
    setAudioPlaying(!audioPlaying);
  };

  // STEP 4: CONNECT SCREEN 5 -> SCREEN 6
  // On clicking Accept & Begin Intake, directly transition into Screen 6 (ConversationalAI)
  const handleAccept = () => {
    if (!isChecked) return;
    setCurrentStep('conversation');
  };

  const handleDecline = () => {
    alert(t.declineAlert);
  };

  const handleBack = () => {
    if (patient?.fullName || patient?.phone) {
      setCurrentStep('registration');
    } else {
      setCurrentStep('identify');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="kiosk-tab active-tab w-full flex flex-col items-center justify-center py-2"
    >
      {/* Top Navigation */}
      <div className="tab-top-nav">
        <button 
          type="button" 
          className="btn-back"
          onClick={handleBack}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span>{t.back}</span>
        </button>
        <span className="step-indicator">{t.step}</span>
      </div>

      {/* Center Header */}
      <div className="tab-header-center">
        <div className="icon-bubble-soft">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <h1 className="tab-main-title">{t.title}</h1>
        <p className="tab-main-desc">{t.desc}</p>
      </div>

      {/* Audio Guidance Pill */}
      <div 
        className="audio-assist-card" 
        id="btnAudioConsent"
        onClick={handleAudioToggle}
        role="button"
        tabIndex={0}
      >
        <div className="audio-icon-pulse">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
        </div>
        <div className="audio-text">
          <strong>{t.audioTitle}</strong>
          <span id="audioStatusText">
            {audioPlaying ? t.audioPlayingMsg : t.audioTap}
          </span>
        </div>
      </div>

      {/* Consent Breakdown Container */}
      <div className="consent-summary-card">
        <div className="consent-item">
          <div className="consent-item-icon">🎙️</div>
          <div className="consent-item-content">
            <strong>{t.item1Title}</strong>
            <p>{t.item1Desc}</p>
          </div>
        </div>

        <div className="consent-item">
          <div className="consent-item-icon">📄</div>
          <div className="consent-item-content">
            <strong>{t.item2Title}</strong>
            <p>{t.item2Desc}</p>
          </div>
        </div>

        <div className="consent-item">
          <div className="consent-item-icon">🩺</div>
          <div className="consent-item-content">
            <strong>{t.item3Title}</strong>
            <p>{t.item3Desc}</p>
          </div>
        </div>
      </div>

      {/* Affirmative Check Card */}
      <label 
        className={`consent-checkbox-card ${isChecked ? 'checked' : ''}`} 
        id="consentCheckCard"
        htmlFor="consentCheckboxInput"
      >
        <input 
          type="checkbox" 
          id="consentCheckboxInput" 
          className="kiosk-native-checkbox"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
        />
        <span className="custom-checkbox">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="check-icon">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </span>
        <span className="checkbox-label">
          {t.consentStatement}
        </span>
      </label>

      {/* Action Buttons */}
      <div className="cta-action-group">
        <button 
          className="btn btn-primary" 
          id="btnAcceptConsent" 
          type="button" 
          disabled={!isChecked}
          onClick={handleAccept}
        >
          <span>{t.btnAccept}</span>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>

        <button 
          className="btn btn-secondary" 
          id="btnDeclineConsent" 
          type="button"
          onClick={handleDecline}
        >
          <span>{t.btnDecline}</span>
        </button>
      </div>

    </motion.div>
  );
}
