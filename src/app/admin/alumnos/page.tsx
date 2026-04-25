'use client';

import React from 'react';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';
import TablaAlumnos from '@/components/admin/TablaAlumnos';

export default function AlumnosPage() {
  const alumnos = useAlumnosStore((s) => s.alumnos);
  const apoderados = useAlumnosStore((s) => s.apoderados);
  const salones = useSalonesStore((s) => s.salones);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Lista de Alumnos</h1>
        <TablaAlumnos
          alumnos={alumnos}
          apoderados={apoderados}
          salones={salones}
        />
      </div>
    </main>
  );
}
