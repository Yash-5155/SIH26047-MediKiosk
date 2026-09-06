import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { uploadMedicalDocument } from '../services/apiService';
import { 
  FileText, 
  Camera, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  FileCheck2, 
  SkipForward,
  FileSpreadsheet,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  Hash
} from 'lucide-react';

/**
 * SCREEN 9 — Medical Documents Upload / Scan
 * 
 * Patient is asked: "Do you have previous medical documents?"
 * Options:
 *  - Scan document (kiosk camera)
 *  - Upload (file picker / PC) -> connected to POST /api/documents/upload
 *  - Skip (continue without documents)
 * Supported types: Prescriptions, Lab reports, Discharge summaries
 */
export function MedicalDocuments() {
  const { 
    language, 
    setCurrentStep, 
    activeDocumentType, 
    setActiveDocumentType, 
    setCapturedImage,
    addMedicalDocument,
    scannedDocumentData,
    setScannedDocumentData,
    uploadedDocumentId,
    setUploadedDocumentId,
    uploadedDocument,
    setUploadedDocument,
    patient,
    session,
    t 
  } = useKiosk();

  const isHindi = language === 'hi';
  const fileInputRef = useRef(null);

  // Upload local states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(uploadedDocument || null);

  const documentCategories = [
    {
      id: 'Prescription',
      backendType: 'PRESCRIPTION',
      titleEn: 'Doctor Prescription',
      titleHi: 'डॉक्टर का पर्चा / प्रिस्क्रिप्शन',
      descEn: 'Recent medicines, dosages, and doctor notes',
      descHi: 'हाल की दवाइयां, खुराक और डॉक्टर की सलाह',
      icon: Stethoscope
    },
    {
      id: 'Lab Report',
      backendType: 'LAB_REPORT',
      titleEn: 'Lab / Blood Report',
      titleHi: 'लैब / रक्त परीक्षण रिपोर्ट',
      descEn: 'Blood tests, pathology, radiology, or vitals',
      descHi: 'ब्लड टेस्ट, पैथोलॉजी, एक्स-रे या लैब रिपोर्ट',
      icon: FileSpreadsheet
    },
    {
      id: 'Discharge Summary',
      backendType: 'DISCHARGE_SUMMARY',
      titleEn: 'Discharge Summary',
      titleHi: 'डिस्चार्ज सारांश / पुराना रिकॉर्ड',
      descEn: 'Hospital admission records or past surgeries',
      descHi: 'अस्पताल में भर्ती रिकॉर्ड या पुरानी सर्जरी विवरण',
      icon: FileCheck2
    }
  ];

  // Map category ID to backend allowed type
  const mapDocumentTypeToBackend = (type) => {
    if (!type) return 'OTHER';
    const matched = documentCategories.find(c => c.id === type || c.backendType === type);
    if (matched) return matched.backendType;
    const norm = String(type).toUpperCase().replace(/\s+/g, '_');
    const allowed = ['PRESCRIPTION', 'LAB_REPORT', 'DISCHARGE_SUMMARY', 'MEDICAL_RECORD', 'OTHER'];
    return allowed.includes(norm) ? norm : 'OTHER';
  };

  // Handle native file selection & upload to backend
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // 1. Validate file size (10 MB maximum)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(
        isHindi
          ? 'फ़ाइल का आकार 10 MB से अधिक है। कृपया 10 MB से छोटी फ़ाइल चुनें।'
          : 'File size exceeds 10 MB. Please select a file smaller than 10 MB.'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validate file type (PDF, JPEG, PNG, WEBP)
    const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const ALLOWED_EXT = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
    const isValidType = ALLOWED_MIME.includes(file.type) || ALLOWED_EXT.includes(ext);

    if (!isValidType) {
      setUploadError(
        isHindi
          ? 'अमान्य फ़ाइल प्रकार। केवल PDF, JPG, PNG, या WEBP फ़ाइलें समर्थित हैं।'
          : 'Unsupported file type. Please upload a PDF, JPG, PNG, or WEBP document.'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. Keep selected file in frontend state
    setSelectedFile(file);
    setIsUploading(true);

    // 4. Extract IDs from existing session/patient state
    const backendDocType = mapDocumentTypeToBackend(activeDocumentType);
    
    // Ensure patientId is a valid positive integer (backend expects int)
    const rawPatientId = session?.patient_id || patient?.id;
    const patientId = (rawPatientId && Number.isInteger(Number(rawPatientId)) && Number(rawPatientId) > 0)
      ? Number(rawPatientId)
      : 1;

    // Only pass session_id if it is a valid integer from backend (avoid random strings or non-numeric IDs that cause 500)
    const rawSessionId = session?.id;
    const sessionId = (rawSessionId && Number.isInteger(Number(rawSessionId)) && Number(rawSessionId) > 0)
      ? Number(rawSessionId)
      : null;

    try {
      // 5. Send multipart/form-data to POST /api/documents/upload
      const result = await uploadMedicalDocument({
        file,
        patientId,
        sessionId,
        documentType: backendDocType,
      });

      // 6. On successful upload:
      // Store returned document_id in frontend state/context
      if (setUploadedDocumentId) {
        setUploadedDocumentId(result.id);
      }
      if (setUploadedDocument) {
        setUploadedDocument(result);
      }

      // Update scannedDocumentData
      setScannedDocumentData({
        documentId: result.id,
        documentType: activeDocumentType,
        fileName: result.file_name || file.name,
        fileSize: file.size,
        uploadedAt: result.uploaded_at || new Date().toISOString(),
        backendData: result,
      });

      // Add to medicalDocuments in context
      addMedicalDocument({
        id: `DOC-${result.id}`,
        backendDocumentId: result.id,
        documentType: activeDocumentType || 'Prescription',
        documentName: result.file_name || file.name,
        date: new Date().toISOString().split('T')[0],
        issuer: 'Uploaded Medical Record',
        diagnosis: 'Pending Clinical OCR Extraction',
        medicines: [],
        labValues: [],
        abnormalValues: [],
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });

      // If image, create data URL for preview in subsequent screens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setCapturedImage(event.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setCapturedImage(null);
      }

      setUploadSuccess(result);
    } catch (err) {
      console.error('[MedicalDocuments] Upload failed:', err);
      setUploadError(
        err.message ||
          (isHindi
            ? 'दस्तावेज़ अपलोड करने में विफल। कृपया पुनः प्रयास करें।'
            : 'Could not upload document to server. Please try again.')
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = (docType) => {
    if (docType) {
      setActiveDocumentType(docType);
    }
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleScanClick = (docType) => {
    if (docType) {
      setActiveDocumentType(docType);
    }
    setCurrentStep('documentscan');
  };

  const handleSkip = () => {
    setCurrentStep('generatingsummary');
  };

  const handleContinueToOCR = () => {
    const docId = 
      uploadSuccess?.id || 
      uploadedDocumentId || 
      scannedDocumentData?.documentId || 
      scannedDocumentData?.backendData?.id;

    if (!docId) {
      setUploadError(
        isHindi
          ? 'कृपया जारी रखने से पहले दस्तावेज़ सफलतापूर्वक अपलोड होने की प्रतीक्षा करें।'
          : 'Please wait for document upload to complete successfully before proceeding to OCR.'
      );
      return;
    }

    if (setUploadedDocumentId) {
      setUploadedDocumentId(Number(docId));
    }
    if (setUploadedDocument && uploadSuccess) {
      setUploadedDocument(uploadSuccess);
    }

    setCurrentStep('ocrprocessing');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto w-full px-4 py-6 sm:py-8"
    >
      {/* Hidden File Input for Native File Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Screen Title */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kiosk-peach text-kiosk-coral font-bold text-xs uppercase tracking-wider mb-2">
          <FileText className="w-3.5 h-3.5" />
          {isHindi ? 'चरण 2: पूर्व दस्तावेज़' : 'Step 2: Medical Documents'}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-kiosk-charcoal tracking-tight mb-3">
          {isHindi ? 'क्या आपके पास कोई पूर्व चिकित्सीय दस्तावेज़ हैं?' : 'Do you have previous medical documents?'}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
          {isHindi
            ? 'पुराने पर्चे, लैब रिपोर्ट या डिस्चार्ज समरी संलग्न करने से डॉक्टर को आपके स्वास्थ्य इतिहास को समझने में मदद मिलती है।'
            : 'Adding past prescriptions, blood test reports, or hospital records helps your doctor provide accurate clinical care.'}
        </p>
      </div>

      {/* Error Notification Banner */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-4 sm:p-5 mb-6 flex items-start gap-4 text-rose-900 shadow-xs"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-sm sm:text-base text-rose-950">
                {isHindi ? 'अपलोड त्रुटि' : 'Document Upload Error'}
              </h4>
              <p className="text-xs sm:text-sm text-rose-700 mt-0.5 font-medium leading-relaxed">
                {uploadError}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 underline px-2 py-1 shrink-0"
            >
              {isHindi ? 'हटाएं' : 'Dismiss'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading / Uploading In-Progress Banner */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-sky-50 border-2 border-kiosk-blue/40 rounded-3xl p-6 sm:p-8 mb-8 text-center space-y-4 shadow-kiosk-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-kiosk-blue text-white flex items-center justify-center mx-auto shadow-md">
              <Loader2 className="w-7 h-7 animate-spin stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {isHindi ? 'दस्तावेज़ अपलोड हो रहा है…' : 'Uploading document to clinical server…'}
              </h3>
              <p className="text-sm text-slate-600 font-medium mt-1">
                {selectedFile ? selectedFile.name : (isHindi ? 'फ़ाइल जांची जा रही है' : 'Securing file in health record')}
                {selectedFile?.size ? ` • ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ''}
              </p>
            </div>
            <div className="w-full max-w-xs mx-auto bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-kiosk-blue h-full rounded-full animate-pulse w-3/4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Success & Document Information Card */}
      <AnimatePresence>
        {uploadSuccess && !isUploading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50/80 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 mb-8 shadow-kiosk-sm space-y-5"
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider bg-emerald-200/90 text-emerald-900 px-2.5 py-0.5 rounded-full">
                      {isHindi ? 'सफलतापूर्वक अपलोड' : 'Upload Success'}
                    </span>
                    <span className="text-xs font-bold font-mono bg-white text-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-emerald-600" />
                      Document ID: {uploadSuccess.id}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-950 mt-1">
                    {uploadSuccess.file_name || selectedFile?.name || 'Medical Document'}
                  </h3>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-white/80 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {isHindi ? 'सुरक्षित क्लिनिकल रिकॉर्ड' : 'Stored in Clinical DB'}
              </span>
            </div>

            {/* Document Metadata Details Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-emerald-200/80">
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">
                  {isHindi ? 'प्रकार:' : 'Type:'}
                </span>
                <span className="font-extrabold text-slate-800 text-sm">
                  {uploadSuccess.document_type || activeDocumentType}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">
                  {isHindi ? 'आकार:' : 'Size:'}
                </span>
                <span className="font-extrabold text-slate-800 text-sm">
                  {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : '< 10 MB'}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">
                  {isHindi ? 'रोगी ID:' : 'Patient ID:'}
                </span>
                <span className="font-extrabold text-slate-800 text-sm">
                  #{uploadSuccess.patient_id || session?.patient_id || patient?.id || 1}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">
                  {isHindi ? 'सत्र ID:' : 'Session ID:'}
                </span>
                <span className="font-extrabold text-slate-800 text-sm">
                  #{uploadSuccess.session_id || session?.id || 'Active'}
                </span>
              </div>
            </div>

            {/* Actions for uploaded document */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleUploadClick(activeDocumentType)}
                className="text-xs font-extrabold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                {isHindi ? 'दूसरी फ़ाइल अपलोड करें' : 'Upload another file'}
              </button>

              <Button
                variant="coral"
                size="lg"
                onClick={handleContinueToOCR}
                icon={ArrowRight}
                iconPosition="right"
              >
                {isHindi ? 'दस्तावेज़ स्कैन / OCR जारी रखें' : 'Continue to OCR Scanning'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Action Choice Grid: Scan vs Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Option 1: Scan via Kiosk Camera */}
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleScanClick(activeDocumentType)}
          className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-kiosk-coral shadow-kiosk-sm hover:shadow-kiosk-md transition-all cursor-pointer flex flex-col justify-between min-h-[260px] group select-none touch-manipulation"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-kiosk-coral flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <Camera className="w-8 h-8 stroke-[2.2]" />
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {isHindi ? 'कियोस्क कैमरा' : 'Kiosk Camera'}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-kiosk-charcoal mb-2">
              {isHindi ? 'दस्तावेज़ स्कैन करें' : 'Scan Document'}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {isHindi
                ? 'अपने कागजी पर्चे या रिपोर्ट को कियोस्क कैमरे के सामने रखें और तुरंत फोटो लें।'
                : 'Hold your paper prescription or physical report up to the kiosk camera for quick capture.'}
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              {isHindi ? 'लाइव व्यूफाइंडर' : 'Live Camera Viewfinder'}
            </span>
            <span className="text-sm font-extrabold text-kiosk-coral flex items-center gap-1">
              {isHindi ? 'कैमरा शुरू करें' : 'Start Camera'} <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </motion.div>

        {/* Option 2: Upload Digital File (PC File Picker) */}
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleUploadClick(activeDocumentType)}
          className={`bg-white rounded-3xl p-6 sm:p-8 border-2 shadow-kiosk-sm hover:shadow-kiosk-md transition-all cursor-pointer flex flex-col justify-between min-h-[260px] group select-none touch-manipulation ${
            isUploading
              ? 'border-kiosk-blue ring-2 ring-kiosk-blue/20 pointer-events-none'
              : 'border-slate-200 hover:border-kiosk-blue'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-100 text-kiosk-blue flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <Upload className="w-8 h-8 stroke-[2.2]" />
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {isHindi ? 'डिजिटल फाइल' : 'PC File Upload'}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-kiosk-charcoal mb-2">
              {isHindi ? 'फाइल अपलोड करें' : 'Upload File from PC'}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {isHindi
                ? 'अपने कंप्यूटर या स्टोरेज से PDF, JPG, PNG या WEBP दस्तावेज़ अपलोड करें (अधिकतम 10 MB)।'
                : 'Select an image (JPG, PNG, WEBP) or PDF document from your PC or storage (max 10 MB).'}
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              PDF, JPG, PNG, WEBP (≤ 10 MB)
            </span>
            <span className="text-sm font-extrabold text-kiosk-blue flex items-center gap-1">
              {isUploading
                ? (isHindi ? 'अपलोड हो रहा है…' : 'Uploading…')
                : (isHindi ? 'फाइल चुनें' : 'Choose File')}{' '}
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </motion.div>

      </div>

      {/* Supported Document Types Selection & Showcase */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-kiosk-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            {isHindi ? 'दस्तावेज़ प्रकार चुनें:' : 'Select Document Type to Upload:'}
          </h3>
          <span className="text-xs font-bold text-kiosk-blue bg-sky-50 px-2.5 py-0.5 rounded-full">
            {isHindi ? 'चयनित:' : 'Selected:'} {activeDocumentType}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {documentCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeDocumentType === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => setActiveDocumentType(cat.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none touch-manipulation ${
                  isSelected
                    ? 'border-kiosk-blue bg-sky-50/70 shadow-xs ring-2 ring-kiosk-blue/15'
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border ${
                  isSelected
                    ? 'bg-kiosk-blue text-white border-kiosk-blue'
                    : 'bg-white text-kiosk-charcoal border-slate-200'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-kiosk-charcoal">
                      {isHindi ? cat.titleHi : cat.titleEn}
                    </h4>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-kiosk-blue text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    {isHindi ? cat.descHi : cat.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons: Back, Continue to OCR, Skip */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentStep('conversation')}
          icon={ArrowLeft}
          iconPosition="left"
        >
          {isHindi ? 'साक्षात्कार पर वापस' : 'Back to Interview'}
        </Button>

        {uploadSuccess ? (
          <Button
            variant="coral"
            size="xl"
            onClick={handleContinueToOCR}
            icon={ArrowRight}
            iconPosition="right"
          >
            {isHindi ? 'दस्तावेज़ विश्लेषण / OCR शुरू करें' : 'Continue with Uploaded Document'}
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="xl"
            onClick={handleSkip}
            icon={SkipForward}
            iconPosition="right"
          >
            {isHindi ? 'दस्तावेज़ नहीं हैं (आगे बढ़ें)' : "I don't have documents (Skip)"}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
