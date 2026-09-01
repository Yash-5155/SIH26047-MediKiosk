/**
 * MediKiosk Mock Staff Authentication Service
 * Operates on the frontend for clinical dashboard access.
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DEMO_STAFF_USER = {
  id: "DOC-8921",
  name: "Dr. Ananya Sharma",
  role: "Senior Triage Medical Officer",
  department: "Emergency & General Triage",
  email: "dr.sharma@medikiosk.in",
  avatarUrl: null
};

export const mockAuth = {
  async login(email, password) {
    await delay(600);

    if (!email || !password) {
      throw new Error("Please provide both Staff ID/Email and password.");
    }

    // Accept demo credentials or any valid-looking input for demo
    if (email.toLowerCase().includes("sharma") || email.toLowerCase().includes("doctor") || email.toLowerCase().includes("staff") || email.includes("@")) {
      return {
        success: true,
        user: DEMO_STAFF_USER,
        token: `MOCK-JWT-TOKEN-${Date.now()}`
      };
    } else {
      throw new Error("Invalid staff credentials. Try using demo login.");
    }
  },

  getDemoCredentials() {
    return {
      email: "dr.sharma@medikiosk.in",
      password: "doctor123"
    };
  }
};
