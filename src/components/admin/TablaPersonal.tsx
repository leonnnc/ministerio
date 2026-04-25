'use client';

import React, { useState } from 'react';
import type { Personal, Salon, Rol } from '@/types';
import { Badge, Button, Modal } from '@/components/ui';

interface TablaPersonalProps {
  personal: Personal[];
  salones: Salon[];
  onEditar: (id: string) => void;
  onEliminar: (id: string) => void;
}

const rolBadgeVariant: Record<Rol, 'primary' | 'success' | 'info' | 'secondary' | 'warning' | 'danger'> = {
  Coordinadora: 'primary',
  Maestro: 'success',
  Auxiliar: 'info',
  Director_General: 'secondary',
  Lider_General: 'warning',
};

const rolLabel: Record<Rol, string> = {
  Director_General: 'Director General',
  Lider_General: 'Líder General',
  Coordinadora: 'Coordinadora',
  Maestro: 'Maestro',
  Auxiliar: 'Auxiliar',
};

export default function TablaPersonal({ personal, salones, onEditar, onEliminar }: TablaPersonalProps) {
  const [confirmarId, setConfirmarId] = useState<string | null>(null);

  const personaAEliminar = personal.find((p) => p.id === confirmarId);

  const nombresSalones = (salonesIds: string[]) => {
    if (!salonesIds.length) return '—';
    return salonesIds
      .map((id) => salones.find((s) => s.id === id)?.nombre ?? id)
      .join(', ');
  };

  const handleConfirmarEliminar = () => {
    if (confirmarId) {
      onEliminar(confirmarId);
      setConfirmarId(null);
    }
  };

  return (
    <>
      {/* Tabla — visible en md+ */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Rol</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Salón(es)</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {personal.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No hay personal registrado.
                </td>
              </tr>
            ) : (
              personal.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.nombreCompleto}</td>
                  <td className="px-4 py-3">
                    <Badge label={rolLabel[p.rol]} variant={rolBadgeVariant[p.rol]} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{nombresSalones(p.salonesIds)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => onEditar(p.id)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setConfirmarId(p.id)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards — visible en móvil */}
      <div className="flex flex-col gap-3 md:hidden">
        {personal.length === 0 ? (
          <p className="text-center text-gray-400 py-6">No hay personal registrado.</p>
        ) : (
          personal.map((p) => (
            <div key={p.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-gray-800">{p.nombreCompleto}</p>
                <Badge label={rolLabel[p.rol]} variant={rolBadgeVariant[p.rol]} />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                <span className="font-medium text-gray-600">Salón(es):</span>{' '}
                {nombresSalones(p.salonesIds)}
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEditar(p.id)}>
                  Editar
                </Button>
                <Button size="sm" variant="danger" onClick={() => setConfirmarId(p.id)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmación */}
      <Modal
        isOpen={confirmarId !== null}
        onClose={() => setConfirmarId(null)}
        title="Confirmar eliminación"
      >
        <p className="text-gray-700">
          ¿Estás seguro de que deseas eliminar a{' '}
          <span className="font-semibold">{personaAEliminar?.nombreCompleto}</span>? Si tiene
          alumnos asignados, no podrá ser eliminado.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmarId(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmarEliminar}>
            Confirmar eliminación
          </Button>
        </div>
      </Modal>
    </>
  );
}
