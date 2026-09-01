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

// Pages
import { LanguageSelection } from './pages/LanguageSelection';
import { Welcome } from './pages/Welcome';
import { PatientDetails } from './pages/PatientDetails';
import { Identity } from './pages/Identity';
import { DocumentScan } from './pages/DocumentScan';
import { DocumentConfirm } from './pages/DocumentConfirm';
import { InteractionMode } from './pages/InteractionMode';
import { ConversationalAI } from './pages/ConversationalAI';
import { Questionnaire } from './pages/Questionnaire';
import { Review } from './pages/Review';
import { Processing } from './pages/Processing';
import { TriageResult } from './pages/TriageResult';
import { NextStep } from './pages/NextStep';
import { Complete } from './pages/Complete';

// Staff Portal Pages
import { StaffLogin } from './pages/StaffLogin';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { SessionDetails } from './pages/staff/SessionDetails';

function KioskContent() {
  const { currentStep } = useApp();

  const renderStep = () => {
    switch (currentStep) {
      case 'language':
        return <LanguageSelection key="language" />;
      case 'welcome':
        return <Welcome key="welcome" />;
      case 'details':
        return <PatientDetails key="details" />;
      case 'identity':
        return <Identity key="identity" />;
      case 'documentscan':
        return <DocumentScan key="documentscan" />;
      case 'documentconfirm':
        return <DocumentConfirm key="documentconfirm" />;
      case 'mode':
        return <InteractionMode key="mode" />;
      case 'conversation':
        return <ConversationalAI key="conversation" />;
      case 'questionnaire':
        return <Questionnaire key="questionnaire" />;
      case 'review':
        return <Review key="review" />;
      case 'processing':
        return <Processing key="processing" />;
      case 'result':
        return <TriageResult key="result" />;
      case 'nextstep':
        return <NextStep key="nextstep" />;
      case 'complete':
        return <Complete key="complete" />;
      
      // Staff Portal Routes
      case 'stafflogin':
        return <StaffLogin key="stafflogin" />;
      case 'staffdashboard':
        return <DoctorDashboard key="staffdashboard" />;
      case 'staffsession':
        return <SessionDetails key="staffsession" />;
      
      default:
        return <LanguageSelection key="language" />;
    }
  };

  const isStaffView = currentStep === 'staffdashboard' || currentStep === 'staffsession';

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
