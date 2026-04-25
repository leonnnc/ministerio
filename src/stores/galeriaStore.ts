import { create } from 'zustand';
import {
  guardarFoto, eliminarFoto,
  type FotoGaleria,
} from '@/lib/firestore/galeriaService';

interface GaleriaState {
  fotos: FotoGaleria[];
  agregarFoto: (f: FotoGaleria) => Promise<void>;
  eliminarFoto: (id: string) => Promise<void>;
}

export const useGaleriaStore = create<GaleriaState>()((set) => ({
  fotos: [],
  agregarFoto: async (f) => {
    await guardarFoto(f);
    set((s) => ({ fotos: [...s.fotos, f] }));
  },
  eliminarFoto: async (id) => {
    await eliminarFoto(id);
    set((s) => ({ fotos: s.fotos.filter((f) => f.id !== id) }));
  },
}));
