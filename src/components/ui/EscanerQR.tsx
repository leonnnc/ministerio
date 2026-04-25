'use client';

import { useEffect, useRef, useState } from 'react';

interface EscanerQRProps {
  onEscaneo: (codigo: string) => void;
  activo: boolean;
}

export default function EscanerQR({ onEscaneo, activo }: EscanerQRProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [iniciando, setIniciando] = useState(false);

  useEffect(() => {
    if (!activo) {
      // Detener escáner si está activo
      if (scannerRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (scannerRef.current as any).stop().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    let cancelado = false;

    async function iniciar() {
      setIniciando(true);
      setError(null);
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelado || !divRef.current) return;

        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            onEscaneo(decodedText);
          },
          () => {} // error silencioso por frame
        );
      } catch (e) {
        if (!cancelado) {
          setError('No se pudo acceder a la cámara. Verifica los permisos.');
        }
      } finally {
        if (!cancelado) setIniciando(false);
      }
    }

    iniciar();

    return () => {
      cancelado = true;
      if (scannerRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (scannerRef.current as any).stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [activo, onEscaneo]);

  return (
    <div className="flex flex-col items-center gap-3">
      {iniciando && (
        <p className="text-sm text-gray-500 animate-pulse">Iniciando cámara...</p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div
        id="qr-reader"
        ref={divRef}
        className="w-full max-w-xs rounded-2xl overflow-hidden border-2 border-yellow-300 shadow-md"
        style={{ minHeight: activo ? '280px' : '0' }}
      />
      {activo && !error && !iniciando && (
        <p className="text-xs text-gray-400 text-center">
          Apunta la cámara al código QR de la tarjeta del niño(a)
        </p>
      )}
    </div>
  );
}
