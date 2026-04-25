'use client';

import React, { useState } from 'react';
import type { Salon, Personal, GrupoEdad } from '@/types';
import { Button } from '@/components/ui';

interface TablaSalonesProps {
  salones: Salon[];
  personal: Personal[];
  onAsignarMaestro: (salonId: string, maestroId: string) => void;
  onAsignarAuxiliar: (salonId: string, auxiliarId: string) => void;
}

const grupoEstilos: Record<GrupoEdad, { bg: string; border: string; text: string; emoji: string }> = {
  Cuna: { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-700', emoji: '🍼' },
  Preescolar: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', emoji: '🎨' },
  PrimariaBaja: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', emoji: '📚' },
  PrimariaAlta: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', emoji: '🌟' },
};

function SalonCard({
  salon,
  personal,
  onAsignarMaestro,
  onAsignarAuxiliar,
}: {
  salon: Salon;
  personal: Personal[];
  onAsignarMaestro: (salonId: string, maestroId: string) => void;
  onAsignarAuxiliar: (salonId: string, auxiliarId: string) => void;
}) {
  const [maestroSeleccionado, setMaestroSeleccionado] = useState('');
  const [auxiliarSeleccionado, setAuxiliarSeleccionado] = useState('');

  const estilos = grupoEstilos[salon.grupoEdad];
  const maestros = personal.filter((p) => p.rol === 'Maestro');
  const auxiliares = personal.filter((p) => p.rol === 'Auxiliar');
  const maestroActual = personal.find((p) => p.id === salon.maestroId);
  const auxiliaresActuales = salon.auxiliaresIds
    .map((id) => personal.find((p) => p.id === id))
    .filter(Boolean) as Personal[];

  return (
    <div className={`rounded-2xl border-2 ${estilos.border} ${estilos.bg} p-5 shadow-sm flex flex-col gap-4`}>
      <div className="flex items-center gap-2">
        <span className="text-3xl">{estilos.emoji}</span>
        <div>
          <h3 className={`text-lg font-bold ${estilos.text}`}>{salon.nombre}</h3>
          <p className="text-sm text-gray-500">{salon.edadMinima} – {salon.edadMaxima} años</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Maestro</p>
        <p className="text-sm font-medium text-gray-800">
          {maestroActual ? maestroActual.nombreCompleto : 'Sin maestro asignado'}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Auxiliares</p>
        {auxiliaresActuales.length > 0 ? (
          <ul className="text-sm text-gray-800 space-y-0.5">
            {auxiliaresActuales.map((a) => <li key={a.id}>• {a.nombreCompleto}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">Sin auxiliares</p>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <select
          value={maestroSeleccionado}
          onChange={(e) => setMaestroSeleccionado(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400"
          aria-label={`Seleccionar maestro para ${salon.nombre}`}
        >
          <option value="">Cambiar maestro…</option>
          {maestros.map((m) => <option key={m.id} value={m.id}>{m.nombreCompleto}</option>)}
        </select>
        <Button size="sm" onClick={() => { if (maestroSeleccionado) { onAsignarMaestro(salon.id, maestroSeleccionado); setMaestroSeleccionado(''); } }} disabled={!maestroSeleccionado}>
          Asignar
        </Button>
      </div>

      <div className="flex gap-2 items-center">
        <select
          value={auxiliarSeleccionado}
          onChange={(e) => setAuxiliarSeleccionado(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400"
          aria-label={`Agregar auxiliar a ${salon.nombre}`}
        >
          <option value="">Agregar auxiliar…</option>
          {auxiliares.filter((a) => !salon.auxiliaresIds.includes(a.id)).map((a) => (
            <option key={a.id} value={a.id}>{a.nombreCompleto}</option>
          ))}
        </select>
        <Button size="sm" variant="outline" onClick={() => { if (auxiliarSeleccionado) { onAsignarAuxiliar(salon.id, auxiliarSeleccionado); setAuxiliarSeleccionado(''); } }} disabled={!auxiliarSeleccionado}>
          Asignar
        </Button>
      </div>
    </div>
  );
}

export default function TablaSalones({ salones, personal, onAsignarMaestro, onAsignarAuxiliar }: TablaSalonesProps) {
  if (salones.length === 0) {
    return <p className="text-center text-gray-400 py-8">No hay salones configurados.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {salones.map((salon) => (
        <SalonCard key={salon.id} salon={salon} personal={personal} onAsignarMaestro={onAsignarMaestro} onAsignarAuxiliar={onAsignarAuxiliar} />
      ))}
    </div>
  );
}
