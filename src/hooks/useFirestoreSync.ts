'use client';

import { useEffect } from 'react';

// Listeners en tiempo real — solo los críticos para operación dominical
import { escucharAlumnos, escucharApoderados } from '@/lib/firestore/alumnosService';
import { escucharAsistencia } from '@/lib/firestore/asistenciaService';

// Carga única — datos que cambian poco
import { obtenerAlumnos, obtenerApoderados } from '@/lib/firestore/alumnosService';
import { escucharPersonal } from '@/lib/firestore/personalService';
import { escucharSalones } from '@/lib/firestore/salonesService';
import { obtenerAsignaciones } from '@/lib/firestore/agendaService';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { useAlumnosStore } from '@/stores/alumnosStore';
import { usePersonalStore } from '@/stores/personalStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { useAgendaStore } from '@/stores/agendaStore';
import { useAsistenciaStore } from '@/stores/asistenciaStore';
import { useAvisosStore } from '@/stores/avisosStore';
import { useEventosStore } from '@/stores/eventosStore';
import { useOracionesStore } from '@/stores/oracionesStore';
import { useGaleriaStore } from '@/stores/galeriaStore';

async function cargarUnaVez() {
  try {
    // Agenda
    const asignaciones = await obtenerAsignaciones();
    useAgendaStore.setState({ asignaciones });

    // Avisos
    const avisosSnap = await getDocs(collection(db, 'avisos'));
    useAvisosStore.setState({ avisos: avisosSnap.docs.map((d) => d.data() as any) });

    // Eventos
    const eventosSnap = await getDocs(collection(db, 'eventos'));
    useEventosStore.setState({ eventos: eventosSnap.docs.map((d) => d.data() as any) });

    // Oraciones
    const oracionesSnap = await getDocs(collection(db, 'oraciones'));
    useOracionesStore.setState({ oraciones: oracionesSnap.docs.map((d) => d.data() as any) });

    // Galería
    const galeriaSnap = await getDocs(collection(db, 'galeria'));
    useGaleriaStore.setState({ fotos: galeriaSnap.docs.map((d) => d.data() as any) });
  } catch {
    // Silencioso — no crítico
  }
}

export function useFirestoreSync() {
  useEffect(() => {
    // 3 listeners en tiempo real — solo los críticos
    const unsubs = [
      escucharAlumnos((alumnos) => { useAlumnosStore.setState({ alumnos }); }),
      escucharApoderados((apoderados) => { useAlumnosStore.setState({ apoderados }); }),
      escucharPersonal((personal) => { usePersonalStore.setState({ personal }); }),
      escucharSalones((salones) => { useSalonesStore.setState({ salones }); }),
      escucharAsistencia((registros) => { useAsistenciaStore.setState({ registros }); }),
    ];

    // Carga única para el resto (con delay para no saturar)
    const timer = setTimeout(() => cargarUnaVez(), 2000);

    return () => {
      unsubs.forEach((u) => u());
      clearTimeout(timer);
    };
  }, []);
}
