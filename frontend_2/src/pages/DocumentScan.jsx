import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useKiosk } from '../context/KioskContext';
import { Button } from '../components/Button';
import { mockDocumentScanner } from '../services/mockDocumentScanner';
import { Camera, Scan, ShieldCheck, ArrowLeft, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export function DocumentScan() {
  const { setScannedDocumentData, setCurrentStep, t } = useKiosk();
  
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Initialize camera stream if supported
  useEffect(() => {
    let stream = null;

    async function initCamera() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
          }
        } catch (err) {
          setCameraError(t('cameraError'));
          setCameraActive(false);
        }
      } else {
        setCameraError(t('cameraError'));
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [t]);

  const handleStartScan = async () => {
    setIsScanning(true);
    try {
      const result = await mockDocumentScanner.scanDocument();
      setScannedDocumentData(result);
      setCurrentStep('documentconfirm');
    } catch (err) {
      setIsScanning(false);
    }
  };

  const handleManualEntry = () => {
    setCurrentStep('details');
  };

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
          {t('docScanTitle')}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          {t('docScanSubtitle')}
        </p>
      </div>

      {/* Scanner Viewfinder Box */}
      <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-kiosk-lg border border-slate-800 mb-6 text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
        
        {/* Video stream or camera simulation container */}
        <div className="relative w-full max-w-lg h-72 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-slate-700">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-6">
              <Camera className="w-16 h-16 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">
                {cameraError || 'Camera preview loading / fallback scanner active'}
              </p>
            </div>
          )}

          {/* Scanner Reticle Overlay */}
          <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-kiosk-coral/80 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
            <div className="flex justify-between">
              <div className="w-6 h-6 border-t-4 border-l-4 border-kiosk-coral" />
              <div className="w-6 h-6 border-t-4 border-r-4 border-kiosk-coral" />
            </div>

            {/* Scanning beam animation when scanning */}
            {isScanning && (
              <motion.div
                initial={{ y: -80 }}
                animate={{ y: 80 }}
                transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
                className="h-1 bg-gradient-to-r from-transparent via-kiosk-coral to-transparent shadow-[0_0_15px_#E05D52]"
              />
            )}

            <div className="flex justify-between">
              <div className="w-6 h-6 border-b-4 border-l-4 border-kiosk-coral" />
              <div className="w-6 h-6 border-b-4 border-r-4 border-kiosk-coral" />
            </div>
          </div>
        </div>

        {/* Scan instruction pill */}
        <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700">
          <Scan className={`w-4 h-4 ${isScanning ? 'text-kiosk-coral animate-spin' : 'text-emerald-400'}`} />
          <span>{isScanning ? 'Reading document details...' : t('scanInstruction')}</span>
        </div>

        {/* Privacy Note */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t('docPrivacyNotice')}</span>
        </div>

      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentStep('details')}
          icon={ArrowLeft}
          iconPosition="left"
          className="w-full sm:w-auto"
        >
          {t('backBtn')}
        </Button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleManualEntry}
            className="w-full sm:w-auto"
          >
            {t('enterManualBtn')}
          </Button>

          <Button
            variant="coral"
            size="xl"
            onClick={handleStartScan}
            disabled={isScanning}
            icon={isScanning ? RefreshCw : Camera}
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            {isScanning ? 'Scanning...' : t('scanDocBtn')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
