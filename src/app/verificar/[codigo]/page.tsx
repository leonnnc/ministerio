'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { buscarAlumnoPorCodigo } from '@/lib/firestore/alumnosService';
import { obtenerSalones } from '@/lib/firestore/salonesService';
import { Spinner } from '@/components/ui';
import type { Alumno, Apoderado, Salon } from '@/types';

function formatearFecha(fechaISO: string): string {
  const [y, m, d] = fechaISO.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  if (hoy.getMonth() < nac.getMonth() ||
    (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

export default function VerificarPage() {
  const params = useParams();
  const codigo = params?.codigo as string;

  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [apoderado, setApoderado] = useState<Apoderado | null>(null);
  const [salon, setSalon] = useState<Salon | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'encontrado' | 'no_encontrado' | 'error'>('cargando');

  useEffect(() => {
    if (!codigo) { setEstado('no_encontrado'); return; }

    async function cargar() {
      try {
        console.log('Buscando código:', codigo);
        const resultado = await buscarAlumnoPorCodigo(codigo);
        console.log('Resultado:', resultado);
        if (!resultado) { setEstado('no_encontrado'); return; }

        setAlumno(resultado.alumno);
        setApoderado(resultado.apoderado);

        // Cargar salón
        const salones = await obtenerSalones();
        const s = salones.find((x) => x.id === resultado.alumno.salonId);
        setSalon(s ?? null);
        setEstado('encontrado');
      } catch {
        setEstado('error');
      }
    }

    cargar();
  }, [codigo]);

  if (estado === 'cargando') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#FFFDE7' }}>
        <Spinner size="lg" />
        <p className="text-gray-500 text-sm">Verificando inscripción...</p>
      </div>
    );
  }

  if (estado === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: '#FFFDE7' }}>
        <p className="text-red-600 font-semibold">Error al verificar. Intenta nuevamente.</p>
        <Link href="/" className="text-sm underline" style={{ color: '#D97706' }}>Volver al inicio</Link>
      </div>
    );
  }

  if (estado === 'no_encontrado' || !alumno) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" style={{ background: '#FFFDE7' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-extrabold text-red-600">Código no encontrado</h1>
          <p className="text-gray-500 text-sm mt-2">
            Este código QR no corresponde a ningún niño inscrito en el ministerio.
          </p>
        </div>
        <Link href="/" className="text-sm underline" style={{ color: '#D97706' }}>Volver al inicio</Link>
      </div>
    );
  }

  const qrValue = typeof window !== 'undefined'
    ? `${window.location.origin}/verificar/${alumno.codigoQR ?? alumno.id}`
    : alumno.codigoQR ?? alumno.id;

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#FFFDE7' }}>
      <div className="max-w-sm mx-auto space-y-4">

        {/* Badge verificado */}
        <div className="rounded-2xl border-2 border-green-200 bg-green-50 px-4 py-3 text-center">
          <p className="text-green-700 font-bold text-sm">✅ Niño inscrito y verificado</p>
          <p className="text-green-600 text-xs mt-0.5">Ministerio de Niños</p>
        </div>

        {/* Tarjeta */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-yellow-300 bg-white">
          <div className="px-5 py-4 text-center" style={{ background: '#F5C518' }}>
            <p className="font-extrabold text-lg" style={{ color: '#4a2c00' }}>Ministerio de Niños</p>
            <p className="text-xs mt-0.5" style={{ color: '#78350f' }}>Tarjeta de Identificación</p>
          </div>

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
            <div className="mt-3 p-2 bg-white rounded-xl border border-yellow-200 shadow-sm">
              <QRCode value={qrValue} size={80} />
            </div>
            <p className="text-xs text-gray-400 mt-1 font-mono">{alumno.codigoQR ?? alumno.id}</p>
          </div>

          <div className="px-5 pb-4 space-y-2">
            <h2 className="text-xl font-extrabold text-center" style={{ color: '#4a2c00' }}>
              {alumno.nombreCompleto}
            </h2>

            <div className="rounded-xl p-3 space-y-1.5 text-sm" style={{ background: '#FFFDE7' }}>
              <div className="flex justify-between">
                <span className="text-gray-500">Salón:</span>
                <span className="font-semibold" style={{ color: '#4a2c00' }}>{salon?.nombre ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nacimiento:</span>
                <span className="font-semibold" style={{ color: '#4a2c00' }}>{formatearFecha(alumno.fechaNacimiento)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Edad:</span>
                <span className="font-semibold" style={{ color: '#4a2c00' }}>{calcularEdad(alumno.fechaNacimiento)} años</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sexo:</span>
                <span className="font-semibold capitalize" style={{ color: '#4a2c00' }}>{alumno.sexo}</span>
              </div>
              {alumno.alergias && alumno.alergias.toLowerCase() !== 'no' && (
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
              {alumno.condicionesMedicas && alumno.condicionesMedicas.toLowerCase() !== 'no' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Condición:</span>
                  <span className="font-semibold text-right max-w-[60%]" style={{ color: '#4a2c00' }}>{alumno.condicionesMedicas}</span>
                </div>
              )}
            </div>

            {apoderado && (
              <div className="rounded-xl p-3 space-y-1 text-sm border border-yellow-100" style={{ background: '#FFF9C4' }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#D97706' }}>
                  {apoderado.relacion === 'padre' ? 'Padre' : apoderado.relacion === 'madre' ? 'Madre' : 'Apoderado'}
                </p>
                <p className="font-semibold" style={{ color: '#4a2c00' }}>{apoderado.nombreCompleto}</p>
                <p className="text-gray-600">📞 {apoderado.telefono}</p>
                {apoderado.telefonoEmergencia && (() => {
                  const telPrincipal = apoderado.telefono.replace(/\D/g, '').slice(-9);
                  const telEmergencia = apoderado.telefonoEmergencia.replace(/\D/g, '').slice(-9);
                  const mismoNumero = telPrincipal === telEmergencia;
                  const mismoNombre = !apoderado.nombreEmergencia ||
                    apoderado.nombreEmergencia.trim().toLowerCase() === apoderado.nombreCompleto.trim().toLowerCase();
                  if (mismoNumero && mismoNombre) return null;
                  return (
                    <p className="text-gray-600">
                      🚨 {apoderado.telefonoEmergencia}
                      {apoderado.nombreEmergencia && ` — ${apoderado.nombreEmergencia}`}
                    </p>
                  );
                })()}
                {apoderado.email && (
                  <p className="text-gray-600">✉️ {apoderado.email}</p>
                )}
                {apoderado.personasAutorizadas && (
                  <p className="text-gray-500 text-xs">Autorizados: {apoderado.personasAutorizadas}</p>
                )}
                {apoderado.distrito && (
                  <p className="text-gray-500 text-xs">{apoderado.distrito}, {apoderado.departamento ?? 'Lima'}</p>
                )}
              </div>
            )}

            <p className="text-xs text-center text-gray-400 pt-1">
              Registrado el {formatearFecha(alumno.fechaRegistro.split('T')[0])}
            </p>
          </div>
        </div>

        <Link href="/" className="block text-center text-xs underline" style={{ color: '#D97706' }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
