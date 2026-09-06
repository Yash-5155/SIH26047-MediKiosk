import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { fetchDoctorSessions } from '../services/apiService';
import { DEMO_DASHBOARD_SESSION } from '../data/demoPatient';
import { PatientSummaryModal } from '../components/PatientSummaryModal';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Search, 
  LogOut, 
  Stethoscope, 
  Activity,
  FileText,
  AlertCircle,
  RefreshCw,
  Loader2,
  Calendar
} from 'lucide-react';

/**
 * SCREEN 17 — Doctor Dashboard / Patient Queue
 * 
 * Connected directly to backend GET /api/doctor/sessions.
 * Displays real patient intake sessions:
 *  - Patient Name
 *  - Session / Case ID
 *  - Status (e.g. IN_PROGRESS, COMPLETED)
 *  - Started At
 *  - Completed At
 *  - View/Open Case Action (stores session_id and navigates to Doctor Case Details)
 * 
 * Preserves the existing UI, styling, metrics cards, animations, and kiosk/portal layout.
 */
export function DoctorDashboard() {
  const { 
    staffUser, 
    setStaffAuthenticated, 
    setStaffUser, 
    setSelectedSessionId, 
    setCurrentStep, 
    setDoctorQueue,
    t 
  } = useApp();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Load sessions from real backend GET /api/doctor/sessions
  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDoctorSessions();
      const realSessions = Array.isArray(data) ? data : [];
      // Combine with temporary frontend demo case for UI and navigation testing
      const hasDemo = realSessions.some(s => s.session_id === DEMO_DASHBOARD_SESSION.session_id);
      const combined = hasDemo ? realSessions : [DEMO_DASHBOARD_SESSION, ...realSessions];
      setSessions(combined);
      if (setDoctorQueue) {
        setDoctorQueue(combined);
      }
    } catch (err) {
      console.error('[DoctorDashboard] Failed to load sessions from backend:', err);
      setError(err.message || 'Unable to load doctor sessions from clinical server.');
      // Keep demo patient available even when backend returns error (500, network offline, etc.)
      setSessions([DEMO_DASHBOARD_SESSION]);
    } finally {
      setLoading(false);
    }
  }, [setDoctorQueue]);


  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Filter sessions list
  const filteredSessions = sessions.filter((s) => {
    const pName = s.patient_name || '';
    const sId = String(s.session_id || '');
    const sStatus = s.status || '';

    const matchesSearch = 
      pName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sId.includes(searchQuery) ||
      sStatus.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate metrics from real data
  const totalCases = sessions.length;
  const totalActive = sessions.filter(s => s.status === 'IN_PROGRESS' || !s.completed_at).length;
  const totalCompleted = sessions.filter(s => s.status === 'COMPLETED' || Boolean(s.completed_at)).length;

  const handleLogout = () => {
    setStaffUser(null);
    setStaffAuthenticated(false);
    setCurrentStep('conversation');
  };

  // Open Case behavior: store session_id and navigate to staffsession
  const handleViewSessionDetails = (sessionObj) => {
    if (!sessionObj?.session_id) return;
    setSelectedSessionId(sessionObj.session_id);
    setCurrentStep('staffsession');
  };

  // Safe date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-7xl mx-auto w-full px-4 py-6 sm:py-8"
    >
      {/* Dashboard Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-kiosk-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-kiosk-blue text-white flex items-center justify-center font-bold text-2xl shadow-kiosk-sm shrink-0">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal tracking-tight">
                {t('dashboardTitle') || 'Doctor Portal — Intake Queue'}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                LIVE QUEUE
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              Logged in as <strong className="text-kiosk-charcoal">{staffUser?.name || 'Attending Physician'}</strong> ({staffUser?.role || 'Clinical Staff'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setCurrentStep('conversation')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
          >
            Kiosk Patient View
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logoutBtn') || 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-kiosk-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Cases</span>
            <span className="text-3xl font-black text-kiosk-charcoal font-mono">{totalCases}</span>
          </div>
        </div>

        <div className="bg-sky-50 rounded-3xl p-5 border border-sky-200 shadow-kiosk-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-kiosk-blue text-white flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">In Progress</span>
            <span className="text-3xl font-black text-sky-900 font-mono">{totalActive}</span>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-200 shadow-kiosk-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Completed</span>
            <span className="text-3xl font-black text-emerald-900 font-mono">{totalCompleted}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 shadow-kiosk-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Queue Status</span>
            <span className="text-sm font-extrabold text-slate-800 mt-1 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${error ? 'bg-rose-500' : loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
              {loading ? 'Refreshing…' : error ? 'Error' : 'Online / Live'}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters, Refresh */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-kiosk-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient name, session ID, status…"
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 focus:border-kiosk-coral outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Cases' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'COMPLETED', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-kiosk-charcoal text-white border-kiosk-charcoal shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={loadSessions}
            disabled={loading}
            title="Refresh Doctor Queue"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 text-xs ml-1"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Backend Sync Alert (non-blocking: temporary demo patient is available for testing) */}
      {error && sessions.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Backend Sync Notice: {error} (Displaying temporary demo patient for frontend navigation & UI testing)
            </span>
          </div>
          <button
            onClick={loadSessions}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Backend Sync</span>
          </button>
        </div>
      )}

      {/* Queue Sessions Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-kiosk-md overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-kiosk-charcoal flex items-center gap-2">
            <Activity className="w-5 h-5 text-kiosk-coral" />
            Patient Sessions Queue ({filteredSessions.length})
          </h2>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Click any row or "Open Case" to open patient details
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Session ID</th>
                <th className="py-4 px-6">Patient Name</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Started At</th>
                <th className="py-4 px-6">Completed At</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                /* Loading State */
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-kiosk-blue animate-spin" />
                      <p className="text-slate-500 font-bold text-sm">
                        Loading patient cases from hospital queue…
                      </p>
                    </div>
                  </td>
                </tr>
              ) : error && sessions.length === 0 ? (
                /* Error State with Retry */
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-3 text-rose-900 bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-xs">
                      <AlertCircle className="w-10 h-10 text-rose-600 shrink-0" />
                      <h3 className="font-extrabold text-base text-rose-950">
                        Failed to Load Doctor Queue
                      </h3>
                      <p className="text-xs sm:text-sm text-rose-700 font-medium">
                        {error}
                      </p>
                      <button
                        onClick={loadSessions}
                        className="mt-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (

                /* Empty State */
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <FileText className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                      <p className="text-base font-bold text-slate-600">
                        {searchQuery || statusFilter !== 'ALL'
                          ? 'No patient cases match your search criteria.'
                          : 'No patient cases available.'}
                      </p>
                      <p className="text-xs text-slate-400">
                        New intake sessions completed at the kiosk will appear here automatically.
                      </p>
                      {(searchQuery || statusFilter !== 'ALL') && (
                        <button
                          onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
                          className="mt-2 text-xs font-extrabold text-kiosk-blue hover:underline cursor-pointer"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                /* Populated List */
                filteredSessions.map((sessionObj) => (
                  <tr 
                    key={sessionObj.session_id}
                    onClick={() => handleViewSessionDetails(sessionObj)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    {/* Session / Case ID */}
                    <td className="py-4 px-6 font-mono font-black text-kiosk-coral text-base">
                      #{sessionObj.session_id}
                    </td>

                    {/* Patient Name */}
                    <td className="py-4 px-6 font-extrabold text-kiosk-charcoal text-base">
                      {sessionObj.patient_name}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                        sessionObj.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : sessionObj.status === 'IN_PROGRESS'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {sessionObj.status === 'COMPLETED'
                          ? '✓ Completed'
                          : sessionObj.status === 'IN_PROGRESS'
                          ? 'In Progress'
                          : sessionObj.status}
                      </span>
                    </td>

                    {/* Started At */}
                    <td className="py-4 px-6 text-slate-600 font-medium text-xs sm:text-sm">
                      {formatDate(sessionObj.started_at)}
                    </td>

                    {/* Completed At */}
                    <td className="py-4 px-6 text-slate-600 font-medium text-xs sm:text-sm">
                      {sessionObj.completed_at ? (
                        formatDate(sessionObj.completed_at)
                      ) : (
                        <span className="text-slate-400 italic font-normal">Active / In Progress</span>
                      )}
                    </td>

                    {/* View / Open Case Action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSessionDetails(sessionObj);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-kiosk-blue text-white font-bold text-xs shadow-sm hover:bg-kiosk-blue-hover transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        title="Open Case"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Open Case</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PatientSummaryModal />
    </motion.div>
  );
}
