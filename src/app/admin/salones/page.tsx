'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSalonesStore } from '@/stores/salonesStore';
import { usePersonalStore } from '@/stores/personalStore';
import { useAuthStore } from '@/stores/authStore';
import TablaSalones from '@/components/admin/TablaSalones';

export default function SalonesPage() {
  const router = useRouter();
  const { estaAutenticado, usuarioActual, _hasHydrated } = useAuthStore();
  const salones = useSalonesStore((s) => s.salones);
  const inicializarSalones = useSalonesStore((s) => s.inicializarSalones);
  const asignarMaestro = useSalonesStore((s) => s.asignarMaestro);
  const asignarAuxiliar = useSalonesStore((s) => s.asignarAuxiliar);
  const personal = usePersonalStore((s) => s.personal);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!estaAutenticado) { router.replace('/login'); return; }
    const esAdmin = usuarioActual?.rol === 'Director_General' || usuarioActual?.rol === 'Lider_General';
    if (!esAdmin) router.replace('/portal');
  }, [_hasHydrated, estaAutenticado, usuarioActual, router]);

  useEffect(() => { inicializarSalones(); }, [inicializarSalones]);

  if (!_hasHydrated || !estaAutenticado || !usuarioActual) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Salones</h1>
        <TablaSalones salones={salones} personal={personal} onAsignarMaestro={asignarMaestro} onAsignarAuxiliar={asignarAuxiliar} />
      </div>
    </main>
  );
}
