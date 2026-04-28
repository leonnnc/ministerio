'use client';

import { useState } from 'react';
import { useSalonesStore } from '@/stores/salonesStore';
import { usePersonalStore } from '@/stores/personalStore';
import { CONFIGURACION_SALONES } from '@/lib/asignacionSalon';
import type { GrupoEdad } from '@/types';
import type { Personal } from '@/types';

type Estado = 'idle' | 'cargando' | 'ok' | 'error';

export default function SetupPage() {
  const { inicializarSalones, salones } = useSalonesStore();
  const { agregarPersonal, personal } = usePersonalStore();

  const [estadoSalones, setEstadoSalones] = useState<Estado>('idle');
  const [estadoPersonal, setEstadoPersonal] = useState<Estado>('idle');
  const [log, setLog] = useState<string[]>([]);

  function addLog(msg: string) {
    setLog((prev) => [...prev, msg]);
  }

  async function handleInicializarSalones() {
    setEstadoSalones('cargando');
    addLog('⏳ Inicializando salones...');
    try {
      await inicializarSalones();
      const s = useSalonesStore.getState().salones;
      addLog(`✅ ${s.length} salones listos en Firestore:`);
      s.forEach((salon) => addLog(`   • ${salon.nombre} (${salon.grupoEdad})`));
      setEstadoSalones('ok');
    } catch (e) {
      addLog(`❌ Error: ${e}`);
      setEstadoSalones('error');
    }
  }

  async function handleCrearPersonalDemo() {
    setEstadoPersonal('cargando');
    addLog('⏳ Creando personal de prueba...');

    const salonesActuales = useSalonesStore.getState().salones;
    if (salonesActuales.length === 0) {
      addLog('❌ Primero inicializa los salones');
      setEstadoPersonal('error');
      return;
    }

    const maestrosDemo: { nombre: string; email: string; grupo: GrupoEdad }[] = [
      { nombre: 'Ana García',    email: 'ana.garcia@ministerio.com',    grupo: 'Cuna' },
      { nombre: 'María López',   email: 'maria.lopez@ministerio.com',   grupo: 'PrimerNivel' },
      { nombre: 'Carmen Ruiz',   email: 'carmen.ruiz@ministerio.com',   grupo: 'SegundoNivel' },
      { nombre: 'Laura Torres',  email: 'laura.torres@ministerio.com',  grupo: 'TercerNivel' },
    ];

    try {
      for (const m of maestrosDemo) {
        const salon = salonesActuales.find((s) => s.grupoEdad === m.grupo);
        const maestro: Personal = {
          id: crypto.randomUUID(),
          nombreCompleto: m.nombre,
          rol: 'Maestro',
          telefono: '+51999000001',
          email: m.email,
          salonesIds: salon ? [salon.id] : [],
        };
        await agregarPersonal(maestro);
        addLog(`✅ Maestro creado: ${m.nombre} → ${CONFIGURACION_SALONES[m.grupo].nombre}`);
      }
      setEstadoPersonal('ok');
    } catch (e) {
      addLog(`❌ Error: ${e}`);
      setEstadoPersonal('error');
    }
  }

  const salonesActuales = useSalonesStore.getState().salones;
  const personalActual = usePersonalStore.getState().personal;

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: '#FFFDE7' }}>
      <div className="max-w-xl mx-auto space-y-6">

        <div className="rounded-3xl overflow-hidden shadow-xl border-2 border-yellow-200 bg-white">
          <div className="px-6 py-6 text-center" style={{ background: '#F5C518' }}>
            <p className="text-4xl mb-2">⚙️</p>
            <h1 className="text-xl font-extrabold" style={{ color: '#4a2c00' }}>Setup inicial</h1>
            <p className="text-sm mt-1" style={{ color: '#78350f' }}>
              Inicializa los datos necesarios para probar la app
            </p>
          </div>

          <div className="px-6 py-6 space-y-4">

            {/* Estado actual */}
            <div className="rounded-xl border border-yellow-200 p-4 space-y-1" style={{ background: '#FFF9C4' }}>
              <p className="text-sm font-bold" style={{ color: '#4a2c00' }}>Estado actual en Firestore:</p>
              <p className="text-sm text-gray-600">
                Salones: <span className="font-bold" style={{ color: salonesActuales.length > 0 ? '#16a34a' : '#dc2626' }}>
                  {salonesActuales.length > 0 ? `${salonesActuales.length} creados ✅` : 'No hay salones ❌'}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Personal: <span className="font-bold" style={{ color: personalActual.length > 0 ? '#16a34a' : '#D97706' }}>
                  {personalActual.length > 0 ? `${personalActual.length} registrados ✅` : 'Sin personal aún'}
                </span>
              </p>
            </div>

            {/* Paso 1: Salones */}
            <div className="rounded-xl border border-yellow-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>Paso 1 — Crear salones por edad</p>
                  <p className="text-xs text-gray-500">14 salones: uno por cada edad (0 a 13 años)</p>
                </div>
                {estadoSalones === 'ok' && <span className="text-green-600 text-lg">✅</span>}
                {estadoSalones === 'error' && <span className="text-red-500 text-lg">❌</span>}
              </div>
              <button
                onClick={handleInicializarSalones}
                disabled={estadoSalones === 'cargando' || estadoSalones === 'ok'}
                className="w-full py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
                style={{ background: '#F5C518', color: '#4a2c00' }}>
                {estadoSalones === 'cargando' ? '⏳ Creando...' :
                 estadoSalones === 'ok' ? '✅ Salones creados' : 'Crear salones'}
              </button>
            </div>

            {/* Paso 2: Personal */}
            <div className="rounded-xl border border-yellow-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>Paso 2 — Crear maestros de prueba</p>
                  <p className="text-xs text-gray-500">4 maestros, uno por salón</p>
                </div>
                {estadoPersonal === 'ok' && <span className="text-green-600 text-lg">✅</span>}
                {estadoPersonal === 'error' && <span className="text-red-500 text-lg">❌</span>}
              </div>
              <button
                onClick={handleCrearPersonalDemo}
                disabled={estadoPersonal === 'cargando' || estadoPersonal === 'ok'}
                className="w-full py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
                style={{ background: '#F5C518', color: '#4a2c00' }}>
                {estadoPersonal === 'cargando' ? '⏳ Creando...' :
                 estadoPersonal === 'ok' ? '✅ Maestros creados' : 'Crear maestros de prueba'}
              </button>
            </div>

            {/* Log */}
            {log.length > 0 && (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 space-y-1 max-h-48 overflow-y-auto">
                {log.map((l, i) => (
                  <p key={i} className="text-xs font-mono" style={{ color: '#4a2c00' }}>{l}</p>
                ))}
              </div>
            )}

            {/* Ir a inscripción */}
            {estadoSalones === 'ok' && (
              <a href="/inscripcion"
                className="block w-full py-3 rounded-xl font-bold text-sm text-center"
                style={{ background: '#4a2c00', color: '#F5C518' }}>
                🎒 Ir a inscripción →
              </a>
            )}

            {/* Credenciales */}
            <div className="rounded-xl border border-yellow-100 p-3" style={{ background: '#FFFDE7' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#D97706' }}>🔑 Credenciales de acceso al portal:</p>
              <p className="text-xs text-gray-600">Admin: <span className="font-mono">admin@ministerio.com</span> / <span className="font-mono">admin123</span></p>
              <p className="text-xs text-gray-500 mt-1">Maestros: email / primeros 6 chars del email + 123</p>
              <p className="text-xs text-gray-400">Ej: ana.garcia@... → <span className="font-mono">ana.ga123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
