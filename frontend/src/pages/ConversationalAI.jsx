/**
 * ConversationalAI.jsx — Screen 6: Medical Assistant / AI Interview
 * 
 * Main patient conversational interview interface for MediKiosk.
 * Integrates directly with existing backend APIs:
 *  - GET  /api/questions
 *  - POST /api/sessions/
 *  - POST /api/sessions/{session_id}/responses
 *  - POST /api/sessions/{session_id}/complete
 * 
 * Interaction Hierarchy:
 *  1. TYPE TEXT / VOICE (Primary dominant interaction elements)
 *  2. Patient's Actual Answer (Live transcript / typed text display)
 *  3. Suggested Options (Visually smaller and secondary quick-tap shortcuts)
 * 
 * Free-Form Answer Handling:
 *  - VOICE: Captures complete spoken transcript as free-form answer. No keyword/option matching.
 *  - TYPE TEXT: Preserves complete typed text as free-form answer. No keyword/option matching.
 *  - TOUCH: Only explicit option clicks set the predefined option as answer.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Check,
  ArrowRight,
  ArrowLeft,
  Keyboard,
  AlertCircle,
  RefreshCw,
  WifiOff,
  Touchpad,
  Send,
  HelpCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Minus,
  Plus,
  Hash,
  Edit3,
  MessageSquare
} from 'lucide-react';

import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { voiceService } from '../services/voiceService';
import { 
  fetchQuestions, 
  createIntakeSession, 
  submitResponse, 
  completeIntakeSession 
} from '../services/apiService';

// Input modes recognized by backend IntakeResponseCreate
const INPUT_MODES = {
  TOUCH: 'TOUCH',
  TEXT: 'TEXT',
  VOICE: 'VOICE',
};

/**
 * Normalizes question object to handle both real backend response
 * ({ id, question_text, question_key, question_type, is_required, display_order, options })
 * and fallback mock datasets.
 */
function normalizeQuestion(q) {
  const qText = q.question_text || q.question_text_en || q.text || q.textEn || '';
  const qTextHi = q.question_text_hi || q.textHi || null;

  const rawOptions = Array.isArray(q.options) ? q.options : [];
  const normalizedOptions = rawOptions.map((opt) => {
    const val = opt.option_value ?? opt.value ?? opt.option_label ?? String(opt.id);
    const label = opt.option_label ?? opt.option_label_en ?? opt.label ?? opt.labelEn ?? val;
    const labelHi = opt.option_label_hi ?? opt.labelHi ?? null;
    return {
      id: opt.id,
      question_id: opt.question_id || q.id,
      option_value: String(val),
      option_label: String(label),
      option_label_hi: labelHi ? String(labelHi) : null,
      display_order: opt.display_order ?? 0,
    };
  });

  return {
    id: q.id,
    question_key: q.question_key || `q_${q.id}`,
    question_text: qText,
    question_text_hi: qTextHi,
    question_type: String(q.question_type || q.type || 'SINGLE_CHOICE').toUpperCase(),
    is_required: Boolean(q.is_required),
    display_order: q.display_order ?? 0,
    options: normalizedOptions,
    hasOptions: normalizedOptions.length > 0,
  };
}

