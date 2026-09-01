import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { KIOSK_CONFIG } from '../config/kioskConfig';
import { mockApi } from '../services/mockApi';

export const KioskContext = createContext(null);

const initialPatientState = {
  id: null,
  name: '',
  fullName: '',
  dateOfBirth: '',
  age: '',
  gender: '',
  phone: '',
  conditions: [],
  preferredLanguage: 'en'
};

const initialSessionState = {
  id: null,
  patient_id: null,
  status: 'IN_PROGRESS',
  startedAt: null,
  completedAt: null
};

export function KioskProvider({ children }) {
  const [language, setLanguage] = useState(KIOSK_CONFIG.defaultLanguage);
  const [currentStep, setCurrentStep] = useState('language');
  const [interactionMode, setInteractionMode] = useState('TOUCH'); // 'TOUCH' | 'VOICE'

  const [patient, setPatient] = useState(initialPatientState);
  const [session, setSession] = useState(initialSessionState);
  const [scannedDocumentData, setScannedDocumentData] = useState(null);
  
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [answersMap, setAnswersMap] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [triageResult, setTriageResult] = useState(null);
  const [token, setToken] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Staff / Doctor Portal state
  const [staffUser, setStaffUser] = useState(null);
  const [staffAuthenticated, setStaffAuthenticated] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedPatientForSummary, setSelectedPatientForSummary] = useState(null);

  // Modals
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isInactivityWarningOpen, setIsInactivityWarningOpen] = useState(false);

  // Accessibility settings
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large' | 'xlarge'
  const [highContrast, setHighContrast] = useState(false);

  // Translation helper shorthand
  const t = useCallback((key) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  }, [language]);

  // Master Session Reset for Patient Kiosk
  const resetSession = useCallback(() => {
    setLanguage('en');
    setCurrentStep('language');
    setInteractionMode('TOUCH');
    setPatient(initialPatientState);
    setSession(initialSessionState);
    setScannedDocumentData(null);
    setResponses([]);
    setAnswersMap({});
    setCurrentQuestionIndex(0);
    setTriageResult(null);
    setToken(null);
    setIsProcessing(false);
    setIsHelpModalOpen(false);
    setIsAccessibilityModalOpen(false);
    setIsHowItWorksOpen(false);
    setIsInactivityWarningOpen(false);
  }, []);

  // Update patient field
  const updatePatient = (field, value) => {
    setPatient(prev => ({ ...prev, [field]: value }));
  };

  // Record an answer in both answersMap and responses array matching backend IntakeResponse schema
  const setAnswer = (questionId, value, inputModeOverride = null) => {
    setAnswersMap(prev => ({ ...prev, [questionId]: value }));

    const targetQ = questions.find(q => q.id === questionId);
    const qKey = targetQ ? targetQ.question_key : `q_${questionId}`;
    const mode = inputModeOverride || interactionMode || "TOUCH";

    const newResponse = {
      question_id: questionId,
      question_key: qKey,
      answer_text: Array.isArray(value) ? value.join(', ') : String(value),
      input_mode: mode,
      answered_at: new Date().toISOString()
    };

    setResponses(prev => {
      const filtered = prev.filter(r => r.question_id !== questionId);
      return [...filtered, newResponse];
    });

    if (session.id) {
      mockApi.submitResponse(session.id, questionId, qKey, newResponse.answer_text, mode);
    }
  };

  // Load questions on initial render
  useEffect(() => {
    mockApi.getQuestions().then(qList => setQuestions(qList));
  }, []);

  // Auto inactivity timeout handling
  useEffect(() => {
    let inactivityTimer;

    const resetInactivityTimers = () => {
      clearTimeout(inactivityTimer);

      if (currentStep !== 'language' && currentStep !== 'staffdashboard' && currentStep !== 'stafflogin' && currentStep !== 'staffsession') {
        inactivityTimer = setTimeout(() => {
          setIsInactivityWarningOpen(true);
        }, KIOSK_CONFIG.inactivityTimeoutSeconds * 1000);
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, resetInactivityTimers));

    resetInactivityTimers();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetInactivityTimers));
    };
  }, [currentStep]);

  const value = {
    language,
    setLanguage,
    currentStep,
    setCurrentStep,
    interactionMode,
    setInteractionMode,
    patient,
    updatePatient,
    setPatient,
    session,
    setSession,
    scannedDocumentData,
    setScannedDocumentData,
    questions,
    setQuestions,
    responses,
    setResponses,
    answers: answersMap,
    setAnswer,
    setAnswers: setAnswersMap,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    triageResult,
    setTriageResult,
    token,
    setToken,
    isProcessing,
    setIsProcessing,
    resetSession,
    t,

    // Staff / Doctor Dashboard
    staffUser,
    setStaffUser,
    staffAuthenticated,
    setStaffAuthenticated,
    selectedSessionId,
    setSelectedSessionId,
    selectedPatientForSummary,
    setSelectedPatientForSummary,

    // Modals
    isHelpModalOpen,
    setIsHelpModalOpen,
    isAccessibilityModalOpen,
    setIsAccessibilityModalOpen,
    isHowItWorksOpen,
    setIsHowItWorksOpen,
    isInactivityWarningOpen,
    setIsInactivityWarningOpen,

    // Accessibility
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast
  };

  return (
    <KioskContext.Provider value={value}>
      <div className={`${fontSize === 'large' ? 'text-lg' : fontSize === 'xlarge' ? 'text-xl' : 'text-base'} ${highContrast ? 'contrast-125 saturate-150' : ''}`}>
        {children}
      </div>
    </KioskContext.Provider>
  );
}

export function useKiosk() {
  const context = useContext(KioskContext);
  if (!context) {
    throw new Error('useKiosk must be used within a KioskProvider');
  }
  return context;
}
