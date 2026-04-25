'use client';

import React, { useState } from 'react';
import type { Alumno, Apoderado, Salon } from '@/types';

interface TablaAlumnosProps {
  alumnos: Alumno[];
  apoderados: Apoderado[];
  salones: Salon[];
}

function formatearFecha(fechaISO: string): string {
  const [year, month, day] = fechaISO.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);
  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function Avatar({ nombre, fotoUrl }: { nombre: string; fotoUrl?: string }) {
  if (fotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={fotoUrl} alt={nombre} className="h-9 w-9 rounded-full object-cover border border-gray-200" />
    );
  }
  const iniciales = nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
  return (
    <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold border border-primary-200">
      {iniciales}
    </div>
  );
}

export default function TablaAlumnos({ alumnos, apoderados, salones }: TablaAlumnosProps) {
  const [salonFiltro, setSalonFiltro] = useState<string>('todos');

  const alumnosFiltrados = salonFiltro === 'todos' ? alumnos : alumnos.filter((a) => a.salonId === salonFiltro);
  const nombreSalon = (salonId: string) => salones.find((s) => s.id === salonId)?.nombre ?? '—';
  const nombreApoderado = (apoderadoId: string) => apoderados.find((a) => a.id === apoderadoId)?.nombreCompleto ?? '—';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label htmlFor="filtro-salon" className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Filtrar por grupo:
        </label>
        <select
          id="filtro-salon"
          value={salonFiltro}
          onChange={(e) => setSalonFiltro(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <option value="todos">Todos los grupos</option>
          {salones.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
      </div>

      {/* Tabla md+ */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Foto', 'Nombre', 'Fecha de nacimiento', 'Salón', 'Apoderado'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {alumnosFiltrados.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No hay alumnos registrados.</td></tr>
            ) : alumnosFiltrados.map((alumno) => (
              <tr key={alumno.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3"><Avatar nombre={alumno.nombreCompleto} fotoUrl={alumno.fotografiaUrl} /></td>
                <td className="px-4 py-3 font-medium text-gray-800">{alumno.nombreCompleto}</td>
                <td className="px-4 py-3 text-gray-600">{formatearFecha(alumno.fechaNacimiento)}</td>
                <td className="px-4 py-3 text-gray-600">{nombreSalon(alumno.salonId)}</td>
                <td className="px-4 py-3 text-gray-600">{nombreApoderado(alumno.apoderadoId)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards móvil */}
      <div className="flex flex-col gap-3 md:hidden">
        {alumnosFiltrados.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No hay alumnos registrados.</p>
        ) : alumnosFiltrados.map((alumno) => (
          <div key={alumno.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar nombre={alumno.nombreCompleto} fotoUrl={alumno.fotografiaUrl} />
              <p className="font-semibold text-gray-800">{alumno.nombreCompleto}</p>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p><span className="font-medium text-gray-700">Nacimiento:</span> {formatearFecha(alumno.fechaNacimiento)}</p>
              <p><span className="font-medium text-gray-700">Salón:</span> {nombreSalon(alumno.salonId)}</p>
              <p><span className="font-medium text-gray-700">Apoderado:</span> {nombreApoderado(alumno.apoderadoId)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
