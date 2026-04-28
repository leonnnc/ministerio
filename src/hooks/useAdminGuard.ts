'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/**
 * Protege páginas de admin.
 * Espera la hidratación del store antes de redirigir.
 * Retorna true cuando el usuario está autenticado y es admin.
 */
export function useAdminGuard(): boolean {
  const router = useRouter();
  const { estaAutenticado, usuarioActual, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return; // esperar hidratación
    if (!estaAutenticado) { router.replace('/login'); return; }
    const esAdmin = usuarioActual?.rol === 'Director_General' || usuarioActual?.rol === 'Lider_General';
    if (!esAdmin) router.replace('/portal');
  }, [_hasHydrated, estaAutenticado, usuarioActual, router]);

  if (!_hasHydrated) return false;
  if (!estaAutenticado || !usuarioActual) return false;
  const esAdmin = usuarioActual.rol === 'Director_General' || usuarioActual.rol === 'Lider_General';
  return esAdmin;
}