export function ConversationalAI() {
  const {
    language,
    answers,
    setAnswer,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    setCurrentStep,
    interactionMode,
    session,
    setSession,
    patient,
    setIsHelpModalOpen,
    t,
  } = useKiosk();

  const isHindi = language === 'hi';

  // ── State ──────────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState(null);

  // Active interaction mode: 'VOICE' | 'TEXT' | 'TOUCH'
  const [activeInputMode, setActiveInputMode] = useState(
    interactionMode === 'VOICE' ? INPUT_MODES.VOICE : INPUT_MODES.TEXT
  );

  // Track the specific input mode used for the currently recorded answer
  const lastAnswerModeRef = useRef(INPUT_MODES.TEXT);

  // Voice recording state
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'error'
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState(null); // { text, mode }
  const latestTranscriptRef = useRef('');

  // Text drafting
  const [textDraft, setTextDraft] = useState('');
  const textInputRef = useRef(null);

  // Submission guard & error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Conversation history for previous responses
  const [history, setHistory] = useState([]);

  // ── 1. Load questions and ensure session exists on mount ───────────────────
  const loadInterviewData = useCallback(async () => {
    setIsLoadingQuestions(true);
    setQuestionError(null);

    try {
      // 1. Fetch questions from backend GET /api/questions
      const fetched = await fetchQuestions();
      if (!Array.isArray(fetched) || fetched.length === 0) {
        throw new Error('No active questions found in questionnaire.');
      }
      setQuestions(fetched.map(normalizeQuestion));

      // 2. Ensure an intake session exists via POST /api/sessions/
      if (!session?.id) {
        const newSession = await createIntakeSession(patient?.id || 1);
        if (newSession && newSession.id) {
          setSession(newSession);
        }
      }
    } catch (err) {
      console.error('[ConversationalAI] Initialization error:', err);
      setQuestionError(
        isHindi
          ? 'प्रश्न लोड करने में असमर्थ। कृपया नेटवर्क कनेक्शन जांचें।'
          : "Unable to load questionnaire. Please check server connection."
      );
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [session?.id, patient?.id, setSession, isHindi]);

  useEffect(() => {
    loadInterviewData();
  }, [loadInterviewData]);

  // ── 2. Sync active question & existing answer on index change ──────────────
  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    voiceService.stopListening();
    voiceService.stopSpeaking();
    setVoiceState('idle');
    setTranscript('');
    setVoiceFeedback(null);
    setSubmitError(null);
    latestTranscriptRef.current = '';
    lastAnswerModeRef.current = INPUT_MODES.TEXT;

    if (currentQ) {
      // Restore previous answer if already answered
      const existing = answersRef.current[currentQ.id];
      if (existing !== undefined && existing !== null) {
        if (Array.isArray(existing)) {
          setTextDraft(existing.join(', '));
        } else {
          setTextDraft(String(existing));
        }
      } else {
        setTextDraft('');
      }

      // Default primary input mode: if interactionMode is VOICE, default to VOICE, else TEXT
      setActiveInputMode(interactionMode === 'VOICE' ? INPUT_MODES.VOICE : INPUT_MODES.TEXT);
    }
  }, [currentQuestionIndex, currentQ?.id, interactionMode]);

  // ── 3. Derived Answer Status ───────────────────────────────────────────────
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;
  const isAnswered = (
    (currentAnswer !== undefined && currentAnswer !== null &&
      (Array.isArray(currentAnswer)
        ? currentAnswer.length > 0
        : String(currentAnswer).trim() !== '')) ||
    textDraft.trim() !== ''
  );

  // ── 4. Audio Text-to-Speech (Listen Question) ──────────────────────────────
  const handleSpeakQuestion = useCallback(() => {
    if (!currentQ) return;
    const textToSpeak = isHindi && currentQ.question_text_hi
      ? currentQ.question_text_hi
      : currentQ.question_text;

    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      voiceService.speak(textToSpeak, {
        language: isHindi ? 'hi' : 'en',
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    }
  }, [currentQ, isSpeaking, isHindi]);

  // ── 5. Apply Recognized Voice Transcript (FREE-FORM, NO OPTION MATCHING) ───
  const applyVoiceTranscript = useCallback((spokenText) => {
    const fullTranscript = (spokenText || '').trim();
    if (!fullTranscript || !currentQ) return;

    // Critical Requirement: Treat voice input as a COMPLETE FREE-FORM answer!
    // Do NOT keyword-match against options or auto-select predefined options.
    setAnswer(currentQ.id, fullTranscript, INPUT_MODES.VOICE);
    lastAnswerModeRef.current = INPUT_MODES.VOICE;

    // Display the complete spoken text in the answer box
    setTextDraft(fullTranscript);

    // Provide clear confirmation
    setVoiceFeedback({
      text: fullTranscript,
      mode: INPUT_MODES.VOICE
    });
  }, [currentQ, setAnswer]);

  // ── 6. Voice Recognition Toggle via voiceService ───────────────────────────
  const handleToggleListening = useCallback(() => {
    if (!voiceService.isSupported()) {
      setVoiceState('error');
      return;
    }

    if (voiceState === 'listening') {
      voiceService.stopListening();
      setVoiceState('idle');
      if (latestTranscriptRef.current) {
        applyVoiceTranscript(latestTranscriptRef.current);
      }
    } else {
      setActiveInputMode(INPUT_MODES.VOICE);
      latestTranscriptRef.current = '';
      setTranscript('');
      setVoiceFeedback(null);

      voiceService.startListening({
        language: isHindi ? 'hi' : 'en',
        onResult: (text, isFinal) => {
          latestTranscriptRef.current = text;
          setTranscript(text);
          setTextDraft(text);
          if (isFinal && text.trim()) {
            applyVoiceTranscript(text);
          }
        },
        onEnd: (finalText) => {
          setVoiceState('idle');
          const toApply = finalText || latestTranscriptRef.current;
          if (toApply && toApply.trim()) {
            applyVoiceTranscript(toApply);
          }
        },
        onStateChange: (state) => setVoiceState(state),
        onError: () => setVoiceState('error'),
      });
    }
  }, [voiceState, isHindi, applyVoiceTranscript]);

  // ── 7. Text Input Change (FREE-FORM, NO OPTION MATCHING) ────────────────────
  const handleTextChange = useCallback((value) => {
    setTextDraft(value);
    lastAnswerModeRef.current = INPUT_MODES.TEXT;
    setActiveInputMode(INPUT_MODES.TEXT);
    setVoiceFeedback(null);

    if (!currentQ) return;
    // Critical Requirement: Treat typed input as a COMPLETE FREE-FORM answer!
    // Do NOT keyword-match against options or auto-select predefined options.
    const trimmed = value.trim();
    setAnswer(currentQ.id, trimmed, INPUT_MODES.TEXT);
  }, [currentQ, setAnswer]);

  // ── 8. Explicit Option Selection (TOUCH ONLY) ──────────────────────────────
  const handleSelectOption = useCallback((optionValue, optionLabel) => {
    if (!currentQ || isSubmitting) return;
    lastAnswerModeRef.current = INPUT_MODES.TOUCH;
    setActiveInputMode(INPUT_MODES.TOUCH);
    setVoiceFeedback(null);

    if (currentQ.question_type === 'MULTIPLE_CHOICE') {
      const currentSelections = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
      const isNone = (val) => {
        const s = String(val).toLowerCase();
        return s === 'none' || s.includes('none of these') || s.includes('none of the above');
      };

      let updated;
      if (isNone(optionValue)) {
        updated = currentSelections.includes(optionValue) ? [] : [optionValue];
      } else {
        const withoutNone = currentSelections.filter(v => !isNone(v));
        if (withoutNone.includes(optionValue)) {
          updated = withoutNone.filter((v) => v !== optionValue);
        } else {
          updated = [...withoutNone, optionValue];
        }
      }
      setAnswer(currentQ.id, updated, INPUT_MODES.TOUCH);
      setTextDraft(updated.join(', '));
    } else {
      // Single choice / Scale / Yes-No / Duration:
      // Tapping explicitly sets this specific option
      setAnswer(currentQ.id, optionValue, INPUT_MODES.TOUCH);
      setTextDraft(optionLabel || String(optionValue));
    }
  }, [currentQ, currentAnswer, isSubmitting, setAnswer]);

  // ── 9. Navigation: Next / Complete ─────────────────────────────────────────
  const handleNext = useCallback(async () => {
    if (!currentQ || isSubmitting) return;

    if (currentQ.is_required && !isAnswered) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Free-form answers from text or voice use textDraft if present, else context answers
      let answerText = '';
      if (lastAnswerModeRef.current === INPUT_MODES.TEXT || lastAnswerModeRef.current === INPUT_MODES.VOICE) {
        answerText = textDraft.trim() || (Array.isArray(answers[currentQ.id]) ? answers[currentQ.id].join(', ') : String(answers[currentQ.id] || ''));
      } else {
        const raw = answers[currentQ.id];
        answerText = Array.isArray(raw) ? raw.join(', ') : String(raw ?? textDraft.trim());
      }

      const submissionInputMode = lastAnswerModeRef.current || (textDraft.trim() ? INPUT_MODES.TEXT : INPUT_MODES.TOUCH);

      // POST /api/sessions/{session_id}/responses
      await submitResponse(
        session?.id,
        currentQ.id,
        currentQ.question_key,
        answerText,
        submissionInputMode
      );

      // Append to local history transcript
      const questionLabel = isHindi && currentQ.question_text_hi
        ? currentQ.question_text_hi
        : currentQ.question_text;

      setHistory((prev) => [
        ...prev,
        { q: questionLabel, a: answerText }
      ]);

      voiceService.stopSpeaking();
      voiceService.stopListening();

      // Check if more questions remain
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Final Question: POST /api/sessions/{session_id}/complete
        await completeIntakeSession(session?.id);
        setCurrentStep('documents');
      }
    } catch (err) {
      console.error('[ConversationalAI] handleNext error:', err);
      setSubmitError(
        isHindi
          ? 'उत्तर सहेजने में त्रुटि। कृपया पुनः प्रयास करें।'
          : "Could not save response. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentQ,
    isAnswered,
    isSubmitting,
    answers,
    textDraft,
    session?.id,
    isHindi,
    currentQuestionIndex,
    totalQuestions,
    setCurrentQuestionIndex,
    setCurrentStep
  ]);

  // ── 10. Navigation: Previous ───────────────────────────────────────────────
  const handlePrev = useCallback(() => {
    voiceService.stopSpeaking();
    voiceService.stopListening();
    setHistory((prev) => prev.slice(0, -1));

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex, setCurrentQuestionIndex]);

  // ── RENDER: Loading State ──────────────────────────────────────────────────
  if (isLoadingQuestions) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto w-full px-4 py-20 flex flex-col items-center justify-center text-center gap-5"
      >
        <div className="w-16 h-16 rounded-full border-4 border-kiosk-coral border-t-transparent animate-spin" />
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-kiosk-charcoal">
            {isHindi ? 'स्वास्थ्य प्रश्न लोड हो रहे हैं…' : 'Loading health interview questions…'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isHindi ? 'बैकएंड से प्रश्नावली तैयार की जा रही है।' : 'Connecting to the clinical intake service.'}
          </p>
        </div>
      </motion.div>
    );
  }

  // ── RENDER: Error State ────────────────────────────────────────────────────
  if (questionError || !currentQ) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto w-full px-4 py-16 text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <WifiOff className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-kiosk-charcoal">
            {questionError || (isHindi ? 'कोई सक्रिय प्रश्न नहीं मिला।' : 'No active questions found.')}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isHindi ? 'कृपया पुनः प्रयास करें या सहायता बटन दबाएं।' : 'Please retry or request assistant help.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="coral"
            size="lg"
            icon={RefreshCw}
            onClick={loadInterviewData}
          >
            {isHindi ? 'पुनः प्रयास करें' : 'Retry Loading'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            icon={HelpCircle}
            onClick={() => setIsHelpModalOpen(true)}
          >
            {isHindi ? 'सहायता लें' : 'Get Help'}
          </Button>
        </div>
      </motion.div>
    );
  }

  const questionDisplay = isHindi && currentQ.question_text_hi
    ? currentQ.question_text_hi
    : currentQ.question_text;

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isMultipleChoice = currentQ.question_type === 'MULTIPLE_CHOICE';
  const isYesNo = currentQ.question_type === 'YES_NO';
  const isScale = currentQ.question_type === 'SCALE';
  const isDuration = currentQ.question_type === 'DURATION';

  // Only highlight an option if it was explicitly selected via TOUCH mode!
  const isOptionSelected = (optVal) => {
    if (lastAnswerModeRef.current !== INPUT_MODES.TOUCH) return false;
    if (isMultipleChoice) {
      return Array.isArray(currentAnswer) && currentAnswer.includes(optVal);
    }
    return String(currentAnswer) === String(optVal);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto w-full px-4 py-6 sm:py-8 space-y-6"
    >
      {/* Progress Bar & Question Counter */}
      <ProgressBar
        current={currentQuestionIndex + 1}
        total={totalQuestions}
        label={`${t('convaTitle')} — ${t('questionOf')} ${currentQuestionIndex + 1} ${t('of')} ${totalQuestions}`}
      />

      {/* Main Conversational Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-kiosk-md overflow-hidden">
        
        {/* Assistant Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-kiosk-coral text-white flex items-center justify-center shadow-kiosk-coral shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg sm:text-xl text-kiosk-charcoal leading-tight">
                {t('convaTitle')}
              </h2>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isHindi ? 'चिकित्सीय साक्षात्कार सक्रिय' : 'Active Medical Interview'}
              </span>
            </div>
          </div>

          {/* Audio Speaker Read-Aloud Button */}
          <button
            type="button"
            onClick={handleSpeakQuestion}
            className={`min-h-[44px] px-3.5 py-2 rounded-2xl border-2 font-bold text-sm transition-all flex items-center gap-2 touch-manipulation ${
              isSpeaking
                ? 'border-kiosk-coral bg-kiosk-coral-light text-kiosk-coral'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
            }`}
            aria-label={isSpeaking ? 'Stop reading' : 'Read question aloud'}
            title={isSpeaking ? 'Stop' : t('listenBtn')}
          >
            {isSpeaking ? <VolumeX className="w-5 h-5 shrink-0" /> : <Volume2 className="w-5 h-5 text-kiosk-coral shrink-0" />}
            <span className="hidden sm:inline text-xs sm:text-sm font-extrabold">
              {isSpeaking ? (isHindi ? 'रोकें' : 'Stop') : t('listenBtn')}
            </span>
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-6">

          {/* Previous Conversation History (Muted mini transcript) */}
          <AnimatePresence>
            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-50 rounded-2xl border border-slate-100 p-3.5 max-h-24 overflow-y-auto space-y-1.5"
              >
                {history.slice(-2).map((item, idx) => (
                  <div key={idx} className="opacity-75 text-xs sm:text-sm leading-snug">
                    <span className="font-semibold text-slate-500">MediKiosk: </span>
                    <span className="text-slate-600">{item.q}</span>
                    <span className="font-extrabold text-kiosk-blue ml-2">• {item.a}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Question Bubble */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
              className="bg-gradient-to-br from-kiosk-peach/50 via-white to-sky-50/40 p-6 sm:p-7 rounded-3xl border border-kiosk-peach-dark/30 shadow-kiosk-sm"
            >
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-kiosk-coral bg-kiosk-coral/10 px-2.5 py-0.5 rounded-full">
                  {currentQ.question_key.replace(/_/g, ' ')}
                </span>
                {currentQ.is_required && (
                  <span className="text-xs font-bold text-rose-600">
                    {isHindi ? '• आवश्यक' : '• Required'}
                  </span>
                )}
                {isMultipleChoice && (
                  <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {isHindi ? 'एक से अधिक चुन सकते हैं' : 'Select all that apply'}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-kiosk-charcoal tracking-tight leading-snug">
                {questionDisplay}
              </h1>
            </motion.div>
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* 1. PRIMARY INTERACTION SECTION — TYPE TEXT & VOICE (PROMINENT DOMINANT)  */}
          {/* ========================================================================= */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                {isHindi ? 'उत्तर देने का मुख्य माध्यम (Primary Interaction):' : 'Primary Answer Mode:'}
              </span>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <span>{isHindi ? 'सक्रिय माध्यम:' : 'Mode:'}</span>
                <span className={`px-2.5 py-0.5 rounded-lg uppercase font-black text-[11px] ${
                  lastAnswerModeRef.current === INPUT_MODES.VOICE
                    ? 'bg-rose-100 text-rose-700'
                    : lastAnswerModeRef.current === INPUT_MODES.TEXT
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {lastAnswerModeRef.current}
                </span>
              </span>
            </div>

            {/* Prominent 2-Column Primary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* PRIMARY BUTTON 1: VOICE INPUT */}
              <motion.button
                type="button"
                onClick={handleToggleListening}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative p-4 sm:p-5 rounded-3xl border-2 text-left transition-all
                  min-h-[82px] sm:min-h-[92px] touch-manipulation select-none flex items-center justify-between gap-4
                  ${voiceState === 'listening'
                    ? 'border-rose-600 bg-rose-50 text-rose-950 ring-4 ring-rose-500/20 shadow-lg'
                    : activeInputMode === INPUT_MODES.VOICE
                    ? 'border-kiosk-coral bg-gradient-to-br from-white to-kiosk-peach/50 text-kiosk-charcoal ring-2 ring-kiosk-coral/30 shadow-md'
                    : 'border-slate-200 bg-white hover:border-kiosk-coral/60 hover:bg-rose-50/30 text-kiosk-charcoal shadow-sm'
                  }
                `}
              >
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                    voiceState === 'listening'
                      ? 'bg-rose-600 text-white shadow-lg animate-pulse'
                      : 'bg-rose-100 text-kiosk-coral'
                  }`}>
                    <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <strong className="block text-base sm:text-lg font-black leading-tight text-kiosk-charcoal">
                      {voiceState === 'listening'
                        ? (isHindi ? 'सुन रहे हैं… अब बोलें' : 'Listening... Speak Now')
                        : (isHindi ? 'आवाज़ से बोलें (Voice)' : 'Speak with Voice')}
                    </strong>
                    <span className="text-xs sm:text-sm text-slate-500 font-medium block mt-0.5">
                      {voiceState === 'listening'
                        ? (isHindi ? 'समाप्त करने के लिए यहाँ टैप करें' : 'Tap here when finished speaking')
                        : (isHindi ? 'प्राकृतिक भाषा में बोलें' : 'Speak naturally in your language')}
                    </span>
                  </div>
                </div>

                {voiceState === 'listening' ? (
                  <span className="flex h-3.5 w-3.5 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600"></span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-kiosk-coral bg-kiosk-peach px-2.5 py-1 rounded-xl hidden sm:inline-block shrink-0">
                    {isHindi ? 'माइक' : 'Microphone'}
                  </span>
                )}
              </motion.button>

              {/* PRIMARY BUTTON 2: TYPE TEXT */}
              <motion.button
                type="button"
                onClick={() => {
                  setActiveInputMode(INPUT_MODES.TEXT);
                  lastAnswerModeRef.current = INPUT_MODES.TEXT;
                  setVoiceFeedback(null);
                  setTimeout(() => textInputRef.current?.focus(), 100);
                }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative p-4 sm:p-5 rounded-3xl border-2 text-left transition-all
                  min-h-[82px] sm:min-h-[92px] touch-manipulation select-none flex items-center justify-between gap-4
                  ${activeInputMode === INPUT_MODES.TEXT
                    ? 'border-kiosk-blue bg-gradient-to-br from-white to-sky-50 text-kiosk-charcoal ring-2 ring-kiosk-blue/30 shadow-md'
                    : 'border-slate-200 bg-white hover:border-kiosk-blue/60 hover:bg-sky-50/30 text-kiosk-charcoal shadow-sm'
                  }
                `}
              >
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                    activeInputMode === INPUT_MODES.TEXT
                      ? 'bg-kiosk-blue text-white shadow-md'
                      : 'bg-sky-100 text-kiosk-blue'
                  }`}>
                    <Keyboard className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <strong className="block text-base sm:text-lg font-black leading-tight text-kiosk-charcoal">
                      {isHindi ? 'टाइप करके लिखें (Type)' : 'Type with Keyboard'}
                    </strong>
                    <span className="text-xs sm:text-sm text-slate-500 font-medium block mt-0.5">
                      {isHindi ? 'कीबोर्ड से उत्तर विस्तार में लिखें' : 'Type your free-form answer'}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-kiosk-blue bg-sky-100 px-2.5 py-1 rounded-xl hidden sm:inline-block shrink-0">
                  {isHindi ? 'कीबोर्ड' : 'Keyboard'}
                </span>
              </motion.button>

            </div>
          </div>

          {/* Voice Error Notification */}
          {voiceState === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900"
            >
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-medium leading-relaxed">
                {isHindi
                  ? 'आवाज़ सेवा इस डिवाइस पर उपलब्ध नहीं है। आप कीबोर्ड से टाइप कर सकते हैं या नीचे दिए गए विकल्पों में से चुन सकते हैं।'
                  : 'Voice input is not available on this device or microphone access was blocked. You can type your answer or tap a suggestion below.'}
              </p>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* 2. MIDDLE SECTION — PATIENT'S ACTUAL ANSWER DISPLAY (PROMINENT FREE-FORM) */}
          {/* ========================================================================= */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-kiosk-blue" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  {isHindi ? "मरीज का उत्तर (Patient's Actual Answer):" : "Patient's Actual Answer:"}
                </span>
              </div>
              {textDraft.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setTextDraft('');
                    setAnswer(currentQ.id, '', INPUT_MODES.TEXT);
                    setVoiceFeedback(null);
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-rose-600 underline"
                >
                  {isHindi ? 'साफ़ करें (Clear)' : 'Clear Answer'}
                </button>
              )}
            </div>

            <textarea
              id="kiosk-actual-answer"
              ref={textInputRef}
              rows={3}
              value={textDraft}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={
                voiceState === 'listening'
                  ? (isHindi ? 'आवाज़ सुनी जा रही है… आपका वाक्य यहाँ दिखाई देगा…' : 'Listening to your voice... speak naturally in Hindi or English...')
                  : (isHindi ? 'यहाँ उत्तर टाइप करें या ऊपर "Voice" बटन दबाकर बोलें…' : 'Type your answer here, or tap "Speak with Voice" above...')
              }
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-kiosk-blue focus:ring-2 focus:ring-kiosk-blue/20 outline-none text-base sm:text-lg font-medium text-kiosk-charcoal bg-white transition-all shadow-xs resize-none"
            />

            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              {textDraft.trim() ? (
                <p className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isHindi ? 'पूर्ण उत्तर दर्ज है (आगे बढ़ने के लिए Next दबाएं)' : 'Complete answer captured (Press Next to continue)'}
                  </span>
                </p>
              ) : (
                <p className="text-slate-400 font-medium italic">
                  {isHindi ? 'बोलें, टाइप करें या नीचे दिए गए सुझावों में से चुनें।' : 'Speak naturally, type your response, or choose a quick shortcut below.'}
                </p>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. THIRD SECTION — SUGGESTED OPTIONS (VISUALLY SMALLER AND SECONDARY)     */}
          {/* ========================================================================= */}
          {currentQ.hasOptions && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Touchpad className="w-3.5 h-3.5 text-slate-400" />
                  {isHindi ? 'सुझाए गए विकल्प (वैकल्पिक शॉर्टकट):' : 'Suggested Options (Optional Quick Tap Shortcuts):'}
                </span>
                <span className="text-[11px] text-slate-400 italic">
                  {isHindi ? 'केवल टैप करने पर लागू' : 'Applies only if tapped'}
                </span>
              </div>

              {/* 1. MULTIPLE CHOICE (Secondary Compact Cards) */}
              {isMultipleChoice && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {currentQ.options.map((opt) => {
                    const isSelected = isOptionSelected(opt.option_value);
                    const labelDisplay = isHindi && opt.option_label_hi ? opt.option_label_hi : opt.option_label;

                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.option_value, labelDisplay)}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting}
                        className={`
                          p-3 rounded-xl border text-left transition-all
                          min-h-[48px] touch-manipulation select-none flex items-center justify-between gap-2.5 text-sm sm:text-base font-semibold
                          ${isSelected
                            ? 'border-kiosk-blue bg-kiosk-blue-light/70 text-kiosk-blue font-bold shadow-xs'
                            : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 text-slate-700'
                          }
                        `}
                      >
                        <span className="flex-1 leading-snug">{labelDisplay}</span>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'border-kiosk-blue bg-kiosk-blue text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* 2. SCALE / RATING (Secondary Compact Pills) */}
              {isScale && (
                <div>
                  {currentQ.options.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {currentQ.options.map((opt) => {
                        const isSelected = isOptionSelected(opt.option_value);
                        const labelDisplay = isHindi && opt.option_label_hi ? opt.option_label_hi : opt.option_label;

                        return (
                          <motion.button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(opt.option_value, labelDisplay)}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSubmitting}
                            className={`
                              p-3 rounded-xl border text-left transition-all min-h-[54px]
                              touch-manipulation select-none flex items-center justify-between gap-2 text-sm font-semibold
                              ${isSelected
                                ? 'border-kiosk-coral bg-rose-50 text-kiosk-coral font-bold ring-1 ring-kiosk-coral shadow-xs'
                                : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 text-slate-700'
                              }
                            `}
                          >
                            <span className="leading-snug">{labelDisplay}</span>
                            {isSelected && <Check className="w-4 h-4 text-kiosk-coral shrink-0 stroke-[3]" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                      {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((num) => {
                        const isSelected = isOptionSelected(num);
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleSelectOption(num, `Level ${num}`)}
                            className={`h-11 rounded-xl border font-bold text-sm transition-all flex items-center justify-center touch-manipulation ${
                              isSelected
                                ? 'bg-kiosk-coral text-white border-kiosk-coral shadow-xs'
                                : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 3. DURATION (Secondary Compact Options) */}
              {isDuration && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(currentQ.options.length > 0 ? currentQ.options : [
                    { id: 'd1', option_value: 'Today (< 24 hrs)', option_label: 'Today (< 24 hrs)', option_label_hi: 'आज (24 घंटे से कम)' },
                    { id: 'd2', option_value: '2 to 3 days', option_label: '2 to 3 days', option_label_hi: '2 से 3 दिन' },
                    { id: 'd3', option_value: '1 week', option_label: '1 week', option_label_hi: '1 सप्ताह' },
                    { id: 'd4', option_value: 'More than a week', option_label: 'More than a week', option_label_hi: 'एक सप्ताह से अधिक' }
                  ]).map((opt) => {
                    const isSelected = isOptionSelected(opt.option_value);
                    const labelDisplay = isHindi && opt.option_label_hi ? opt.option_label_hi : opt.option_label;

                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.option_value, labelDisplay)}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting}
                        className={`
                          p-3 rounded-xl border text-left transition-all min-h-[48px]
                          touch-manipulation select-none flex items-center justify-between gap-2 text-sm font-semibold
                          ${isSelected
                            ? 'border-kiosk-coral bg-rose-50 text-kiosk-coral font-bold shadow-xs'
                            : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 text-slate-700'
                          }
                        `}
                      >
                        <span className="leading-snug">{labelDisplay}</span>
                        {isSelected && <Check className="w-4 h-4 text-kiosk-coral shrink-0 stroke-[3]" />}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* 4. YES / NO (Secondary Compact Options) */}
              {isYesNo && (
                <div className="grid grid-cols-2 gap-3">
                  {currentQ.options.map((opt) => {
                    const isSelected = isOptionSelected(opt.option_value);
                    const isYes = opt.option_value.toUpperCase() === 'YES' || opt.option_label.toLowerCase().includes('yes');
                    const labelDisplay = isHindi && opt.option_label_hi ? opt.option_label_hi : opt.option_label;

                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.option_value, labelDisplay)}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting}
                        className={`
                          p-3.5 rounded-xl border-2 text-left transition-all min-h-[54px]
                          touch-manipulation select-none flex items-center justify-between gap-3 text-base font-bold
                          ${isSelected
                            ? isYes
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                              : 'border-rose-600 bg-rose-50 text-rose-900 shadow-xs'
                            : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 text-slate-700'
                          }
                        `}
                      >
                        <span className="leading-snug">{labelDisplay}</span>
                        {isSelected && <Check className="w-4 h-4 shrink-0 stroke-[3]" />}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* 5. SINGLE CHOICE / OTHER (Secondary Compact Options) */}
              {!isMultipleChoice && !isScale && !isDuration && !isYesNo && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {currentQ.options.map((opt) => {
                    const isSelected = isOptionSelected(opt.option_value);
                    const labelDisplay = isHindi && opt.option_label_hi ? opt.option_label_hi : opt.option_label;

                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.option_value, labelDisplay)}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting}
                        className={`
                          p-3 rounded-xl border text-left transition-all min-h-[48px]
                          touch-manipulation select-none flex items-center justify-between gap-2 text-sm sm:text-base font-semibold
                          ${isSelected
                            ? 'border-kiosk-coral bg-rose-50 text-kiosk-coral font-bold shadow-xs'
                            : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 text-slate-700'
                          }
                        `}
                      >
                        <span className="leading-snug">{labelDisplay}</span>
                        {isSelected && <Check className="w-4 h-4 text-kiosk-coral shrink-0 stroke-[3]" />}
                      </motion.button>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* Save/Submission Error Banner */}
          {submitError && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-900">
              <div className="flex items-center gap-2 text-sm font-bold">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {isHindi ? 'पुनः प्रयास' : 'Retry'}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Navigation Buttons: Previous & Next/Continue */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0 || isSubmitting}
          icon={ArrowLeft}
          iconPosition="left"
        >
          {t('previousQuestion')}
        </Button>

        <Button
          variant="coral"
          size="xl"
          onClick={handleNext}
          disabled={(currentQ.is_required && !isAnswered) || isSubmitting}
          icon={isSubmitting ? undefined : (isLastQuestion ? Check : ArrowRight)}
          iconPosition="right"
          className={isSubmitting ? 'opacity-80' : ''}
        >
          {isSubmitting
            ? (isHindi ? 'सहेज रहे हैं…' : 'Saving response…')
            : isLastQuestion
            ? (isHindi ? 'साक्षात्कार संपन्न (दस्तावेज़) →' : 'Complete Interview (Documents) →')
            : (!isAnswered && !currentQ.is_required)
            ? (isHindi ? 'आगे बढ़ें (छोड़ें) →' : 'Next / Skip →')
            : t('nextQuestion')}
        </Button>
      </div>
    </motion.div>
  );
}
