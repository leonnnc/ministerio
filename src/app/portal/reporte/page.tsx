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
    day: 'numeric', month: 'short', year: 'numeric',
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

function descargarCSV(contenido: string, nombre: string) {
  const bom = '\uFEFF'; // BOM para Excel en español
  const blob = new Blob([bom + contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ReportePage() {
  const router = useRouter();
  const { estaAutenticado } = useAuthStore();
  const alumnos = useAlumnosStore((s) => s.alumnos);
  const apoderados = useAlumnosStore((s) => s.apoderados);
  const salones = useSalonesStore((s) => s.salones);
  const registros = useAsistenciaStore((s) => s.registros);

  const [tipoReporte, setTipoReporte] = useState<'asistencia' | 'alumnos' | 'por_fecha'>('asistencia');
  const [salonFiltro, setSalonFiltro] = useState('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    if (!estaAutenticado) router.replace('/login');
    // Defaults: último mes
    const hoy = new Date();
    const hace30 = new Date(hoy);
    hace30.setDate(hoy.getDate() - 30);
    setFechaDesde(hace30.toISOString().split('T')[0]);
    setFechaHasta(hoy.toISOString().split('T')[0]);
  }, [estaAutenticado, router]);

  const alumnosFiltrados = alumnos.filter((a) =>
    salonFiltro === 'todos' || a.salonId === salonFiltro
  );

  function porcentajeAsistencia(alumnoId: string) {
    const regs = registros.filter((r) => r.alumnoId === alumnoId);
    if (regs.length === 0) return 0;
    return Math.round((regs.filter((r) => r.estado !== 'pendiente').length / regs.length) * 100);
  }

  function ultimaAsistencia(alumnoId: string) {
    const regs = registros.filter((r) => r.alumnoId === alumnoId).sort((a, b) => b.fecha.localeCompare(a.fecha));
    return regs[0]?.fecha ?? '—';
  }

  async function generarReporteAsistencia() {
    setGenerando(true);
    const filas = [
      ['Nombre', 'Salón', 'Edad', 'Total Asistencias', '% Asistencia', 'Última Visita', 'Apoderado', 'Teléfono'].join(','),
      ...alumnosFiltrados.map((a) => {
        const salon = salones.find((s) => s.id === a.salonId);
        const apoderado = apoderados.find((ap) => ap.id === a.apoderadoId);
        const total = registros.filter((r) => r.alumnoId === a.id).length;
        const pct = porcentajeAsistencia(a.id);
        const ultima = ultimaAsistencia(a.id);
        return [
          `"${a.nombreCompleto}"`,
          `"${salon?.nombre ?? ''}"`,
          calcularEdad(a.fechaNacimiento),
          total,
          `${pct}%`,
          ultima !== '—' ? formatFecha(ultima) : '—',
          `"${apoderado?.nombreCompleto ?? ''}"`,
          apoderado?.telefono ?? '',
        ].join(',');
      }),
    ];
    descargarCSV(filas.join('\n'), `reporte-asistencia-${new Date().toISOString().split('T')[0]}.csv`);
    setGenerando(false);
  }

  async function generarReporteAlumnos() {
    setGenerando(true);
    const filas = [
      ['Nombre', 'Fecha Nacimiento', 'Edad', 'Sexo', 'Salón', 'Colegio', 'Grado',
       'Alergias', 'Tipo Sangre', 'Apoderado', 'Relación', 'Teléfono', 'Email',
       'Distrito', 'Primera Vez', 'Bautizado', 'Aceptó Cristo'].join(','),
      ...alumnosFiltrados.map((a) => {
        const salon = salones.find((s) => s.id === a.salonId);
        const apoderado = apoderados.find((ap) => ap.id === a.apoderadoId);
        return [
          `"${a.nombreCompleto}"`,
          a.fechaNacimiento,
          calcularEdad(a.fechaNacimiento),
          a.sexo,
          `"${salon?.nombre ?? ''}"`,
          `"${a.colegio ?? ''}"`,
          `"${a.grado ?? ''}"`,
          `"${a.alergias ?? ''}"`,
          a.tipoSangre ?? '',
          `"${apoderado?.nombreCompleto ?? ''}"`,
          apoderado?.relacion ?? '',
          apoderado?.telefono ?? '',
          apoderado?.email ?? '',
          `"${apoderado?.distrito ?? ''}"`,
          a.primeraVez ? 'Sí' : 'No',
          a.esBautizado ? 'Sí' : 'No',
          a.haAceptadoCristo ? 'Sí' : 'No',
        ].join(',');
      }),
    ];
    descargarCSV(filas.join('\n'), `reporte-alumnos-${new Date().toISOString().split('T')[0]}.csv`);
    setGenerando(false);
  }

  async function generarReportePorFecha() {
    if (!fechaDesde || !fechaHasta) return;
    setGenerando(true);
    const registrosFiltrados = registros.filter((r) =>
      r.fecha >= fechaDesde && r.fecha <= fechaHasta &&
      (salonFiltro === 'todos' || alumnosFiltrados.some((a) => a.id === r.alumnoId))
    );

    const filas = [
      ['Fecha', 'Servicio', 'Niño', 'Salón', 'Hora Ingreso', 'Hora Salida', 'Estado'].join(','),
      ...registrosFiltrados
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
        .map((r) => {
          const alumno = alumnos.find((a) => a.id === r.alumnoId);
          const salon = alumno ? salones.find((s) => s.id === alumno.salonId) : null;
          const servicio = SERVICIOS_DOMINGO.find((s) => s.id === r.servicioId);
          const horaIn = r.horaIngreso ? new Date(r.horaIngreso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '';
          const horaOut = r.horaSalida ? new Date(r.horaSalida).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '';
          return [
            formatFecha(r.fecha),
            servicio?.hora ?? r.servicioId,
            `"${alumno?.nombreCompleto ?? r.alumnoId}"`,
            `"${salon?.nombre ?? ''}"`,
            horaIn,
            horaOut,
            r.estado,
          ].join(',');
        }),
    ];
    descargarCSV(filas.join('\n'), `reporte-por-fecha-${fechaDesde}-${fechaHasta}.csv`);
    setGenerando(false);
  }

  // Preview de datos
  const totalRegistrosFiltrados = registros.filter((r) =>
    (salonFiltro === 'todos' || alumnosFiltrados.some((a) => a.id === r.alumnoId)) &&
    (!fechaDesde || r.fecha >= fechaDesde) &&
    (!fechaHasta || r.fecha <= fechaHasta)
  ).length;

  return (
    <div className="min-h-screen" style={{ background: '#FFFDE7' }}>
      <div className="px-6 py-6 text-center" style={{ background: '#F5C518' }}>
        <h1 className="text-2xl font-extrabold" style={{ color: '#4a2c00' }}>📋 Reportes</h1>
        <p className="text-sm mt-1" style={{ color: '#78350f' }}>Exporta datos del ministerio en Excel/CSV</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Tipo de reporte */}
        <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
          <div className="px-4 py-3" style={{ background: '#FFF9C4' }}>
            <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>📊 Tipo de reporte</p>
          </div>
          <div className="px-4 py-4 space-y-2">
            {[
              { value: 'asistencia', label: 'Resumen de asistencia por alumno', emoji: '📊', desc: `${alumnosFiltrados.length} alumnos` },
              { value: 'alumnos', label: 'Datos completos de alumnos', emoji: '🎒', desc: `${alumnosFiltrados.length} registros` },
              { value: 'por_fecha', label: 'Asistencia por rango de fechas', emoji: '📅', desc: `${totalRegistrosFiltrados} registros` },
            ].map((op) => (
              <label key={op.value} className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-yellow-50 transition-colors">
                <input type="radio" name="tipo" value={op.value}
                  checked={tipoReporte === op.value}
                  onChange={() => setTipoReporte(op.value as typeof tipoReporte)}
                  className="w-4 h-4 accent-yellow-500" />
                <span className="text-xl">{op.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{op.label}</p>
                  <p className="text-xs text-gray-400">{op.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
          <div className="px-4 py-3" style={{ background: '#FFF9C4' }}>
            <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>🔍 Filtros</p>
          </div>
          <div className="px-4 py-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Salón</label>
              <select value={salonFiltro} onChange={(e) => setSalonFiltro(e.target.value)}
                className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                <option value="todos">Todos los salones</option>
                {salones.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            {tipoReporte === 'por_fecha' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Desde</label>
                  <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
                    className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Hasta</label>
                  <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
                    className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-2xl border-2 border-yellow-200 bg-white p-4">
          <p className="text-sm font-bold mb-3" style={{ color: '#4a2c00' }}>Vista previa del reporte</p>
          <div className="overflow-x-auto rounded-xl border border-yellow-100">
            <table className="min-w-full text-xs">
              <thead style={{ background: '#FFF9C4' }}>
                <tr>
                  {tipoReporte === 'asistencia' && ['Nombre', 'Salón', 'Asistencias', '%', 'Última visita'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-bold" style={{ color: '#4a2c00' }}>{h}</th>
                  ))}
                  {tipoReporte === 'alumnos' && ['Nombre', 'Edad', 'Salón', 'Apoderado', 'Teléfono'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-bold" style={{ color: '#4a2c00' }}>{h}</th>
                  ))}
                  {tipoReporte === 'por_fecha' && ['Fecha', 'Servicio', 'Niño', 'Estado'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-bold" style={{ color: '#4a2c00' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-50">
                {tipoReporte === 'asistencia' && alumnosFiltrados.slice(0, 5).map((a) => {
                  const salon = salones.find((s) => s.id === a.salonId);
                  const total = registros.filter((r) => r.alumnoId === a.id).length;
                  const ultima = ultimaAsistencia(a.id);
                  return (
                    <tr key={a.id} className="hover:bg-yellow-50">
                      <td className="px-3 py-2 font-medium" style={{ color: '#4a2c00' }}>{a.nombreCompleto}</td>
                      <td className="px-3 py-2 text-gray-500">{salon?.nombre ?? '—'}</td>
                      <td className="px-3 py-2 text-center font-bold" style={{ color: '#D97706' }}>{total}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded-full font-bold ${porcentajeAsistencia(a.id) >= 75 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {porcentajeAsistencia(a.id)}%
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-400">{ultima !== '—' ? formatFecha(ultima) : '—'}</td>
                    </tr>
                  );
                })}
                {tipoReporte === 'alumnos' && alumnosFiltrados.slice(0, 5).map((a) => {
                  const salon = salones.find((s) => s.id === a.salonId);
                  const apoderado = apoderados.find((ap) => ap.id === a.apoderadoId);
                  return (
                    <tr key={a.id} className="hover:bg-yellow-50">
                      <td className="px-3 py-2 font-medium" style={{ color: '#4a2c00' }}>{a.nombreCompleto}</td>
                      <td className="px-3 py-2 text-gray-500">{calcularEdad(a.fechaNacimiento)} años</td>
                      <td className="px-3 py-2 text-gray-500">{salon?.nombre ?? '—'}</td>
                      <td className="px-3 py-2 text-gray-500">{apoderado?.nombreCompleto ?? '—'}</td>
                      <td className="px-3 py-2 text-gray-400">{apoderado?.telefono ?? '—'}</td>
                    </tr>
                  );
                })}
                {tipoReporte === 'por_fecha' && registros
                  .filter((r) => (!fechaDesde || r.fecha >= fechaDesde) && (!fechaHasta || r.fecha <= fechaHasta))
                  .sort((a, b) => b.fecha.localeCompare(a.fecha))
                  .slice(0, 5)
                  .map((r) => {
                    const alumno = alumnos.find((a) => a.id === r.alumnoId);
                    const servicio = SERVICIOS_DOMINGO.find((s) => s.id === r.servicioId);
                    return (
                      <tr key={r.id} className="hover:bg-yellow-50">
                        <td className="px-3 py-2 text-gray-500">{formatFecha(r.fecha)}</td>
                        <td className="px-3 py-2 text-gray-500">{servicio?.hora ?? r.servicioId}</td>
                        <td className="px-3 py-2 font-medium" style={{ color: '#4a2c00' }}>{alumno?.nombreCompleto ?? '—'}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${r.estado === 'entregado' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {r.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Mostrando 5 de {tipoReporte === 'por_fecha' ? totalRegistrosFiltrados : alumnosFiltrados.length} registros
          </p>
        </div>

        {/* Botón exportar */}
        <button
          onClick={() => {
            if (tipoReporte === 'asistencia') generarReporteAsistencia();
            else if (tipoReporte === 'alumnos') generarReporteAlumnos();
            else generarReportePorFecha();
          }}
          disabled={generando}
          className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: '#F5C518', color: '#4a2c00' }}>
          {generando ? '⏳ Generando...' : '⬇️ Descargar reporte CSV (Excel)'}
        </button>
        <p className="text-xs text-center text-gray-400">
          El archivo CSV se puede abrir directamente en Excel o Google Sheets
        </p>
      </div>
    </div>
  );
}
