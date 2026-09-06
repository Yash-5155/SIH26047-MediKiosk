# MediKiosk — SIH26047 Backend-Aligned Frontend MVP

MediKiosk is a self-service medical intake and triage kiosk built for Smart India Hackathon (**SIH26047**).

This standalone frontend application strictly reflects the underlying backend model architecture for seamless future FastAPI integration.

---

## 🏗️ Conceptual Backend Model Architecture

```text
PATIENT (id, name, date_of_birth, gender, phone, preferred_language)
   │
   └── INTAKE SESSION (id, patient_id, status, started_at, completed_at)
          │
          ├── QUESTION (id, question_text, question_key, question_type, is_required, options)
          │
          └── INTAKE RESPONSE (question_id, question_key, answer_text, input_mode)
```

---

## 🎨 Visual Identity Palette

- **Backgrounds**: Warm Ivory (`#FAF9F5`)
- **Primary Actions**: Coral (`#E05D52`)
- **Secondary Surfaces**: Peach (`#FDF0ED`)
- **Informational Elements**: Soft Blue (`#2B6CB0`)
- **Accents**: Gentle Pink (`#FAD2E1`)
- **Typography**: Dark Navy / Charcoal (`#1E293B`)

---

## 🌟 Complete Application Flows

### 🏥 1. Patient Kiosk Journey
1. **Language Selection** (`/language`): Choice of English & हिन्दी (Hindi) with native script rendering.
2. **Welcome** (`/welcome`): Healthcare branding ("Your health. Your first step.") & process modal.
3. **Patient Information** (`/patient-details`): Full Name, Date of Birth, Gender, Phone, Preferred Language.
4. **Identity Verification** (`/identity`): Options for **Aadhaar Card**, **ABHA Health ID**, or **Enter Manually**.
5. **Document Confirmation** (`/document-confirm`): Extracted card details review.
6. **Interaction Mode** (`/interaction-mode`): Choice between **TOUCH** and **VOICE + TOUCH**.
7. **Conversational AI / Questionnaire** (`/conversation` / `/questionnaire`): Guided questions with Web Speech API STT/TTS and backend-compatible keys (`chief_complaint`, `symptom_duration`, `severity`, `has_fever`, `existing_conditions`, `current_medications`, `allergies`, `past_medical_history`, `pain_level`, `additional_information`).
8. **Review** (`/review`): Patient summary & response list with inline editing.
9. **Processing** (`/processing`): Animated triage computation sequence.
10. **Triage Result** (`/result`): Priority outcome cards (`HIGH PRIORITY`, `MODERATE PRIORITY`, `ROUTINE`).
11. **Next Step & Token** (`/next-step`): Designated clinic desk room & Token `A-104`.
12. **Complete & Reset** (`/complete`): Master reset to start a new session.

### 🩺 2. Clinical Staff Portal
1. **Staff Sign-In** (`/staff/login`): Demo credentials (`dr.sharma@medikiosk.in` / `doctor123`).
2. **Clinical Dashboard** (`/staff/dashboard`): Real-time metrics, queue list (`DoctorSessionListItem`), priority tabs (`ALL`, `HIGH`, `MODERATE`, `ROUTINE`), and search.
3. **Session Case Details** (`/staff/session/:id`): Full `DoctorCaseResponse` table (Question Key, Text, Answer, Input Mode badge) + `ClinicalSummary` preview card.

---

## 🚀 How to Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📁 Folder Structure

```text
MediKiosk2.0/
├── src/
│   ├── components/             # Reusable UI & Modal components
│   │   ├── Header.jsx          # Header with staff portal link & mode badge
│   │   ├── Footer.jsx          # Privacy & emergency disclaimers
│   │   ├── Button.jsx          # Touch-optimised high contrast buttons
│   │   ├── ProgressBar.jsx     # Animated progress indicator
│   │   ├── HelpModal.jsx       # Staff call assistance modal
│   │   ├── AccessibilityModal.jsx # Font sizing & contrast controls
│   │   ├── InactivityModal.jsx # Auto session timeout warning
│   │   ├── HowItWorksModal.jsx # Process overview modal
│   │   └── PatientSummaryModal.jsx # Doctor detail view modal
│   ├── config/
│   │   └── kioskConfig.js      # Timeout & hospital configuration
│   ├── context/
│   │   └── AppContext.jsx      # Central backend-aligned React Context
│   ├── data/
│   │   ├── questions.js        # Questions matching backend schema & keys
│   │   ├── languages.js        # Supported languages dictionary
│   │   ├── translations.js     # Bilingual translation text
│   │   └── mockSessions.js     # DoctorSessionListItem mock dataset
│   ├── pages/                  # 16 Flow Steps & Routes
│   │   ├── LanguageSelection.jsx
│   │   ├── Welcome.jsx
│   │   ├── PatientDetails.jsx
│   │   ├── Identity.jsx        # Aadhaar / ABHA / Manual identity screen
│   │   ├── DocumentScan.jsx
│   │   ├── DocumentConfirm.jsx
│   │   ├── InteractionMode.jsx
│   │   ├── ConversationalAI.jsx
│   │   ├── Questionnaire.jsx
│   │   ├── Review.jsx
│   │   ├── Processing.jsx
│   │   ├── TriageResult.jsx
│   │   ├── NextStep.jsx
│   │   ├── Complete.jsx
│   │   ├── StaffLogin.jsx
│   │   ├── DoctorDashboard.jsx
│   │   └── staff/
│   │       └── SessionDetails.jsx # /staff/session/:id case view
│   ├── services/
│   │   ├── mockApi.js          # Async simulated FastAPI endpoint layer
│   │   ├── mockTriage.js       # Triage rule evaluation engine
│   │   ├── mockAuth.js         # Staff authentication service
│   │   ├── mockDocumentScanner.js # Mock document OCR parser
│   │   └── voiceService.js     # Web Speech API Recognition & TTS
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx                 # Main route handler & step switcher
│   └── main.jsx
├── README.md
```

---

## 🔒 Privacy & Safety Notice

This application is a **frontend prototype MVP** for demonstration. All data processing runs locally in the browser. No real Aadhaar or medical information is stored or transmitted.
