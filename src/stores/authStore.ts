import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Personal, Rol } from '@/types';

export const ADMIN_MAESTRO = {
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'admin@ministerio.com',
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'admin123',
  rol: 'Director_General' as Rol,
  nombreCompleto: 'Administrador General',
  id: 'admin-maestro',
};

interface AuthState {
  usuarioActual: Personal | null;
  estaAutenticado: boolean;
  _hasHydrated: boolean;
  iniciarSesion: (email: string, password: string, personal: Personal[]) => { ok: boolean; error?: string };
  cerrarSesion: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuarioActual: null,
      estaAutenticado: false,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      iniciarSesion: (email, password, personal) => {
        if (
          email.trim().toLowerCase() === ADMIN_MAESTRO.email &&
          password === ADMIN_MAESTRO.password
        ) {
          const adminPersonal: Personal = {
            id: ADMIN_MAESTRO.id,
            nombreCompleto: ADMIN_MAESTRO.nombreCompleto,
            rol: ADMIN_MAESTRO.rol,
            telefono: '',
            email: ADMIN_MAESTRO.email,
            salonesIds: [],
          };
          set({ usuarioActual: adminPersonal, estaAutenticado: true });
          return { ok: true };
        }

        const miembro = personal.find(
          (p) => p.email.trim().toLowerCase() === email.trim().toLowerCase()
        );
        if (!miembro) return { ok: false, error: 'No se encontró una cuenta con ese correo' };

        const passwordEsperado = email.trim().toLowerCase().slice(0, 6) + '123';
        if (password !== passwordEsperado) return { ok: false, error: 'Contraseña incorrecta' };

        set({ usuarioActual: miembro, estaAutenticado: true });
        return { ok: true };
      },

      cerrarSesion: () => set({ usuarioActual: null, estaAutenticado: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        usuarioActual: state.usuarioActual,
        estaAutenticado: state.estaAutenticado,
        // _hasHydrated NO se persiste — siempre empieza en false y se activa al rehidratar
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.warn('Error al rehidratar auth-storage:', error);
        state?.setHasHydrated(true);
      },
    }
  )
);
