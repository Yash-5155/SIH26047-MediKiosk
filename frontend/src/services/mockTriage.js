/**
 * MediKiosk Mock Triage Engine
 * Evaluates patient questionnaire responses against basic healthcare triage rule heuristics.
 *
 * NOTE: This frontend module is for demonstration and prototype queue prioritization only.
 * It will be replaced by the backend FastAPI AI Triage Service in production.
 */
export function evaluateTriage(answers = {}, patientDetails = {}) {
  let isHighPriority = false;
  let isModeratePriority = false;
  const redFlagsTriggered = [];
  let riskScore = 0;

  // 1. Check direct Red Flags
  if (answers.breathing === 'yes') {
    isHighPriority = true;
    redFlagsTriggered.push('Difficulty breathing');
  }

  if (answers.chest_pain === 'yes') {
    isHighPriority = true;
    redFlagsTriggered.push('Chest pain or tightness');
  }

  if (answers.dizziness === 'yes') {
    isHighPriority = true;
    redFlagsTriggered.push('Sudden dizziness or fainting');
  }

  if (answers.pain_scale === '4') {
    isHighPriority = true;
    redFlagsTriggered.push('Very severe pain (Level 4)');
  }

  // 2. Calculate Secondary Risk Factors
  if (answers.fever === 'moderate' || answers.fever === 'severe') {
    riskScore += answers.fever === 'severe' ? 3 : 2;
  } else if (answers.fever === 'mild') {
    riskScore += 1;
  }

  if (answers.pain_scale === '3') {
    riskScore += 3;
    isModeratePriority = true;
  } else if (answers.pain_scale === '2') {
    riskScore += 1;
  }

  if (answers.vomiting === 'yes') {
    riskScore += 2;
  }

  if (answers.injury === 'yes') {
    riskScore += 2;
  }

  if (answers.mobility === 'no') {
    riskScore += 2;
  }

  // Consider pre-existing conditions if provided
  if (Array.isArray(patientDetails.conditions) && patientDetails.conditions.length > 0) {
    if (!patientDetails.conditions.includes('none')) {
      riskScore += patientDetails.conditions.length;
    }
  }

  // 3. Determine Final Outcome
  if (isHighPriority) {
    return {
      priority: 'HIGH',
      badgeColor: 'coral',
      deskNameEn: 'Emergency Triage Desk — Room E-01',
      deskNameHi: 'आपातकालीन ट्राइएज डेस्क — कमरा E-01',
      estimatedWaitEn: 'Immediate (0 mins)',
      estimatedWaitHi: 'तत्काल (0 मिनट)',
      tokenPrefix: 'E',
      summaryEn: 'High Priority Assessment: Urgent attention required based on reported key symptoms.',
      summaryHi: 'उच्च प्राथमिकता मूल्यांकन: रिपोर्ट किए गए मुख्य लक्षणों के आधार पर तत्काल ध्यान देने की आवश्यकता है।',
      redFlags: redFlagsTriggered
    };
  } else if (isModeratePriority || riskScore >= 3) {
    return {
      priority: 'MODERATE',
      badgeColor: 'blue',
      deskNameEn: 'Priority Consultation Desk — Room 102',
      deskNameHi: 'प्राथमिकता परामर्श डेस्क — कमरा 102',
      estimatedWaitEn: '10 to 15 minutes',
      estimatedWaitHi: '10 से 15 मिनट',
      tokenPrefix: 'M',
      summaryEn: 'Moderate Priority Assessment: Timely healthcare evaluation recommended.',
      summaryHi: 'मध्यम प्राथमिकता मूल्यांकन: समय पर स्वास्थ्य देखभाल मूल्यांकन की सिफारिश की जाती है।',
      redFlags: []
    };
  } else {
    return {
      priority: 'ROUTINE',
      badgeColor: 'peach',
      deskNameEn: 'General Outpatient Desk — Room 205',
      deskNameHi: 'सामान्य ओपीडी डेस्क — कमरा 205',
      estimatedWaitEn: '20 to 30 minutes',
      estimatedWaitHi: '20 से 30 मिनट',
      tokenPrefix: 'A',
      summaryEn: 'Routine Priority Assessment: Standard outpatient queue assignment.',
      summaryHi: 'सामान्य प्राथमिकता मूल्यांकन: मानक आउटपेशेंट कतार आवंटन।',
      redFlags: []
    };
  }
}
