import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { mockApi } from '../services/mockApi';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';

export function Questionnaire() {
  const { 
    language, 
    answers, 
    setAnswer, 
    currentQuestionIndex, 
    setCurrentQuestionIndex, 
    setCurrentStep, 
    t 
  } = useKiosk();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getQuestions().then((qList) => {
      setQuestions(qList);
      setLoading(false);
    });
  }, []);

  if (loading || questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-kiosk-coral border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-bold text-lg">Loading questionnaire…</p>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isHindi = language === 'hi';

  const currentAnswer = answers[currentQ.id];

  const handleSelectOption = (optionId) => {
    if (currentQ.type === 'multiple_choice') {
      let selectedArray = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
      if (selectedArray.includes(optionId)) {
        selectedArray = selectedArray.filter(id => id !== optionId);
      } else {
        selectedArray.push(optionId);
      }
      setAnswer(currentQ.id, selectedArray);
    } else {
      setAnswer(currentQ.id, optionId);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentStep('review');
    }
  };

  const handlePrev = () => {
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
        label={`${t('healthCheckHeader')} — ${t('questionOf')} ${currentQuestionIndex + 1} ${t('of')} ${totalQuestions}`}
      />

      {/* Main Animated Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-kiosk-md mb-8 min-h-[360px] flex flex-col justify-between"
        >
          {/* Question Text */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-kiosk-peach text-kiosk-coral px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {currentQ.category}
              </span>
              {currentQ.redFlag && (
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> High Importance
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-kiosk-charcoal tracking-tight leading-snug mb-8">
              {isHindi ? currentQ.textHi : currentQ.textEn}
            </h2>
          </div>

          {/* Question Options */}
          <div className="space-y-3 sm:space-y-4">
            
            {/* Yes / No Buttons */}
            {currentQ.type === 'yes_no' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQ.options.map((opt) => {
                  const isSelected = currentAnswer === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        p-6 rounded-2xl border-2 font-bold text-xl sm:text-2xl transition-all flex items-center justify-between text-left min-h-[80px] touch-manipulation select-none
                        ${isSelected
                          ? 'border-kiosk-coral bg-kiosk-coral-light text-kiosk-coral shadow-kiosk-coral/20 shadow-lg'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-kiosk-charcoal'
                        }
                      `}
                    >
                      <span>{isHindi ? opt.labelHi : opt.labelEn}</span>
                      {isSelected && (
                        <div className="w-8 h-8 rounded-full bg-kiosk-coral text-white flex items-center justify-center shrink-0">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Severity Scale 1-4 */}
            {currentQ.type === 'severity_scale' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQ.options.map((opt) => {
                  const isSelected = currentAnswer === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        p-5 rounded-2xl border-2 transition-all text-left flex flex-col justify-between min-h-[96px] touch-manipulation select-none
                        ${isSelected
                          ? 'border-kiosk-coral bg-kiosk-coral-light text-kiosk-coral shadow-kiosk-coral/20 shadow-lg'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-kiosk-charcoal'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xl sm:text-2xl">
                          {isHindi ? opt.labelHi : opt.labelEn}
                        </span>
                        {isSelected && (
                          <div className="w-7 h-7 rounded-full bg-kiosk-coral text-white flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-kiosk-coral' : 'text-slate-500'}`}>
                        {isHindi ? opt.descriptionHi : opt.descriptionEn}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Single Choice / Multiple Choice Options */}
            {(currentQ.type === 'single_choice' || currentQ.type === 'multiple_choice') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {currentQ.options.map((opt) => {
                  const isSelected = currentQ.type === 'multiple_choice'
                    ? (Array.isArray(currentAnswer) && currentAnswer.includes(opt.id))
                    : currentAnswer === opt.id;

                  return (
                    <motion.button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        p-5 rounded-2xl border-2 font-bold text-lg sm:text-xl transition-all flex items-center justify-between text-left min-h-[64px] touch-manipulation select-none
                        ${isSelected
                          ? 'border-kiosk-blue bg-kiosk-blue-light text-kiosk-blue shadow-kiosk-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-kiosk-charcoal'
                        }
                      `}
                    >
                      <span>{isHindi ? opt.labelHi : opt.labelEn}</span>
                      {isSelected && (
                        <div className="w-7 h-7 rounded-full bg-kiosk-blue text-white flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

          </div>
        </motion.div>
      </AnimatePresence>

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
