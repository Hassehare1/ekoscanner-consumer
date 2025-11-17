'use client';

import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

type BarcodeScannerProps = {
  onDetected: (barcode: string) => void;
};

export default function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let stopped = false;

    if (!videoRef.current) {
      return;
    }

    codeReader
      .decodeFromVideoDevice(
        undefined, // default-kamera
        videoRef.current,
        (result, _err, controls) => {
          controlsRef.current = controls;

          if (stopped || !result) return;

          const text = result.getText();
          if (!text) return;

          try {
            // Här går vi “ut” till din logik i page.tsx
            onDetected(text);
          } catch (err) {
            console.error('Error in onDetected callback:', err);
          }

          controls?.stop();
          stopped = true;
        }
      )
      .catch((err) => {
        console.error('Scanner error:', err);
      });

    return () => {
      stopped = true;
      if (controlsRef.current && typeof controlsRef.current.stop === 'function') {
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
        Rikta kameran mot streckkoden tills den lästs in.
      </p>
    </div>
  );
}
