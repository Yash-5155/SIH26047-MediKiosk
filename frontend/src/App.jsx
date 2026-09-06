import { KioskProvider } from './context/KioskContext';
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HelpModal } from './components/HelpModal';
import { AccessibilityModal } from './components/AccessibilityModal';
import { InactivityModal } from './components/InactivityModal';
import { HowItWorksModal } from './components/HowItWorksModal';

// Screens 1–5 (Patient Onboarding & Verification)
import { Welcome } from './pages/Welcome';
import { LanguageSelection } from './pages/LanguageSelection';
import { Identity } from './pages/Identity';
import { PatientRegistration } from './pages/PatientRegistration';
import { PatientConsent } from './pages/PatientConsent';

// Active Flow Pages
import { ConversationalAI } from './pages/ConversationalAI';
import { MedicalDocuments } from './pages/MedicalDocuments';
import { DocumentScan } from './pages/DocumentScan';
import { OCRProcessing } from './pages/OCRProcessing';
import { ExtractedHistory } from './pages/ExtractedHistory';
import { GeneratingSummary } from './pages/GeneratingSummary';
import { PatientSummary } from './pages/PatientSummary';
import { TriageAssessment } from './pages/TriageAssessment';
import { Complete } from './pages/Complete';

// Staff Portal Pages
import { StaffLogin } from './pages/StaffLogin';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { SessionDetails } from './pages/staff/SessionDetails';
import { ClinicalSummary } from './pages/staff/ClinicalSummary';

function KioskContent() {
  const { currentStep } = useApp();

  const renderStep = () => {
    switch (currentStep) {
      // Screens 1–5 (Welcome, Language, Identity, Registration, Consent)
      case 'welcome':
      case 'idle':
        return <Welcome key="welcome" />;
      case 'language':
      case 'languageselection':
        return <LanguageSelection key="language" />;
      case 'identify':
      case 'identity':
        return <Identity key="identity" />;
      case 'registration':
      case 'patientdetails':
      case 'details':
        return <PatientRegistration key="registration" />;
      case 'consent':
      case 'patientconsent':
        return <PatientConsent key="consent" />;

      // Screen 6 (Main Entry): Medical Assistant / AI Interview
      case 'conversation':
        return <ConversationalAI key="conversation" />;

      // Screens 9, 10, 11, 12 (Medical Documents, Scan/Camera, OCR, Extracted History)
      case 'documents':
        return <MedicalDocuments key="documents" />;
      case 'documentscan':
        return <DocumentScan key="documentscan" />;
      case 'ocrprocessing':
        return <OCRProcessing key="ocrprocessing" />;
      case 'extractedhistory':
        return <ExtractedHistory key="extractedhistory" />;

      // Screens 13, 14, 15, 16 (Generating Summary, Patient Summary, Triage Assessment, Completion)
      case 'generatingsummary':
        return <GeneratingSummary key="generatingsummary" />;
      case 'patientsummary':
      case 'intakesummary':
        return <PatientSummary key="patientsummary" />;
      case 'triage':
      case 'triageassessment':
        return <TriageAssessment key="triage" />;
      case 'complete':
        return <Complete key="complete" />;
      
      // Screens 16, 17, 18, 19 (Doctor Login, Doctor Dashboard, Patient Clinical Summary, Doctor Review/Edit)
      case 'stafflogin':
        return <StaffLogin key="stafflogin" />;
      case 'staffdashboard':
        return <DoctorDashboard key="staffdashboard" />;
      case 'staffsession':
        return <SessionDetails key="staffsession" />;
      case 'staffsummary':
      case 'clinicalsummary':
      case 'patientclinicalsummary':
      case 'doctorsummary':
        return <ClinicalSummary key={currentStep} />;
      
      default:
        return <Welcome key="welcome" />;
    }
  };

  const isStaffView = 
    currentStep === 'staffdashboard' || 
    currentStep === 'staffsession' || 
    currentStep === 'staffsummary' || 
    currentStep === 'clinicalsummary' || 
    currentStep === 'patientclinicalsummary' || 
    currentStep === 'doctorsummary';


  return (
    <div className="flex flex-col min-h-screen bg-kiosk-ivory">
      <Header />
      <main className="flex-1 flex flex-col justify-center py-4">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>
      {!isStaffView && <Footer />}

      {/* Global Modals */}
      <HelpModal />
      <AccessibilityModal />
      <InactivityModal />
      <HowItWorksModal />
    </div>
  );
}

export default function App() {
  return (
    <KioskProvider>
      <AppProvider>
        <KioskContent />
      </AppProvider>
    </KioskProvider>
  );
}
