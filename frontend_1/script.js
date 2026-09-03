document.addEventListener("DOMContentLoaded", () => {
  console.log("MediKiosk Engine Initialized 🚀");

  // ==========================================================================
  // 1. GLOBAL STATE & TRANSLATIONS
  // ==========================================================================
  const kioskState = {
    selectedLanguage: "en",
    patientType: "existing",
    patientId: "",
    profile: {
      fullName: "",
      age: "",
      gender: "Male",
      phone: "",
      address: ""
    },
    consentTimestamp: null
  };

  const translations = {
    en: {
      brandSub: "Self-Service Health Check",
      triageTag: "Fast & Friendly Self-Service Triage",
      heroHeading: "Your health. Your first step.",
      heroDesc: "Answer a few simple questions to help us understand your symptoms and guide you to the right care.",
      btnStart: "Start Health Check",
      btnHelp: "How does this work?",
      tab2Title: "Welcome to MediKiosk",
      tab2Desc: "Choose your preferred language to begin your health check",
      btnContinue: "Continue",
      tab3Title: "Patient Identification",
      tab3Desc: "Select an option to proceed with your clinical intake",
      existingTitle: "Existing Patient",
      existingSub: "Check in using ABHA / Health ID",
      newTitle: "New Patient",
      newSub: "First time visit / Create profile",
      btnVerify: "Verify & Continue",
      btnRegister: "Proceed to Registration",
      tab4Title: "New Patient Registration",
      tab4Desc: "Enter your basic demographics to generate your triage token",
      btnSubmitReg: "Proceed to Consent",
      tab5Title: "Consent & Data Privacy",
      tab5Desc: "Please review how MediKiosk processes your health information",
      consentStatement: "I understand how my information will be collected and agree to proceed with this AI-assisted clinical intake.",
      btnAccept: "Accept & Begin Intake",
      btnDecline: "Decline / Speak with Staff"
    },
    hi: {
      brandSub: "स्वयं-सेवा स्वास्थ्य जांच",
      triageTag: "त्वरित और सरल प्राथमिक स्वास्थ्य जांच",
      heroHeading: "आपका स्वास्थ्य। आपका पहला कदम।",
      heroDesc: "अपने लक्षणों को समझने और सही डॉक्टर तक पहुँचने के लिए कुछ सरल प्रश्नों के उत्तर दें।",
      btnStart: "स्वास्थ्य जांच शुरू करें",
      btnHelp: "यह कैसे काम करता है?",
      tab2Title: "MediKiosk में आपका स्वागत है",
      tab2Desc: "स्वास्थ्य जांच शुरू करने के लिए अपनी पसंदीदा भाषा चुनें",
      btnContinue: "आगे बढ़ें",
      tab3Title: "रोगी पहचान (लॉग इन)",
      tab3Desc: "अपनी जांच आगे बढ़ाने के लिए एक विकल्प चुनें",
      existingTitle: "पुराने मरीज",
      existingSub: "ABHA / हेल्थ आईडी द्वारा जांचें",
      newTitle: "नए मरीज",
      newSub: "पहली बार आगमन / नया प्रोफ़ाइल बनाएं",
      btnVerify: "सत्यापित करें और आगे बढ़ें",
      btnRegister: "पंजीकरण के लिए आगे बढ़ें",
      tab4Title: "नए रोगी का पंजीकरण",
      tab4Desc: "टोकन प्राप्त करने के लिए अपनी बुनियादी जानकारी दर्ज करें",
      btnSubmitReg: "सहमति के लिए आगे बढ़ें",
      tab5Title: "सहमति एवं डेटा गोपनीयता",
      tab5Desc: "समीक्षा करें कि आपकी स्वास्थ्य जानकारी कैसे उपयोग की जाएगी",
      consentStatement: "मैं समझता/समझती हूँ कि मेरी जानकारी कैसे ली जाएगी और मैं इस AI स्वास्थ्य जांच के लिए सहमत हूँ।",
      btnAccept: "स्वीकार करें और जांच शुरू करें",
      btnDecline: "अस्वीकार करें / कर्मचारी से बात करें"
    }
  };

  function updateLanguage(lang) {
    kioskState.selectedLanguage = lang;
    const bundle = translations[lang] || translations.en;

    const safeSetText = (selector, text) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = text;
    };

    // Tab 1 Elements
    safeSetText(".brand-subtitle", bundle.brandSub);
    safeSetText(".triage-tag span", bundle.triageTag);
    safeSetText(".hero-heading", bundle.heroHeading);
    safeSetText(".hero-description", bundle.heroDesc);
    safeSetText("#btnStart span", bundle.btnStart);
    safeSetText("#btnHelp span", bundle.btnHelp);

    // Tab 2 Elements
    safeSetText("#tab-language .tab-main-title", bundle.tab2Title);
    safeSetText("#tab-language .tab-main-desc", bundle.tab2Desc);
    safeSetText("#btnContinueLang span", bundle.btnContinue);

    // Tab 3 Elements
    safeSetText("#tab-identify .tab-main-title", bundle.tab3Title);
    safeSetText("#tab-identify .tab-main-desc", bundle.tab3Desc);
    safeSetText("#cardExistingPatient .id-card-title", bundle.existingTitle);
    safeSetText("#cardExistingPatient .id-card-sub", bundle.existingSub);
    safeSetText("#cardNewPatient .id-card-title", bundle.newTitle);
    safeSetText("#cardNewPatient .id-card-sub", bundle.newSub);
    safeSetText("#btnVerifyExisting span", bundle.btnVerify);
    safeSetText("#btnGoToRegister span", bundle.btnRegister);

    // Tab 4 Elements
    safeSetText("#tab-registration .tab-main-title", bundle.tab4Title);
    safeSetText("#tab-registration .tab-main-desc", bundle.tab4Desc);
    safeSetText("#btnSubmitRegistration span", bundle.btnSubmitReg);

    // Tab 5 Elements
    safeSetText("#tab-consent .tab-main-title", bundle.tab5Title);
    safeSetText("#tab-consent .tab-main-desc", bundle.tab5Desc);
    safeSetText(".checkbox-label", bundle.consentStatement);
    safeSetText("#btnAcceptConsent span", bundle.btnAccept);
    safeSetText("#btnDeclineConsent span", bundle.btnDecline);

    // Header Language Toggle Indicators
    const navLangText = document.getElementById("navLangText");
    const navLangBadge = document.getElementById("navLangBadge");
    if (navLangText) navLangText.textContent = lang === "hi" ? "हिन्दी" : "English";
    if (navLangBadge) navLangBadge.textContent = lang.toUpperCase();

    // Synchronize Tab 2 Selected Card
    document.querySelectorAll(".lang-card").forEach(card => {
      if (card.getAttribute("data-lang") === lang) {
        card.classList.add("selected");
      } else {
        card.classList.remove("selected");
      }
    });

    console.log(`Language set to: ${lang} 🌐`);
  }

  // ==========================================================================
  // 2. NAVIGATION STACK ENGINE (LIFO)
  // ==========================================================================
  const navStack = ["tab-idle"];

  function navigateToTab(targetTabId) {
    const currentTabId = navStack[navStack.length - 1];
    if (currentTabId === targetTabId) return;

    const currentEl = document.getElementById(currentTabId);
    const targetEl = document.getElementById(targetTabId);

    if (currentEl && targetEl) {
      currentEl.classList.remove("active-tab");
      targetEl.classList.add("active-tab");
      navStack.push(targetTabId);
      window.history.pushState({ tabId: targetTabId }, "", `#${targetTabId}`);
    }
  }

  function navigateBack() {
    if (navStack.length <= 1) return;

    const currentTabId = navStack.pop();
    const previousTabId = navStack[navStack.length - 1];

    const currentEl = document.getElementById(currentTabId);
    const prevEl = document.getElementById(previousTabId);

    if (currentEl && prevEl) {
      currentEl.classList.remove("active-tab");
      prevEl.classList.add("active-tab");
    }
  }

  window.addEventListener("popstate", () => navigateBack());
  document.querySelectorAll(".btn-back").forEach(btn => {
    btn.addEventListener("click", () => navigateBack());
  });

  // ==========================================================================
  // 3. TOP NAVBAR BUTTONS
  // ==========================================================================
  const btnNavTouch = document.getElementById("btnNavTouch");
  if (btnNavTouch) {
    btnNavTouch.addEventListener("click", () => {
      document.body.classList.toggle("touch-mode");
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    });
  }

  const btnNavLang = document.getElementById("btnNavLang");
  if (btnNavLang) {
    btnNavLang.addEventListener("click", () => {
      const nextLang = kioskState.selectedLanguage === "en" ? "hi" : "en";
      updateLanguage(nextLang);
    });
  }

  const btnNavAccess = document.getElementById("btnNavAccess");
  if (btnNavAccess) {
    btnNavAccess.addEventListener("click", () => {
      document.body.classList.toggle("high-contrast");
    });
  }

  const btnNavHelp = document.getElementById("btnNavHelp");
  if (btnNavHelp) {
    btnNavHelp.addEventListener("click", () => {
      alert("ℹ️ MediKiosk Assistance:\n\n1. Select your preferred language.\n2. Verify ABHA / Health ID or choose New Patient.\n3. Review consent terms to begin triage intake.");
    });
  }

  const btnNavStaff = document.getElementById("btnNavStaff");
  if (btnNavStaff) {
    btnNavStaff.addEventListener("click", () => {
      const pin = prompt("🔒 Staff Portal Access:\nEnter PIN (Demo: 1234):");
      if (pin === "1234") {
        alert("Access Granted. Routing to Doctor Queue...");
      } else if (pin !== null) {
        alert("❌ Unauthorized PIN.");
      }
    });
  }

  // ==========================================================================
  // 4. TAB 1: IDLE / WELCOME
  // ==========================================================================
  const btnStart = document.getElementById("btnStart");
  const btnHelp = document.getElementById("btnHelp");

  if (btnStart) {
    btnStart.addEventListener("click", () => navigateToTab("tab-language"));
  }
  if (btnHelp) {
    btnHelp.addEventListener("click", () => {
      alert("MediKiosk guides you through basic intake questions and document scans before you meet the doctor.");
    });
  }

  // ==========================================================================
  // 5. TAB 2: LANGUAGE SELECTION
  // ==========================================================================
  const langCards = document.querySelectorAll(".lang-card:not(.disabled)");
  langCards.forEach(card => {
    card.addEventListener("click", () => {
      const chosenLang = card.getAttribute("data-lang") || "en";
      updateLanguage(chosenLang);
    });
  });

  const btnContinueLang = document.getElementById("btnContinueLang");
  if (btnContinueLang) {
    btnContinueLang.addEventListener("click", () => navigateToTab("tab-identify"));
  }

  // ==========================================================================
  // 6. TAB 3: PATIENT IDENTIFICATION
  // ==========================================================================
  const cardExisting = document.getElementById("cardExistingPatient");
  const cardNew = document.getElementById("cardNewPatient");
  const panelExisting = document.getElementById("panelExisting");
  const panelNew = document.getElementById("panelNew");

  if (cardExisting && cardNew && panelExisting && panelNew) {
    cardExisting.addEventListener("click", () => {
      cardExisting.classList.add("active");
      cardNew.classList.remove("active");
      panelExisting.style.display = "flex";
      panelNew.style.display = "none";
      kioskState.patientType = "existing";
    });

    cardNew.addEventListener("click", () => {
      cardNew.classList.add("active");
      cardExisting.classList.remove("active");
      panelExisting.style.display = "none";
      panelNew.style.display = "flex";
      kioskState.patientType = "new";
    });
  }

  const btnVerifyExisting = document.getElementById("btnVerifyExisting");
  const inputPatientId = document.getElementById("inputPatientId");
  if (btnVerifyExisting && inputPatientId) {
    btnVerifyExisting.addEventListener("click", () => {
      const rawInput = inputPatientId.value.replace(/[^0-9]/g, "");

      if (rawInput.length !== 14) {
        alert("⚠️ Invalid Format: ABHA Health ID must be exactly 14 digits.");
        inputPatientId.focus();
        return;
      }

      btnVerifyExisting.disabled = true;
      btnVerifyExisting.innerHTML = `<span>Verifying with Registry...</span>`;

      setTimeout(() => {
        btnVerifyExisting.disabled = false;
        btnVerifyExisting.innerHTML = `<span>Verify & Continue</span>`;

        if (rawInput === "00000000000000" || rawInput === "11111111111111") {
          alert("❌ Record Not Found: Please register as New Patient.");
        } else {
          kioskState.patientId = rawInput;
          alert("✅ Verified: ABHA record found. Proceeding to Consent...");
          navigateToTab("tab-consent");
        }
      }, 1000);
    });
  }

  const btnGoToRegister = document.getElementById("btnGoToRegister");
  if (btnGoToRegister) {
    btnGoToRegister.addEventListener("click", () => navigateToTab("tab-registration"));
  }

  // ==========================================================================
  // 7. TAB 4: REGISTRATION FORM
  // ==========================================================================
  const genderPills = document.querySelectorAll(".gender-pill");
  genderPills.forEach(pill => {
    pill.addEventListener("click", () => {
      genderPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      kioskState.profile.gender = pill.getAttribute("data-gender") || "Male";
    });
  });

  const btnSubmitRegistration = document.getElementById("btnSubmitRegistration");
  if (btnSubmitRegistration) {
    btnSubmitRegistration.addEventListener("click", () => {
      const nameInput = document.getElementById("regFullName")?.value.trim() || "";
      const ageInput = document.getElementById("regAge")?.value.trim() || "";
      const phoneInput = document.getElementById("regPhone")?.value.trim() || "";
      const addressInput = document.getElementById("regAddress")?.value.trim() || "";

      if (!nameInput) {
        alert("Please enter your full name.");
        return;
      }
      if (!ageInput || parseInt(ageInput, 10) < 1 || parseInt(ageInput, 10) > 120) {
        alert("Please enter a valid age between 1 and 120.");
        return;
      }
      if (!phoneInput || !/^\d{10}$/.test(phoneInput)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
      }

      kioskState.profile.fullName = nameInput;
      kioskState.profile.age = ageInput;
      kioskState.profile.phone = phoneInput;
      kioskState.profile.address = addressInput;

      navigateToTab("tab-consent");
    });
  }

  // ==========================================================================
  // 8. TAB 5: CONSENT SCREEN
  // ==========================================================================
  let audioPlaying = false;

  const btnAudioConsent = document.getElementById("btnAudioConsent");
  const audioStatusText = document.getElementById("audioStatusText");
  const consentCheckboxInput = document.getElementById("consentCheckboxInput");
  const consentCheckCard = document.getElementById("consentCheckCard");
  const btnAcceptConsent = document.getElementById("btnAcceptConsent");
  const btnDeclineConsent = document.getElementById("btnDeclineConsent");

  if (btnAudioConsent && audioStatusText) {
    btnAudioConsent.addEventListener("click", () => {
      audioPlaying = !audioPlaying;
      if (audioPlaying) {
        audioStatusText.innerHTML = `<strong>Playing:</strong> <em>"${kioskState.selectedLanguage === "hi" ? "MediKiosk अब आपके लक्षणों को रिकॉर्ड करेगा..." : "MediKiosk will now record your symptoms..."}"</em>`;
      } else {
        audioStatusText.innerText = "Tap to play spoken explanation in your selected language";
      }
    });
  }

  if (consentCheckboxInput && consentCheckCard && btnAcceptConsent) {
    consentCheckboxInput.addEventListener("change", (e) => {
      const isChecked = e.target.checked;
      consentCheckCard.classList.toggle("checked", isChecked);
      btnAcceptConsent.disabled = !isChecked;
    });
  }

  if (btnAcceptConsent) {
    btnAcceptConsent.addEventListener("click", () => {
      if (consentCheckboxInput && !consentCheckboxInput.checked) return;
      kioskState.consentTimestamp = new Date().toISOString();
      alert(`✅ Consent Captured!\nPatient: ${kioskState.profile.fullName || kioskState.patientId}\nLanguage: ${kioskState.selectedLanguage.toUpperCase()}\n\nOnboarding is complete!`);
    });
  }

  if (btnDeclineConsent) {
    btnDeclineConsent.addEventListener("click", () => {
      alert("A triage nurse has been alerted to assist you with manual paper intake.");
    });
  }
});