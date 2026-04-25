'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { usePersonalStore } from '@/stores/personalStore';
import { useSalonesStore } from '@/stores/salonesStore';

function getMesActual() {
  return new Date().getMonth() + 1; // 1-12
}

function getDiaActual() {
  return new Date().getDate();
}

function getNombreMes(mes: number) {
  return new Date(2000, mes - 1, 1).toLocaleDateString('es-PE', { month: 'long' });
}

function parseMesDia(fecha: string): { mes: number; dia: number } | null {
  if (!fecha) return null;
  const partes = fecha.split('-');
  if (partes.length < 3) return null;
  return { mes: parseInt(partes[1]), dia: parseInt(partes[2]) };
}

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  if (hoy.getMonth() < nac.getMonth() ||
    (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

const ROL_LABEL: Record<string, string> = {
  Director_General: 'Director General',
  Lider_General: 'Líder General',
  Coordinadora: 'Coordinadora',
  Maestro: 'Maestro/a',
  Auxiliar: 'Auxiliar',
};

export default function CumpleanosPage() {
  const router = useRouter();
  const { estaAutenticado } = useAuthStore();
  const alumnos = useAlumnosStore((s) => s.alumnos);
  const personal = usePersonalStore((s) => s.personal);
  const salones = useSalonesStore((s) => s.salones);

  useEffect(() => {
    if (!estaAutenticado) router.replace('/login');
  }, [estaAutenticado, router]);

  const mesActual = getMesActual();
  const diaActual = getDiaActual();
  const nombreMes = getNombreMes(mesActual);

  // Niños que cumplen este mes
  const ninosMes = alumnos
    .filter((a) => {
      const md = parseMesDia(a.fechaNacimiento);
      return md?.mes === mesActual;
    })
    .sort((a, b) => {
      const da = parseMesDia(a.fechaNacimiento)?.dia ?? 0;
      const db = parseMesDia(b.fechaNacimiento)?.dia ?? 0;
      return da - db;
    });

  // Staff que cumple este mes
  const staffMes = personal
    .filter((p) => {
      if (!p.fechaNacimiento) return false;
      const md = parseMesDia(p.fechaNacimiento);
      return md?.mes === mesActual;
    })
    .sort((a, b) => {
      const da = parseMesDia(a.fechaNacimiento!)?.dia ?? 0;
      const db = parseMesDia(b.fechaNacimiento!)?.dia ?? 0;
      return da - db;
    });

  const esHoy = (fecha: string) => {
    const md = parseMesDia(fecha);
    return md?.mes === mesActual && md?.dia === diaActual;
  };

  return (
    <div className="min-h-screen" style={{ background: '#FFFDE7' }}>
      {/* Header */}
      <div className="px-6 py-6 text-center" style={{ background: '#F5C518' }}>
        <h1 className="text-2xl font-extrabold" style={{ color: '#4a2c00' }}>
          🎂 Cumpleaños del Mes
        </h1>
        <p className="text-sm mt-1 capitalize" style={{ color: '#78350f' }}>
          {nombreMes} — niños y equipo del ministerio
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">

        {/* Resumen */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 text-center border-2 border-yellow-200 bg-white">
            <p className="text-3xl font-extrabold" style={{ color: '#F5C518' }}>{ninosMes.length}</p>
            <p className="text-xs text-gray-500 mt-1">Niños este mes</p>
          </div>
          <div className="rounded-2xl p-4 text-center border-2 border-yellow-200 bg-white">
            <p className="text-3xl font-extrabold" style={{ color: '#D97706' }}>{staffMes.length}</p>
            <p className="text-xs text-gray-500 mt-1">Staff este mes</p>
          </div>
        </div>

        {/* Niños */}
        <div>
          <h2 className="text-lg font-bold mb-3" style={{ color: '#92400e' }}>
            👦 Niños — {nombreMes}
          </h2>
          {ninosMes.length === 0 ? (
            <div className="rounded-2xl border-2 border-yellow-200 bg-white p-8 text-center">
              <p className="text-gray-400 text-sm">No hay niños que cumplan años este mes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ninosMes.map((alumno) => {
                const md = parseMesDia(alumno.fechaNacimiento)!;
                const salon = salones.find((s) => s.id === alumno.salonId);
                const hoy = esHoy(alumno.fechaNacimiento);
                const edad = calcularEdad(alumno.fechaNacimiento);
                const cumplioYa = md.dia < diaActual;

                return (
                  <div key={alumno.id}
                    className="rounded-2xl border-2 bg-white p-4 flex items-center gap-4"
                    style={{ borderColor: hoy ? '#F5C518' : '#FDE68A', background: hoy ? '#FFFDE7' : '#fff' }}>
                    {/* Avatar */}
                    {alumno.fotografiaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={alumno.fotografiaUrl} alt={alumno.nombreCompleto}
                        className="w-12 h-12 rounded-full object-cover border-2 border-yellow-300 flex-none" />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-none border-2 border-yellow-300"
                        style={{ background: '#FFF9C4', color: '#4a2c00' }}>
                        {alumno.nombreCompleto.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>
                          {alumno.nombreCompleto}
                        </p>
                        {hoy && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse"
                            style={{ background: '#F5C518', color: '#4a2c00' }}>
                            🎉 ¡Hoy!
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{salon?.nombre ?? '—'}</p>
                      <p className="text-xs text-gray-400">
                        Cumple {edad + 1} años el {md.dia} de {nombreMes}
                      </p>
                    </div>

                    <div className="flex-none text-center">
                      <p className="text-2xl font-extrabold" style={{ color: cumplioYa ? '#9ca3af' : '#F5C518' }}>
                        {md.dia}
                      </p>
                      <p className="text-xs text-gray-400">{cumplioYa ? 'ya pasó' : 'próximo'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Staff */}
        <div>
          <h2 className="text-lg font-bold mb-3" style={{ color: '#92400e' }}>
            👥 Equipo del Ministerio — {nombreMes}
          </h2>
          {staffMes.length === 0 ? (
            <div className="rounded-2xl border-2 border-yellow-200 bg-white p-8 text-center">
              <p className="text-gray-400 text-sm">No hay miembros del equipo que cumplan años este mes</p>
              <p className="text-xs text-gray-300 mt-1">Agrega la fecha de nacimiento al registrar personal</p>
            </div>
          ) : (
            <div className="space-y-3">
              {staffMes.map((miembro) => {
                const md = parseMesDia(miembro.fechaNacimiento!)!;
                const hoy = esHoy(miembro.fechaNacimiento!);
                const cumplioYa = md.dia < diaActual;

                return (
                  <div key={miembro.id}
                    className="rounded-2xl border-2 bg-white p-4 flex items-center gap-4"
                    style={{ borderColor: hoy ? '#D97706' : '#FDE68A', background: hoy ? '#FFF9C4' : '#fff' }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-none border-2"
                      style={{ background: '#FFF9C4', color: '#4a2c00', borderColor: hoy ? '#D97706' : '#FDE68A' }}>
                      {miembro.nombreCompleto.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>
                          {miembro.nombreCompleto}
                        </p>
                        {hoy && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse"
                            style={{ background: '#D97706', color: '#fff' }}>
                            🎉 ¡Hoy!
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{ROL_LABEL[miembro.rol] ?? miembro.rol}</p>
                      <p className="text-xs text-gray-400">
                        El {md.dia} de {nombreMes}
                      </p>
                    </div>

                    <div className="flex-none text-center">
                      <p className="text-2xl font-extrabold" style={{ color: cumplioYa ? '#9ca3af' : '#D97706' }}>
                        {md.dia}
                      </p>
                      <p className="text-xs text-gray-400">{cumplioYa ? 'ya pasó' : 'próximo'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
