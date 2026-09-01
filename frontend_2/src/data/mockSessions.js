export const MOCK_SESSIONS = [
  {
    session_id: "SES-89201",
    token: "E-101",
    status: "COMPLETED",
    started_at: "2026-08-31T18:40:00Z",
    completed_at: "2026-08-31T18:43:12Z",
    priority: "HIGH",
    patient: {
      id: "PAT-1001",
      name: "Rajesh Verma",
      date_of_birth: "1968-05-14",
      age: 58,
      gender: "MALE",
      phone: "9812345670",
      preferred_language: "en"
    },
    responses: [
      { question_id: 1, question_key: "chief_complaint", question: "Primary medical concern?", answer: "Chest Pain / Tightness", input_mode: "TOUCH", answered_at: "2026-08-31T18:40:30Z" },
      { question_id: 2, question_key: "has_fever", question: "Experiencing fever?", answer: "NO", input_mode: "TOUCH", answered_at: "2026-08-31T18:41:00Z" },
      { question_id: 3, question_key: "symptom_duration", question: "Symptom duration?", answer: "Today (< 24 hrs)", input_mode: "VOICE", answered_at: "2026-08-31T18:41:30Z" },
      { question_id: 4, question_key: "pain_level", question: "Pain level (1-4)?", answer: "4 — Very Severe", input_mode: "TOUCH", answered_at: "2026-08-31T18:42:00Z" },
      { question_id: 5, question_key: "severity", question: "Functional impairment?", answer: "YES", input_mode: "VOICE", answered_at: "2026-08-31T18:42:30Z" },
      { question_id: 6, question_key: "existing_conditions", question: "Existing conditions?", answer: "Hypertension, Diabetes", input_mode: "TOUCH", answered_at: "2026-08-31T18:43:00Z" }
    ],
    clinical_summary: {
      chief_complaint: "Chest Pain / Tightness",
      symptom_duration: "Today (< 24 hrs)",
      severity: "High (Level 4 Pain with functional impairment)",
      has_fever: "No",
      existing_conditions: "Hypertension, Diabetes",
      current_medications: "Antihypertensive regimen",
      allergies: "None reported",
      past_medical_history: "Known Type-2 Diabetes & Hypertension",
      pain_level: "4 (Very Severe)",
      additional_information: "Patient reports sudden onset of substernal chest pressure radiating to left arm."
    }
  },
  {
    session_id: "SES-89202",
    token: "M-102",
    status: "COMPLETED",
    started_at: "2026-08-31T18:45:00Z",
    completed_at: "2026-08-31T18:48:20Z",
    priority: "MODERATE",
    patient: {
      id: "PAT-1004",
      name: "Priya Sharma",
      date_of_birth: "1992-04-12",
      age: 34,
      gender: "FEMALE",
      phone: "9876543210",
      preferred_language: "hi"
    },
    responses: [
      { question_id: 1, question_key: "chief_complaint", question: "Primary medical concern?", answer: "Stomach Pain / Vomiting", input_mode: "VOICE", answered_at: "2026-08-31T18:45:30Z" },
      { question_id: 2, question_key: "has_fever", question: "Experiencing fever?", answer: "YES", input_mode: "VOICE", answered_at: "2026-08-31T18:46:00Z" },
      { question_id: 3, question_key: "symptom_duration", question: "Symptom duration?", answer: "2 to 3 days", input_mode: "TOUCH", answered_at: "2026-08-31T18:46:30Z" },
      { question_id: 4, question_key: "pain_level", question: "Pain level (1-4)?", answer: "3 — Severe", input_mode: "TOUCH", answered_at: "2026-08-31T18:47:00Z" },
      { question_id: 5, question_key: "severity", question: "Functional impairment?", answer: "YES", input_mode: "TOUCH", answered_at: "2026-08-31T18:47:30Z" }
    ],
    clinical_summary: {
      chief_complaint: "Stomach Pain / Vomiting",
      symptom_duration: "2 to 3 days",
      severity: "Moderate (Level 3 Pain)",
      has_fever: "Yes (Moderate)",
      existing_conditions: "High BP",
      current_medications: "None",
      allergies: "Penicillin",
      past_medical_history: "Mild Hypertension",
      pain_level: "3 (Severe)",
      additional_information: "Right lower quadrant abdominal tenderness with persistent nausea."
    }
  },
  {
    session_id: "SES-89203",
    token: "A-103",
    status: "COMPLETED",
    started_at: "2026-08-31T18:50:00Z",
    completed_at: "2026-08-31T18:53:10Z",
    priority: "ROUTINE",
    patient: {
      id: "PAT-1005",
      name: "Ramesh Chand",
      date_of_birth: "1959-11-20",
      age: 67,
      gender: "MALE",
      phone: "9845678903",
      preferred_language: "hi"
    },
    responses: [
      { question_id: 1, question_key: "chief_complaint", question: "Primary medical concern?", answer: "Fever / Body Pain", input_mode: "TOUCH", answered_at: "2026-08-31T18:50:30Z" },
      { question_id: 2, question_key: "has_fever", question: "Experiencing fever?", answer: "NO", input_mode: "TOUCH", answered_at: "2026-08-31T18:51:00Z" },
      { question_id: 3, question_key: "symptom_duration", question: "Symptom duration?", answer: "More than a week", input_mode: "TOUCH", answered_at: "2026-08-31T18:51:30Z" },
      { question_id: 4, question_key: "pain_level", question: "Pain level (1-4)?", answer: "2 — Moderate", input_mode: "TOUCH", answered_at: "2026-08-31T18:52:00Z" }
    ],
    clinical_summary: {
      chief_complaint: "Joint stiffness / Knee pain",
      symptom_duration: "More than a week",
      severity: "Routine (Level 2 Pain)",
      has_fever: "No",
      existing_conditions: "Osteoarthritis",
      current_medications: "Calcium supplements",
      allergies: "None",
      past_medical_history: "Bilateral knee osteoarthritis",
      pain_level: "2 (Moderate)",
      additional_information: "Routine orthopedic outpatient consultation requested."
    }
  }
];
