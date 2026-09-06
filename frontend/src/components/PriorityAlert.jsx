import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Clock, CheckCircle, AlertTriangle, ArrowRight, Info } from 'lucide-react';
import { Button } from './Button';

/**
 * PriorityAlert — Screen 8 — Red-Flag / Priority State
 * 
 * This is a CONDITIONAL STATE rendered inside the interview flow,
 * not a separate page. It appears after a high- or moderate-priority
 * answer pattern is detected, giving the patient clear, calm guidance.
 *
 * Props:
 *  - priorityState: 'NORMAL' | 'PRIORITY' | 'URGENT'  (from backend or mockTriage adapter)
 *  - flaggedSymptoms: string[]   — symptoms flagged (from triage engine, not diagnosed here)
 *  - messageEn: string           — optional backend-provided message (English)
 *  - messageHi: string           — optional backend-provided message (Hindi)
 *  - onContinue: () => void      — proceed to next question / review
 *  - onCallStaff: () => void     — notify staff immediately
 *  - language: 'en' | 'hi'
 *  - isHindi: boolean
 */
export function PriorityAlert({
  priorityState = 'NORMAL',
  flaggedSymptoms = [],
  messageEn,
  messageHi,
  onContinue,
  onCallStaff,
  language = 'en',
  isHindi = false,
}) {
  if (priorityState === 'NORMAL') return null;

  const isUrgent = priorityState === 'URGENT';

  const config = {
    URGENT: {
      wrapperClass: 'border-rose-200 bg-rose-50',
      badgeClass: 'bg-rose-600 text-white',
      iconBgClass: 'bg-rose-100 text-rose-600',
      textClass: 'text-rose-900',
      subtextClass: 'text-rose-800',
      Icon: ShieldAlert,
      badgeEn: 'Urgent Attention Recommended',
      badgeHi: 'तत्काल ध्यान आवश्यक',
      headingEn: 'Your responses may need prompt attention',
      headingHi: 'आपकी प्रतिक्रियाओं पर शीघ्र ध्यान देने की जरूरत हो सकती है',
      defaultMsgEn: 'Based on your answers, our system recommends that a healthcare professional review your situation promptly. Please continue to complete your intake or ask staff for immediate assistance.',
      defaultMsgHi: 'आपके उत्तरों के आधार पर, हमारी प्रणाली अनुशंसा करती है कि एक स्वास्थ्य सेवा पेशेवर जल्द ही आपकी स्थिति की समीक्षा करे।',
      ctaEn: 'Continue & Complete Intake',
      ctaHi: 'जारी रखें और इनटेक पूरा करें',
      staffEn: 'Call Staff Now',
      staffHi: 'अभी स्टाफ बुलाएं',
      ctaVariant: 'coral',
    },
    PRIORITY: {
      wrapperClass: 'border-amber-200 bg-amber-50',
      badgeClass: 'bg-amber-600 text-white',
      iconBgClass: 'bg-amber-100 text-amber-700',
      textClass: 'text-amber-950',
      subtextClass: 'text-amber-900',
      Icon: Clock,
      badgeEn: 'Priority Queue Recommended',
      badgeHi: 'प्राथमिकता कतार अनुशंसित',
      headingEn: 'We recommend timely medical evaluation',
      headingHi: 'हम समय पर चिकित्सा मूल्यांकन की सलाह देते हैं',
      defaultMsgEn: 'Your symptom pattern suggests a timely consultation is advisable. Please finish the intake form so we can prepare your priority queue token.',
      defaultMsgHi: 'आपके लक्षण यह सुझाव देते हैं कि समय पर परामर्श उचित है। कृपया हमारी प्राथमिकता कतार टोकन तैयार करने के लिए इनटेक फ़ॉर्म पूरा करें।',
      ctaEn: 'Continue Intake',
      ctaHi: 'इनटेक जारी रखें',
      staffEn: 'Request Staff Help',
      staffHi: 'स्टाफ से सहायता माँगें',
      ctaVariant: 'blue',
    },
  };

  const c = config[priorityState] || config.PRIORITY;
  const Icon = c.Icon;

  const heading = isHindi ? c.headingHi : c.headingEn;
  const message = isHindi
    ? (messageHi || c.defaultMsgHi)
    : (messageEn || c.defaultMsgEn);

  return (
    <AnimatePresence>
      <motion.div
        key="priority-alert"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`rounded-3xl border-2 p-5 sm:p-7 ${c.wrapperClass} shadow-kiosk-md`}
        role="alert"
        aria-live="assertive"
      >
        {/* Badge + Icon Row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${c.badgeClass}`}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden />
            {isHindi ? c.badgeHi : c.badgeEn}
          </span>

          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${c.iconBgClass}`}>
            <Icon className="w-6 h-6 stroke-[2.5]" aria-hidden />
          </div>
        </div>

        {/* Heading */}
        <h3 className={`text-xl sm:text-2xl font-extrabold mb-2 ${c.textClass}`}>
          {heading}
        </h3>

        {/* Body message (backend-supplied or default) */}
        <p className={`text-sm sm:text-base font-medium leading-relaxed mb-4 ${c.subtextClass}`}>
          {message}
        </p>

        {/* Flagged symptoms list (backend-provided, no frontend diagnosis) */}
        {flaggedSymptoms.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/80 mb-5">
            <span className={`text-xs font-extrabold uppercase tracking-wide block mb-2 ${c.textClass}`}>
              {isHindi ? 'नोट किए गए लक्षण:' : 'Symptoms noted:'}
            </span>
            <ul className="space-y-1">
              {flaggedSymptoms.map((sym, i) => (
                <li key={i} className={`text-sm font-semibold flex items-center gap-2 ${c.subtextClass}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" aria-hidden />
                  {sym}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer — mandatory non-diagnostic notice */}
        <div className="flex items-start gap-2 bg-white/50 rounded-xl px-3 py-2.5 mb-5 border border-white/60">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-slate-600" aria-hidden />
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {isHindi
              ? 'यह जानकारी केवल कतार प्राथमिकता मार्गदर्शन के लिए है और चिकित्सा निदान नहीं है।'
              : 'This information is for queue priority guidance only and does not constitute a medical diagnosis.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            variant={c.ctaVariant}
            size="lg"
            fullWidth
            onClick={onContinue}
            icon={ArrowRight}
            iconPosition="right"
          >
            {isHindi ? c.ctaHi : c.ctaEn}
          </Button>

          {isUrgent && onCallStaff && (
            <Button
              variant="outline"
              size="lg"
              onClick={onCallStaff}
              className="border-rose-300 hover:border-rose-400 hover:text-rose-700"
            >
              {isHindi ? c.staffHi : c.staffEn}
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
