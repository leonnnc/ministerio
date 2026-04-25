'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { usePersonalStore } from '@/stores/personalStore';
import { useAsistenciaStore } from '@/stores/asistenciaStore';
import { SERVICIOS_DOMINGO } from '@/stores/agendaStore';

function getNombreMes(mes: number) {
  return new Date(2000, mes, 1).toLocaleDateString('es-PE', { month: 'short' });
}

const GRUPO_COLORES: Record<string, string> = {
  Cuna: '#F59E0B',
  PrimerNivel: '#10B981',
  SegundoNivel: '#3B82F6',
  TercerNivel: '#8B5CF6',
};

const GRUPO_NOMBRES: Record<string, string> = {
  Cuna: 'Cuna',
  PrimerNivel: 'Primer Nivel',
  SegundoNivel: 'Segundo Nivel',
  TercerNivel: 'Tercer Nivel',
};

export default function EstadisticasPage() {
  const router = useRouter();
  const { estaAutenticado } = useAuthStore();
  const alumnos = useAlumnosStore((s) => s.alumnos);
  const salones = useSalonesStore((s) => s.salones);
  const personal = usePersonalStore((s) => s.personal);
  const registros = useAsistenciaStore((s) => s.registros);

  useEffect(() => {
    if (!estaAutenticado) router.replace('/login');
  }, [estaAutenticado, router]);

  // Alumnos por salón
  const alumnosPorSalon = salones.map((s) => ({
    salon: s,
    cantidad: alumnos.filter((a) => a.salonId === s.id).length,
  }));

  // Personal por rol
  const rolesCounts = personal.reduce<Record<string, number>>((acc, p) => {
    acc[p.rol] = (acc[p.rol] ?? 0) + 1;
    return acc;
  }, {});

  // Asistencia por mes (últimos 6 meses)
  const hoy = new Date();
  const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - i), 1);
    return { mes: d.getMonth(), anio: d.getFullYear(), label: getNombreMes(d.getMonth()) };
  });

  const asistenciaPorMes = ultimos6Meses.map(({ mes, anio, label }) => ({
    label,
    cantidad: registros.filter((r) => {
      const d = new Date(r.fecha);
      return d.getMonth() === mes && d.getFullYear() === anio;
    }).length,
  }));

  const maxAsistencia = Math.max(...asistenciaPorMes.map((m) => m.cantidad), 1);

  // Asistencia por servicio
  const asistenciaPorServicio = SERVICIOS_DOMINGO.map((s) => ({
    servicio: s,
    cantidad: registros.filter((r) => r.servicioId === s.id).length,
  }));
  const maxServicio = Math.max(...asistenciaPorServicio.map((s) => s.cantidad), 1);

  // Niños nuevos vs recurrentes
  const nuevos = alumnos.filter((a) => a.primeraVez).length;
  const recurrentes = alumnos.length - nuevos;

  // Sexo
  const masculinos = alumnos.filter((a) => a.sexo === 'masculino').length;
  const femeninos = alumnos.filter((a) => a.sexo === 'femenino').length;

  // Fechas únicas con asistencia
  const fechasUnicas = new Set(registros.map((r) => r.fecha)).size;

  return (
    <div className="min-h-screen" style={{ background: '#FFFDE7' }}>
      {/* Header */}
      <div className="px-6 py-6 text-center" style={{ background: '#F5C518' }}>
        <h1 className="text-2xl font-extrabold" style={{ color: '#4a2c00' }}>
          📈 Estadísticas
        </h1>
        <p className="text-sm mt-1" style={{ color: '#78350f' }}>
          Resumen general del ministerio
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* KPIs principales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total niños', valor: alumnos.length, color: '#4a2c00', bg: '#FFF9C4' },
            { label: 'Total personal', valor: personal.length, color: '#7c3aed', bg: '#ede9fe' },
            { label: 'Domingos registrados', valor: fechasUnicas, color: '#D97706', bg: '#FEF3C7' },
            { label: 'Total asistencias', valor: registros.length, color: '#16a34a', bg: '#dcfce7' },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl p-4 text-center border border-yellow-100"
              style={{ background: c.bg }}>
              <p className="text-3xl font-extrabold" style={{ color: c.color }}>{c.valor}</p>
              <p className="text-xs text-gray-600 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Asistencia por mes */}
        <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
          <div className="px-5 py-4" style={{ background: '#FFF9C4' }}>
            <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>📅 Asistencia — últimos 6 meses</p>
          </div>
          <div className="px-5 py-5">
            <div className="flex items-end gap-3 h-32">
              {asistenciaPorMes.map(({ label, cantidad }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-xs font-bold" style={{ color: '#D97706' }}>{cantidad}</p>
                  <div className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${Math.max((cantidad / maxAsistencia) * 100, 4)}%`,
                      background: '#F5C518',
                      minHeight: cantidad > 0 ? '8px' : '4px',
                    }} />
                  <p className="text-xs text-gray-500 capitalize">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Niños por salón */}
        <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
          <div className="px-5 py-4" style={{ background: '#FFF9C4' }}>
            <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>🏫 Niños por salón</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {alumnosPorSalon.map(({ salon, cantidad }) => {
              const color = GRUPO_COLORES[salon.grupoEdad] ?? '#F5C518';
              const pct = alumnos.length === 0 ? 0 : Math.round((cantidad / alumnos.length) * 100);
              return (
                <div key={salon.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold" style={{ color: '#4a2c00' }}>
                      {GRUPO_NOMBRES[salon.grupoEdad] ?? salon.nombre}
                    </span>
                    <span className="font-bold" style={{ color }}>{cantidad} niños ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Asistencia por servicio */}
        <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
          <div className="px-5 py-4" style={{ background: '#FFF9C4' }}>
            <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>🕐 Asistencia por servicio</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {asistenciaPorServicio.map(({ servicio, cantidad }) => {
              const pct = Math.round((cantidad / maxServicio) * 100);
              return (
                <div key={servicio.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold" style={{ color: '#4a2c00' }}>{servicio.hora}</span>
                    <span className="font-bold" style={{ color: '#D97706' }}>{cantidad} registros</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: '#D97706' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribución */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Nuevos vs recurrentes */}
          <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
            <div className="px-5 py-4" style={{ background: '#FFF9C4' }}>
              <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>⭐ Nuevos vs Recurrentes</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { label: 'Primera visita', valor: nuevos, color: '#16a34a', bg: '#dcfce7' },
                { label: 'Recurrentes', valor: recurrentes, color: '#D97706', bg: '#FEF3C7' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-none"
                    style={{ background: item.bg, color: item.color }}>
                    {item.valor}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: '#4a2c00' }}>{item.label}</p>
                    <p className="text-xs text-gray-400">
                      {alumnos.length === 0 ? 0 : Math.round((item.valor / alumnos.length) * 100)}% del total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sexo */}
          <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
            <div className="px-5 py-4" style={{ background: '#FFF9C4' }}>
              <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>👦👧 Por sexo</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { label: 'Masculino', valor: masculinos, emoji: '👦', color: '#3B82F6', bg: '#dbeafe' },
                { label: 'Femenino', valor: femeninos, emoji: '👧', color: '#EC4899', bg: '#fce7f3' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-none"
                    style={{ background: item.bg }}>
                    {item.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: '#4a2c00' }}>{item.label}</p>
                    <p className="text-xs text-gray-400">
                      {item.valor} niños · {alumnos.length === 0 ? 0 : Math.round((item.valor / alumnos.length) * 100)}%
                    </p>
                  </div>
                  <p className="font-extrabold text-lg" style={{ color: item.color }}>{item.valor}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Personal por rol */}
          <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden sm:col-span-2">
            <div className="px-5 py-4" style={{ background: '#FFF9C4' }}>
              <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>👥 Personal por rol</p>
            </div>
            <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(rolesCounts).map(([rol, cantidad]) => (
                <div key={rol} className="rounded-xl p-3 text-center border border-yellow-100"
                  style={{ background: '#FFFDE7' }}>
                  <p className="text-2xl font-extrabold" style={{ color: '#D97706' }}>{cantidad}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{rol.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
