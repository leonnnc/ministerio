'use client';

import React, { useEffect } from 'react';
import { useSalonesStore } from '@/stores/salonesStore';
import { usePersonalStore } from '@/stores/personalStore';
import TablaSalones from '@/components/admin/TablaSalones';

export default function SalonesPage() {
  const salones = useSalonesStore((s) => s.salones);
  const inicializarSalones = useSalonesStore((s) => s.inicializarSalones);
  const asignarMaestro = useSalonesStore((s) => s.asignarMaestro);
  const asignarAuxiliar = useSalonesStore((s) => s.asignarAuxiliar);
  const personal = usePersonalStore((s) => s.personal);

  useEffect(() => {
    inicializarSalones();
  }, [inicializarSalones]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Salones</h1>
        <TablaSalones
          salones={salones}
          personal={personal}
          onAsignarMaestro={asignarMaestro}
          onAsignarAuxiliar={asignarAuxiliar}
        />
      </div>
    </main>
  );
}
