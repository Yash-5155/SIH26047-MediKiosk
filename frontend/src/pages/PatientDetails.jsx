import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { User, Calendar, Phone, Activity, ArrowLeft, ArrowRight, Minus, Plus, AlertCircle, Camera, CreditCard } from 'lucide-react';

export function PatientDetails() {
  const { patient, updatePatient, setCurrentStep, t } = useKiosk();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (data = patient) => {
    const errs = {};
    if (!data.fullName || !data.fullName.trim()) {
      errs.fullName = t('fullNameRequired');
    }
    const ageNum = Number(data.age);
    if (!data.age || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      errs.age = t('ageRequired');
    }
    if (data.phone && data.phone.trim()) {
      const phoneClean = data.phone.trim().replace(/\D/g, '');
      if (phoneClean.length !== 10) {
        errs.phone = t('phoneInvalid');
      }
    }
    return errs;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleChange = (field, value) => {
    const updated = { ...patient, [field]: value };
    updatePatient(field, value);
    if (touched[field]) {
      setErrors(validate(updated));
    }
  };

  const handleAgeAdjust = (delta) => {
    const current = Number(patient.age) || 30;
    const next = Math.min(120, Math.max(1, current + delta));
    handleChange('age', String(next));
  };

  const handleToggleCondition = (condId) => {
    let currentConds = [...(patient.conditions || [])];
    if (condId === 'none') {
      currentConds = ['none'];
    } else {
      currentConds = currentConds.filter(c => c !== 'none');
      if (currentConds.includes(condId)) {
        currentConds = currentConds.filter(c => c !== condId);
      } else {
        currentConds.push(condId);
      }
    }
    handleChange('conditions', currentConds);
  };

  const currentErrors = validate();
  const isValid = Object.keys(currentErrors).length === 0;

  const handleNext = () => {
    const errs = validate();
    setErrors(errs);
    setTouched({ fullName: true, age: true, phone: true });
    if (Object.keys(errs).length === 0) {
      setCurrentStep('conversation');
    }
  };

  const genderOptions = [
    { id: 'male', label: t('genderMale') },
    { id: 'female', label: t('genderFemale') },
    { id: 'other', label: t('genderOther') },
    { id: 'prefer_not', label: t('genderPreferNot') }
  ];

  const conditionOptions = [
    { id: 'hypertension', label: t('condHypertension') },
    { id: 'diabetes', label: t('condDiabetes') },
    { id: 'asthma', label: t('condAsthma') },
    { id: 'heart', label: t('condHeart') },
    { id: 'pregnancy', label: t('condPregnancy') },
    { id: 'none', label: t('condNone') }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto w-full px-4 py-6 sm:py-8"
    >
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-kiosk-charcoal tracking-tight mb-2">
          {t('patientInfoTitle')}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          {t('patientInfoSubtitle')}
        </p>
      </div>

      {/* Quick Document Scan Banner Trigger */}
      <div className="bg-gradient-to-r from-kiosk-peach/60 via-white to-sky-50 p-4 sm:p-5 rounded-3xl border border-kiosk-peach-dark/40 shadow-kiosk-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-kiosk-coral text-white flex items-center justify-center shrink-0 shadow-kiosk-coral">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-kiosk-charcoal text-base sm:text-lg">Have a Health Card / ABHA ID?</h3>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">Scan document to automatically fill patient details</p>
          </div>
        </div>

        <Button
          variant="coral"
          size="md"
          onClick={() => setCurrentStep('documentscan')}
          icon={Camera}
          iconPosition="left"
          className="shrink-0 w-full sm:w-auto"
        >
          {t('scanDocBtn')}
        </Button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-kiosk-md space-y-8 mb-8">
        
        {/* Full Name Input */}
        <div>
          <label className="flex items-center gap-2 text-lg font-bold text-kiosk-charcoal mb-2">
            <User className="w-5 h-5 text-kiosk-coral" />
            {t('fullNameLabel')} <span className="text-kiosk-coral">*</span>
          </label>
          <input
            type="text"
            value={patient.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            placeholder={t('fullNamePlaceholder')}
            className={`
              w-full h-16 px-6 text-xl rounded-2xl border-2 transition-all outline-none font-medium text-kiosk-charcoal bg-slate-50/50 focus:bg-white
              ${errors.fullName && touched.fullName
                ? 'border-rose-400 focus:ring-4 focus:ring-rose-100'
                : 'border-slate-200 focus:border-kiosk-coral focus:ring-4 focus:ring-kiosk-coral/10'
              }
            `}
          />
          {errors.fullName && touched.fullName && (
            <p className="flex items-center gap-1.5 text-rose-600 text-sm font-semibold mt-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Age Selector */}
        <div>
          <label className="flex items-center gap-2 text-lg font-bold text-kiosk-charcoal mb-2">
            <Calendar className="w-5 h-5 text-kiosk-blue" />
            {t('ageLabel')} <span className="text-kiosk-coral">*</span>
          </label>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleAgeAdjust(-1)}
              className="w-16 h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 text-kiosk-charcoal flex items-center justify-center text-2xl font-bold transition-all active:scale-95 border border-slate-200"
            >
              <Minus className="w-6 h-6" />
            </button>

            <input
              type="number"
              min="1"
              max="120"
              value={patient.age}
              onChange={(e) => handleChange('age', e.target.value)}
              onBlur={() => handleBlur('age')}
              placeholder="e.g. 35"
              className={`
                flex-1 h-16 text-center text-2xl font-bold rounded-2xl border-2 transition-all outline-none text-kiosk-charcoal bg-slate-50/50 focus:bg-white
                ${errors.age && touched.age
                  ? 'border-rose-400 focus:ring-4 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-kiosk-coral focus:ring-4 focus:ring-kiosk-coral/10'
                }
              `}
            />

            <button
              type="button"
              onClick={() => handleAgeAdjust(1)}
              className="w-16 h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 text-kiosk-charcoal flex items-center justify-center text-2xl font-bold transition-all active:scale-95 border border-slate-200"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Age Buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[18, 25, 35, 45, 60, 75].map((quickAge) => (
              <button
                key={quickAge}
                type="button"
                onClick={() => handleChange('age', String(quickAge))}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-sm transition-all border ${
                  Number(patient.age) === quickAge
                    ? 'bg-kiosk-blue text-white border-kiosk-blue'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {quickAge} yrs
              </button>
            ))}
          </div>

          {errors.age && touched.age && (
            <p className="flex items-center gap-1.5 text-rose-600 text-sm font-semibold mt-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.age}
            </p>
          )}
        </div>

        {/* Gender Choice Touch Cards */}
        <div>
          <label className="block text-lg font-bold text-kiosk-charcoal mb-3">
            {t('genderLabel')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {genderOptions.map((opt) => {
              const isSelected = patient.gender === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleChange('gender', opt.id)}
                  className={`
                    h-14 px-4 rounded-2xl font-bold text-sm sm:text-base border-2 transition-all flex items-center justify-center text-center touch-manipulation
                    ${isSelected
                      ? 'border-kiosk-coral bg-kiosk-coral-light text-kiosk-coral shadow-kiosk-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }
                  `}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Phone Number */}
        <div>
          <label className="flex items-center gap-2 text-lg font-bold text-kiosk-charcoal mb-2">
            <Phone className="w-5 h-5 text-slate-500" />
            {t('phoneLabel')}
          </label>
          <input
            type="tel"
            value={patient.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            placeholder={t('phonePlaceholder')}
            className={`
              w-full h-16 px-6 text-xl rounded-2xl border-2 transition-all outline-none font-medium text-kiosk-charcoal bg-slate-50/50 focus:bg-white
              ${errors.phone && touched.phone
                ? 'border-rose-400 focus:ring-4 focus:ring-rose-100'
                : 'border-slate-200 focus:border-kiosk-coral focus:ring-4 focus:ring-kiosk-coral/10'
              }
            `}
          />
          {errors.phone && touched.phone && (
            <p className="flex items-center gap-1.5 text-rose-600 text-sm font-semibold mt-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* Pre-existing Conditions */}
        <div>
          <label className="flex items-center gap-2 text-lg font-bold text-kiosk-charcoal mb-3">
            <Activity className="w-5 h-5 text-purple-600" />
            {t('conditionsLabel')}
          </label>
          <div className="flex flex-wrap gap-2.5">
            {conditionOptions.map((cond) => {
              const isSelected = (patient.conditions || []).includes(cond.id);
              return (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => handleToggleCondition(cond.id)}
                  className={`
                    px-4 py-3 rounded-2xl border-2 font-bold text-sm sm:text-base transition-all touch-manipulation
                    ${isSelected
                      ? 'border-kiosk-blue bg-kiosk-blue-light text-kiosk-blue shadow-kiosk-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }
                  `}
                >
                  {cond.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentStep('mode')}
          icon={ArrowLeft}
          iconPosition="left"
        >
          {t('backBtn')}
        </Button>

        <Button
          variant="coral"
          size="xl"
          onClick={handleNext}
          disabled={!isValid}
          icon={ArrowRight}
          iconPosition="right"
        >
          {t('continueBtn')}
        </Button>
      </div>
    </motion.div>
  );
}
