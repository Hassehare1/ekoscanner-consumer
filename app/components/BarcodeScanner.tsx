'use client';

import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

type BarcodeScannerProps = {
  onDetected: (barcode: string) => void;
};

export default function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<any>(null);
  const lastCodeRef = useRef<string | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    if (!videoRef.current) {
      return;
    }

    codeReader
      .decodeFromVideoDevice(
        undefined, // default-kamera
        videoRef.current,
        (result, _err, controls) => {
          controlsRef.current = controls;

          if (!result) return;

          const text = result.getText();
          if (!text) return;

          // Undvik spam om samma kod läses om och om igen
          if (text === lastCodeRef.current) return;
          lastCodeRef.current = text;

          try {
            onDetected(text); // här går vi vidare till page.tsx
          } catch (err) {
            console.error('Error in onDetected callback:', err);
          }
        }
      )
      .catch((err) => {
        console.error('Scanner error:', err);
      });

    return () => {
      if (
        controlsRef.current &&
        typeof controlsRef.current.stop === 'function'
      ) {
        controlsRef.current.stop();
      }
    };
  }, [onDetected]);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 8,
          border: '1px solid #ccc',
        }}
      />
      <p
        style={{
          fontSize: 12,
          color: '#555',
          marginTop: 8,
        }}
      >
        Rikta kameran mot streckkoden. Varje ny kod läses in automatiskt.
      </p>
    </div>
  );
}
