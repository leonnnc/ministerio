'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FormularioInscripcion from '@/components/forms/FormularioInscripcion';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { calcularEdadParaSalon, SALONES_POR_EDAD } from '@/lib/asignacionSalon';
import { guardarSalon } from '@/lib/firestore/salonesService';
import { guardarAlumno } from '@/lib/firestore/alumnosService';
import type { Alumno, Apoderado, Salon } from '@/types';

export default function InscripcionPage() {
  const router = useRouter();
  const { inicializarSalones } = useSalonesStore();
  const [errorEdad, setErrorEdad] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // Cargar salones al montar (en background, no bloquea)
  useEffect(() => {
    inicializarSalones().catch(() => {});
  }, [inicializarSalones]);

  function obtenerOCrearSalon(edad: number): Salon {
    // Buscar en store local (instantáneo, sin Firestore)
    const salonesActuales = useSalonesStore.getState().salones;
    const existente = salonesActuales.find((s) => edad >= s.edadMinima && edad <= s.edadMaxima);
    if (existente) return existente;

    // Crear salón localmente si no existe
    const config = SALONES_POR_EDAD.find((c) => edad >= c.edadMinima && edad <= c.edadMaxima);
    const nuevoSalon: Salon = {
      id: crypto.randomUUID(),
      nombre: config?.nombre ?? `Salón ${edad} años`,
      grupoEdad: config?.grupoEdad ?? 'SegundoNivel',
      edadMinima: config?.edadMinima ?? edad,
      edadMaxima: config?.edadMaxima ?? edad,
      auxiliaresIds: [],
    };

    // Actualizar store local inmediatamente
    useSalonesStore.setState((state) => ({ salones: [...state.salones, nuevoSalon] }));

    // Sincronizar con Firestore en background
    guardarSalon(nuevoSalon).catch(() => {});

    return nuevoSalon;
  }

  async function onExito(alumno: Alumno, apoderado: Apoderado) {
    setErrorEdad(null);
    setCargando(true);

    try {
      // 1. Calcular edad (instantáneo)
      let edad: number | null;
      try {
        edad = calcularEdadParaSalon(alumno.fechaNacimiento);
      } catch {
        setErrorEdad('La fecha de nacimiento no puede ser una fecha futura');
        setCargando(false);
        return;
      }

      if (edad === null) {
        setErrorEdad('El niño no cumple el rango de edad del ministerio (0–13 años)');
        setCargando(false);
        return;
      }

      // 2. Obtener salón (instantáneo, sin await)
      const salon = obtenerOCrearSalon(edad);

      // 3. Construir alumno con salonId
      const alumnoConSalon: Alumno = { ...alumno, salonId: salon.id };

      // 4. Guardar en Firestore PRIMERO (con timeout de 8s)
      try {
        await Promise.race([
          guardarAlumno(alumnoConSalon, apoderado),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
        ]);
        console.log('✅ Alumno guardado en Firestore:', alumnoConSalon.id);
      } catch (e) {
        console.error('❌ Error guardando en Firestore:', e);
        setErrorEdad(`Error al guardar en la base de datos: ${e}. Verifica las reglas de Firestore.`);
        setCargando(false);
        return;
      }

      // 5. Actualizar store local
      useAlumnosStore.setState((state) => ({
        alumnos: [...state.alumnos, alumnoConSalon],
        apoderados: [...state.apoderados, apoderado],
      }));

      // 6. Redirigir a confirmación
      router.push(`/confirmacion?alumnoId=${alumnoConSalon.id}`);

    } catch (err) {
      setErrorEdad('Error al inscribir. Intenta nuevamente.');
      console.error(err);
      setCargando(false);
    }
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
          <div role="alert" className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorEdad}
          </div>
        )}

        {cargando && (
          <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-700 text-center">
            ⏳ Procesando inscripción...
          </div>
        )}

        <FormularioInscripcion onExito={onExito} />
      </div>
    </main>
  );
}
