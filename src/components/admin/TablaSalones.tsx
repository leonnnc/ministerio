'use client';

import React, { useState } from 'react';
import type { Salon, Personal, GrupoEdad } from '@/types';

interface TablaSalonesProps {
  salones: Salon[];
  personal: Personal[];
  onAsignarMaestro: (salonId: string, maestroId: string) => void;
  onAsignarAuxiliar: (salonId: string, auxiliarId: string) => void;
}

const grupoConfig: Record<GrupoEdad, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  Cuna:         { label: 'Cuna',         emoji: '🍼', color: '#D97706', bg: '#FEF3C7', border: '#FCD34D' },
  PrimerNivel:  { label: 'Primer Nivel', emoji: '🎨', color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
  SegundoNivel: { label: 'Segundo Nivel',emoji: '📚', color: '#2563eb', bg: '#dbeafe', border: '#93c5fd' },
  TercerNivel:  { label: 'Tercer Nivel', emoji: '🌟', color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd' },
};

function SalonFila({
  salon,
  personal,
  onAsignarMaestro,
}: {
  salon: Salon;
  personal: Personal[];
  onAsignarMaestro: (salonId: string, maestroId: string) => void;
}) {
  const [maestroSel, setMaestroSel] = useState(salon.maestroId ?? '');
  const maestroActual = personal.find((p) => p.id === salon.maestroId);
  const maestros = personal.filter((p) => p.rol === 'Maestro' || p.rol === 'Auxiliar' || p.rol === 'Coordinadora');

  function handleAsignar() {
    if (maestroSel && maestroSel !== salon.maestroId) {
      onAsignarMaestro(salon.id, maestroSel);
    }
  }

  return (
    <tr className="border-b border-yellow-50 hover:bg-yellow-50 transition-colors">
      <td className="px-4 py-3">
        <p className="font-semibold text-sm" style={{ color: '#4a2c00' }}>{salon.nombre}</p>
        <p className="text-xs text-gray-400">{salon.edadMinima} año{salon.edadMinima !== 1 ? 's' : ''}</p>
      </td>
      <td className="px-4 py-3">
        {maestroActual ? (
          <div>
            <p className="text-sm font-medium" style={{ color: '#4a2c00' }}>{maestroActual.nombreCompleto}</p>
            <p className="text-xs text-gray-400">{maestroActual.rol}</p>
          </div>
        ) : (
          <span className="text-xs text-red-400 font-semibold">Sin maestro</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2 items-center">
          <select
            value={maestroSel}
            onChange={(e) => setMaestroSel(e.target.value)}
            className="flex-1 rounded-lg border border-yellow-200 bg-white px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 min-w-0"
          >
            <option value="">Seleccionar...</option>
            {maestros.map((m) => (
              <option key={m.id} value={m.id}>{m.nombreCompleto}</option>
            ))}
          </select>
          <button
            onClick={handleAsignar}
            disabled={!maestroSel || maestroSel === salon.maestroId}
            className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 whitespace-nowrap"
            style={{ background: '#F5C518', color: '#4a2c00' }}
          >
            {salon.maestroId ? 'Cambiar' : 'Asignar'}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function TablaSalones({ salones, personal, onAsignarMaestro, onAsignarAuxiliar }: TablaSalonesProps) {
  if (salones.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-yellow-200 bg-white p-12 text-center">
        <p className="text-4xl mb-3">🏫</p>
        <p className="text-gray-400 text-sm">No hay salones configurados.</p>
        <p className="text-gray-300 text-xs mt-1">Ve a <strong>/setup</strong> para inicializarlos.</p>
      </div>
    );
  }

  // Agrupar salones por grupoEdad
  const grupos = (['Cuna', 'PrimerNivel', 'SegundoNivel', 'TercerNivel'] as GrupoEdad[]).map((grupo) => ({
    grupo,
    config: grupoConfig[grupo],
    salones: salones
      .filter((s) => s.grupoEdad === grupo)
      .sort((a, b) => a.edadMinima - b.edadMinima),
  })).filter((g) => g.salones.length > 0);

  const sinMaestro = salones.filter((s) => !s.maestroId).length;

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {grupos.map(({ grupo, config, salones: s }) => (
          <div key={grupo} className="rounded-2xl p-4 text-center border-2"
            style={{ background: config.bg, borderColor: config.border }}>
            <p className="text-2xl mb-1">{config.emoji}</p>
            <p className="font-bold text-sm" style={{ color: config.color }}>{config.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.length} salones</p>
            <p className="text-xs mt-0.5" style={{ color: config.color }}>
              {s.filter((x) => x.maestroId).length}/{s.length} con maestro
            </p>
          </div>
        ))}
      </div>

      {sinMaestro > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ {sinMaestro} salón{sinMaestro !== 1 ? 'es' : ''} sin maestro asignado
        </div>
      )}

      {/* Tabla por grupo */}
      {grupos.map(({ grupo, config, salones: salonesGrupo }) => (
        <div key={grupo} className="rounded-2xl border-2 bg-white overflow-hidden"
          style={{ borderColor: config.border }}>
          <div className="px-5 py-3 flex items-center gap-2"
            style={{ background: config.bg }}>
            <span className="text-xl">{config.emoji}</span>
            <h3 className="font-bold text-base" style={{ color: config.color }}>
              {config.label}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full ml-auto"
              style={{ background: config.border, color: config.color }}>
              {salonesGrupo.length} salones
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead style={{ background: '#FFFDE7' }}>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Salón</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Maestro actual</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Asignar / Cambiar</th>
                </tr>
              </thead>
              <tbody>
                {salonesGrupo.map((salon) => (
                  <SalonFila
                    key={salon.id}
                    salon={salon}
                    personal={personal}
                    onAsignarMaestro={onAsignarMaestro}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
