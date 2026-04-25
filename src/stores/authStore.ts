import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Personal, Rol } from '@/types';

// Credenciales del admin — usar variables de entorno en producción
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
  iniciarSesion: (email: string, password: string, personal: Personal[]) => { ok: boolean; error?: string };
  cerrarSesion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuarioActual: null,
      estaAutenticado: false,

      iniciarSesion: (email, password, personal) => {
        // Verificar admin maestro
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

        // Buscar en el personal registrado por email
        // La contraseña por defecto es el email (se puede cambiar después)
        const miembro = personal.find(
          (p) => p.email.trim().toLowerCase() === email.trim().toLowerCase()
        );

        if (!miembro) {
          return { ok: false, error: 'No se encontró una cuenta con ese correo' };
        }

        // Contraseña por defecto: primeros 6 caracteres del email + "123"
        const passwordEsperado = email.trim().toLowerCase().slice(0, 6) + '123';
        if (password !== passwordEsperado) {
          return { ok: false, error: 'Contraseña incorrecta' };
        }

        set({ usuarioActual: miembro, estaAutenticado: true });
        return { ok: true };
      },

      cerrarSesion: () => {
        set({ usuarioActual: null, estaAutenticado: false });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state, error) => {
        if (error) console.warn('Error al rehidratar auth-storage:', error);
      },
    }
  )
);
