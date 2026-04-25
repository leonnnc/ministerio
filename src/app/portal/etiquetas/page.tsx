'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { SERVICIOS_DOMINGO } from '@/stores/agendaStore';

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  if (hoy.getMonth() < nac.getMonth() ||
    (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

export default function EtiquetasPage() {
  const router = useRouter();
  const { estaAutenticado } = useAuthStore();
  const alumnos = useAlumnosStore((s) => s.alumnos);
  const apoderados = useAlumnosStore((s) => s.apoderados);
  const salones = useSalonesStore((s) => s.salones);
  const printRef = useRef<HTMLDivElement>(null);

  const [salonFiltro, setSalonFiltro] = useState('todos');
  const [servicioId, setServicioId] = useState(SERVICIOS_DOMINGO[0].id);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!estaAutenticado) router.replace('/login');
  }, [estaAutenticado, router]);

  const alumnosFiltrados = alumnos.filter((a) =>
    salonFiltro === 'todos' || a.salonId === salonFiltro
  );

  const servicio = SERVICIOS_DOMINGO.find((s) => s.id === servicioId);

  function formatFechaCorta(iso: string) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function imprimir() {
    window.print();
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFDE7' }}>
      {/* Header — oculto al imprimir */}
      <div className="px-6 py-6 text-center print:hidden" style={{ background: '#F5C518' }}>
        <h1 className="text-2xl font-extrabold" style={{ color: '#4a2c00' }}>🏷️ Etiquetas de Seguridad</h1>
        <p className="text-sm mt-1" style={{ color: '#78350f' }}>Imprime etiquetas de identificación para los niños</p>
      </div>

      {/* Controles — ocultos al imprimir */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 print:hidden">
        <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
          <div className="px-4 py-3" style={{ background: '#FFF9C4' }}>
            <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>⚙️ Configuración</p>
          </div>
          <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Salón</label>
              <select value={salonFiltro} onChange={(e) => setSalonFiltro(e.target.value)}
                className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                <option value="todos">Todos los salones</option>
                {salones.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Servicio</label>
              <select value={servicioId} onChange={(e) => setServicioId(e.target.value)}
                className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                {SERVICIOS_DOMINGO.map((s) => <option key={s.id} value={s.id}>{s.hora}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {alumnosFiltrados.length} etiqueta{alumnosFiltrados.length !== 1 ? 's' : ''} listas para imprimir
          </p>
          <button onClick={imprimir}
            className="px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
            style={{ background: '#4a2c00', color: '#F5C518' }}>
            🖨️ Imprimir etiquetas
          </button>
        </div>
      </div>

      {/* Etiquetas — visibles siempre, optimizadas para impresión */}
      <div ref={printRef} className="max-w-3xl mx-auto px-4 pb-8 print:px-0 print:max-w-none">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
          {alumnosFiltrados.map((alumno) => {
            const salon = salones.find((s) => s.id === alumno.salonId);
            const apoderado = apoderados.find((ap) => ap.id === alumno.apoderadoId);
            const edad = calcularEdad(alumno.fechaNacimiento);

            return (
              <div key={alumno.id}
                className="rounded-2xl border-2 border-yellow-300 bg-white overflow-hidden shadow-sm print:rounded-lg print:shadow-none print:border print:border-gray-300"
                style={{ pageBreakInside: 'avoid' }}>
                {/* Header etiqueta */}
                <div className="px-3 py-2 text-center" style={{ background: '#F5C518' }}>
                  <p className="text-xs font-extrabold" style={{ color: '#4a2c00' }}>✝️ Ministerio de Niños</p>
                  <p className="text-xs" style={{ color: '#78350f' }}>{formatFechaCorta(fecha)} · {servicio?.hora}</p>
                </div>

                {/* Contenido */}
                <div className="px-3 py-3 space-y-1.5">
                  {/* Avatar + nombre */}
                  <div className="flex items-center gap-2">
                    {alumno.fotografiaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={alumno.fotografiaUrl} alt={alumno.nombreCompleto}
                        className="w-10 h-10 rounded-full object-cover border-2 border-yellow-300 flex-none" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base flex-none border-2 border-yellow-300"
                        style={{ background: '#FFF9C4', color: '#4a2c00' }}>
                        {alumno.nombreCompleto.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs leading-tight" style={{ color: '#4a2c00' }}>
                        {alumno.nombreCompleto}
                      </p>
                      <p className="text-xs text-gray-500">{edad} años · {alumno.sexo === 'masculino' ? '👦' : '👧'}</p>
                    </div>
                  </div>

                  {/* Salón */}
                  <div className="rounded-lg px-2 py-1 text-center"
                    style={{ background: '#FFF9C4' }}>
                    <p className="text-xs font-bold" style={{ color: '#D97706' }}>{salon?.nombre ?? '—'}</p>
                  </div>

                  {/* Alergias — destacado */}
                  {alumno.alergias && (
                    <div className="rounded-lg px-2 py-1 border border-red-200" style={{ background: '#FFF5F5' }}>
                      <p className="text-xs font-bold text-red-600">⚠️ {alumno.alergias}</p>
                    </div>
                  )}

                  {/* Apoderado */}
                  {apoderado && (
                    <div className="border-t border-yellow-100 pt-1.5">
                      <p className="text-xs text-gray-500 leading-tight">
                        <span className="font-semibold" style={{ color: '#4a2c00' }}>{apoderado.nombreCompleto.split(' ').slice(0, 2).join(' ')}</span>
                      </p>
                      <p className="text-xs text-gray-400">{apoderado.telefono}</p>
                    </div>
                  )}

                  {/* Código QR texto */}
                  {alumno.codigoQR && (
                    <p className="text-xs font-mono text-center text-gray-300 border-t border-yellow-50 pt-1">
                      {alumno.codigoQR}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          #main-content, #main-content * { visibility: visible; }
          #main-content { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </div>
  );
}
