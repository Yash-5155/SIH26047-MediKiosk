import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { KIOSK_CONFIG } from '../config/kioskConfig';
import { mockApi } from '../services/mockApi';
import { MOCK_SESSIONS } from '../data/mockSessions';

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

// Default sample medical document extracted data for realistic demo
export const SAMPLE_EXTRACTED_DOCS = [
  {
    id: 'DOC-2026-01',
    documentType: 'Prescription',
    documentName: 'Dr_Sharma_Prescription_Aug2026.pdf',
    date: '2026-08-15',
    issuer: 'City Care Hospital, OPD',
    diagnosis: 'Acute Bronchitis & Secondary Pharyngitis',
    medicines: [
      'Amoxicillin 500mg (1 tablet thrice daily x 5 days)',
      'Paracetamol 650mg (SOS for fever above 100°F)',
      'Levocetirizine 5mg (1 tablet at bedtime)'
    ],
    labValues: [
      'C-Reactive Protein (CRP): 18.4 mg/L [Elevated, Ref: <5.0]',
      'Total Leukocyte Count: 11,400 /µL [Mild Leukocytosis]'
    ],
    abnormalValues: ['Elevated CRP (18.4 mg/L)', 'Mild Leukocytosis (11,400/µL)'],
    doctorNotes: 'Advised rest, warm fluids, steam inhalation twice daily.'
  }
];

export function KioskProvider({ children }) {
  const [language, setLanguage] = useState(KIOSK_CONFIG.defaultLanguage);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [interactionMode, setInteractionMode] = useState('TOUCH'); // 'TOUCH' | 'VOICE'

  const [patient, setPatient] = useState(initialPatientState);
  const [session, setSession] = useState(initialSessionState);
  const [scannedDocumentData, setScannedDocumentData] = useState(null);
  
  // Medical Documents State (Screens 9-12)
  const [medicalDocuments, setMedicalDocuments] = useState(SAMPLE_EXTRACTED_DOCS);
  const [activeDocumentType, setActiveDocumentType] = useState('Prescription'); // 'Prescription' | 'Lab Report' | 'Discharge Summary'
  const [capturedImage, setCapturedImage] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [uploadedDocumentId, setUploadedDocumentId] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);

  // Generated Clinical Summary State (Screens 13, 14, 18, 19)
  const [clinicalSummary, setClinicalSummary] = useState(null);

  // Doctor Queue State (Screens 16-19)
  const [doctorQueue, setDoctorQueue] = useState(MOCK_SESSIONS);

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
  const [isDoctorReviewReadOnly, setIsDoctorReviewReadOnly] = useState(false);

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
    setCurrentStep('welcome');
    setInteractionMode('TOUCH');
    setPatient(initialPatientState);
    setSession(initialSessionState);
    setScannedDocumentData(null);
    setMedicalDocuments(SAMPLE_EXTRACTED_DOCS);
    setCapturedImage(null);
    setOcrResult(null);
    setUploadedDocumentId(null);
    setUploadedDocument(null);
    setClinicalSummary(null);
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
    setIsDoctorReviewReadOnly(false);
  }, []);

  // Add a newly scanned/uploaded document
  const addMedicalDocument = useCallback((doc) => {
    setMedicalDocuments(prev => [doc, ...prev]);
  }, []);

  // Update clinical summary (for doctor edits or patient intake generation)
  const updateClinicalSummary = useCallback((updates) => {
    setClinicalSummary(prev => ({ ...(prev || {}), ...updates }));
  }, []);

  // Update a session in the doctor queue (for doctor confirm/reject/edit)
  const updateDoctorQueueSession = useCallback((sessionId, updates) => {
    setDoctorQueue(prev => prev.map(s => {
      if (s.session_id === sessionId) {
        return {
          ...s,
          ...updates,
          clinical_summary: {
            ...(s.clinical_summary || {}),
            ...(updates.clinical_summary || {})
          }
        };
      }
      return s;
    }));
  }, []);

  // Update patient field
  const updatePatient = (field, value) => {
    setPatient(prev => ({ ...prev, [field]: value }));
  };

  // Record an answer in both answersMap and responses array matching backend IntakeResponse schema
  // inputModeOverride — explicit mode string ('TOUCH'|'TEXT'|'VOICE') passed by interview components
  const setAnswer = (questionId, value, inputModeOverride = null) => {
    setAnswersMap(prev => ({ ...prev, [questionId]: value }));

    const targetQ = questions.find(q => q.id === questionId);
    const qKey = targetQ ? (targetQ.question_key || `q_${questionId}`) : `q_${questionId}`;
    // Use the explicitly supplied override first, then context interactionMode, then fallback
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

      if (currentStep !== 'language' && currentStep !== 'staffdashboard' && currentStep !== 'stafflogin' && currentStep !== 'staffsession' && currentStep !== 'staffsummary') {
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

    // Medical Documents & OCR (Screens 9-12)
    medicalDocuments,
    setMedicalDocuments,
    addMedicalDocument,
    activeDocumentType,
    setActiveDocumentType,
    capturedImage,
    setCapturedImage,
    ocrResult,
    setOcrResult,
    uploadedDocumentId,
    setUploadedDocumentId,
    uploadedDocument,
    setUploadedDocument,

    // Clinical Summary (Screens 13, 14, 18, 19)
    clinicalSummary,
    setClinicalSummary,
    updateClinicalSummary,

    // Doctor Queue (Screens 16-19)
    doctorQueue,
    setDoctorQueue,
    updateDoctorQueueSession,

    // Staff / Doctor Dashboard
    staffUser,
    setStaffUser,
    staffAuthenticated,
    setStaffAuthenticated,
    selectedSessionId,
    setSelectedSessionId,
    selectedPatientForSummary,
    setSelectedPatientForSummary,
    isDoctorReviewReadOnly,
    setIsDoctorReviewReadOnly,

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
