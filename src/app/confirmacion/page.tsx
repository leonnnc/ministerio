'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { descargarTarjetaPDF } from '@/components/tarjeta/TarjetaAlumnoPDF';
import { Button, Spinner } from '@/components/ui';
import type { Alumno, Apoderado, Salon } from '@/types';

function formatearFecha(fechaISO: string): string {
  const [y, m, d] = fechaISO.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function TarjetaCompleta({ alumno, apoderado, salon }: { alumno: Alumno; apoderado: Apoderado; salon: Salon }) {
  const qrValue = alumno.codigoQR ?? alumno.id;

  return (
    <div className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-yellow-300 bg-white">
      {/* Header */}
      <div className="px-5 py-4 text-center" style={{ background: '#F5C518' }}>
        <p className="font-extrabold text-lg" style={{ color: '#4a2c00' }}>✝️ Ministerio de Niños</p>
        <p className="text-xs mt-0.5" style={{ color: '#78350f' }}>Tarjeta de Identificación</p>
      </div>

      {/* Foto + nombre */}
      <div className="flex flex-col items-center pt-5 pb-3 px-5">
        {alumno.fotografiaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={alumno.fotografiaUrl} alt={alumno.nombreCompleto}
            className="w-24 h-24 rounded-full object-cover border-4 border-yellow-300 shadow-md" />
        ) : (
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-yellow-300 shadow-md"
            style={{ background: '#FFF9C4', color: '#4a2c00' }}>
            {alumno.nombreCompleto.charAt(0)}
          </div>
        )}

        {/* QR debajo de la foto */}
        <div className="mt-3 p-2 bg-white rounded-xl border border-yellow-200 shadow-sm">
          <QRCode value={qrValue} size={80} />
        </div>
        <p className="text-xs text-gray-400 mt-1 font-mono">{qrValue}</p>
      </div>

      {/* Datos del niño */}
      <div className="px-5 pb-4 space-y-2">
        <h2 className="text-xl font-extrabold text-center" style={{ color: '#4a2c00' }}>
          {alumno.nombreCompleto}
        </h2>

        <div className="rounded-xl p-3 space-y-1.5 text-sm" style={{ background: '#FFFDE7' }}>
          <div className="flex justify-between">
            <span className="text-gray-500">Salón:</span>
            <span className="font-semibold" style={{ color: '#4a2c00' }}>{salon.nombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Nacimiento:</span>
            <span className="font-semibold" style={{ color: '#4a2c00' }}>{formatearFecha(alumno.fechaNacimiento)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Sexo:</span>
            <span className="font-semibold capitalize" style={{ color: '#4a2c00' }}>{alumno.sexo}</span>
          </div>
          {alumno.alergias && (
            <div className="flex justify-between">
              <span className="text-gray-500">Alergias:</span>
              <span className="font-semibold text-red-600 text-right max-w-[60%]">{alumno.alergias}</span>
            </div>
          )}
          {alumno.tipoSangre && alumno.tipoSangre !== 'desconocido' && (
            <div className="flex justify-between">
              <span className="text-gray-500">Sangre:</span>
              <span className="font-bold text-red-600">{alumno.tipoSangre}</span>
            </div>
          )}
        </div>

        {/* Apoderado */}
        <div className="rounded-xl p-3 space-y-1 text-sm border border-yellow-100" style={{ background: '#FFF9C4' }}>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#D97706' }}>Apoderado</p>
          <p className="font-semibold" style={{ color: '#4a2c00' }}>{apoderado.nombreCompleto}</p>
          <p className="text-gray-600">📞 {apoderado.telefono}</p>
          {apoderado.telefonoEmergencia && (
            <p className="text-gray-600">🚨 {apoderado.telefonoEmergencia}</p>
          )}
          {apoderado.distrito && (
            <p className="text-gray-500 text-xs">{apoderado.distrito}, {apoderado.departamento ?? 'Lima'}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const alumnoId = searchParams.get('alumnoId') ?? '';

  const alumno = useAlumnosStore((s) => s.obtenerAlumnoPorId(alumnoId));
  const apoderados = useAlumnosStore((s) => s.apoderados);
  const salones = useSalonesStore((s) => s.salones);

  const [descargando, setDescargando] = useState(false);
  const [esperando, setEsperando] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setEsperando(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (esperando && !alumno) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" style={{ background: '#FFFDE7' }}>
        <Spinner size="lg" />
        <p className="text-gray-500 text-sm">Cargando datos del registro...</p>
      </div>
    );
  }

  if (!alumno) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" style={{ background: '#FFFDE7' }}>
        <p className="text-red-600 text-lg font-semibold">No se encontró el alumno registrado.</p>
        <Link href="/inscripcion" className="underline" style={{ color: '#D97706' }}>Volver a inscripción</Link>
      </div>
    );
  }

  const apoderado = apoderados.find((a) => a.id === alumno.apoderadoId);
  const salon = salones.find((s) => s.id === alumno.salonId);

  if (!apoderado || !salon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" style={{ background: '#FFFDE7' }}>
        <p className="text-red-600 text-lg font-semibold">Datos incompletos. Intente nuevamente.</p>
        <Link href="/inscripcion" className="underline" style={{ color: '#D97706' }}>Volver a inscripción</Link>
      </div>
    );
  }

  async function handleDescargarPDF() {
    if (!alumno || !apoderado || !salon) return;
    setDescargando(true);
    try { await descargarTarjetaPDF(alumno, apoderado, salon); }
    finally { setDescargando(false); }
  }

  function compartirWhatsApp() {
    const qr = alumno!.codigoQR ?? alumno!.id;
    const msg = encodeURIComponent(
      `✝️ *Ministerio de Niños*\n\n` +
      `Hola ${apoderado!.nombreCompleto}, tu hijo/a *${alumno!.nombreCompleto}* ha sido inscrito exitosamente.\n\n` +
      `📋 *Salón:* ${salon!.nombre}\n` +
      `🎂 *Nacimiento:* ${formatearFecha(alumno!.fechaNacimiento)}\n` +
      `🔑 *Código QR:* ${qr}\n\n` +
      `Presenta este código al dejar y recoger a tu hijo/a. ¡Dios te bendiga! 🙏`
    );
    const tel = apoderado!.whatsapp ?? apoderado!.telefono;
    const numero = tel.replace(/\D/g, '');
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#FFFDE7' }}>
      <div className="max-w-lg mx-auto space-y-6">

        {/* Mensaje de éxito */}
        <div className="text-center">
          <div className="text-5xl mb-2">🎉</div>
          <h1 className="text-2xl font-extrabold" style={{ color: '#4a2c00' }}>¡Inscripción exitosa!</h1>
          <p className="text-gray-600 mt-1">El niño ha sido registrado correctamente en el ministerio.</p>
        </div>

        {/* Tarjeta completa con QR */}
        <TarjetaCompleta alumno={alumno} apoderado={apoderado} salon={salon} />

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <button onClick={compartirWhatsApp}
            className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-sm"
            style={{ background: '#25D366' }}>
            <span className="text-lg">📱</span> Enviar por WhatsApp al apoderado
          </button>

          <Button onClick={handleDescargarPDF} loading={descargando} className="w-full"
            style={{ background: '#F5C518', color: '#4a2c00', border: 'none' }}>
            {descargando ? 'Generando PDF...' : '📄 Descargar tarjeta PDF'}
          </Button>

          <Link href="/inscripcion" className="w-full">
            <Button variant="outline" className="w-full">Inscribir otro niño</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFDE7' }}>
        <Spinner />
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  );
}
