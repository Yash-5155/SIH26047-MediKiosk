import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { mockAuth } from '../services/mockAuth';
import { UserCog, Lock, Mail, Key, Sparkles, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

export function StaffLogin() {
  const { setStaffUser, setStaffAuthenticated, setCurrentStep, t } = useKiosk();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFillDemo = () => {
    const demo = mockAuth.getDemoCredentials();
    setEmail(demo.email);
    setPassword(demo.password);
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await mockAuth.login(email, password);
      setStaffUser(res.user);
      setStaffAuthenticated(true);
      setCurrentStep('staffdashboard');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-md mx-auto w-full px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"
    >
      {/* Staff Icon Badge */}
      <div className="w-20 h-20 rounded-3xl bg-kiosk-blue text-white flex items-center justify-center mb-6 shadow-kiosk-md">
        <UserCog className="w-10 h-10 stroke-[2]" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-kiosk-charcoal tracking-tight text-center mb-2">
        {t('staffLoginTitle')}
      </h1>
      <p className="text-slate-600 text-sm sm:text-base text-center mb-8">
        {t('staffLoginSubtitle')}
      </p>

      {/* Demo Credentials Quick Pill */}
      <button
        type="button"
        onClick={handleFillDemo}
        className="w-full mb-6 p-3 rounded-2xl bg-kiosk-peach border border-kiosk-peach-dark/40 text-kiosk-coral font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-kiosk-peach-dark/40 transition-all"
      >
        <Sparkles className="w-4 h-4" />
        <span>{t('demoFillBtn')} (dr.sharma@medikiosk.in)</span>
      </button>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md space-y-5 mb-6">
        
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-kiosk-charcoal mb-2">
            <Mail className="w-4 h-4 text-kiosk-blue" />
            {t('emailLabel')}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="dr.sharma@medikiosk.in"
            className="w-full h-14 px-4 text-base rounded-2xl border-2 border-slate-200 focus:border-kiosk-coral outline-none font-medium text-kiosk-charcoal bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-kiosk-charcoal mb-2">
            <Lock className="w-4 h-4 text-kiosk-coral" />
            {t('passwordLabel')}
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-14 px-4 text-base rounded-2xl border-2 border-slate-200 focus:border-kiosk-coral outline-none font-medium text-kiosk-charcoal bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        <Button
          type="submit"
          variant="coral"
          size="lg"
          fullWidth
          disabled={loading}
          icon={ArrowRight}
          iconPosition="right"
        >
          {loading ? 'Authenticating...' : t('signInBtn')}
        </Button>
      </form>

      {/* Return to Patient Kiosk */}
      <button
        onClick={() => setCurrentStep('welcome')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-bold transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Patient Kiosk
      </button>
    </motion.div>
  );
}
