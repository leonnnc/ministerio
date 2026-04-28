'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { calcularEdadParaSalon } from '@/lib/asignacionSalon';
import type { Alumno, Apoderado } from '@/types';

export default function InscribirPruebaPage() {
  const router = useRouter();
  const { agregarAlumno } = useAlumnosStore();
  const { salones, inicializarSalones } = useSalonesStore();
  const [estado, setEstado] = useState<'idle' | 'cargando' | 'ok' | 'error'>('idle');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    inicializarSalones();
  }, [inicializarSalones]);

  async function inscribir() {
    setEstado('cargando');
    setMensaje('Preparando inscripción...');

    try {
      // Asegurar salones cargados
      let salonesActuales = useSalonesStore.getState().salones;
      if (salonesActuales.length === 0) {
        setMensaje('Inicializando salones...');
        await inicializarSalones();
        salonesActuales = useSalonesStore.getState().salones;
      }

      if (salonesActuales.length === 0) {
        setEstado('error');
        setMensaje('❌ No hay salones. Ve a /setup primero.');
        return;
      }

      // Datos del niño de prueba — 7 años
      const fechaNacimiento = '2017-03-15';
      const edad = calcularEdadParaSalon(fechaNacimiento);

      if (edad === null) {
        setEstado('error');
        setMensaje('❌ Edad fuera de rango');
        return;
      }

      const salon = salonesActuales.find((s) => edad >= s.edadMinima && edad <= s.edadMaxima);
      if (!salon) {
        setEstado('error');
        setMensaje(`❌ No se encontró salón para ${edad} años. Ve a /setup primero.`);
        return;
      }

      setMensaje(`✅ Salón encontrado: ${salon.nombre}`);

      const apoderadoId = crypto.randomUUID();
      const alumnoId = crypto.randomUUID();
      const codigoQR = `MIN-${alumnoId.slice(0, 8).toUpperCase()}`;

      const apoderado: Apoderado = {
        id: apoderadoId,
        nombreCompleto: 'Roberto Castillo Pérez',
        relacion: 'padre',
        telefono: '+51 987 654 321',
        email: 'roberto.castillo@gmail.com',
        direccion: 'Av. Los Olivos 456, Miraflores',
        distrito: 'Miraflores',
        departamento: 'Lima',
        telefonoEmergencia: '+51 976 543 210',
        nombreEmergencia: 'María Pérez (madre)',
        personasAutorizadas: 'María Pérez, Carlos Castillo',
        servicioHabitual: '11am',
        esMiembroIglesia: true,
        whatsapp: '+51987654321',
      };

      const alumno: Alumno = {
        id: alumnoId,
        nombreCompleto: 'Santiago Castillo Pérez',
        fechaNacimiento,
        sexo: 'masculino',
        salonId: salon.id,
        apoderadoId,
        fechaRegistro: new Date().toISOString(),
        codigoQR,
        // Escolar
        colegio: 'I.E. San Martín de Porres',
        grado: '2° Primaria',
        // Médico
        alergias: 'Polen, polvo',
        tipoSangre: 'O+',
        seguroMedico: 'SIS',
        hospitalPreferencia: 'Hospital Rebagliati',
        condicionesMedicas: 'Asma leve',
        medicamentos: 'Salbutamol (solo en crisis)',
        tieneDiscapacidad: false,
        // Espiritual
        primeraVez: false,
        esBautizado: true,
        haAceptadoCristo: true,
        asistenciaRegular: true,
        comoSeEntero: 'iglesia',
      };

      setMensaje('Guardando en Firestore...');
      await agregarAlumno(alumno, apoderado);

      setEstado('ok');
      setMensaje(`✅ Inscripción exitosa. Redirigiendo...`);

      setTimeout(() => {
        router.push(`/confirmacion?alumnoId=${alumnoId}`);
      }, 1500);

    } catch (err) {
      setEstado('error');
      setMensaje(`❌ Error: ${err}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FFFDE7' }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-xl border-2 border-yellow-200 bg-white">
        <div className="px-6 py-6 text-center" style={{ background: '#F5C518' }}>
          <p className="text-4xl mb-2">🧪</p>
          <h1 className="text-xl font-extrabold" style={{ color: '#4a2c00' }}>Inscripción de prueba</h1>
          <p className="text-sm mt-1" style={{ color: '#78350f' }}>
            Inscribe a Santiago Castillo, 7 años, con todos los datos
          </p>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Datos del niño */}
          <div className="rounded-xl border border-yellow-200 p-4 space-y-1 text-sm" style={{ background: '#FFF9C4' }}>
            <p className="font-bold" style={{ color: '#4a2c00' }}>👦 Niño</p>
            <p className="text-gray-600">Santiago Castillo Pérez</p>
            <p className="text-gray-500">Nacimiento: 15/03/2017 · 7 años · Masculino</p>
            <p className="text-gray-500">Colegio: I.E. San Martín · 2° Primaria</p>
            <p className="text-red-500 text-xs">⚠️ Alergias: Polen, polvo · Sangre: O+</p>
          </div>

          <div className="rounded-xl border border-yellow-200 p-4 space-y-1 text-sm" style={{ background: '#FFF9C4' }}>
            <p className="font-bold" style={{ color: '#4a2c00' }}>👨 Apoderado</p>
            <p className="text-gray-600">Roberto Castillo Pérez (Padre)</p>
            <p className="text-gray-500">📞 +51 987 654 321</p>
            <p className="text-gray-500">✉️ roberto.castillo@gmail.com</p>
            <p className="text-gray-500">📍 Miraflores, Lima</p>
          </div>

          {mensaje && (
            <div className={`rounded-xl px-4 py-3 text-sm text-center font-semibold ${
              estado === 'error' ? 'bg-red-50 text-red-600 border border-red-200' :
              estado === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' :
              'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}>
              {mensaje}
            </div>
          )}

          <button
            onClick={inscribir}
            disabled={estado === 'cargando' || estado === 'ok'}
            className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: '#F5C518', color: '#4a2c00' }}
          >
            {estado === 'cargando' ? '⏳ Inscribiendo...' :
             estado === 'ok' ? '✅ Inscrito — redirigiendo...' :
             '🎒 Inscribir y ver tarjeta'}
          </button>

          <p className="text-xs text-center text-gray-400">
            Asegúrate de haber creado los salones en{' '}
            <a href="/setup" className="underline" style={{ color: '#D97706' }}>/setup</a> primero
          </p>
        </div>
      </div>
    </div>
  );
}
