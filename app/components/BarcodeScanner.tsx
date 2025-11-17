'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

type BarcodeScannerProps = {
  // Funktionen kommer från page.tsx och tar emot den skannade koden
  onDetected: (barcode: string) => void;
};

export default function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let controls: ReturnType<typeof codeReader.decodeFromVideoDevice> | null = null;

    async function startScanner() {
      if (!videoRef.current) return;

      try {
        setErrorMessage(null);
        setIsScanning(true);

        controls = codeReader.decodeFromVideoDevice(
          null,
          videoRef.current,
          (result, err, _controls) => {
            // Vissa fel är bara “brus” under scanning – ignorera dem
            if (result) {
              const text = result.getText();
              if (text) {
                onDetected(text); // Skicka upp koden till sidan
                // Stoppa direkt efter en träff så att vi inte spammar
                _controls.stop();
                setIsScanning(false);
              }
            }
          }
        );
      } catch (err: any) {
        console.error(err);
        setErrorMessage('Kunde inte starta kameran. Tillåt kamerabehörighet och testa igen.');
        setIsScanning(false);
      }
    }

    startScanner();

    return () => {
      if (controls) {
        controls.then(c => c.stop()).catch(() => {});
      } else {
        codeReader.reset();
      }
    };
  }, [onDetected]);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border p-3 flex flex-col items-center">
        <video
          ref={videoRef}
          className="w-full max-w-sm rounded-md border"
          autoPlay
          muted
          playsInline
        />
        <span className="mt-2 text-sm text-gray-600">
          Rikta kameran mot streckkoden. När den lästs in fylls koden automatiskt och AI körs.
        </span>
      </div>

      {isScanning && (
        <div className="text-xs text-gray-500">
          Scannar efter streckkod…
        </div>
      )}

      {errorMessage && (
        <div className="text-sm text-red-600">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
