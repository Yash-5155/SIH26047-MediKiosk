/**
 * MediKiosk Mock Document Scanner & OCR Service
 * Simulates document scanning reticle, OCR image processing, and key data extraction.
 * NOTE: Operates 100% locally with mock data — no image files are uploaded or stored.
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockDocumentScanner = {
  /**
   * Simulate document scanning workflow
   */
  async scanDocument() {
    await delay(2200); // Realistic scanning simulation delay

    return {
      success: true,
      documentType: "ABHA / Health Identity Card",
      documentNumber: "ABHA-8921-3412-9011",
      extractedData: {
        fullName: "Priya Sharma",
        age: "34",
        gender: "female",
        phone: "9876543210",
        conditions: ["hypertension"]
      },
      confidenceScore: "98.4%",
      scannedAt: new Date().toISOString()
    };
  }
};
