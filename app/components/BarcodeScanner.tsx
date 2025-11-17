'use client';

import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

type BarcodeScannerProps = {
  onDetected: (barcode: string) => void;
};

export default function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
          if (stopped) return;

          if (result) {
            const text = result.getText();
            if (text) {
              onDetected(text);   // skicka upp koden till parent
              controls?.stop();   // stoppa kameran efter träff
              stopped = true;
            }
          }
        }
      )
      .catch((err) => {
        console.error('Scanner error:', err);
      });

    return () => {
      stopped = true;
      // Typdefinitionerna saknar reset(), men funktionen finns i runtime.
      (codeReader as any).reset();
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
