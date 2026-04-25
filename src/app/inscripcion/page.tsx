'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FormularioInscripcion from '@/components/forms/FormularioInscripcion';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { asignarSalon } from '@/lib/asignacionSalon';
import type { Alumno, Apoderado } from '@/types';

export default function InscripcionPage() {
  const router = useRouter();
  const { agregarAlumno } = useAlumnosStore();
  const { salones, inicializarSalones } = useSalonesStore();
  const [errorEdad, setErrorEdad] = useState<string | null>(null);

  useEffect(() => {
    inicializarSalones();
  }, [inicializarSalones]);

  async function onExito(alumno: Alumno, apoderado: Apoderado) {
    setErrorEdad(null);

    let grupoEdad;
    try {
      grupoEdad = asignarSalon(alumno.fechaNacimiento);
    } catch {
      setErrorEdad('El niño no cumple el rango de edad del ministerio (0–13 años)');
      return;
    }

    if (grupoEdad === null) {
      setErrorEdad('El niño no cumple el rango de edad del ministerio (0–13 años)');
      return;
    }

    const salon = salones.find((s) => s.grupoEdad === grupoEdad);
    if (!salon) {
      setErrorEdad('No se encontró el salón correspondiente. Intente nuevamente.');
      return;
    }

    const alumnoConSalon: Alumno = { ...alumno, salonId: salon.id };
    await agregarAlumno(alumnoConSalon, apoderado);

    router.push(`/confirmacion?alumnoId=${alumnoConSalon.id}`);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Inscripción de Niños(as)</h1>
          <p className="mt-2 text-gray-600">
            Complete el formulario para inscribir a su hijo/a en el Ministerio de Niños.
          </p>
        </div>

        {errorEdad && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorEdad}
          </div>
        )}

        <FormularioInscripcion onExito={onExito} />
      </div>
    </main>
  );
}
