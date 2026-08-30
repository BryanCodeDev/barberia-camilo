import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

const QRScanner = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let animationFrameId = null;
    let detector = null;

    const startScanning = async () => {
      try {
        setScanning(true);
        setError(null);

        if (!window.BarcodeDetector) {
          setShowManualInput(true);
          setScanning(false);
          return;
        }

        detector = new BarcodeDetector({ formats: ['qr_code'] });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const detect = async () => {
          if (!detector || !videoRef.current || videoRef.current.readyState < 2) {
            animationFrameId = requestAnimationFrame(detect);
            return;
          }

          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              onScan(barcodes[0].rawValue);
              return;
            }
          } catch (err) {
            console.error('QR detection error:', err);
          }

          animationFrameId = requestAnimationFrame(detect);
        };

        animationFrameId = requestAnimationFrame(detect);
      } catch (err) {
        console.error('Camera error:', err);
        setError(err.message || 'No se pudo acceder a la cámara');
        setScanning(false);
        setShowManualInput(true);
      }
    };

    startScanning();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (detector) {
        detector = null;
      }
    };
  }, [onScan]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-sm shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl text-[#1C1A16]">Escanear Codigo QR</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#F6F2EA] rounded-sm transition-colors">
            <X className="h-5 w-5 text-[#1C1A16]" />
          </button>
        </div>

        {error && (
          <div className="bg-[#FBEAEA] border border-[#E3B8B8] rounded-sm p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#8B2E2E] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-[#8B2E2E]">{error}</p>
              <p className="text-xs text-[#6B6459] mt-1">Puedes ingresar tu codigo manualmente.</p>
            </div>
          </div>
        )}

        {scanning && !showManualInput && (
          <div className="mb-6">
            <div className="relative bg-[#121113] rounded-sm overflow-hidden aspect-square max-w-xs mx-auto">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-[#A9812E] rounded-lg opacity-50" />
              </div>
            </div>
            <p className="text-sm text-[#6B6459] text-center mt-4">
              Coloca el codigo QR dentro del marco para escanear
            </p>
          </div>
        )}

        {showManualInput && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <p className="text-sm text-[#6B6459] mb-4">
              Ingresa tu codigo de acceso manualmente:
            </p>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ingresa tu codigo QR"
              className="w-full px-4 py-3 border border-[#E4DCC9] rounded-lg focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none transition-all"
              autoFocus
            />
            <Button type="submit" className="w-full" size="lg">
              <Check className="h-4 w-4 mr-2" />
              Verificar Codigo
            </Button>
          </form>
        )}

        {!showManualInput && (
          <div className="flex items-center justify-center gap-4">
            <Button variant="secondary" onClick={() => setShowManualInput(true)}>
              Ingresar manualmente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
