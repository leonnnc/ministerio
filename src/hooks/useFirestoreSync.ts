'use client';

import { useEffect } from 'react';
import { escucharAlumnos, escucharApoderados } from '@/lib/firestore/alumnosService';
import { escucharPersonal } from '@/lib/firestore/personalService';
import { escucharSalones } from '@/lib/firestore/salonesService';
import { escucharAgenda } from '@/lib/firestore/agendaService';
import { escucharAsistencia } from '@/lib/firestore/asistenciaService';
import { escucharAvisos } from '@/lib/firestore/avisosService';
import { escucharEventos } from '@/lib/firestore/eventosService';
import { escucharOraciones } from '@/lib/firestore/oracionesService';
import { escucharGaleria } from '@/lib/firestore/galeriaService';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { usePersonalStore } from '@/stores/personalStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { useAgendaStore } from '@/stores/agendaStore';
import { useAsistenciaStore } from '@/stores/asistenciaStore';
import { useAvisosStore } from '@/stores/avisosStore';
import { useEventosStore } from '@/stores/eventosStore';
import { useOracionesStore } from '@/stores/oracionesStore';
import { useGaleriaStore } from '@/stores/galeriaStore';

export function useFirestoreSync() {
  useEffect(() => {
    const unsubs = [
      escucharAlumnos((alumnos) => { useAlumnosStore.setState({ alumnos }); }),
      escucharApoderados((apoderados) => { useAlumnosStore.setState({ apoderados }); }),
      escucharPersonal((personal) => { usePersonalStore.setState({ personal }); }),
      escucharSalones((salones) => { useSalonesStore.setState({ salones }); }),
      escucharAgenda((asignaciones) => { useAgendaStore.setState({ asignaciones }); }),
      escucharAsistencia((registros) => { useAsistenciaStore.setState({ registros }); }),
      escucharAvisos((avisos) => { useAvisosStore.setState({ avisos }); }),
      escucharEventos((eventos) => { useEventosStore.setState({ eventos }); }),
      escucharOraciones((oraciones) => { useOracionesStore.setState({ oraciones }); }),
      escucharGaleria((fotos) => { useGaleriaStore.setState({ fotos }); }),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);
}
