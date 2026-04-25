'use client';

import { useState, useEffect } from 'react';
import { useAgendaStore, SERVICIOS_DOMINGO, formatearFechaDomingo, type ServicioId, type AsignacionServicio } from '@/stores/agendaStore';
import { usePersonalStore } from '@/stores/personalStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { useAlumnosStore } from '@/stores/alumnosStore';

interface ModalAsignacionProps {
  fecha: string;
  servicioId: ServicioId;
  asignacionEditando: AsignacionServicio | null;
  onCerrar: () => void;
}

export default function ModalAsignacion({
  fecha,
  servicioId,
  asignacionEditando,
  onCerrar,
}: ModalAsignacionProps) {
  const { agregarAsignacion, actualizarAsignacion } = useAgendaStore();
  const personal = usePersonalStore((s) => s.personal);
  const salones = useSalonesStore((s) => s.salones);
  const alumnos = useAlumnosStore((s) => s.alumnos);

  const maestros = personal.filter((p) => p.rol === 'Maestro');
  const auxiliares = personal.filter((p) => p.rol === 'Auxiliar');

  const [salonId, setSalonId] = useState(asignacionEditando?.salonId ?? '');
  const [maestroId, setMaestroId] = useState(asignacionEditando?.maestroId ?? '');
  const [auxiliaresIds, setAuxiliaresIds] = useState<string[]>(asignacionEditando?.auxiliaresIds ?? []);
  const [alumnosIds, setAlumnosIds] = useState<string[]>(asignacionEditando?.alumnosIds ?? []);
  const [notas, setNotas] = useState(asignacionEditando?.notas ?? '');

  // Al cambiar salón, pre-seleccionar alumnos de ese salón
  useEffect(() => {
    if (salonId && !asignacionEditando) {
      const alumnosSalon = alumnos.filter((a) => a.salonId === salonId).map((a) => a.id);
      setAlumnosIds(alumnosSalon);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId]);

  const servicio = SERVICIOS_DOMINGO.find((s) => s.id === servicioId);
  const alumnosSalonActual = salonId ? alumnos.filter((a) => a.salonId === salonId) : [];

  function toggleAuxiliar(id: string) {
    setAuxiliaresIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAlumno(id: string) {
    setAlumnosIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleGuardar() {
    if (!salonId || !maestroId) return;

    if (asignacionEditando) {
      actualizarAsignacion(asignacionEditando.id, {
        salonId, maestroId, auxiliaresIds, alumnosIds, notas,
      });
    } else {
      const nueva: AsignacionServicio = {
        id: crypto.randomUUID(),
        fecha,
        servicioId,
        salonId,
        maestroId,
        auxiliaresIds,
        alumnosIds,
        notas: notas || undefined,
      };
      agregarAsignacion(nueva);
    }
    onCerrar();
  }

  const selectClass = "w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-yellow-400 bg-white";
  const labelClass = "text-xs font-bold mb-1 block" ;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCerrar} />

      <div className="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl bg-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 text-center flex-none" style={{ background: '#F5C518' }}>
          <h2 className="text-xl font-extrabold" style={{ color: '#4a2c00' }}>
            {asignacionEditando ? 'Editar asignación' : 'Nueva asignación'}
          </h2>
          <p className="text-sm mt-1 capitalize" style={{ color: '#78350f' }}>
            {formatearFechaDomingo(fecha)} — {servicio?.hora} ({servicio?.label})
          </p>
        </div>

        {/* Formulario */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* Salón */}
          <div>
            <label className={labelClass} style={{ color: '#92400e' }}>Salón *</label>
            <select value={salonId} onChange={(e) => setSalonId(e.target.value)} className={selectClass}>
              <option value="">Seleccionar salón...</option>
              {salones.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre} ({s.edadMinima}–{s.edadMaxima} años)</option>
              ))}
            </select>
          </div>

          {/* Maestro */}
          <div>
            <label className={labelClass} style={{ color: '#92400e' }}>Maestro/a *</label>
            <select value={maestroId} onChange={(e) => setMaestroId(e.target.value)} className={selectClass}>
              <option value="">Seleccionar maestro...</option>
              {maestros.map((m) => (
                <option key={m.id} value={m.id}>{m.nombreCompleto}</option>
              ))}
            </select>
          </div>

          {/* Auxiliares */}
          <div>
            <label className={labelClass} style={{ color: '#92400e' }}>Auxiliares / Ayudantes</label>
            {auxiliares.length === 0 ? (
              <p className="text-xs text-gray-400">No hay auxiliares registrados</p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-1">
                {auxiliares.map((aux) => (
                  <button
                    key={aux.id}
                    type="button"
                    onClick={() => toggleAuxiliar(aux.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all"
                    style={{
                      background: auxiliaresIds.includes(aux.id) ? '#F5C518' : '#fff',
                      borderColor: auxiliaresIds.includes(aux.id) ? '#D97706' : '#FDE68A',
                      color: '#4a2c00',
                    }}
                  >
                    {auxiliaresIds.includes(aux.id) ? '✓ ' : ''}{aux.nombreCompleto}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Niños del salón */}
          <div>
            <label className={labelClass} style={{ color: '#92400e' }}>
              Niños asignados {salonId ? `(${alumnosSalonActual.length} en este salón)` : ''}
            </label>
            {!salonId ? (
              <p className="text-xs text-gray-400">Selecciona un salón primero</p>
            ) : alumnosSalonActual.length === 0 ? (
              <p className="text-xs text-gray-400">No hay niños inscritos en este salón</p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-1 max-h-36 overflow-y-auto">
                {alumnosSalonActual.map((alumno) => (
                  <button
                    key={alumno.id}
                    type="button"
                    onClick={() => toggleAlumno(alumno.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all"
                    style={{
                      background: alumnosIds.includes(alumno.id) ? '#FDE68A' : '#fff',
                      borderColor: alumnosIds.includes(alumno.id) ? '#F59E0B' : '#FDE68A',
                      color: '#4a2c00',
                    }}
                  >
                    {alumnosIds.includes(alumno.id) ? '✓ ' : ''}{alumno.nombreCompleto.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className={labelClass} style={{ color: '#92400e' }}>Notas (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              placeholder="Ej: Traer material de manualidades..."
              className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-yellow-400 resize-none"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="px-6 py-4 flex gap-3 flex-none border-t border-yellow-100">
          <button
            onClick={handleGuardar}
            disabled={!salonId || !maestroId}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-opacity disabled:opacity-40"
            style={{ background: '#F5C518', color: '#4a2c00' }}
          >
            {asignacionEditando ? 'Guardar cambios' : 'Agregar asignación'}
          </button>
          <button
            onClick={onCerrar}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm border-2 border-yellow-200 text-gray-600 hover:bg-yellow-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
