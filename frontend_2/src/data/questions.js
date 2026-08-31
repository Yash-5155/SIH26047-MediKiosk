/**
 * MediKiosk Questionnaire Dataset
 * Aligned with the SIH26047 Backend Question Schema & Clinical Summary Keys:
 * - id
 * - question_text_en / question_text_hi
 * - question_key (chief_complaint, symptom_duration, severity, has_fever, existing_conditions, current_medications, allergies, past_medical_history, pain_level, additional_information)
 * - question_type ("YES_NO", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "SCALE", "DURATION")
 * - is_required
 * - display_order
 * - options [{ id, option_value, option_label_en, option_label_hi, display_order }]
 */

export const QUESTIONS = [
  {
    id: 1,
    question_key: "chief_complaint",
    question_text_en: "What is your primary medical concern or main symptom today?",
    question_text_hi: "आज आपकी मुख्य स्वास्थ्य चिंता या लक्षण क्या है?",
    question_type: "SINGLE_CHOICE",
    is_required: true,
    display_order: 1,
    category: "Intake",
    options: [
      { id: 101, option_value: "Fever / Body Pain", option_label_en: "Fever / Body Pain", option_label_hi: "बुखार / शरीर में दर्द", display_order: 1 },
      { id: 102, option_value: "Cough / Respiratory Issues", option_label_en: "Cough / Breathing Issues", option_label_hi: "खांसी / सांस लेने में तकलीफ", display_order: 2 },
      { id: 103, option_value: "Chest Pain / Heart Concern", option_label_en: "Chest Pain / Tightness", option_label_hi: "छाती में दर्द / जकड़न", display_order: 3 },
      { id: 104, option_value: "Stomach Pain / Nausea", option_label_en: "Stomach Pain / Vomiting", option_label_hi: "पेट दर्द / उल्टी", display_order: 4 },
      { id: 105, option_value: "Dizziness / Sudden Weakness", option_label_en: "Dizziness / Fainting", option_label_hi: "चक्कर / बेहोशी", display_order: 5 },
      { id: 106, option_value: "Injury / Fall", option_label_en: "Recent Physical Injury", option_label_hi: "हालिया चोट / गिरावट", display_order: 6 }
    ]
  },
  {
    id: 2,
    question_key: "has_fever",
    question_text_en: "Are you currently experiencing a fever or high body temperature?",
    question_text_hi: "क्या आपको वर्तमान में बुखार या शरीर का तापमान अधिक लग रहा है?",
    question_type: "YES_NO",
    is_required: true,
    display_order: 2,
    category: "Systemic",
    options: [
      { id: 201, option_value: "YES", option_label_en: "Yes, I have fever", option_label_hi: "हां, मुझे बुखार है", display_order: 1 },
      { id: 202, option_value: "NO", option_label_en: "No fever", option_label_hi: "नहीं, कोई बुखार नहीं", display_order: 2 }
    ]
  },
  {
    id: 3,
    question_key: "symptom_duration",
    question_text_en: "How long have you been experiencing these symptoms?",
    question_text_hi: "आप कितने समय से इन लक्षणों को महसूस कर रहे हैं?",
    question_type: "DURATION",
    is_required: true,
    display_order: 3,
    category: "Timeline",
    options: [
      { id: 301, option_value: "Today (< 24 hrs)", option_label_en: "Today (Less than 24 hrs)", option_label_hi: "आज (24 घंटे से कम)", display_order: 1 },
      { id: 302, option_value: "2 to 3 days", option_label_en: "2 to 3 days", option_label_hi: "2 से 3 दिन", display_order: 2 },
      { id: 303, option_value: "Less than a week", option_label_en: "Less than a week", option_label_hi: "एक सप्ताह से कम", display_order: 3 },
      { id: 304, option_value: "More than a week", option_label_en: "More than a week", option_label_hi: "एक सप्ताह से अधिक", display_order: 4 }
    ]
  },
  {
    id: 4,
    question_key: "pain_level",
    question_text_en: "How severe is your pain level on a scale from 1 to 4?",
    question_text_hi: "1 से 4 के पैमाने पर आपके दर्द का स्तर कितना है?",
    question_type: "SCALE",
    is_required: true,
    display_order: 4,
    category: "Pain",
    options: [
      { id: 401, option_value: "1", option_label_en: "1 — Mild", option_label_hi: "1 — हल्का दर्द", display_order: 1 },
      { id: 402, option_value: "2", option_label_en: "2 — Moderate", option_label_hi: "2 — मध्यम दर्द", display_order: 2 },
      { id: 403, option_value: "3", option_label_en: "3 — Severe", option_label_hi: "3 — तेज दर्द", display_order: 3 },
      { id: 404, option_value: "4", option_label_en: "4 — Very Severe", option_label_hi: "4 — अत्यधिक तेज दर्द", display_order: 4 }
    ]
  },
  {
    id: 5,
    question_key: "severity",
    question_text_en: "Are your symptoms interfering with your ability to stand, walk, or perform daily tasks?",
    question_text_hi: "क्या आपके लक्षण आपके खड़े होने, चलने या दैनिक कार्यों में बाधा डाल रहे हैं?",
    question_type: "YES_NO",
    is_required: true,
    display_order: 5,
    category: "Functional Impact",
    options: [
      { id: 501, option_value: "YES", option_label_en: "Yes, significant difficulty", option_label_hi: "हां, काफी कठिनाई है", display_order: 1 },
      { id: 502, option_value: "NO", option_label_en: "No, manageable", option_label_hi: "नहीं, सहनयोग्य है", display_order: 2 }
    ]
  },
  {
    id: 6,
    question_key: "existing_conditions",
    question_text_en: "Do you have any pre-existing medical conditions?",
    question_text_hi: "क्या आपको कोई पूर्व-मौजूद चिकित्सीय स्थिति है?",
    question_type: "MULTIPLE_CHOICE",
    is_required: false,
    display_order: 6,
    category: "History",
    options: [
      { id: 601, option_value: "Hypertension", option_label_en: "High Blood Pressure", option_label_hi: "उच्च रक्तचाप (बीपी)", display_order: 1 },
      { id: 602, option_value: "Diabetes", option_label_en: "Diabetes", option_label_hi: "मधुमेह (शुगर)", display_order: 2 },
      { id: 603, option_value: "Asthma", option_label_en: "Asthma / Breathing issue", option_label_hi: "अस्थमा / सांस की बीमारी", display_order: 3 },
      { id: 604, option_value: "Heart Disease", option_label_en: "Heart Condition", option_label_hi: "हृदय रोग", display_order: 4 },
      { id: 605, option_value: "Pregnancy", option_label_en: "Pregnancy", option_label_hi: "गर्भावस्था", display_order: 5 },
      { id: 606, option_value: "None", option_label_en: "None of these", option_label_hi: "इनमें से कोई नहीं", display_order: 6 }
    ]
  },
  {
    id: 7,
    question_key: "current_medications",
    question_text_en: "Are you currently taking any prescription medications?",
    question_text_hi: "क्या आप वर्तमान में कोई नियमित दवाएं ले रहे हैं?",
    question_type: "YES_NO",
    is_required: false,
    display_order: 7,
    category: "Medication",
    options: [
      { id: 701, option_value: "YES", option_label_en: "Yes, taking medications", option_label_hi: "हां, नियमित दवाएं चालू हैं", display_order: 1 },
      { id: 702, option_value: "NO", option_label_en: "No medications", option_label_hi: "नहीं, कोई नियमित दवा नहीं", display_order: 2 }
    ]
  },
  {
    id: 8,
    question_key: "allergies",
    question_text_en: "Do you have any known drug or food allergies?",
    question_text_hi: "क्या आपको किसी दवा या भोजन से एलर्जी है?",
    question_type: "YES_NO",
    is_required: false,
    display_order: 8,
    category: "Allergies",
    options: [
      { id: 801, option_value: "YES", option_label_en: "Yes, I have allergies", option_label_hi: "हां, एलर्जी है", display_order: 1 },
      { id: 802, option_value: "NO", option_label_en: "No allergies", option_label_hi: "कोई एलर्जी नहीं", display_order: 2 }
    ]
  }
];
