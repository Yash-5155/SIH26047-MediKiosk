export const TRANSLATIONS = {
  en: {
    // Header & Global
    headerTitle: "MediKiosk",
    headerSubtitle: "Self-Service Health Check",
    helpBtn: "Help & Assist",
    accessibilityBtn: "Accessibility",
    staffPortalBtn: "Staff Portal",
    emergencyAlert: "In severe medical emergencies, inform staff immediately or call 112.",
    privacyNotice: "MediKiosk does not store permanent patient records. All data is for queue triage only.",

    // Language Selection Screen
    langSelectTitle: "Welcome to MediKiosk",
    langSelectSubtitle: "Choose your preferred language to begin your health check",
    continueBtn: "Continue",
    backBtn: "Back",

    // Welcome Screen
    welcomeHeading: "Your health. Your first step.",
    welcomeSubheading: "Answer a few simple questions to help us understand your symptoms and guide you to the right care.",
    startHealthCheck: "Start Health Check",
    howItWorks: "How does this work?",

    // Interaction Mode Screen
    modeTitle: "How would you like to continue?",
    modeSubtitle: "Choose how you want to interact with MediKiosk today",
    touchModeTitle: "Touch Screen",
    touchModeDesc: "Use large touch buttons to answer questions",
    voiceModeTitle: "Voice + Touch",
    voiceModeDesc: "Talk to MediKiosk using natural speech alongside touch controls",

    // How It Works Modal
    howItWorksTitle: "How MediKiosk Works",
    step1Title: "1. Patient Details",
    step1Desc: "Provide basic information or scan a health document.",
    step2Title: "2. Answer Questions",
    step2Desc: "Respond by voice or tap clear options describing your symptoms.",
    step3Title: "3. Get Guidance",
    step3Desc: "Receive a queue token and immediate direction to the appropriate clinic desk.",
    closeBtn: "Got it, close",

    // Patient Details Screen
    patientInfoTitle: "Patient Information",
    patientInfoSubtitle: "Please provide basic details or scan an identity document",
    scanDocBtn: "Scan Health/ID Document",
    enterManualBtn: "Enter Manually",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    fullNameRequired: "Please enter your full name",
    ageLabel: "Age (Years)",
    ageRequired: "Please enter a valid age between 1 and 120",
    genderLabel: "Gender",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",
    genderPreferNot: "Prefer not to say",
    phoneLabel: "Phone Number (Optional)",
    phonePlaceholder: "10-digit mobile number",
    phoneInvalid: "Please enter a valid 10-digit phone number",
    conditionsLabel: "Pre-existing Medical Conditions (Optional)",
    condHypertension: "High Blood Pressure",
    condDiabetes: "Diabetes",
    condAsthma: "Asthma / Respiratory issue",
    condHeart: "Heart Condition",
    condPregnancy: "Pregnancy",
    condNone: "None of these",

    // Document Scanner & Confirmation Screen
    docScanTitle: "Verify Your Details",
    docScanSubtitle: "Position your health/ID document inside the frame to auto-fill details",
    scanInstruction: "Hold document steady inside the frame",
    scanSuccess: "Document Scanned Successfully!",
    cameraError: "Camera access unavailable. You can enter details manually.",
    confirmDetailsTitle: "Confirm Your Scanned Details",
    confirmDetailsSubtitle: "Please verify the information extracted from your document",
    confirmAndContinue: "Confirm & Continue",
    editDetails: "Edit Details",
    docPrivacyNotice: "Your document is processed locally for this demo and is never uploaded or saved.",

    // Conversational AI & Voice UI Screen
    convaTitle: "MediKiosk Assistant",
    listeningState: "I'm listening...",
    processingState: "Processing your response...",
    speakingState: "MediKiosk is speaking...",
    voiceUnavailable: "Voice interaction unavailable right now. Please continue using touch.",
    listenBtn: "Listen Question",
    speakInstruction: "Say your answer aloud or tap an option below",

    // Questionnaire Screen
    healthCheckHeader: "Health Check",
    questionOf: "Question",
    of: "of",
    previousQuestion: "Previous Question",
    nextQuestion: "Next Question",
    selectOption: "Please select an answer to continue",

    // Review Screen
    reviewTitle: "Review Your Answers",
    reviewSubtitle: "Please double check your responses before submitting",
    patientDetailsSection: "Patient Details",
    symptomsSection: "Symptom Responses",
    editBtn: "Edit",
    submitHealthCheck: "Submit Health Check",

    // Processing Screen
    processingHeading: "Reviewing your responses…",
    processingSub1: "Analyzing symptom patterns…",
    processingSub2: "Calculating priority queue status…",
    processingSub3: "Preparing your recommended next step…",

    // Triage Result Screen
    resultTitle: "Assessment Complete",
    highPriorityTitle: "Priority: High",
    highPriorityDesc: "Please seek immediate assistance from a healthcare professional at the Emergency Desk.",
    highPriorityCTA: "Proceed to Emergency / Staff Desk",

    moderatePriorityTitle: "Priority: Moderate",
    moderatePriorityDesc: "We recommend speaking with a healthcare professional promptly.",
    moderatePriorityCTA: "Proceed to Consultation",

    routinePriorityTitle: "Priority: Routine",
    routinePriorityDesc: "Your responses indicate routine symptoms. Please proceed to general consultation.",
    routinePriorityCTA: "Proceed to General Consultation",

    medicalDisclaimer: "Important: This screening provides queue priority guidance only and does NOT constitute a medical diagnosis. If you feel severely unwell, seek immediate medical attention.",

    // Next Step Screen
    nextStepTitle: "Recommended Next Step",
    nextStepSubtitle: "Please head to the designated location below",
    assignedDesk: "Assigned Desk / Room",
    estimatedWait: "Estimated Waiting Time",
    tokenNumberLabel: "Your Queue Token",
    proceedToComplete: "View Token & Complete Session",

    // Complete Screen
    completeHeading: "You're All Set!",
    completeSubtitle: "Please note down your token number or wait until it is called on the overhead display screen.",
    tokenBigLabel: "TOKEN NUMBER",
    startNewSession: "Start New Session",

    // Inactivity Modal
    inactivityTitle: "Are you still there?",
    inactivityMessage: "For your privacy, this session will reset automatically in",
    inactivitySeconds: "seconds",
    keepSessionBtn: "I'm still here — Continue",
    resetNowBtn: "Reset Session Now",

    // Help Modal
    helpTitle: "Need Assistance?",
    helpMessage: "If you need help using this kiosk or are feeling unwell, press the button below to request staff support.",
    callStaffBtn: "Call Kiosk Staff Assistant",
    staffCalledMessage: "Staff notification sent! An assistant will be with you shortly.",

    // Staff Login & Doctor Dashboard
    staffLoginTitle: "Clinical Staff Portal",
    staffLoginSubtitle: "Authorized healthcare provider sign-in for patient queue management",
    emailLabel: "Staff ID / Email",
    passwordLabel: "Password",
    signInBtn: "Sign In to Dashboard",
    demoFillBtn: "Use Demo Credentials",
    dashboardTitle: "MediKiosk Clinical Queue Dashboard",
    searchPlaceholder: "Search patient name, token...",
    allPriorityFilter: "All Priorities",
    highPriorityFilter: "High Priority",
    modPriorityFilter: "Moderate Priority",
    routinePriorityFilter: "Routine",
    patientQueueHeader: "Active Patient Queue",
    clinicalSummaryTitle: "Clinical Triage Summary",
    presentingSymptoms: "Presenting Symptoms",
    redFlagsNoted: "Red Flag Alerts",
    assignedAction: "Assigned Action",
    logoutBtn: "Sign Out"
  },
  hi: {
    // Header & Global
    headerTitle: "मेडीकियोस्क",
    headerSubtitle: "स्वयं-सेवा स्वास्थ्य जांच",
    helpBtn: "सहायता प्राप्त करें",
    accessibilityBtn: "सुगम्यता",
    staffPortalBtn: "स्टाफ पोर्टल",
    emergencyAlert: "गंभीर आपात स्थिति में, तुरंत अस्पताल कर्मचारी को सूचित करें या 112 पर कॉल करें।",
    privacyNotice: "मेडीकियोस्क स्थाई रिकॉर्ड सहेजता नहीं है। डेटा केवल टोकन कतार के लिए है।",

    // Language Selection Screen
    langSelectTitle: "मेडीकियोस्क में आपका स्वागत है",
    langSelectSubtitle: "स्वास्थ्य जांच शुरू करने के लिए अपनी पसंदीदा भाषा चुनें",
    continueBtn: "आगे बढ़ें",
    backBtn: "पीछे जाएं",

    // Welcome Screen
    welcomeHeading: "आपका स्वास्थ्य। आपका पहला कदम।",
    welcomeSubheading: "अपने लक्षणों को समझने और सही देखभाल तक पहुँचने के लिए कुछ सरल प्रश्नों के उत्तर दें।",
    startHealthCheck: "स्वास्थ्य जांच शुरू करें",
    howItWorks: "यह कैसे काम करता है?",

    // Interaction Mode Screen
    modeTitle: "आप कैसे जारी रखना चाहेंगे?",
    modeSubtitle: "आज मेडीकियोस्क के साथ संवाद करने का तरीका चुनें",
    touchModeTitle: "टच स्क्रीन",
    touchModeDesc: "बटन दबाकर प्रश्नों के उत्तर दें",
    voiceModeTitle: "आवाज़ + टच",
    voiceModeDesc: "बोलकर और टच द्वारा मेडीकियोस्क से बात करें",

    // How It Works Modal
    howItWorksTitle: "मेडीकियोस्क कैसे काम करता है",
    step1Title: "1. रोगी का विवरण",
    step1Desc: "बुनियादी जानकारी दें या कार्ड स्कैन करें।",
    step2Title: "2. प्रश्नों के उत्तर दें",
    step2Desc: "बोलकर या टच करके अपने लक्षण बताएं।",
    step3Title: "3. मार्गदर्शन प्राप्त करें",
    step3Desc: "टोकन नंबर और सही काउंटर की जानकारी पाएं।",
    closeBtn: "समझ गया, बंद करें",

    // Patient Details Screen
    patientInfoTitle: "रोगी की जानकारी",
    patientInfoSubtitle: "प्राथमिकता तय करने के लिए विवरण दर्ज करें या कार्ड स्कैन करें",
    scanDocBtn: "स्वास्थ्य/पहचान पत्र स्कैन करें",
    enterManualBtn: "मैन्युअल रूप से दर्ज करें",
    fullNameLabel: "पूरा नाम",
    fullNamePlaceholder: "अपना पूरा नाम दर्ज करें",
    fullNameRequired: "कृपया अपना पूरा नाम दर्ज करें",
    ageLabel: "आयु (वर्ष)",
    ageRequired: "कृपया 1 से 120 के बीच मान्य आयु दर्ज करें",
    genderLabel: "लिंग",
    genderMale: "पुरुष",
    genderFemale: "महिला",
    genderOther: "अन्य",
    genderPreferNot: "बताना नहीं चाहते",
    phoneLabel: "फ़ोन नंबर (वैकल्पिक)",
    phonePlaceholder: "10-अंकों का मोबाइल नंबर",
    phoneInvalid: "कृपया 10 अंकों का मान्य नंबर दर्ज करें",
    conditionsLabel: "पूर्व-मौजूद बीमारियां (वैकल्पिक)",
    condHypertension: "उच्च रक्तचाप (बीपी)",
    condDiabetes: "मधुमेह (शुगर)",
    condAsthma: "अस्थमा / सांस की समस्या",
    condHeart: "हृदय रोग",
    condPregnancy: "गर्भावस्था",
    condNone: "इनमें से कोई नहीं",

    // Document Scanner & Confirmation Screen
    docScanTitle: "अपने विवरण की पुष्टि करें",
    docScanSubtitle: "विवरण स्वतः भरने के लिए कार्ड को फ्रेम के अंदर रखें",
    scanInstruction: "दस्तावेज़ को फ्रेम में स्थिर रखें",
    scanSuccess: "दस्तावेज़ सफलतापूर्वक स्कैन हुआ!",
    cameraError: "कैमरा उपलब्ध नहीं है। आप विवरण मैन्युअल रूप से दर्ज कर सकते हैं।",
    confirmDetailsTitle: "स्कैन किए गए विवरण की पुष्टि करें",
    confirmDetailsSubtitle: "कृपया अपने दस्तावेज़ से निकाले गए विवरण की जांच करें",
    confirmAndContinue: "पुष्टि करें और आगे बढ़ें",
    editDetails: "विवरण में संशोधन करें",
    docPrivacyNotice: "आपका दस्तावेज़ स्थानीय रूप से संसाधित होता है और कभी अपलोड या सहेजा नहीं जाता है।",

    // Conversational AI & Voice UI Screen
    convaTitle: "मेडीकियोस्क सहायक",
    listeningState: "मैं सुन रहा हूं...",
    processingState: "आपकी प्रतिक्रिया का विश्लेषण हो रहा है...",
    speakingState: "मेडीकियोस्क बोल रहा है...",
    voiceUnavailable: "आवाज़ सेवा उपलब्ध नहीं है। कृपया टच का उपयोग जारी रखें।",
    listenBtn: "प्रश्न सुनें",
    speakInstruction: "अपना उत्तर बोलें या नीचे दिए गए विकल्प पर टैप करें",

    // Questionnaire Screen
    healthCheckHeader: "स्वास्थ्य जांच",
    questionOf: "प्रश्न",
    of: "का",
    previousQuestion: "पिछला प्रश्न",
    nextQuestion: "अगला प्रश्न",
    selectOption: "आगे बढ़ने के लिए कृपया उत्तर का चयन करें",

    // Review Screen
    reviewTitle: "अपने उत्तरों की समीक्षा करें",
    reviewSubtitle: "कृपया जमा करने से पहले अपने उत्तरों की पुष्टि करें",
    patientDetailsSection: "रोगी विवरण",
    symptomsSection: "लक्षण प्रतिक्रियाएं",
    editBtn: "संशोधन करें",
    submitHealthCheck: "स्वास्थ्य जांच सबमिट करें",

    // Processing Screen
    processingHeading: "आपकी प्रतिक्रियाओं की समीक्षा हो रही है…",
    processingSub1: "लक्षणों का विश्लेषण किया जा रहा है…",
    processingSub2: "प्राथमिकता श्रेणी तय की जा रही है…",
    processingSub3: "अगले कदम की तैयारी हो रही है…",

    // Triage Result Screen
    resultTitle: "मूल्यांकन पूर्ण",
    highPriorityTitle: "प्राथमिकता: उच्च (High)",
    highPriorityDesc: "कृपया आपातकालीन डेस्क पर तुरंत चिकित्सा पेशेवर से सहायता लें।",
    highPriorityCTA: "आपातकालीन / स्टाफ डेस्क पर जाएं",

    moderatePriorityTitle: "प्राथमिकता: मध्यम (Moderate)",
    moderatePriorityDesc: "हम जल्द ही किसी स्वास्थ्य देखभाल पेशेवर से परामर्श करने की सलाह देते हैं।",
    moderatePriorityCTA: "परामर्श कक्ष पर जाएं",

    routinePriorityTitle: "प्राथमिकता: सामान्य (Routine)",
    routinePriorityDesc: "आपकी प्रतिक्रियाएं सामान्य लक्षणों को दर्शाती हैं। सामान्य परामर्श पर जाएं।",
    routinePriorityCTA: "सामान्य परामर्श डेस्क पर जाएं",

    medicalDisclaimer: "महत्वपूर्ण: यह केवल कतार प्राथमिकता मार्गदर्शन है और कोई चिकित्सीय निदान (Medical Diagnosis) नहीं है। गंभीर स्थिति में तुरंत आपातकालीन सहायता लें।",

    // Next Step Screen
    nextStepTitle: "अनुशंसित अगला कदम",
    nextStepSubtitle: "कृपया नीचे दिए गए निर्दिष्ट स्थान पर जाएं",
    assignedDesk: "निर्दिष्ट डेस्क / कमरा",
    estimatedWait: "अनुमानित प्रतीक्षा समय",
    tokenNumberLabel: "आपका टोकन नंबर",
    proceedToComplete: "टोकन देखें और सत्र पूरा करें",

    // Complete Screen
    completeHeading: "सत्र संपन्न!",
    completeSubtitle: "कृपया अपना टोकन नंबर नोट कर लें और डिस्प्ले स्क्रीन पर बुलाए जाने तक प्रतीक्षा करें।",
    tokenBigLabel: "टोकन नंबर",
    startNewSession: "नया सत्र शुरू करें",

    // Inactivity Modal
    inactivityTitle: "क्या आप अभी भी यहां हैं?",
    inactivityMessage: "आपकी गोपनीयता के लिए, यह सत्र स्वचालित रूप से रीसेट हो जाएगा:",
    inactivitySeconds: "सेकंड में",
    keepSessionBtn: "हां, मैं यही हूं — जारी रखें",
    resetNowBtn: "अभी सत्र रीसेट करें",

    // Help Modal
    helpTitle: "सहायता चाहिए?",
    helpMessage: "यदि आपको कियोस्क का उपयोग करने में सहायता चाहिए या अस्वस्थ महसूस कर रहे हैं, तो नीचे का बटन दबाएं।",
    callStaffBtn: "स्टाफ सहायक को बुलाएं",
    staffCalledMessage: "सूचना भेज दी गई है! एक सहायक जल्द ही आपके पास होगा।",

    // Staff Login & Doctor Dashboard
    staffLoginTitle: "क्लिनिकल स्टाफ पोर्टल",
    staffLoginSubtitle: "रोगी कतार प्रबंधन के लिए अधिकृत चिकित्सा प्रदाता साइन-इन",
    emailLabel: "स्टाफ आईडी / ईमेल",
    passwordLabel: "पासवर्ड",
    signInBtn: "डैशबोर्ड पर साइन इन करें",
    demoFillBtn: "डेमो क्रेडेंशियल का उपयोग करें",
    dashboardTitle: "मेडीकियोस्क क्लिनिकल कतार डैशबोर्ड",
    searchPlaceholder: "रोगी का नाम, टोकन खोजें...",
    allPriorityFilter: "सभी प्राथमिकताएं",
    highPriorityFilter: "उच्च प्राथमिकता",
    modPriorityFilter: "मध्यम प्राथमिकता",
    routinePriorityFilter: "सामान्य",
    patientQueueHeader: "सक्रिय रोगी कतार",
    clinicalSummaryTitle: "क्लिनिकल ट्राइएज सारांश",
    presentingSymptoms: "प्रस्तुत लक्षण",
    redFlagsNoted: "रेड फ्लैग चेतावनी",
    assignedAction: "निर्दिष्ट कार्रवाई",
    logoutBtn: "साइन आउट"
  }
};
