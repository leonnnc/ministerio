'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/**
 * Protege páginas del portal.
 * Espera la hidratación del store antes de redirigir.
 * Retorna true cuando el usuario está autenticado.
 */
export function usePortalGuard(): boolean {
  const router = useRouter();
  const { estaAutenticado, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!estaAutenticado) router.replace('/login');
  }, [_hasHydrated, estaAutenticado, router]);

  return _hasHydrated && estaAutenticado;
}
