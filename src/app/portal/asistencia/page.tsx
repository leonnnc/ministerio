'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { useAsistenciaStore } from '@/stores/asistenciaStore';
import { SERVICIOS_DOMINGO } from '@/stores/agendaStore';

function formatFecha(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PE', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

export default function AsistenciaPage() {
  const router = useRouter();
  const { usuarioActual, estaAutenticado } = useAuthStore();
  const alumnos = useAlumnosStore((s) => s.alumnos);
  const salones = useSalonesStore((s) => s.salones);
  const { registros } = useAsistenciaStore();

  const [salonFiltro, setSalonFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!estaAutenticado) router.replace('/login');
  }, [estaAutenticado, router]);

  if (!usuarioActual) return null;

  const esMaestro = usuarioActual.rol === 'Maestro';
  const misSalones = esMaestro
    ? salones.filter((s) => s.maestroId === usuarioActual.id)
    : salones;

  const alumnosFiltrados = alumnos
    .filter((a) => misSalones.map((s) => s.id).includes(a.salonId))
    .filter((a) => salonFiltro === 'todos' || a.salonId === salonFiltro)
    .filter((a) => busqueda === '' || a.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()));

  function asistenciasAlumno(alumnoId: string) {
    return registros.filter((r) => r.alumnoId === alumnoId);
  }

  function porcentajeAsistencia(alumnoId: string) {
    const total = asistenciasAlumno(alumnoId).length;
    if (total === 0) return 0;
    const presentes = asistenciasAlumno(alumnoId).filter((r) => r.estado !== 'pendiente').length;
    return Math.round((presentes / total) * 100);
  }

  // Estadísticas generales
  const totalRegistros = registros.filter((r) =>
    alumnos.filter((a) => misSalones.map((s) => s.id).includes(a.salonId))
      .map((a) => a.id).includes(r.alumnoId)
  ).length;

  const fechasUnicas = Array.from(new Set(registros.map((r) => r.fecha))).sort().reverse();

  return (
    <div className="min-h-screen" style={{ background: '#FFFDE7' }}>
      <div className="px-6 py-6 text-center" style={{ background: '#F5C518' }}>
        <h1 className="text-2xl font-extrabold" style={{ color: '#4a2c00' }}>📊 Historial de Asistencia</h1>
        <p className="text-sm mt-1" style={{ color: '#78350f' }}>Registro de asistencia de los niños(as)</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total niños', valor: alumnosFiltrados.length, color: '#4a2c00', bg: '#FFF9C4' },
            { label: 'Registros totales', valor: totalRegistros, color: '#D97706', bg: '#FEF3C7' },
            { label: 'Domingos registrados', valor: fechasUnicas.length, color: '#7c3aed', bg: '#ede9fe' },
            { label: 'Servicios', valor: SERVICIOS_DOMINGO.length, color: '#0369a1', bg: '#e0f2fe' },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl p-4 text-center border border-yellow-100"
              style={{ background: c.bg }}>
              <p className="text-2xl font-extrabold" style={{ color: c.color }}>{c.valor}</p>
              <p className="text-xs text-gray-600 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="search" placeholder="🔍 Buscar niño(a)..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 rounded-xl border-2 border-yellow-200 px-4 py-2 text-sm focus:outline-none focus:border-yellow-400 bg-white" />
          <select value={salonFiltro} onChange={(e) => setSalonFiltro(e.target.value)}
            className="rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-yellow-400">
            <option value="todos">Todos los salones</option>
            {misSalones.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>

        {/* Tabla de asistencia */}
        <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead style={{ background: '#FFF9C4' }}>
                <tr>
                  <th className="px-4 py-3 text-left font-bold" style={{ color: '#4a2c00' }}>Niño(a)</th>
                  <th className="px-4 py-3 text-left font-bold" style={{ color: '#4a2c00' }}>Salón</th>
                  <th className="px-4 py-3 text-center font-bold" style={{ color: '#4a2c00' }}>Asistencias</th>
                  <th className="px-4 py-3 text-center font-bold" style={{ color: '#4a2c00' }}>%</th>
                  <th className="px-4 py-3 text-left font-bold" style={{ color: '#4a2c00' }}>Última visita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-50">
                {alumnosFiltrados.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Sin resultados</td></tr>
                ) : alumnosFiltrados.map((alumno) => {
                  const asistencias = asistenciasAlumno(alumno.id);
                  const salon = salones.find((s) => s.id === alumno.salonId);
                  const ultima = asistencias.sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
                  const pct = porcentajeAsistencia(alumno.id);

                  return (
                    <tr key={alumno.id} className="hover:bg-yellow-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {alumno.fotografiaUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={alumno.fotografiaUrl} alt={alumno.nombreCompleto}
                              className="w-8 h-8 rounded-full object-cover border border-yellow-200 flex-none" />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-none border border-yellow-200"
                              style={{ background: '#FFF9C4', color: '#4a2c00' }}>
                              {alumno.nombreCompleto.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium" style={{ color: '#4a2c00' }}>{alumno.nombreCompleto}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{salon?.nombre ?? '—'}</td>
                      <td className="px-4 py-3 text-center font-bold" style={{ color: '#D97706' }}>
                        {asistencias.length}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          pct >= 75 ? 'bg-green-100 text-green-700' :
                          pct >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {ultima ? formatFecha(ultima.fecha) : 'Sin registros'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
