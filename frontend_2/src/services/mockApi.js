import { evaluateTriage } from './mockTriage';
import { QUESTIONS } from '../data/questions';
import { MOCK_SESSIONS } from '../data/mockSessions';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let tokenCounter = 104;
let sessionCounter = 89204;
let patientCounter = 1011;

export const mockApi = {
  /**
   * Simulate POST /api/patients
   */
  async createPatient(patientData) {
    await delay(300);
    patientCounter += 1;
    return {
      id: `PAT-${patientCounter}`,
      name: patientData.fullName || patientData.name || "Demo Patient",
      date_of_birth: patientData.dateOfBirth || patientData.date_of_birth || "1992-04-12",
      age: patientData.age || 34,
      gender: (patientData.gender || "female").toUpperCase(),
      phone: patientData.phone || "",
      preferred_language: patientData.preferredLanguage || patientData.language || "en"
    };
  },

  /**
   * Simulate POST /api/sessions
   */
  async createSession(patientId) {
    await delay(300);
    sessionCounter += 1;
    return {
      id: `SES-${sessionCounter}`,
      patient_id: patientId,
      status: "IN_PROGRESS",
      started_at: new Date().toISOString(),
      completed_at: null
    };
  },

  /**
   * Simulate GET /api/questions
   */
  async getQuestions() {
    await delay(200);
    return QUESTIONS;
  },

  /**
   * Simulate POST /api/sessions/{session_id}/responses
   */
  async submitResponse(sessionId, questionId, questionKey, answerText, inputMode = "TOUCH") {
    await delay(150);
    return {
      success: true,
      response: {
        session_id: sessionId,
        question_id: questionId,
        question_key: questionKey,
        answer_text: answerText,
        input_mode: inputMode,
        answered_at: new Date().toISOString()
      }
    };
  },

  /**
   * Simulate POST /api/sessions/{session_id}/complete
   */
  async completeSession(sessionId, answers, patientDetails) {
    await delay(2000);
    const assessment = evaluateTriage(answers, patientDetails);

    tokenCounter += 1;
    const token = `${assessment.tokenPrefix}-${tokenCounter}`;

    return {
      success: true,
      session: {
        id: sessionId,
        status: "COMPLETED",
        completed_at: new Date().toISOString()
      },
      assessment,
      token
    };
  },

  /**
   * Simulate GET /api/doctor/sessions
   */
  async getDoctorSessions() {
    await delay(400);
    return MOCK_SESSIONS;
  },

  /**
   * Simulate GET /api/doctor/sessions/{session_id}
   */
  async getCaseSummary(sessionId) {
    await delay(300);
    const found = MOCK_SESSIONS.find(s => s.session_id === sessionId);
    if (found) return found;

    // Default fallback mock case
    return MOCK_SESSIONS[0];
  }
};
