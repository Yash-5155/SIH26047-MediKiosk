import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { mockApi } from '../services/mockApi';
import { PatientSummaryModal } from '../components/PatientSummaryModal';
import { 
  Users, 
  ShieldAlert, 
  Clock, 
  CheckCircle, 
  Search, 
  Filter, 
  LogOut, 
  Eye, 
  Stethoscope, 
  Activity,
  FileText
} from 'lucide-react';

export function DoctorDashboard() {
  const { 
    staffUser, 
    setStaffAuthenticated, 
    setStaffUser, 
    setSelectedSessionId, 
    setSelectedPatientForSummary, 
    setCurrentStep, 
    t 
  } = useApp();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    mockApi.getDoctorSessions().then((sList) => {
      setSessions(sList);
      setLoading(false);
    });
  }, []);

  // Filter sessions list
  const filteredSessions = sessions.filter((s) => {
    const pName = s.patient?.name || '';
    const tok = s.token || '';
    const complaint = s.clinical_summary?.chief_complaint || '';

    const matchesSearch = 
      pName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tok.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === 'ALL' || s.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Calculate metrics
  const totalWaiting = sessions.filter(s => s.status === 'IN_PROGRESS' || s.status === 'Waiting').length;
  const totalHigh = sessions.filter(s => s.priority === 'HIGH').length;
  const totalModerate = sessions.filter(s => s.priority === 'MODERATE').length;
  const totalCompleted = sessions.filter(s => s.status === 'COMPLETED').length;

  const handleLogout = () => {
    setStaffUser(null);
    setStaffAuthenticated(false);
    setCurrentStep('welcome');
  };

  const handleViewSessionDetails = (sessionObj) => {
    setSelectedSessionId(sessionObj.session_id);
    setCurrentStep('staffsession');
  };

  const priorityBadges = {
    HIGH: 'bg-rose-600 text-white',
    MODERATE: 'bg-kiosk-blue text-white',
    ROUTINE: 'bg-emerald-600 text-white'
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
          <div className="w-14 h-14 rounded-2xl bg-kiosk-blue text-white flex items-center justify-center font-bold text-2xl shadow-kiosk-sm">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-kiosk-charcoal tracking-tight">
                {t('dashboardTitle')}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                SIH26047 LIVE
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Logged in as <strong className="text-kiosk-charcoal">{staffUser?.name || 'Dr. Ananya Sharma'}</strong> ({staffUser?.role || 'Senior Triage Officer'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setCurrentStep('welcome')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
          >
            Kiosk Patient View
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-sm transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logoutBtn')}</span>
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
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Waiting / Active</span>
            <span className="text-3xl font-black text-kiosk-charcoal font-mono">{totalWaiting}</span>
          </div>
        </div>

        <div className="bg-rose-50 rounded-3xl p-5 border border-rose-200 shadow-kiosk-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">High Priority</span>
            <span className="text-3xl font-black text-rose-900 font-mono">{totalHigh}</span>
          </div>
        </div>

        <div className="bg-sky-50 rounded-3xl p-5 border border-sky-200 shadow-kiosk-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-kiosk-blue text-white flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">Moderate Priority</span>
            <span className="text-3xl font-black text-sky-900 font-mono">{totalModerate}</span>
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
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-kiosk-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient name, token, symptom..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 focus:border-kiosk-coral outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: t('allPriorityFilter') },
            { id: 'HIGH', label: t('highPriorityFilter') },
            { id: 'MODERATE', label: t('modPriorityFilter') },
            { id: 'ROUTINE', label: t('routinePriorityFilter') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPriorityFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                priorityFilter === tab.id
                  ? 'bg-kiosk-charcoal text-white border-kiosk-charcoal shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Sessions Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-kiosk-md overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-kiosk-charcoal flex items-center gap-2">
            <Activity className="w-5 h-5 text-kiosk-coral" />
            Intake Queue Sessions ({filteredSessions.length})
          </h2>
          <span className="text-xs text-slate-400 font-medium">Click row to inspect case responses & clinical summary</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Token</th>
                <th className="py-4 px-6">Session ID</th>
                <th className="py-4 px-6">Patient Name</th>
                <th className="py-4 px-6">Age / Gender</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6">Chief Complaint</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-bold">
                    Loading clinical sessions…
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-bold">
                    No intake sessions match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((sessionObj) => (
                  <tr 
                    key={sessionObj.session_id}
                    onClick={() => handleViewSessionDetails(sessionObj)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6 font-mono font-black text-kiosk-coral text-base">
                      {sessionObj.token}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500 text-xs font-bold">
                      {sessionObj.session_id}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-kiosk-charcoal text-base">
                      {sessionObj.patient?.name}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {sessionObj.patient?.age} yrs, {sessionObj.patient?.gender}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${priorityBadges[sessionObj.priority]}`}>
                        {sessionObj.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {sessionObj.clinical_summary?.chief_complaint || 'General Checkup'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        sessionObj.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sessionObj.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSessionDetails(sessionObj);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-kiosk-blue text-white font-bold text-xs shadow-sm hover:bg-kiosk-blue-hover transition-all inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Case Details</span>
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
