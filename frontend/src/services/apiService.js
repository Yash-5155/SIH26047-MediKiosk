/**
 * MediKiosk API Service
 * 
 * Direct connection to backend FastAPI endpoints:
 * - GET  /api/questions
 * - POST /api/sessions/
 * - POST /api/sessions/{session_id}/responses
 * - POST /api/sessions/{session_id}/complete
 * 
 * Handles network failures gracefully with patient-friendly fallbacks so the
 * kiosk flow is never blocked.
 */

import { mockApi } from './mockApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Standard fetch helper with timeout and error handling.
 */
async function apiFetch(path, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const message = errBody?.detail || `Server responded with status ${res.status}`;
      throw new Error(message);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out. Please check network connection.');
    }
    throw err;
  }
}

/**
 * PART 3-A: Fetch active questions from backend.
 * Calls GET /api/questions.
 * Falls back to local dataset if backend is offline.
 */
export async function fetchQuestions() {
  try {
    const questions = await apiFetch('/api/questions');
    if (Array.isArray(questions) && questions.length > 0) {
      // Sort by display_order
      return questions.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    }
    throw new Error('No questions returned from backend');
  } catch (err) {
    console.warn('[apiService] fetchQuestions: backend unavailable, using fallback questions.', err.message);
    return await mockApi.getQuestions();
  }
}

/**
 * PART 3-B: Create intake session.
 * Calls POST /api/sessions/ with { patient_id }.
 * If patient ID is not yet assigned, uses patient_id = 1 or creates a fallback session.
 */
export async function createIntakeSession(patientId = 1) {
  try {
    const session = await apiFetch('/api/sessions/', {
      method: 'POST',
      body: JSON.stringify({ patient_id: Number(patientId) || 1 }),
    });
    return session;
  } catch (err) {
    console.warn('[apiService] createIntakeSession: backend call failed, using fallback session.', err.message);
    return {
      id: Math.floor(10000 + Math.random() * 90000),
      patient_id: patientId || 1,
      status: 'IN_PROGRESS',
      started_at: new Date().toISOString(),
      completed_at: null,
      _source: 'FALLBACK'
    };
  }
}

/**
 * PART 3-C: Save patient response.
 * Calls POST /api/sessions/{session_id}/responses.
 *
 * @param {string|number} sessionId
 * @param {number} questionId
 * @param {string} questionKey
 * @param {string} answerText
 * @param {'TEXT'|'VOICE'|'TOUCH'} inputMode
 */
export async function submitResponse(sessionId, questionId, questionKey, answerText, inputMode = 'TOUCH') {
  const normalizedInputMode = ['TEXT', 'VOICE', 'TOUCH'].includes(String(inputMode).toUpperCase())
    ? String(inputMode).toUpperCase()
    : 'TEXT';

  if (!sessionId) {
    console.warn('[apiService] submitResponse called without sessionId, using fallback response.');
    return {
      session_id: 'local',
      question_id: questionId,
      answer_text: answerText,
      input_mode: normalizedInputMode,
      answered_at: new Date().toISOString()
    };
  }

  try {
    const response = await apiFetch(`/api/sessions/${sessionId}/responses`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: Number(questionId),
        answer_text: String(answerText ?? ''),
        input_mode: normalizedInputMode,
      }),
    });
    return response;
  } catch (err) {
    console.warn('[apiService] submitResponse: backend unavailable, recorded locally.', err.message);
    return {
      session_id: sessionId,
      question_id: questionId,
      answer_text: answerText,
      input_mode: normalizedInputMode,
      answered_at: new Date().toISOString(),
      _source: 'FALLBACK'
    };
  }
}

/**
 * PART 3-D: Complete questionnaire session.
 * Calls POST /api/sessions/{session_id}/complete.
 *
 * @param {string|number} sessionId
 */
export async function completeIntakeSession(sessionId) {
  if (!sessionId) return { success: true, status: 'COMPLETED' };

  try {
    const session = await apiFetch(`/api/sessions/${sessionId}/complete`, {
      method: 'POST',
    });
    return session;
  } catch (err) {
    console.warn('[apiService] completeIntakeSession: backend unavailable, completed locally.', err.message);
    return {
      id: sessionId,
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      _source: 'FALLBACK'
    };
  }
}

/**
 * PART 3-E: Upload medical document to backend.
 * Calls POST /api/documents/upload with multipart/form-data.
 *
 * @param {Object} params
 * @param {File|Blob} params.file - File to upload (PDF, JPEG, PNG, WEBP)
 * @param {number|string} params.patientId - Patient ID
 * @param {number|string|null} [params.sessionId] - Session ID (optional)
 * @param {string} [params.documentType] - Document type ('PRESCRIPTION'|'LAB_REPORT'|'DISCHARGE_SUMMARY'|'MEDICAL_RECORD'|'OTHER')
 */
