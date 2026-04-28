'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { useAuthStore } from '@/stores/authStore';
import TablaAlumnos from '@/components/admin/TablaAlumnos';

export default function AlumnosPage() {
  const router = useRouter();
  const { estaAutenticado, usuarioActual, _hasHydrated } = useAuthStore();
  const alumnos = useAlumnosStore((s) => s.alumnos);
  const apoderados = useAlumnosStore((s) => s.apoderados);
  const salones = useSalonesStore((s) => s.salones);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!estaAutenticado) { router.replace('/login'); return; }
    const esAdmin = usuarioActual?.rol === 'Director_General' || usuarioActual?.rol === 'Lider_General';
    if (!esAdmin) router.replace('/portal');
  }, [_hasHydrated, estaAutenticado, usuarioActual, router]);

  if (!_hasHydrated || !estaAutenticado || !usuarioActual) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Lista de Alumnos</h1>
        <TablaAlumnos alumnos={alumnos} apoderados={apoderados} salones={salones} />
      </div>
    </main>
  );
}
