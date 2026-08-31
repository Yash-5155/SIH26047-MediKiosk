import React from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { QUESTIONS } from '../data/questions';
import { ArrowLeft, Edit2, CheckCircle2, User, FileText, ArrowRight } from 'lucide-react';

export function Review() {
  const { 
    language, 
    patient, 
    answers, 
    setCurrentStep, 
    setCurrentQuestionIndex, 
    t 
  } = useKiosk();

  const isHindi = language === 'hi';

  const handleEditDetails = () => {
    setCurrentStep('details');
  };

  const handleEditQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setCurrentStep('questionnaire');
  };

  const handleSubmit = () => {
    setCurrentStep('processing');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto w-full px-4 py-6 sm:py-8"
    >
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-kiosk-charcoal tracking-tight mb-2">
          {t('reviewTitle')}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          {t('reviewSubtitle')}
        </p>
      </div>

      <div className="space-y-6 mb-8">
        
        {/* Patient Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-kiosk-coral-light text-kiosk-coral flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-kiosk-charcoal">
                {t('patientDetailsSection')}
              </h2>
            </div>
            <button
              onClick={handleEditDetails}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all"
            >
              <Edit2 className="w-4 h-4" />
              <span>{t('editBtn')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-base">
            <div>
              <span className="text-slate-400 text-xs uppercase font-bold tracking-wider block mb-1">
                {t('fullNameLabel')}
              </span>
              <span className="font-extrabold text-kiosk-charcoal text-lg">
                {patient.fullName || '—'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-xs uppercase font-bold tracking-wider block mb-1">
                {t('ageLabel')}
              </span>
              <span className="font-extrabold text-kiosk-charcoal text-lg">
                {patient.age ? `${patient.age} yrs` : '—'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-xs uppercase font-bold tracking-wider block mb-1">
                {t('genderLabel')}
              </span>
              <span className="font-extrabold text-kiosk-charcoal text-lg capitalize">
                {patient.gender ? patient.gender.replace('_', ' ') : '—'}
              </span>
            </div>

            {patient.phone && (
              <div>
                <span className="text-slate-400 text-xs uppercase font-bold tracking-wider block mb-1">
                  {t('phoneLabel')}
                </span>
                <span className="font-extrabold text-kiosk-charcoal text-lg">
                  {patient.phone}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Questionnaire Answers Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-kiosk-blue-light text-kiosk-blue flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-kiosk-charcoal">
              {t('symptomsSection')}
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {QUESTIONS.map((q, idx) => {
              const ansVal = answers[q.id];
              let displayAnswer = '—';

              if (ansVal !== undefined && ansVal !== null) {
                if (Array.isArray(ansVal)) {
                  displayAnswer = ansVal.map(id => {
                    const opt = q.options.find(o => o.id === id);
                    return opt ? (isHindi ? opt.labelHi : opt.labelEn) : id;
                  }).join(', ');
                } else {
                  const opt = q.options.find(o => o.id === ansVal);
                  displayAnswer = opt ? (isHindi ? opt.labelHi : opt.labelEn) : ansVal;
                }
              }

              return (
                <div key={q.id} className="py-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Q{idx + 1}. {q.category}
                    </span>
                    <p className="font-bold text-slate-800 text-base mb-1">
                      {isHindi ? q.textHi : q.textEn}
                    </p>
                    <p className="text-kiosk-blue font-extrabold text-base flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-kiosk-blue shrink-0" />
                      {displayAnswer}
                    </p>
                  </div>

                  <button
                    onClick={() => handleEditQuestion(idx)}
                    className="p-2 rounded-xl text-slate-400 hover:text-kiosk-coral hover:bg-kiosk-peach-dark/30 transition-all shrink-0"
                    title={t('editBtn')}
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentStep('questionnaire')}
          icon={ArrowLeft}
          iconPosition="left"
        >
          {t('backBtn')}
        </Button>

        <Button
          variant="coral"
          size="xl"
          onClick={handleSubmit}
          icon={ArrowRight}
          iconPosition="right"
        >
          {t('submitHealthCheck')}
        </Button>
      </div>
    </motion.div>
  );
}
