/**
 * TEMPORARY FRONTEND DEMO DATA FOR DOCTOR PORTAL UI/NAVIGATION TESTING
 * 
 * Easy to remove once backend database has permanent test records.
 * Used by:
 *  - DoctorDashboard.jsx (Screen 17 queue item)
 *  - SessionDetails.jsx (Screen 18 case details fallback for session 9999)
 */

export const DEMO_SESSION_ID = 9999;

// Queue item for Screen 17 (Doctor Dashboard)
export const DEMO_DASHBOARD_SESSION = {
  session_id: DEMO_SESSION_ID,
  patient_name: 'Demo Patient',
  status: 'COMPLETED',
  started_at: 'Demo session',
  completed_at: 'Demo session'
};

// Full Case Details for Screen 18 (Doctor Case Details)
export const DEMO_CASE_DETAILS = {
  session_id: DEMO_SESSION_ID,
  status: 'COMPLETED',
  started_at: 'Demo session',
  completed_at: 'Demo session',
  patient: {
    id: DEMO_SESSION_ID,
    name: 'Demo Patient',
    date_of_birth: '1985-06-15',
    gender: 'Female',
    phone: '+91 98765 43210',
    preferred_language: 'en'
  },
  responses: [
    {
      question_key: 'chief_complaint',
      question: 'What symptoms or health concerns bring you in today?',
      answer: 'Persistent dry cough and mild fever for the past 3 days with throat irritation',
      input_mode: 'VOICE'
    },
    {
      question_key: 'symptom_duration',
      question: 'How long have you been experiencing these symptoms?',
      answer: '3 to 4 days',
      input_mode: 'TOUCH'
    },
    {
      question_key: 'severity',
      question: 'On a scale from mild to severe, how severe is your discomfort?',
      answer: 'Moderate discomfort during swallowing and speaking',
      input_mode: 'TOUCH'
    },
    {
      question_key: 'existing_conditions',
      question: 'Do you have any existing medical conditions or take regular medications?',
      answer: 'Mild seasonal allergies; no regular prescription medications',
      input_mode: 'TEXT'
    }
  ]
};

// Full Clinical Summary for Screen 19 (Doctor Clinical Summary / Review)
export const DEMO_CLINICAL_SUMMARY = {
  session_id: DEMO_SESSION_ID,
  status: 'COMPLETED',
  started_at: 'Demo session',
  completed_at: 'Demo session',
  patient: {
    id: DEMO_SESSION_ID,
    name: 'Demo Patient',
    date_of_birth: '1985-06-15',
    gender: 'Female',
    phone: '+91 98765 43210',
    preferred_language: 'en'
  },
  clinical_summary: {
    chief_complaint: 'Persistent dry cough and mild fever for the past 3 days with throat irritation',
    symptom_duration: '3 to 4 days',
    severity: 'Moderate',
    has_fever: 'Yes (mild, ~99.5°F)',
    existing_conditions: 'Mild seasonal allergies',
    current_medications: 'None reported',
    allergies: 'None reported',
    past_medical_history: 'Seasonal allergic rhinitis',
    pain_level: 'Mild throat discomfort (3/10)',
    additional_information: 'Patient self-administered warm fluids and OTC lozenges without lasting relief.'
  }
};

