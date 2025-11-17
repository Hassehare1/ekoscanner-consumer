'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/browser';

type BarcodeScannerProps = {
  // Den här får vi från page.tsx
  onDetected?: (code: string) => void;
};

export default function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();

    return () => {
      // städa upp om komponenten försvinner
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isActive) {
      stopScanner();
      return;
    }

    if (!videoRef.current || !codeReaderRef.current) return;

    const codeReader = codeReaderRef.current;

    // starta kameran och scanning
    codeReader
      .decodeFromVideoDevice(
        null,
        videoRef.current,
        (result: Result | undefined, err) => {
          if (result) {
            const text = result.getText();

            // undvik spam om samma kod läses flera gånger
            setLastCode((prev) => {
              if (prev !== text) {
                onDetected?.(text); // <-- NU talar vi om för sidan att vi hittat en kod
              }
              return text;
            });
          }
          // ev. fel från ZXing loggar vi bara i konsolen
          if (err && !result) {
            // console.debug(err);
          }
        }
      )
      .catch((e) => {
        console.error('Kunde inte starta scanner:', e);
      });

    return () => {
      stopScanner();
    };
    // vi vill bara reagera på isActive / onDetected
  }, [isActive, onDetected]);

  function stopScanner() {
    const codeReader = codeReaderRef.current;
    try {
      codeReader?.reset();
    } catch (e) {
      // ignore
    }
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current!.srcObject = null;
    }
  }

  return (
    <div>
      {!isActive ? (
        <button
          type="button"
          onClick={() => setIsActive(true)}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid #374151',
            background: '#111827',
            color: '#e5e7eb',
            fontSize: '0.85rem',
            cursor: 'pointer',
            marginBottom: 6,
          }}
        >
          Starta scanner
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsActive(false)}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid #374151',
            background: '#111827',
            color: '#e5e7eb',
            fontSize: '0.85rem',
            cursor: 'pointer',
            marginBottom: 6,
          }}
        >
          Stäng scanner
        </button>
      )}

      <div
        style={{
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid #1f2937',
          background: '#000',
          width: '100%',
          maxWidth: 360,
          aspectRatio: '4 / 3',
        }}
      >
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          muted
        />
      </div>

      {lastCode && (
        <p style={{ fontSize: '0.8rem', marginTop: 4 }}>
          Senast lästa kod: <strong>{lastCode}</strong>
        </p>
      )}
    </div>
  );
}
