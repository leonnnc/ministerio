'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { usePersonalStore } from '@/stores/personalStore';
import { useSalonesStore } from '@/stores/salonesStore';

const salonEmojis: Record<string, string> = {
  Cuna: '🍼',
  PrimerNivel: '🎨',
  SegundoNivel: '📚',
  TercerNivel: '🌟',
};

const salonColores: Record<string, string> = {
  Cuna: 'bg-pink-50 border-pink-200 text-pink-700',
  PrimerNivel: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  SegundoNivel: 'bg-green-50 border-green-200 text-green-700',
  TercerNivel: 'bg-blue-50 border-blue-200 text-blue-700',
};

export default function AdminDashboard() {
  const alumnos = useAlumnosStore((s) => s.alumnos);
  const personal = usePersonalStore((s) => s.personal);
  const salones = useSalonesStore((s) => s.salones);
  const inicializarSalones = useSalonesStore((s) => s.inicializarSalones);

  useEffect(() => {
    inicializarSalones();
  }, [inicializarSalones]);

  const alumnosPorSalon = salones.map((salon) => ({
    salon,
    cantidad: alumnos.filter((a) => a.salonId === salon.id).length,
  }));

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>

        {/* Resumen general */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-primary-600 uppercase tracking-wide">Total de alumnos</p>
            <p className="mt-1 text-4xl font-bold text-primary-700">{alumnos.length}</p>
          </div>
          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">Total de personal</p>
            <p className="mt-1 text-4xl font-bold text-purple-700">{personal.length}</p>
          </div>
        </div>

        {/* Alumnos por salón */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Alumnos por salón</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {alumnosPorSalon.map(({ salon, cantidad }) => {
              const colorClass = salonColores[salon.grupoEdad] ?? 'bg-gray-50 border-gray-200 text-gray-700';
              const emoji = salonEmojis[salon.grupoEdad] ?? '🏫';
              return (
                <div key={salon.id} className={`rounded-2xl border-2 p-5 shadow-sm ${colorClass}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{emoji}</span>
                    <p className="font-semibold text-sm">{salon.nombre}</p>
                  </div>
                  <p className="text-3xl font-bold">{cantidad}</p>
                  <p className="text-xs mt-1 opacity-70">alumnos</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Links de navegación */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Gestión</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/admin/personal" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary-300 transition-all text-center">
              <span className="text-3xl">👥</span>
              <p className="mt-2 font-semibold text-gray-800">Personal</p>
              <p className="text-sm text-gray-500">Gestionar maestros y auxiliares</p>
            </Link>
            <Link href="/admin/salones" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary-300 transition-all text-center">
              <span className="text-3xl">🏫</span>
              <p className="mt-2 font-semibold text-gray-800">Salones</p>
              <p className="text-sm text-gray-500">Asignar maestros y auxiliares</p>
            </Link>
            <Link href="/admin/alumnos" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary-300 transition-all text-center">
              <span className="text-3xl">🎒</span>
              <p className="mt-2 font-semibold text-gray-800">Alumnos</p>
              <p className="text-sm text-gray-500">Ver lista de alumnos inscritos</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
