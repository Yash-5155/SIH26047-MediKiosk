import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { 
  Camera, 
  RotateCcw, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Scan, 
  AlertCircle, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  FileText, 
  Loader2, 
  ArrowRight 
} from 'lucide-react';
import { uploadMedicalDocument } from '../services/apiService';

/**
 * SCREEN 10 — Document Scanning / Camera
 * 
 * Camera flow: Live Preview → Capture Frame → Retake / Confirm
 * Features:
 *  - Cross-device MediaDevices/getUserMedia (desktop webcam, tablet, mobile rear camera)
 *  - Live video preview with document reticle guide
 *  - Capture current video frame into high-resolution JPEG, Blob, and File objects
 *  - Stops camera stream immediately upon capture/confirm or unmount
 *  - Retake button discards frame and re-activates camera stream
 *  - Confirm button saves captured File/Blob/dataUrl in state/context ready for teammate
 *  - Graceful, informative error handling for permission denied, camera in-use, or no device
 */
export function DocumentScan() {
  const { 
    language, 
    setCurrentStep, 
    activeDocumentType, 
    setCapturedImage,
    scannedDocumentData,
    setScannedDocumentData,
    uploadedDocumentId,
    setUploadedDocumentId,
    setUploadedDocument,
    addMedicalDocument,
    session,
    patient,
    t 
  } = useKiosk();

  const isHindi = language === 'hi';

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [isInitializingCamera, setIsInitializingCamera] = useState(true);
  const [cameraError, setCameraError] = useState(null);

  // Capture & confirmation states
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('[DocumentScan] Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsVideoReady(false);
  }, []);

  // Start / Open camera with cross-device fallbacks
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setIsInitializingCamera(true);
    setIsVideoReady(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError({
        type: 'UNSUPPORTED',
        message: isHindi
          ? 'इस ब्राउज़र या डिवाइस पर कैमरा समर्थित नहीं है।'
          : 'Camera access is not supported by your browser or environment.'
      });
      setIsInitializingCamera(false);
      return;
    }

    // Constraint strategy order:
    // 1. Mobile/tablet: prefer rear/environment camera with 1080p ideal
    // 2. Mobile/tablet: environment camera standard
    // 3. Desktop/laptop: user/front webcam with 720p ideal
    // 4. Basic video true fallback (works on any webcam)
    const constraintStrategies = [
      {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 }
        }
      },
      {
        video: {
          facingMode: 'environment'
        }
      },
      {
        video: {
          facingMode: { ideal: 'user' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      },
      {
        video: true
      }
    ];

    let activeStream = null;
    let lastError = null;

    for (const constraints of constraintStrategies) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (activeStream) break;
      } catch (err) {
        lastError = err;
        console.warn('[DocumentScan] Constraint attempt failed:', err.name);
        // If permission was explicitly denied, break immediately
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          break;
        }
      }
    }

    if (activeStream) {
      streamRef.current = activeStream;
      setCameraActive(true);
      setCameraError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = activeStream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('[DocumentScan] Video play failed:', playErr);
        }
      }
    } else {
      setCameraActive(false);
      let errorMessage = isHindi
        ? 'कैमरा शुरू करने में असमर्थ। कृपया कनेक्शन जांचें।'
        : 'Unable to access camera. Please check connection and permissions.';

      if (lastError?.name === 'NotAllowedError' || lastError?.name === 'PermissionDeniedError') {
        errorMessage = isHindi
          ? 'कैमरा अनुमति अस्वीकार कर दी गई है। कृपया ब्राउज़र सेटिंग्स में कैमरा अनुमति दें।'
          : 'Camera permission was denied. Please allow camera access in your browser to scan documents.';
      } else if (lastError?.name === 'NotFoundError' || lastError?.name === 'DevicesNotFoundError') {
        errorMessage = isHindi
          ? 'इस डिवाइस पर कोई कैमरा नहीं मिला। कृपया वेबकैम कनेक्ट करें।'
          : 'No camera found on this device. Please connect a webcam or upload a file.';
      } else if (lastError?.name === 'NotReadableError' || lastError?.name === 'TrackStartError') {
        errorMessage = isHindi
          ? 'कैमरा पहले से किसी अन्य ऐप द्वारा उपयोग किया जा रहा है।'
          : 'Camera is currently in use by another application or could not be initialized.';
      }

      setCameraError({
        type: lastError?.name || 'UNKNOWN',
        message: errorMessage
      });
    }

    setIsInitializingCamera(false);
  }, [isHindi, stopCamera]);

  // Initial mount: start camera; unmount: stop camera tracks
  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Capture current video frame
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !cameraActive) return;

    const width = video.videoWidth;
    const height = video.videoHeight;

    // Never capture if dimensions are 0 (e.g. video not loaded/ready)
    if (!width || !height || width <= 0 || height <= 0) {
      console.warn('[DocumentScan] Video frame not ready for capture');
      return;
    }

    setIsCapturing(true);

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    // Draw active video frame
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhoto(dataUrl);

    // Convert to native Blob and File object for React state / integration
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const docTypeSafe = String(activeDocumentType || 'document').toLowerCase().replace(/\s+/g, '_');
          const file = new File(
            [blob],
            `camera_${docTypeSafe}_${Date.now()}.jpg`,
            { type: 'image/jpeg', lastModified: Date.now() }
          );
          setCapturedBlob(blob);
          setCapturedFile(file);
        }
      },
      'image/jpeg',
      0.92
    );

    // Requirement 5: Stop the live camera stream after capture
    stopCamera();
    setIsCapturing(false);
  };

  // Helper to map UI doc category to backend enum
  const mapDocumentTypeToBackend = (type) => {
    if (!type) return 'OTHER';
    const norm = String(type).toUpperCase().replace(/\s+/g, '_');
    const allowed = ['PRESCRIPTION', 'LAB_REPORT', 'DISCHARGE_SUMMARY', 'MEDICAL_RECORD', 'OTHER'];
    return allowed.includes(norm) ? norm : 'OTHER';
  };

  // Upload captured file/blob to backend POST /api/documents/upload
  const uploadCapturedDocument = async (fileOrBlob) => {
    const docTypeSafe = String(activeDocumentType || 'document').toLowerCase().replace(/\s+/g, '_');
    const targetFile = fileOrBlob instanceof File
      ? fileOrBlob
      : new File(
          [fileOrBlob],
          capturedFile?.name || `camera_${docTypeSafe}_${Date.now()}.jpg`,
          { type: 'image/jpeg', lastModified: Date.now() }
        );

    const rawPatientId = session?.patient_id || patient?.id;
    const patientId = (rawPatientId && Number.isInteger(Number(rawPatientId)) && Number(rawPatientId) > 0)
      ? Number(rawPatientId)
      : 1;

    const rawSessionId = session?.id;
    const sessionId = (rawSessionId && Number.isInteger(Number(rawSessionId)) && Number(rawSessionId) > 0)
      ? Number(rawSessionId)
      : null;

    const backendDocType = mapDocumentTypeToBackend(activeDocumentType);

    const result = await uploadMedicalDocument({
      file: targetFile,
      patientId,
      sessionId,
      documentType: backendDocType,
    });

    // Store real backend ID in KioskContext
    if (setUploadedDocumentId) {
      setUploadedDocumentId(result.id);
    }
    if (setUploadedDocument) {
      setUploadedDocument(result);
    }

    setScannedDocumentData(prev => ({
      ...(prev || {}),
      dataUrl: capturedPhoto,
      blob: capturedBlob,
      file: targetFile,
      documentId: result.id,
      backendData: result,
      documentType: activeDocumentType || 'Prescription',
      fileName: result.file_name || targetFile.name,
      fileSize: targetFile.size || capturedBlob?.size || 0,
      source: 'CAMERA_CAPTURE',
      capturedAt: new Date().toISOString()
    }));

    if (addMedicalDocument) {
      addMedicalDocument({
        id: `DOC-${result.id}`,
        backendDocumentId: result.id,
        documentType: activeDocumentType || 'Prescription',
        documentName: result.file_name || targetFile.name,
        date: new Date().toISOString().split('T')[0],
        issuer: 'Camera Scanned Record',
        diagnosis: 'Pending Clinical OCR Extraction',
        medicines: [],
        labValues: [],
        abnormalValues: []
      });
    }

    return result;
  };

  // Retake: clear previous stream/state and reopen camera cleanly to live preview
  const handleRetake = () => {
    setCapturedPhoto(null);
    setCapturedBlob(null);
    setCapturedFile(null);
    setIsConfirmed(false);
    setIsVideoReady(false);
    setUploadError(null);
    setIsUploading(false);
    startCamera();
  };

  // Confirm: keep image in React state / context and upload to backend
  const handleConfirm = async () => {
    if (!capturedPhoto) return;

    // Ensure camera stream is fully stopped
    stopCamera();

    // Mark as confirmed in local state
    setIsConfirmed(true);

    // Keep available in KioskContext state
    setCapturedImage(capturedPhoto);
    setScannedDocumentData(prev => ({
      ...(prev || {}),
      dataUrl: capturedPhoto,
      blob: capturedBlob,
      file: capturedFile,
      documentType: activeDocumentType || 'Prescription',
      fileName: capturedFile?.name || `document_${Date.now()}.jpg`,
      fileSize: capturedBlob?.size || 0,
      source: 'CAMERA_CAPTURE',
      capturedAt: new Date().toISOString()
    }));

    // Upload to backend immediately so document ID is ready when proceeding
    const fileToUpload = capturedFile || capturedBlob;
    if (fileToUpload && !scannedDocumentData?.documentId && !uploadedDocumentId) {
      setIsUploading(true);
      setUploadError(null);
      try {
        await uploadCapturedDocument(fileToUpload);
      } catch (err) {
        console.warn('[DocumentScan] Auto-upload on confirm failed, can retry on proceed:', err);
        setUploadError(
          err.message ||
          (isHindi ? 'दस्तावेज़ सर्वर पर अपलोड करने में विफल।' : 'Could not upload document to server.')
        );
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Advance to next step once confirmed and backend ID is guaranteed
  const handleProceed = async () => {
    stopCamera();

    const existingId = 
      scannedDocumentData?.documentId || 
      scannedDocumentData?.backendData?.id || 
      uploadedDocumentId;

    if (existingId) {
      if (setUploadedDocumentId) setUploadedDocumentId(Number(existingId));
      setCurrentStep('ocrprocessing');
      return;
    }

    const fileToUpload = capturedFile || capturedBlob;
    if (!fileToUpload) {
      setUploadError(
        isHindi ? 'कृपया पहले दस्तावेज़ की फोटो लें।' : 'Please capture a document image first.'
      );
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadCapturedDocument(fileToUpload);
      if (result?.id) {
        if (setUploadedDocumentId) setUploadedDocumentId(Number(result.id));
        setCurrentStep('ocrprocessing');
      }
    } catch (err) {
      console.error('[DocumentScan] Proceed upload failed:', err);
      setUploadError(
        err.message ||
        (isHindi ? 'दस्तावेज़ अपलोड करने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to upload document. Please try again.')
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Navigate back to Screen 9 (Medical Documents)
  const handleBack = () => {
    stopCamera();
    setCurrentStep('documents');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto w-full px-4 py-6 sm:py-8"
    >
      <canvas ref={canvasRef} className="hidden" />

      {/* Screen Title */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs uppercase tracking-wider mb-2 border border-rose-200">
          <Camera className="w-3.5 h-3.5 text-kiosk-coral" />
          {isHindi ? 'कियोस्क कैमरा' : 'Kiosk Document Camera'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-kiosk-charcoal tracking-tight mb-2">
          {capturedPhoto
            ? (isHindi ? 'दस्तावेज़ फोटो की पुष्टि करें' : 'Confirm Captured Document')
            : (isHindi ? `${activeDocumentType || 'दस्तावेज़'} स्कैन करें` : `Scan ${activeDocumentType || 'Document'}`)}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
          {capturedPhoto
            ? (isHindi 
                ? 'जांचें कि दस्तावेज़ और टेक्स्ट स्पष्ट रूप से दिखाई दे रहे हैं, फिर पुष्टि करें।' 
                : 'Check that the document text is sharp and clearly visible, then confirm to proceed.')
            : (isHindi 
                ? 'अपने कागजी पर्चे या रिपोर्ट को गाइड बॉक्स के अंदर रखें और फोटो लें।' 
                : 'Position your physical prescription or report inside the viewfinder frame and tap Capture.')}
        </p>
      </div>

      {/* Camera Viewfinder / Preview Box */}
      <div className="bg-slate-950 rounded-3xl p-4 sm:p-6 shadow-kiosk-lg border border-slate-800 mb-6 text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[420px]">
        
        {/* Container for Video or Captured Photo Preview */}
        <div className="relative w-full max-w-xl h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border-2 border-slate-800">
          
          {/* Always-mounted Video element for stream attachment and re-attachment */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => {
              setIsVideoReady(true);
              if (videoRef.current) {
                videoRef.current.play().catch(e => console.warn('[DocumentScan] Play error:', e));
              }
            }}
            onCanPlay={() => {
              setIsVideoReady(true);
            }}
            className={`w-full h-full object-cover ${capturedPhoto || !cameraActive ? 'hidden' : 'block'}`}
          />

          {/* State A: Captured Photo Preview Overlay */}
          {capturedPhoto && (
            <div className="absolute inset-0 w-full h-full bg-slate-950 flex items-center justify-center">
              <img
                src={capturedPhoto}
                alt="Captured Medical Document"
                className="w-full h-full object-contain bg-slate-950"
              />
              
              {/* Captured / Confirmed Tag */}
              <div className={`absolute top-3 right-3 text-white text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md ${
                isConfirmed ? 'bg-emerald-600 ring-2 ring-white/30' : 'bg-slate-800/90 border border-slate-700'
              }`}>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>
                  {isConfirmed
                    ? (isHindi ? 'दस्तावेज़ की पुष्टि की गई' : 'Confirmed & Ready')
                    : (isHindi ? 'फोटो कैप्चर की गई' : 'Captured Frame')}
                </span>
              </div>

              {/* Document metadata strip */}
              {capturedFile && (
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-xs px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 border border-slate-700/80 flex items-center justify-between">
                  <span className="truncate max-w-[200px] sm:max-w-xs">{capturedFile.name}</span>
                  <span className="text-emerald-400 font-mono">
                    {(capturedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>
          )}

          {/* State B: Initializing Camera Loader (when not captured and initializing) */}
          {!capturedPhoto && isInitializingCamera && !cameraActive && (
            <div className="text-center p-6 space-y-3 z-10">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 text-kiosk-blue flex items-center justify-center mx-auto border border-slate-700 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <p className="text-slate-200 font-extrabold text-sm sm:text-base">
                  {isHindi ? 'कैमरा शुरू हो रहा है…' : 'Initializing camera…'}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  {isHindi ? 'डिवाइस कैमरा कनेक्ट किया जा रहा है' : 'Requesting device camera access'}
                </p>
              </div>
            </div>
          )}

          {/* State C: Camera Error / Permission Denied Notification (when not captured and error occurred) */}
          {!capturedPhoto && !cameraActive && !isInitializingCamera && (
            <div className="text-center p-6 sm:p-8 space-y-4 max-w-md z-10">
              <div className="w-16 h-16 rounded-2xl bg-rose-950/80 text-rose-400 flex items-center justify-center mx-auto border border-rose-800 shadow-sm">
                <AlertCircle className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div className="space-y-1.5">
                <p className="text-rose-200 font-extrabold text-sm sm:text-base">
                  {isHindi ? 'कैमरा उपलब्ध नहीं है' : 'Camera Access Error'}
                </p>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {cameraError?.message || (isHindi ? 'कैमरा शुरू नहीं किया जा सका।' : 'Could not access device camera.')}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-kiosk-coral hover:bg-rose-700 text-xs sm:text-sm font-extrabold text-white transition-all shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isHindi ? 'पुनः प्रयास करें' : 'Retry Camera'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-extrabold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-kiosk-blue" />
                  <span>{isHindi ? 'फ़ाइल अपलोड करें' : 'Upload File Instead'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Target Reticle Overlay (Only visible when camera is live and not captured) */}
          {cameraActive && !capturedPhoto && (
            <div className="absolute inset-4 sm:inset-6 border-2 border-dashed border-kiosk-coral/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3 z-10">
              <div className="flex justify-between">
                <div className="w-7 h-7 border-t-4 border-l-4 border-kiosk-coral" />
                <div className="w-7 h-7 border-t-4 border-r-4 border-kiosk-coral" />
              </div>
              <div className="flex justify-between">
                <div className="w-7 h-7 border-b-4 border-l-4 border-kiosk-coral" />
                <div className="w-7 h-7 border-b-4 border-r-4 border-kiosk-coral" />
              </div>
            </div>
          )}
        </div>

        {/* Capture / Guidance Status Strip */}
        <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 bg-slate-900/90 px-4 py-2 rounded-full border border-slate-800 shadow-xs">
          <Scan className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {isConfirmed
              ? (isHindi ? 'दस्तावेज़ की पुष्टि हो चुकी है। आप आगे बढ़ सकते हैं।' : 'Document confirmed and ready.')
              : capturedPhoto
              ? (isHindi ? 'जांचें कि दस्तावेज़ स्पष्ट है, फिर पुष्टि करें।' : 'Review captured preview. Tap Confirm to save.')
              : cameraActive
              ? (isHindi ? 'दस्तावेज़ को गाइड बॉक्स में रखें और फोटो लें' : 'Align document inside guideline box and press Capture')
              : (isHindi ? 'कैमरा कनेक्ट किया जा रहा है…' : 'Waiting for camera connection…')}
          </span>
        </div>
      </div>

      {/* Confirmed Status Notification Banner */}
      <AnimatePresence>
        {isConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-4 sm:p-5 mb-6 flex items-center justify-between flex-wrap gap-4 text-emerald-950 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-black text-sm sm:text-base text-emerald-950">
                  {isHindi ? 'दस्तावेज़ कैप्चर सफलतापूर्वक पुष्ट हुआ' : 'Document Image Confirmed'}
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800 font-medium">
                  {activeDocumentType || 'Prescription'} • {capturedFile?.name || 'camera_document.jpg'} (
                  {capturedBlob ? `${(capturedBlob.size / (1024 * 1024)).toFixed(2)} MB` : '< 5 MB'})
                </p>
              </div>
            </div>

            <Button
              variant="coral"
              size="lg"
              onClick={handleProceed}
              disabled={isUploading}
              icon={isUploading ? Loader2 : ArrowRight}
              iconPosition="right"
            >
              {isUploading
                ? (isHindi ? 'दस्तावेज़ अपलोड हो रहा है…' : 'Uploading Document…')
                : (isHindi ? 'दस्तावेज़ विश्लेषण / OCR शुरू करें' : 'Proceed to Document OCR')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Error Alert */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-4 sm:p-5 mb-6 flex items-center justify-between gap-4 text-rose-950 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-black text-sm sm:text-base text-rose-950">
                  {isHindi ? 'अपलोड त्रुटि' : 'Document Upload Failed'}
                </h4>
                <p className="text-xs sm:text-sm text-rose-800 font-medium">
                  {uploadError}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 underline px-2 py-1 shrink-0 cursor-pointer"
            >
              {isHindi ? 'हटाएं' : 'Dismiss'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleBack}
          icon={ArrowLeft}
          iconPosition="left"
          className="w-full sm:w-auto"
        >
          {isHindi ? 'वापस' : 'Back'}
        </Button>

        {capturedPhoto ? (
          /* Captured State: Retake vs Confirm / Proceed */
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleRetake}
              icon={RotateCcw}
              iconPosition="left"
              className="w-full sm:w-auto"
            >
              {isHindi ? 'पुनः फोटो लें (Retake)' : 'Retake Photo'}
            </Button>

            {!isConfirmed ? (
              <Button
                variant="coral"
                size="xl"
                onClick={handleConfirm}
                disabled={isUploading}
                icon={isUploading ? Loader2 : Check}
                iconPosition="right"
                className="w-full sm:w-auto min-w-[200px]"
              >
                {isUploading
                  ? (isHindi ? 'अपलोड हो रहा है…' : 'Uploading…')
                  : (isHindi ? 'दस्तावेज़ की पुष्टि करें' : 'Confirm Document')}
              </Button>
            ) : (
              <Button
                variant="coral"
                size="xl"
                onClick={handleProceed}
                disabled={isUploading}
                icon={isUploading ? Loader2 : ArrowRight}
                iconPosition="right"
                className="w-full sm:w-auto min-w-[200px]"
              >
                {isUploading
                  ? (isHindi ? 'अपलोड हो रहा है…' : 'Uploading…')
                  : (isHindi ? 'आगे बढ़ें (OCR) →' : 'Continue to OCR →')}
              </Button>
            )}
          </div>
        ) : (
          /* Live Camera State: Capture Frame Button */
          <Button
            variant="coral"
            size="xl"
            onClick={handleCapture}
            disabled={!cameraActive || !isVideoReady || isCapturing}
            icon={Camera}
            iconPosition="left"
            className="w-full sm:w-auto min-w-[220px]"
          >
            {isCapturing
              ? (isHindi ? 'कैप्चर हो रहा है…' : 'Capturing…')
              : (isHindi ? 'फोटो लें (Capture)' : 'Capture Document')}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

