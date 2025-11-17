'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

type BarcodeScannerProps = {
  onDetected: (barcode: string) => void;
};

export default function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    async function startScanner() {
      if (!videoRef.current) return;

      try {
        setErrorMessage(null);
        setIsScanning(true);

        // OBS: undefined istället för null → TS blir nöjd
        codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err, controls) => {
            if (result) {
              const text = result.getText();
              if (text) {
                onDetected(text);       // skicka koden till parent
                controls?.stop();       // stoppa scanning efter träff
                setIsScanning(false);
              }
            }
          }
        );
      } catch (err: any) {
        console.error(err);
        setErrorMessage(
          'Kunde inte starta kameran. Tillåt kamerabehörighet och testa igen.'
        );
        setIsScanning(false);
      }
    }

    startScanner();

    // Rensa upp när komponenten avmonteras
    return () => {
      codeReader.reset();
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

      {isSca
