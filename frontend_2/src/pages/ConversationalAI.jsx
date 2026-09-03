import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { QUESTIONS } from '../data/questions';
import { voiceService } from '../services/voiceService';
import { Activity, Mic, MicOff, Volume2, VolumeX, Check, ArrowRight, ArrowLeft, Bot, User } from 'lucide-react';

export function ConversationalAI() {
  const { 
    language, 
    answers, 
    setAnswer, 
    currentQuestionIndex, 
    setCurrentQuestionIndex, 
    setCurrentStep, 
    t 
  } = useKiosk();

  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'speaking' | 'error'
  const [transcript, setTranscript] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentQ = QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUESTIONS.length;
  const isHindi = language === 'hi';

  const questionText = isHindi
  ? currentQ.question_text_hi
  : currentQ.question_text_en;

  const questionType = currentQ.question_type;

  const currentAnswer = answers[currentQ.id];


  // Auto read question aloud if voice mode active or speaker pressed
  const handleSpeakQuestion = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      voiceService.speak(questionText, {
        language,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    }
  };

  // Start speech recognition listening
  const handleToggleListening = () => {
    if (voiceState === 'listening') {
      voiceService.stopListening();
      setVoiceState('idle');
    } else {
      voiceService.startListening({
        language,
        onResult: (text, isFinal) => {
          setTranscript(text);
          if (isFinal) {
            // Attempt simple voice matching with options
            matchVoiceAnswer(text);
          }
        },
        onStateChange: (state) => setVoiceState(state),
        onError: () => setVoiceState('error')
      });
    }
  };

  // Basic string match for voice answers
 const matchVoiceAnswer = (recognizedText) => {
  const text = recognizedText.toLowerCase().trim();

  // -------------------------
  // YES / NO QUESTIONS
  // -------------------------
  if (currentQ.question_type === 'YES_NO') {

    const yesWords = [
      'yes',
      'yeah',
      'yep',
      'haan',
      'han',
      'हां',
      'हाँ',
      'जी',
      'जी हाँ',
      'जी हां'
    ];

    const noWords = [
      'no',
      'nope',
      'nah',
      'nahi',
      'nahin',
      'नहीं',
      'नही'
    ];

    if (yesWords.some(word => text.includes(word))) {
      const option = currentQ.options.find(
        opt => opt.option_value === 'YES'
      );

      if (option) {
        handleSelectOption(option.id);
      }

      return;
    }

    if (noWords.some(word => text.includes(word))) {
      const option = currentQ.options.find(
        opt => opt.option_value === 'NO'
      );

      if (option) {
        handleSelectOption(option.id);
      }

      return;
    }
  }

  // -------------------------
  // SCALE QUESTIONS
  // -------------------------
  if (currentQ.question_type === 'SCALE') {

    const matchedOption = currentQ.options.find(option => {

      const value =
        option.option_value?.toLowerCase() || '';

      const english =
        option.option_label_en?.toLowerCase() || '';

      const hindi =
        option.option_label_hi?.toLowerCase() || '';

      return (
        text.includes(value) ||
        text.includes(english) ||
        text.includes(hindi)
      );
    });

    if (matchedOption) {
      handleSelectOption(matchedOption.id);
    }

    return;
  }

  // -------------------------
  // CHOICE / DURATION QUESTIONS
  // -------------------------
  if (
    currentQ.question_type === 'SINGLE_CHOICE' ||
    currentQ.question_type === 'MULTIPLE_CHOICE' ||
    currentQ.question_type === 'DURATION'
  ) {

    const matchedOption = currentQ.options.find(option => {

      const value =
        option.option_value?.toLowerCase() || '';

      const english =
        option.option_label_en?.toLowerCase() || '';

      const hindi =
        option.option_label_hi?.toLowerCase() || '';

      return (
        text.includes(value) ||
        text.includes(english) ||
        text.includes(hindi)
      );
    });

    if (matchedOption) {
      handleSelectOption(matchedOption.id);
    }
  }
};

  const handleSelectOption = (optionId) => {

  if (currentQ.question_type === 'MULTIPLE_CHOICE') {

    let selectedArray = Array.isArray(currentAnswer)
      ? [...currentAnswer]
      : [];

    if (selectedArray.includes(optionId)) {

      selectedArray = selectedArray.filter(
        id => id !== optionId
      );

    } else {

      selectedArray.push(optionId);

    }

    setAnswer(currentQ.id, selectedArray);

  } else {

    setAnswer(currentQ.id, optionId);

  }

  const selectedOption = currentQ.options.find(
    option => option.id === optionId
  );

  if (selectedOption) {

    const label = isHindi
      ? selectedOption.option_label_hi
      : selectedOption.option_label_en;

    setTranscriptHistory(prev => [
      ...prev,
      {
        q: questionText,
        a: label
      }
    ]);
  }
};

  const handleNext = () => {
    voiceService.stopSpeaking();
    voiceService.stopListening();

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentStep('review');
    }
  };

  const handlePrev = () => {
    voiceService.stopSpeaking();
    voiceService.stopListening();

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      setCurrentStep('details');
    }
  };

  const isAnswered = currentAnswer !== undefined && currentAnswer !== null && 
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto w-full px-4 py-6 sm:py-8"
    >
      {/* Progress Bar */}
      <ProgressBar
        current={currentQuestionIndex + 1}
        total={totalQuestions}
        label={`${t('convaTitle')} — ${t('questionOf')} ${currentQuestionIndex + 1} ${t('of')} ${totalQuestions}`}
      />

      {/* Main Conversational Layout */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md mb-8 space-y-6">
        
        {/* Assistant Header & Voice Control Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-kiosk-coral text-white flex items-center justify-center shadow-kiosk-coral">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-kiosk-charcoal">
                {t('convaTitle')}
              </h2>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Conversational AI
              </span>
            </div>
          </div>

          {/* Audio TTS Speaker Toggle */}
          <button
            onClick={handleSpeakQuestion}
            className={`p-3 rounded-2xl border-2 font-bold text-sm transition-all flex items-center gap-2 ${
              isSpeaking
                ? 'border-kiosk-coral bg-kiosk-coral-light text-kiosk-coral'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
            }`}
            title="Read question aloud / सवाल सुनें"
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-kiosk-coral" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Stop' : t('listenBtn')}</span>
          </button>
        </div>

        {/* Compact History Transcript (Older Q&A muted) */}
        {transcriptHistory.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-32 overflow-y-auto space-y-2 text-xs sm:text-sm">
            {transcriptHistory.slice(-2).map((item, idx) => (
              <div key={idx} className="opacity-75">
                <p className="font-semibold text-slate-500">MediKiosk: {item.q}</p>
                <p className="font-bold text-kiosk-blue">You: {item.a}</p>
              </div>
            ))}
          </div>
        )}

        {/* Active Question Bubble */}
        <div className="bg-gradient-to-r from-kiosk-peach/40 via-white to-sky-50 p-6 rounded-3xl border border-kiosk-peach-dark/30 shadow-kiosk-sm">
          <span className="text-xs font-bold text-kiosk-coral uppercase tracking-wider block mb-1">
            {t('questionOf')} {currentQuestionIndex + 1} {t('of')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal tracking-tight leading-snug">
            {questionText}
          </h2>
        </div>

        {/* Voice Visualizer Status Bar */}
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleListening}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                voiceState === 'listening'
                  ? 'bg-rose-600 text-white shadow-lg animate-pulse'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {voiceState === 'listening' ? <Mic className="w-6 h-6 animate-bounce" /> : <MicOff className="w-6 h-6" />}
            </button>
            <div>
              <span className="text-sm font-bold text-kiosk-charcoal block">
                {voiceState === 'listening' ? t('listeningState') : t('speakInstruction')}
              </span>
              {transcript && (
                <span className="text-xs text-kiosk-blue font-semibold">
                  Heard: "{transcript}"
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Touch Option Cards (Integrated for seamless Voice OR Touch selection) */}
        <div className="space-y-3 pt-2">
          {currentQ.question_type === 'YES_NO' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((opt) => {
                const isSelected = currentAnswer === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`
                      p-5 rounded-2xl border-2 font-bold text-xl sm:text-2xl transition-all flex items-center justify-between text-left min-h-[72px] touch-manipulation select-none
                      ${isSelected
                        ? 'border-kiosk-coral bg-kiosk-coral-light text-kiosk-coral shadow-kiosk-coral/20 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-kiosk-charcoal'
                      }
                    `}
                  >
                    <span>{isHindi ? opt.option_label_hi : opt.option_label_en}</span>
                    {isSelected && (
                      <div className="w-7 h-7 rounded-full bg-kiosk-coral text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {(currentQ.question_type === 'SINGLE_CHOICE' || currentQ.question_type === 'SCALE' || currentQ.question_type === 'MULTIPLE_CHOICE') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt) => {
                const isSelected = currentQ.question_type === 'MULTIPLE_CHOICE'
                  ? (Array.isArray(currentAnswer) && currentAnswer.includes(opt.id))
                  : currentAnswer === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`
                      p-4 rounded-2xl border-2 font-bold text-base sm:text-lg transition-all flex items-center justify-between text-left min-h-[60px] touch-manipulation select-none
                      ${isSelected
                        ? 'border-kiosk-blue bg-kiosk-blue-light text-kiosk-blue shadow-kiosk-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-kiosk-charcoal'
                      }
                    `}
                  >
                    <span>{isHindi ? opt.option_label_hi : opt.option_label_en}</span>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-kiosk-blue text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrev}
          icon={ArrowLeft}
          iconPosition="left"
        >
          {t('previousQuestion')}
        </Button>

        <Button
          variant="coral"
          size="xl"
          onClick={handleNext}
          disabled={!isAnswered}
          icon={ArrowRight}
          iconPosition="right"
        >
          {currentQuestionIndex === totalQuestions - 1 ? t('reviewTitle') : t('nextQuestion')}
        </Button>
      </div>
    </motion.div>
  );
}
