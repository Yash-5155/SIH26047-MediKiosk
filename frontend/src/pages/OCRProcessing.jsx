import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { extractDocumentText } from '../services/apiService';
import { 
  Scan, 
  CheckCircle2, 
  FileSearch, 
  Cpu, 
  ArrowRight, 
  Info,
  Layers,
  Sparkles,
  AlertCircle,
  RotateCcw,
  FileText,
  Clock,
  ShieldCheck
} from 'lucide-react';

/**
 * SCREEN 11 — OCR Processing
 * 
 * Flow:
 *  - Uses the EXISTING uploaded document ID from KioskContext / state:
 *    (uploadedDocumentId, uploadedDocument.id, or scannedDocumentData.documentId)
 *  - Calls POST /api/documents/{document_id}/extract to trigger backend Tesseract / PDF extraction
 *  - Prevents duplicate requests with React ref guard
 *  - Stores extraction information in KioskContext / state (document ID, type, filename, status, text, engine)
 *  - Updates existing medicalDocuments item or adds new structured record with real extracted text
 *  - On OCR failure / error: keeps uploaded document intact, shows patient-friendly advisory,
 *    and offers "Retry OCR" or "Continue to Summary"
 */
export function OCRProcessing() {
  const { 
    language, 
    setCurrentStep, 
    activeDocumentType, 
    uploadedDocumentId,
    uploadedDocument,
    scannedDocumentData,
    medicalDocuments,
    setMedicalDocuments,
    addMedicalDocument,
    setOcrResult,
    t 
  } = useKiosk();

  const isHindi = language === 'hi';

  // Extract existing document ID strictly from state (never invented or hardcoded)
  const rawDocId = 
    uploadedDocumentId || 
    uploadedDocument?.id || 
    scannedDocumentData?.documentId || 
    scannedDocumentData?.backendData?.id ||
    null;
  const effectiveDocumentId = (rawDocId && !isNaN(Number(rawDocId)) && Number(rawDocId) > 0)
    ? Number(rawDocId)
    : null;

  const effectiveFileName = 
    scannedDocumentData?.fileName || 
    uploadedDocument?.file_name || 
    scannedDocumentData?.file?.name ||
    'Medical Document';

  const effectiveDocType = 
    uploadedDocument?.document_type || 
    scannedDocumentData?.documentType || 
    activeDocumentType || 
    'Prescription';

  // Pipeline phases
  const processingPhases = [
    {
      labelEn: 'Connecting to medical intake document repository…',
      labelHi: 'मेडिकल इंटेक दस्तावेज़ रिपॉजिटरी से कनेक्ट हो रहा है…'
    },
    {
      labelEn: 'Backend optical character recognition (OCR) analyzing text…',
      labelHi: 'बैकएंड ऑप्टिकल कैरेक्टर रिकग्निशन (OCR) द्वारा पाठ का विश्लेषण…'
    },
    {
      labelEn: 'Processing clinical records & extracting medical details…',
      labelHi: 'क्लिनिकल रिकॉर्ड और चिकित्सीय विवरण का संकलन…'
    },
    {
      labelEn: 'Extraction complete! Structuring pre-consultation timeline…',
      labelHi: 'विश्लेषण पूर्ण! प्री-परामर्श टाइमलाइन तैयार की जा रही है…'
    }
  ];

  // States: 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'NO_ID'
  const [ocrStatus, setOcrStatus] = useState('PROCESSING');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(30);
  const [extractedData, setExtractedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Guard against duplicate OCR calls for the same document ID
  const lastExtractedIdRef = useRef(null);

  // Execute OCR extraction against backend endpoint
  const runExtraction = useCallback(async (docId) => {
    if (!docId) {
      setOcrStatus('NO_ID');
      setErrorMessage(
        isHindi 
          ? 'कोई अपलोड किया गया दस्तावेज़ ID नहीं मिला। कृपया पहले दस्तावेज़ अपलोड करें।' 
          : 'No uploaded document ID was found. Please upload or scan a document first.'
      );
      return;
    }

    setOcrStatus('PROCESSING');
    setErrorMessage(null);
    setPhaseIndex(0);
    setProgressPercent(30);

    // Progress animation timer 1
    const t1 = setTimeout(() => {
      setPhaseIndex(1);
      setProgressPercent(60);
    }, 700);

    // Progress animation timer 2
    const t2 = setTimeout(() => {
      setPhaseIndex(2);
      setProgressPercent(85);
    }, 1500);

    try {
      // Call backend POST /api/documents/{document_id}/extract
      const result = await extractDocumentText(docId);

      clearTimeout(t1);
      clearTimeout(t2);

      setPhaseIndex(3);
      setProgressPercent(100);
      setExtractedData(result);
      setOcrStatus('SUCCESS');

      // Store OCR result in context
      if (setOcrResult) {
        setOcrResult(result);
      }

      // Preserve extraction in medicalDocuments array
      const extractedText = result.extracted_text || '';
      const docIdStr = `DOC-${docId}`;

      setMedicalDocuments((prevDocs = []) => {
        const existingIndex = prevDocs.findIndex(
          d => d.backendDocumentId === docId || d.id === docIdStr
        );

        const updatedRecord = {
          id: docIdStr,
          backendDocumentId: docId,
          documentType: effectiveDocType,
          documentName: effectiveFileName,
          date: new Date().toISOString().split('T')[0],
          issuer: 'Uploaded Medical Record',
          diagnosis: extractedText ? 'Extracted from Document' : 'Pending Doctor Review',
          extractedText: extractedText,
          extractionStatus: result.extraction_status || 'COMPLETED',
          extractionEngine: result.extraction_engine || 'TESSERACT',
          extractedAt: result.extracted_at || new Date().toISOString(),
          medicines: [],
          labValues: [],
          abnormalValues: [],
          doctorNotes: extractedText ? `OCR Extracted Content:\n${extractedText.slice(0, 300)}...` : undefined
        };

        if (existingIndex >= 0) {
          const next = [...prevDocs];
          next[existingIndex] = { ...next[existingIndex], ...updatedRecord };
          return next;
        } else {
          return [updatedRecord, ...prevDocs];
        }
      });

      // Auto-advance to Extracted History after brief completion confirmation
      setTimeout(() => {
        setCurrentStep('extractedhistory');
      }, 1400);

    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      console.error('[OCRProcessing] Extraction error:', err);

      setOcrStatus('FAILED');
      setErrorMessage(
        err.message || 
        (isHindi
          ? 'दस्तावेज़ सहेजा गया है, लेकिन हम इसका पूरा पाठ स्वचालित रूप से नहीं पढ़ सके।'
          : "Document was saved, but we couldn't read all of its text automatically.")
      );

      // Make sure the document remains saved in medicalDocuments even when OCR fails!
      const docIdStr = `DOC-${docId}`;
      setMedicalDocuments((prevDocs = []) => {
        const exists = prevDocs.some(
          d => d.backendDocumentId === docId || d.id === docIdStr
        );
        if (!exists) {
          return [
            {
              id: docIdStr,
              backendDocumentId: docId,
              documentType: effectiveDocType,
              documentName: effectiveFileName,
              date: new Date().toISOString().split('T')[0],
              issuer: 'Uploaded Medical Record',
              diagnosis: 'Manual Doctor Review Required',
              extractionStatus: 'FAILED',
              extractedText: null,
              medicines: [],
              labValues: [],
              abnormalValues: []
            },
            ...prevDocs
          ];
        }
        return prevDocs;
      });
    }
  }, [
    isHindi, 
    effectiveDocType, 
    effectiveFileName, 
    setMedicalDocuments, 
    setOcrResult, 
    setCurrentStep
  ]);

  // Trigger extraction when document ID is available
  useEffect(() => {
    if (effectiveDocumentId) {
      if (lastExtractedIdRef.current === effectiveDocumentId) {
        return;
      }
      lastExtractedIdRef.current = effectiveDocumentId;
      runExtraction(effectiveDocumentId);
    } else {
      // If no ID is available on immediate mount, give a brief window (350ms) for context hydration before showing NO_ID
      const timer = setTimeout(() => {
        if (!effectiveDocumentId && !lastExtractedIdRef.current) {
          setOcrStatus('NO_ID');
          setErrorMessage(
            isHindi 
              ? 'कोई अपलोड किया गया दस्तावेज़ ID नहीं मिला। कृपया पहले दस्तावेज़ अपलोड करें।' 
              : 'No uploaded document ID was found. Please upload or scan a document first.'
          );
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [effectiveDocumentId, runExtraction, isHindi]);

  // Manual Retry using the exact same document ID
  const handleRetry = () => {
    if (effectiveDocumentId) {
      lastExtractedIdRef.current = effectiveDocumentId;
      runExtraction(effectiveDocumentId);
    }
  };

  // Continue to Summary even if OCR did not extract all text
  const handleContinueToSummary = () => {
    setCurrentStep('extractedhistory');
  };

  // Navigate back to Screen 9 to choose/upload document
  const handleBackToUpload = () => {
    setCurrentStep('documents');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-3xl mx-auto w-full px-4 py-8 sm:py-14 text-center"
    >
      {/* Central Status Visual Badge */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 flex items-center justify-center">
        {ocrStatus === 'PROCESSING' && (
          <>
            <div className="absolute inset-0 rounded-3xl bg-kiosk-coral/10 animate-ping opacity-50" />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white border-2 border-kiosk-coral shadow-kiosk-coral flex items-center justify-center text-kiosk-coral">
              <Cpu className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse stroke-[2.2]" />
            </div>
          </>
        )}

        {ocrStatus === 'SUCCESS' && (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-50 border-2 border-emerald-500 shadow-lg flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
          </div>
        )}

        {(ocrStatus === 'FAILED' || ocrStatus === 'NO_ID') && (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-50 border-2 border-amber-500 shadow-lg flex items-center justify-center text-amber-600">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.2]" />
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-black text-kiosk-charcoal tracking-tight mb-2">
        {ocrStatus === 'PROCESSING' && (isHindi ? 'दस्तावेज़ का विश्लेषण जारी है…' : 'Analyzing your medical document…')}
        {ocrStatus === 'SUCCESS' && (isHindi ? 'विश्लेषण सफलतापूर्वक पूर्ण हुआ!' : 'Document Analysis Complete!')}
        {ocrStatus === 'FAILED' && (isHindi ? 'दस्तावेज़ सुरक्षित सहेजा गया' : 'Document Saved Successfully')}
        {ocrStatus === 'NO_ID' && (isHindi ? 'कोई दस्तावेज़ नहीं मिला' : 'No Document Found')}
      </h1>

      <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto mb-6">
        {ocrStatus === 'PROCESSING' && (
          isHindi
            ? 'बैकएंड ओसीआर सेवा आपके दस्तावेज़ से क्लिनिकल पाठ और विवरण पढ़ रही है। कृपया प्रतीक्षा करें।'
            : 'Backend OCR pipeline is reading printed and clinical text from your document. Please wait.'
        )}
        {ocrStatus === 'SUCCESS' && (
          isHindi
            ? 'दस्तावेज़ से पाठ सफलतापूर्वक निकाला गया। मेडिकल इतिहास तैयार किया जा रहा है।'
            : 'Clinical text extracted successfully. Adding records to your pre-consultation timeline.'
        )}
        {ocrStatus === 'FAILED' && (
          isHindi
            ? 'दस्तावेज़ सुरक्षित रूप से सहेजा जा चुका है, लेकिन इसका पूरा पाठ स्वचालित रूप से नहीं पढ़ा जा सका। आपके डॉक्टर परामर्श के दौरान इसकी समीक्षा करेंगे।'
            : "Document was saved, but we couldn't read all of its text automatically. Your doctor will review the original document during consultation."
        )}
        {ocrStatus === 'NO_ID' && (
          isHindi
            ? 'विश्लेषण करने के लिए कोई दस्तावेज़ ID नहीं मिला। कृपया पहले कोई दस्तावेज़ अपलोड या स्कैन करें।'
            : 'No uploaded document ID was found to analyze. Please upload or scan a document first.'
        )}
      </p>

      {/* Active Document Context Pill */}
      {effectiveDocumentId && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 mb-6">
          <FileText className="w-3.5 h-3.5 text-kiosk-coral" />
          <span>{effectiveDocType}: {effectiveFileName}</span>
          <span className="font-mono text-slate-400">#{effectiveDocumentId}</span>
        </div>
      )}

      {/* STATE A: Processing Pipeline Progress */}
      {ocrStatus === 'PROCESSING' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-kiosk-md mb-8 max-w-xl mx-auto text-left">
          <div className="flex items-center justify-between text-sm font-bold text-kiosk-charcoal mb-2">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-kiosk-coral animate-pulse" />
              {isHindi ? 'ओसीआर पाइपलाइन प्रगति' : 'Backend OCR Pipeline'}
            </span>
            <span className="text-kiosk-coral font-black text-base">{progressPercent}%</span>
          </div>

          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-6 p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-kiosk-coral to-rose-400 rounded-full"
              initial={{ width: '20%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Dynamic Checklist */}
          <div className="space-y-3">
            {processingPhases.map((phase, idx) => {
              const isDone = idx < phaseIndex || phaseIndex === 3;
              const isCurrent = idx === phaseIndex && phaseIndex < 3;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 text-sm font-semibold transition-opacity duration-300 ${
                    isDone
                      ? 'text-emerald-700'
                      : isCurrent
                      ? 'text-kiosk-charcoal'
                      : 'text-slate-400 opacity-60'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full border-2 border-kiosk-coral border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span>{isHindi ? phase.labelHi : phase.labelEn}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STATE B: Success Details */}
      {ocrStatus === 'SUCCESS' && extractedData && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 mb-8 max-w-xl mx-auto text-left shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-950 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{isHindi ? 'दस्तावेज़ पाठ सफलतापूर्वक पढ़ा गया' : 'Document Text Processed'}</span>
          </div>
          {extractedData.extracted_text ? (
            <div className="bg-white/90 p-3 rounded-xl border border-emerald-200 text-xs font-mono text-slate-700 max-h-32 overflow-y-auto whitespace-pre-wrap">
              {extractedData.extracted_text.slice(0, 300)}
              {extractedData.extracted_text.length > 300 ? '…' : ''}
            </div>
          ) : (
            <p className="text-xs text-emerald-800">
              {isHindi ? 'दस्तावेज़ संग्रहीत है और डॉक्टर परामर्श के लिए उपलब्ध है।' : 'Document recorded and attached to consultation summary.'}
            </p>
          )}
        </div>
      )}

      {/* STATE C: OCR Failed / Non-Destructive Advisory */}
      {ocrStatus === 'FAILED' && (
        <div className="bg-amber-50/95 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 mb-8 max-w-xl mx-auto text-left shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-amber-950">
                {isHindi ? 'दस्तावेज़ सुरक्षित रूप से संग्रहीत है' : 'Document Safely Stored in System'}
              </h4>
              <p className="text-xs sm:text-sm text-amber-800 font-medium mt-1 leading-relaxed">
                {isHindi
                  ? 'हस्तलिखित पर्चे या जटिल लेआउट के कारण स्वचालित ओसीआर पूरा पाठ नहीं पढ़ सका। आपका मूल दस्तावेज़ सुरक्षित है और डॉक्टर समीक्षा के लिए उपलब्ध रहेगा।'
                  : "Due to handwriting or layout complexity, automatic OCR could not read all text. Your original document file remains safely stored and available for the doctor's direct review."}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleRetry}
              icon={RotateCcw}
              iconPosition="left"
              className="w-full sm:w-auto"
            >
              {isHindi ? 'पुनः प्रयास करें' : 'Retry OCR'}
            </Button>

            <Button
              variant="coral"
              size="md"
              onClick={handleContinueToSummary}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto"
            >
              {isHindi ? 'सारांश जारी रखें →' : 'Continue to Summary →'}
            </Button>
          </div>
        </div>
      )}

      {/* STATE D: No Document ID Warning */}
      {ocrStatus === 'NO_ID' && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 sm:p-7 mb-8 max-w-xl mx-auto text-left shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-base text-rose-950">
                {isHindi ? 'कोई दस्तावेज़ ID नहीं मिली' : 'No Document Selected'}
              </h4>
              <p className="text-xs sm:text-sm text-rose-800 font-medium mt-1 leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <Button
              variant="coral"
              size="md"
              onClick={handleBackToUpload}
              icon={ArrowRight}
              iconPosition="right"
            >
              {isHindi ? 'दस्तावेज़ अपलोड पर जाएं' : 'Go to Document Upload'}
            </Button>
          </div>
        </div>
      )}

      {/* Fast Forward / Manual Skip Button during Processing */}
      {ocrStatus === 'PROCESSING' && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleContinueToSummary}
            icon={ArrowRight}
            iconPosition="right"
            className="text-slate-500 hover:text-slate-700"
          >
            {isHindi ? 'सीधे सारांश पर जाएं →' : 'Skip directly to summary →'}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
