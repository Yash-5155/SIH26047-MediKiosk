import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  User,
  FileText,
  ArrowLeft,
  Stethoscope,
  Touchpad,
  Mic,
  FileScan,
  CheckCircle,
  AlertCircle,
  Save,
  ShieldCheck,
} from 'lucide-react';

export function SessionDetails() {
  const { selectedSessionId, setCurrentStep } = useApp();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [generatingAI, setGeneratingAI] = useState(false);
  const [savingAI, setSavingAI] = useState(false);
  const [approvingAI, setApprovingAI] = useState(false);

  const [aiError, setAiError] = useState(null);
  const [aiSuccess, setAiSuccess] = useState(null);

  const [editedExtraction, setEditedExtraction] = useState(null);

  /*
   * Load case
   */
  useEffect(() => {
    let mounted = true;

    const loadCase = async () => {
      if (!selectedSessionId) {
        setLoading(false);
        setError('No session selected.');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await api.getDoctorCase(selectedSessionId);

        if (mounted) {
          setCaseData(data);

          const extraction =
            data?.ai_extraction?.extracted_data || null;

          setEditedExtraction(
            extraction
              ? {
                  ...extraction,
                  symptoms: [...(extraction.symptoms || [])],
                  current_medications: [
                    ...(extraction.current_medications || []),
                  ],
                  allergies: [...(extraction.allergies || [])],
                  existing_conditions: [
                    ...(extraction.existing_conditions || []),
                  ],
                  past_medical_history: [
                    ...(extraction.past_medical_history || []),
                  ],
                }
              : null
          );
        }
      } catch (err) {
        console.error('Failed to load case:', err);

        if (mounted) {
          setError(
            err?.message || 'Failed to load session case details.'
          );
          setCaseData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCase();

    return () => {
      mounted = false;
    };
  }, [selectedSessionId]);

  /*
   * Generate AI summary
   */
  const generateAIExtraction = async () => {
    if (!selectedSessionId) return;

    try {
      setGeneratingAI(true);
      setAiError(null);
      setAiSuccess(null);

      await api.generateAIExtraction(selectedSessionId);

      const updatedCase =
        await api.getDoctorCase(selectedSessionId);

      setCaseData(updatedCase);

      const extraction =
        updatedCase?.ai_extraction?.extracted_data || null;

      setEditedExtraction(
        extraction
          ? {
              ...extraction,
              symptoms: [...(extraction.symptoms || [])],
              current_medications: [
                ...(extraction.current_medications || []),
              ],
              allergies: [...(extraction.allergies || [])],
              existing_conditions: [
                ...(extraction.existing_conditions || []),
              ],
              past_medical_history: [
                ...(extraction.past_medical_history || []),
              ],
            }
          : null
      );

      setAiSuccess('Clinical summary generated successfully.');
    } catch (error) {
      console.error(
        'Failed to generate AI extraction:',
        error
      );

      setAiError(
        error?.message ||
          'Failed to generate clinical summary.'
      );
    } finally {
      setGeneratingAI(false);
    }
  };

  /*
   * Update an individual field locally
   */
  const updateExtractionField = (field, value) => {
    setEditedExtraction((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /*
   * Save doctor edits
   */
  const saveAIExtraction = async () => {
    if (!selectedSessionId || !editedExtraction) return;

    try {
      setSavingAI(true);
      setAiError(null);
      setAiSuccess(null);

      const updated =
        await api.updateAIExtraction(
          selectedSessionId,
          editedExtraction
        );

      setCaseData((previous) => ({
        ...previous,
        ai_extraction: updated,
      }));

      setAiSuccess(
        'Doctor changes saved successfully.'
      );
    } catch (error) {
      console.error(
        'Failed to save AI extraction:',
        error
      );

      setAiError(
        error?.message ||
          'Failed to save doctor changes.'
      );
    } finally {
      setSavingAI(false);
    }
  };

  /*
   * Approve summary
   */
  const approveAIExtraction = async () => {
    const updated =
  await api.approveAIExtraction(selectedSessionId);
    if (!selectedSessionId || !editedExtraction) return;

    try {
      setApprovingAI(true);
      setAiError(null);
      setAiSuccess(null);

      const updated =
        await api.approveAIExtraction(
          selectedSessionId
        );

      setCaseData((previous) => ({
        ...previous,
        ai_extraction: updated,
      }));

      setAiSuccess(
        'Clinical summary approved by doctor.'
      );
    } catch (error) {
      console.error(
        'Failed to approve AI extraction:',
        error
      );

      setAiError(
        error?.message ||
          'Failed to approve clinical summary.'
      );
    } finally {
      setApprovingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-kiosk-coral border-t-transparent animate-spin mx-auto mb-4" />

        <p className="text-slate-600 font-bold text-lg">
          Loading session case details…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() =>
            setCurrentStep('staffdashboard')
          }
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-kiosk-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard Queue
        </button>

        <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-kiosk-md text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />

          <h2 className="text-xl font-extrabold text-slate-800 mb-2">
            Unable to Load Case
          </h2>

          <p className="text-slate-500 font-medium">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return null;
  }

  const {
    session_id,
    patient_id,
    session_status,
    started_at,
    completed_at,
    questionnaire = [],
    documents = [],
    ai_extraction = null,
  } = caseData;

  const extraction =
    ai_extraction?.extracted_data || null;

  const extractionStatus =
    ai_extraction?.extraction_status || null;

  const isApproved =
    extractionStatus === 'VERIFIED_BY_DOCTOR';

  const formatDateTime = (value) => {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const formatValue = (
    value,
    fallback = 'None reported'
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return fallback;
    }

    if (Array.isArray(value)) {
      return value.length > 0
        ? value.join(', ')
        : fallback;
    }

    return String(value);
  };

  const statusClass =
    session_status === 'COMPLETED'
      ? 'bg-emerald-100 text-emerald-700'
      : session_status === 'IN_PROGRESS'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-slate-100 text-slate-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-6xl mx-auto w-full px-4 py-6 sm:py-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() =>
            setCurrentStep('staffdashboard')
          }
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-kiosk-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard Queue</span>
        </button>

        <span className="text-xs font-mono font-bold text-slate-400">
          Session ID: {session_id}
        </span>
      </div>

      {/* Patient / Session Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-100 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-kiosk-blue text-white flex items-center justify-center shadow-kiosk-sm shrink-0">
              <User className="w-9 h-9" />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-kiosk-charcoal tracking-tight">
                Patient #{patient_id}
              </h1>

              <p className="text-sm font-medium text-slate-500 mt-1">
                Patient ID:{' '}
                <strong>{patient_id}</strong>
              </p>
            </div>
          </div>

          <div
            className={`px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase ${statusClass}`}
          >
            {session_status || 'UNKNOWN'}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <span className="text-slate-400 font-bold uppercase block text-xs mb-1">
              Session Status
            </span>

            <span className="font-extrabold text-slate-800">
              {session_status || '—'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase block text-xs mb-1">
              Started At
            </span>

            <span className="font-semibold text-slate-700">
              {formatDateTime(started_at)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase block text-xs mb-1">
              Completed At
            </span>

            <span className="font-semibold text-slate-700">
              {formatDateTime(completed_at)}
            </span>
          </div>
        </div>
      </div>

      {/* AI Clinical Extraction */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md mb-8">

        {/* Summary Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-slate-100 pb-5 mb-6">

          <Stethoscope className="w-6 h-6 text-kiosk-coral shrink-0" />

          <div className="flex-1">
            <h2 className="text-2xl font-extrabold text-kiosk-charcoal">
              Clinical Intake Summary
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Generated from questionnaire and verified medical-document data
            </p>
          </div>

          {isApproved ? (
            <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-black flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              VERIFIED BY DOCTOR
            </div>
          ) : (
            <button
              onClick={generateAIExtraction}
              disabled={generatingAI}
              className="px-4 py-3 rounded-xl bg-kiosk-coral text-white font-extrabold text-sm shadow-kiosk-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {generatingAI
                ? 'Generating...'
                : extraction
                ? 'Regenerate Summary'
                : 'Generate Clinical Summary'}
            </button>
          )}
        </div>

        {/* Messages */}
        {aiError && (
          <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm font-semibold">
            {aiError}
          </div>
        )}

        {aiSuccess && (
          <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {aiSuccess}
          </div>
        )}

        {extraction && editedExtraction ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <EditableSummaryItem
                label="Chief Complaint"
                value={editedExtraction.chief_complaint}
                disabled={isApproved}
                onChange={(value) =>
                  updateExtractionField(
                    'chief_complaint',
                    value
                  )
                }
              />

              <EditableSummaryItem
                label="Symptoms"
                value={editedExtraction.symptoms}
                disabled={isApproved}
                onChange={(value) =>
                  updateExtractionField(
                    'symptoms',
                    value
                  )
                }
              />

              <EditableSummaryItem
                label="Duration"
                value={editedExtraction.duration}
                disabled={isApproved}
                onChange={(value) =>
                  updateExtractionField(
                    'duration',
                    value
                  )
                }
              />

              <EditableSummaryItem
                label="Severity"
                value={editedExtraction.severity}
                disabled={isApproved}
                onChange={(value) =>
                  updateExtractionField(
                    'severity',
                    value
                  )
                }
              />

              <EditableSummaryItem
                label="Fever"
                value={editedExtraction.fever}
                disabled={isApproved}
                onChange={(value) =>
                  updateExtractionField(
                    'fever',
                    value
                  )
                }
              />

              <EditableSummaryItem
                label="Current Medications"
                value={
                  editedExtraction.current_medications
                }
                disabled={isApproved}
                onChange={(value) =>
                  updateExtractionField(
                    'current_medications',
                    value
                  )
                }
              />

              <EditableSummaryItem
                label="Known Allergies"
                value={editedExtraction.allergies}
                disabled={isApproved}
                onChange={(value) =>
                  updateExtractionField(
                    'allergies',
                    value
                  )
                }
              />

              <EditableSummaryItem
                label="Existing Conditions"
                value={
                  editedExtraction.existing_conditions
                }
                disabled={isApproved}
                onChange={(value) =>
                  updateExtractionField(
                    'existing_conditions',
                    value
                  )
                }
              />

              <EditableSummaryItem
                label="Past Medical History"
                value={
                  editedExtraction.past_medical_history
                }
                disabled={isApproved}
                onChange={(value) =>
                  updateExtractionField(
                    'past_medical_history',
                    value
                  )
                }
              />

            </div>

            <div className="mt-6">
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                Additional Information
              </label>

              <textarea
                value={
                  editedExtraction.additional_information ||
                  ''
                }
                disabled={isApproved}
                onChange={(event) =>
                  updateExtractionField(
                    'additional_information',
                    event.target.value
                  )
                }
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-kiosk-blue disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Doctor Actions */}
            {!isApproved && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">

                <button
                  onClick={saveAIExtraction}
                  disabled={savingAI || approvingAI}
                  className="px-5 py-3 rounded-xl bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />

                  {savingAI
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>

                <button
                  onClick={approveAIExtraction}
                  disabled={savingAI || approvingAI}
                  className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />

                  {approvingAI
                    ? 'Approving...'
                    : 'Approve Summary'}
                </button>

              </div>
            )}

          </>
        ) : (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center">
            <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-3" />

            <p className="font-bold text-slate-500">
              AI clinical extraction is not available yet.
            </p>

            <p className="text-sm text-slate-400 mt-1">
              Generate a clinical summary to begin doctor review.
            </p>
          </div>
        )}

      </div>

      {/* Questionnaire */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-kiosk-md overflow-hidden mb-8">

        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-kiosk-charcoal flex items-center gap-2">
            <FileText className="w-5 h-5 text-kiosk-blue" />
            Questionnaire Responses
          </h2>
        </div>

        <div className="overflow-x-auto">

          {questionnaire.length > 0 ? (
            <table className="w-full text-left border-collapse text-sm">

              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">Question</th>
                  <th className="py-4 px-6">Answer</th>
                  <th className="py-4 px-6">Input Mode</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {questionnaire.map(
                  (response, index) => (
                    <tr
                      key={response.id || index}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-slate-400">
                        {index + 1}
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {response.question ||
                          response.question_text ||
                          response.question_key ||
                          '—'}
                      </td>

                      <td className="py-4 px-6 font-extrabold text-kiosk-charcoal">
                        {formatValue(
                          response.answer ||
                            response.answer_text,
                          'No answer'
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold inline-flex items-center gap-1 uppercase bg-slate-100 text-slate-700">

                          {response.input_mode ===
                          'VOICE' ? (
                            <Mic className="w-3 h-3" />
                          ) : (
                            <Touchpad className="w-3 h-3" />
                          )}

                          {response.input_mode ||
                            'TOUCH'}

                        </span>
                      </td>
                    </tr>
                  )
                )}

              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center text-slate-400 font-semibold">
              No questionnaire responses recorded.
            </div>
          )}

        </div>
      </div>

      {/* Medical Documents */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-kiosk-md overflow-hidden">

        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-kiosk-charcoal flex items-center gap-2">
            <FileScan className="w-5 h-5 text-kiosk-blue" />
            Medical Documents
          </h2>
        </div>

        {documents.length > 0 ? (
          <div className="divide-y divide-slate-100">

            {documents.map(
              (document, index) => (
                <div
                  key={document.id || index}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">

                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-500" />
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">
                        {document.file_name ||
                          'Medical Document'}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {document.document_type ||
                          'OTHER'}
                      </p>
                    </div>

                  </div>

                  <div className="flex items-center gap-2">

                    {document.extraction_status ===
                    'VERIFIED' ? (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-extrabold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        OCR VERIFIED
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-extrabold">
                        {document.extraction_status ||
                          'PENDING'}
                      </span>
                    )}

                  </div>
                </div>
              )
            )}

          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 font-semibold">
            No medical documents uploaded.
          </div>
        )}

      </div>
    </motion.div>
  );
}


/*
 * Editable clinical summary field
 */
function EditableSummaryItem({
  label,
  value,
  disabled,
  onChange,
}) {
  const isArray = Array.isArray(value);

  const displayValue = isArray
    ? value.join(', ')
    : value || '';

  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">

      <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
        {label}
      </label>

      <textarea
        value={displayValue}
        disabled={disabled}
        onChange={(event) => {
          const newValue = event.target.value;

          if (isArray) {
            const arrayValue = newValue
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean);

            onChange(arrayValue);
          } else {
            onChange(newValue);
          }
        }}
        rows={2}
        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-kiosk-blue disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed resize-none"
        placeholder="None reported"
      />

      {isArray && !disabled && (
        <p className="text-[11px] text-slate-400 mt-2">
          Separate multiple values with commas.
        </p>
      )}

    </div>
  );
}