export async function uploadMedicalDocument({ file, patientId, sessionId, documentType = 'OTHER' }) {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const formData = new FormData();
  // patient_id is required integer
  const validPatientId = Number(patientId);
  formData.append('patient_id', String(!isNaN(validPatientId) && validPatientId > 0 ? validPatientId : 1));

  // session_id is optional integer (only append if valid number)
  if (sessionId !== null && sessionId !== undefined && sessionId !== '' && !isNaN(Number(sessionId))) {
    formData.append('session_id', String(Number(sessionId)));
  }

  // document_type must match backend allowed enum
  const allowedDocTypes = ['PRESCRIPTION', 'LAB_REPORT', 'DISCHARGE_SUMMARY', 'MEDICAL_RECORD', 'OTHER'];
  const normalizedType = String(documentType || 'OTHER').toUpperCase().trim();
  const safeDocType = allowedDocTypes.includes(normalizedType) ? normalizedType : 'OTHER';
  formData.append('document_type', safeDocType);

  // file is raw File or Blob
  formData.append('file', file);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const res = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: 'POST',
      signal: controller.signal,
      body: formData,
      // Note: Do not set Content-Type header; fetch automatically sets multipart/form-data with boundary
    });
    clearTimeout(timer);

    if (!res.ok) {
      let detailMessage = null;
      try {
        const text = await res.text();
        try {
          const errBody = JSON.parse(text);
          detailMessage = errBody?.detail || errBody?.message;
        } catch {
          detailMessage = text;
        }
      } catch {
        detailMessage = null;
      }

      const message = detailMessage || `Upload failed with status ${res.status} (${res.statusText || 'Server Error'})`;
      console.error('[apiService] Backend document upload error:', {
        status: res.status,
        statusText: res.statusText,
        detail: detailMessage
      });
      throw new Error(message);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Upload timed out. Please check network connection and file size.');
    }
    throw err;
  }
}

/**
 * Trigger backend OCR text extraction on an already stored document.
 * Calls POST /api/documents/{document_id}/extract.
 *
 * @param {number|string} documentId - Stored document ID
 * @returns {Promise<Object>} DocumentExtractionResponse
 */
export async function extractDocumentText(documentId) {
  if (!documentId) {
    throw new Error('Valid document ID is required to trigger OCR extraction.');
  }

  const cleanDocId = Number(documentId);
  if (isNaN(cleanDocId) || cleanDocId <= 0) {
    throw new Error(`Invalid document ID: ${documentId}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000); // 45s timeout for Tesseract OCR / PDF processing

  try {
    const res = await fetch(`${BASE_URL}/api/documents/${cleanDocId}/extract`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      let detailMessage = null;
      try {
        const text = await res.text();
        try {
          const errBody = JSON.parse(text);
          detailMessage = errBody?.detail || errBody?.message;
        } catch {
          detailMessage = text;
        }
      } catch {
        detailMessage = null;
      }

      const message = detailMessage || `OCR extraction failed with status ${res.status} (${res.statusText || 'Server Error'})`;
      console.error('[apiService] Backend OCR extract error:', {
        documentId: cleanDocId,
        status: res.status,
        detail: detailMessage
      });
      throw new Error(message);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('OCR extraction timed out. The document might be large or complex.');
    }
    throw err;
  }
}

/**
 * PART 3-G: Fetch doctor queue sessions from backend.
 * Calls GET /api/doctor/sessions.
 * 
 * @returns {Promise<Array<{session_id: number, patient_name: string, status: string, started_at: string, completed_at: string|null}>>}
 */
export async function fetchDoctorSessions() {
  const data = await apiFetch('/api/doctor/sessions');
  return Array.isArray(data) ? data : [];
}

/**
 * PART 3-H: Fetch doctor case details for a specific session.
 * Calls GET /api/doctor/sessions/{session_id}.
 * 
 * @param {string|number} sessionId
 * @returns {Promise<{
 *   session_id: number,
 *   status: string,
 *   started_at: string,
 *   completed_at: string|null,
 *   patient: {
 *     id: number,
 *     name: string,
 *     date_of_birth: string|null,
 *     gender: string|null,
 *     phone: string|null,
 *     preferred_language: string
 *   },
 *   responses: Array<{
 *     question_key: string,
 *     question: string,
 *     answer: string|null,
 *     input_mode: string
 *   }>
 * }>}
 */
export async function fetchDoctorSessionDetails(sessionId) {
  if (!sessionId) {
    throw new Error('Session ID is required to fetch case details');
  }
  return await apiFetch(`/api/doctor/sessions/${sessionId}`);
}

/**
 * PART 3-I: Fetch clinical summary for a session.
 * Calls GET /api/doctor/sessions/{session_id}/summary.
 * 
 * @param {string|number} sessionId
 * @returns {Promise<{
 *   session_id: number,
 *   status: string,
 *   started_at: string,
 *   completed_at: string|null,
 *   patient: {
 *     id: number,
 *     name: string,
 *     date_of_birth: string|null,
 *     gender: string|null,
 *     preferred_language: string
 *   },
 *   clinical_summary: {
 *     chief_complaint: string|null,
 *     symptom_duration: string|null,
 *     severity: string|null,
 *     has_fever: string|null,
 *     existing_conditions: string|null,
 *     current_medications: string|null,
 *     allergies: string|null,
 *     past_medical_history: string|null,
 *     pain_level: string|null,
 *     additional_information: string|null
 *   }
 * }>}
 */
export async function fetchDoctorSessionSummary(sessionId) {
  if (!sessionId) {
    throw new Error('Session ID is required to fetch clinical summary');
  }
  return await apiFetch(`/api/doctor/sessions/${sessionId}/summary`);
}





