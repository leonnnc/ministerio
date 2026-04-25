'use client';

import React, { useState } from 'react';
import { usePersonalStore } from '@/stores/personalStore';
import { useSalonesStore } from '@/stores/salonesStore';
import TablaPersonal from '@/components/admin/TablaPersonal';
import FormularioPersonal from '@/components/forms/FormularioPersonal';
import { Button, Modal } from '@/components/ui';
import type { Personal } from '@/types';

export default function PersonalPage() {
  const personal = usePersonalStore((s) => s.personal);
  const agregarPersonal = usePersonalStore((s) => s.agregarPersonal);
  const actualizarPersonal = usePersonalStore((s) => s.actualizarPersonal);
  const eliminarPersonal = usePersonalStore((s) => s.eliminarPersonal);
  const salones = useSalonesStore((s) => s.salones);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [personaEditando, setPersonaEditando] = useState<Personal | undefined>(undefined);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const abrirModalNuevo = () => {
    setPersonaEditando(undefined);
    setModalAbierto(true);
  };

  const abrirModalEditar = (id: string) => {
    const persona = personal.find((p) => p.id === id);
    if (persona) {
      setPersonaEditando(persona);
      setModalAbierto(true);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPersonaEditando(undefined);
  };

  const handleGuardar = (datos: Personal) => {
    if (personaEditando) {
      actualizarPersonal(datos.id, datos);
    } else {
      agregarPersonal(datos);
    }
    cerrarModal();
  };

  const handleEliminar = (id: string) => {
    const exito = eliminarPersonal(id);
    if (!exito) {
      setErrorEliminar('No se puede eliminar: el maestro tiene alumnos asignados');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Personal</h1>
          <Button onClick={abrirModalNuevo}>Agregar Personal</Button>
        </div>

        {errorEliminar && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{errorEliminar}</span>
            <button
              onClick={() => setErrorEliminar(null)}
              className="ml-4 text-red-500 hover:text-red-700 font-semibold"
              aria-label="Cerrar alerta"
            >
              ✕
            </button>
          </div>
        )}

        <TablaPersonal
          personal={personal}
          salones={salones}
          onEditar={abrirModalEditar}
          onEliminar={handleEliminar}
        />

        <Modal
          isOpen={modalAbierto}
          onClose={cerrarModal}
          title={personaEditando ? 'Editar Personal' : 'Agregar Personal'}
        >
          <FormularioPersonal
            valorInicial={personaEditando}
            onGuardar={handleGuardar}
            onCancelar={cerrarModal}
          />
        </Modal>
      </div>
    </main>
  );
}
