'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { usePersonalStore } from '@/stores/personalStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { useAuthStore } from '@/stores/authStore';

const GRUPO_CONFIG: Record<string, { color: string; bg: string; emoji: string }> = {
  Cuna:         { color: '#F59E0B', bg: '#FEF3C7', emoji: '🍼' },
  PrimerNivel:  { color: '#10B981', bg: '#D1FAE5', emoji: '🎨' },
  SegundoNivel: { color: '#3B82F6', bg: '#DBEAFE', emoji: '📚' },
  TercerNivel:  { color: '#8B5CF6', bg: '#EDE9FE', emoji: '🌟' },
};

export default function AdminDashboard() {
  const router = useRouter();
  const { estaAutenticado, usuarioActual, _hasHydrated } = useAuthStore();
  const alumnos = useAlumnosStore((s) => s.alumnos);
  const personal = usePersonalStore((s) => s.personal);
  const salones = useSalonesStore((s) => s.salones);
  const inicializarSalones = useSalonesStore((s) => s.inicializarSalones);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!estaAutenticado) { router.replace('/login'); return; }
    const esAdmin = usuarioActual?.rol === 'Director_General' || usuarioActual?.rol === 'Lider_General';
    if (!esAdmin) router.replace('/portal');
  }, [_hasHydrated, estaAutenticado, usuarioActual, router]);

  useEffect(() => { inicializarSalones(); }, [inicializarSalones]);

  if (!_hasHydrated || !estaAutenticado || !usuarioActual) return null;

  // Agrupar salones por grupoEdad
  const gruposUnicos = [...new Set(salones.map((s) => s.grupoEdad))];
  const resumenGrupos = gruposUnicos.map((grupo) => {
    const salonesGrupo = salones.filter((s) => s.grupoEdad === grupo);
    const totalAlumnos = salonesGrupo.reduce(
      (acc, s) => acc + alumnos.filter((a) => a.salonId === s.id).length, 0
    );
    return { grupo, totalAlumnos, salones: salonesGrupo.length };
  });

  const totalAlumnos = alumnos.length;
  const totalPersonal = personal.length;
  const totalSalones = salones.length;
  const salonSinMaestro = salones.filter((s) => !s.maestroId).length;

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-5 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ministerio de Niños — Vista general</p>
        </div>
        <Link href="/portal"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600">
          ← Portal
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Alumnos', valor: totalAlumnos, icon: '🎒', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
            { label: 'Personal', valor: totalPersonal, icon: '👥', color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
            { label: 'Salones', valor: totalSalones, icon: '🏫', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
            { label: 'Sin maestro', valor: salonSinMaestro, icon: '⚠️', color: salonSinMaestro > 0 ? '#EF4444' : '#10B981', bg: salonSinMaestro > 0 ? '#FEF2F2' : '#ECFDF5', border: salonSinMaestro > 0 ? '#FECACA' : '#A7F3D0' },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl border p-5 bg-white shadow-sm"
              style={{ borderColor: k.border }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{k.icon}</span>
                <span className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ background: k.bg, color: k.color }}>
                  {k.label}
                </span>
              </div>
              <p className="text-3xl font-bold" style={{ color: k.color }}>{k.valor}</p>
            </div>
          ))}
        </div>

        {/* Alumnos por grupo */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Alumnos por grupo</h2>
            <Link href="/admin/alumnos" className="text-sm font-semibold text-blue-600 hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
            {resumenGrupos.map(({ grupo, totalAlumnos: total, salones: nSalones }) => {
              const cfg = GRUPO_CONFIG[grupo] ?? { color: '#6B7280', bg: '#F9FAFB', emoji: '🏫' };
              return (
                <div key={grupo} className="px-6 py-5 text-center">
                  <div className="text-3xl mb-2">{cfg.emoji}</div>
                  <p className="text-2xl font-bold" style={{ color: cfg.color }}>{total}</p>
                  <p className="text-xs font-semibold text-gray-500 mt-1">{grupo.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-xs text-gray-400">{nSalones} salón{nSalones !== 1 ? 'es' : ''}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div>
          <h2 className="font-bold text-gray-800 mb-4">Gestión</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                href: '/admin/personal',
                icon: '👥',
                title: 'Personal',
                desc: 'Gestionar maestros y auxiliares',
                count: `${totalPersonal} miembros`,
                color: '#8B5CF6',
                bg: '#F5F3FF',
                border: '#DDD6FE',
              },
              {
                href: '/admin/salones',
                icon: '🏫',
                title: 'Salones',
                desc: 'Asignar maestros por edad',
                count: `${totalSalones} salones`,
                color: '#10B981',
                bg: '#ECFDF5',
                border: '#A7F3D0',
              },
              {
                href: '/admin/alumnos',
                icon: '🎒',
                title: 'Alumnos',
                desc: 'Ver lista de inscritos',
                count: `${totalAlumnos} inscritos`,
                color: '#3B82F6',
                bg: '#EFF6FF',
                border: '#BFDBFE',
              },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="group rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                style={{ borderColor: item.border }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: item.bg }}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: item.bg, color: item.color }}>
                    {item.count}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold"
                  style={{ color: item.color }}>
                  Gestionar <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Alerta salones sin maestro */}
        {salonSinMaestro > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-red-700">
                  {salonSinMaestro} salón{salonSinMaestro !== 1 ? 'es' : ''} sin maestro asignado
                </p>
                <p className="text-sm text-red-500">Asigna maestros para que los niños puedan ser atendidos correctamente.</p>
              </div>
            </div>
            <Link href="/admin/salones"
              className="text-sm font-bold px-4 py-2 rounded-xl text-white"
              style={{ background: '#EF4444' }}>
              Asignar →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
