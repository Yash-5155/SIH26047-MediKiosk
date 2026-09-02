const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";


async function request(
  endpoint,
  options = {}
) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      `API request failed: ${response.status}`;

    throw new Error(message);
  }

  return data;
}


export const api = {

  async getDoctorSessions() {
    return request(
      "/api/doctor/sessions"
    );
  },


  async getDoctorCase(sessionId) {
    return request(
      `/api/doctor/sessions/${sessionId}/case`
    );
  },

  async generateAIExtraction(sessionId) {
  return request(`/api/doctor/sessions/${sessionId}/ai-extract`, {
    method: "POST",
  });
  },
};