'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { usePersonalStore } from '@/stores/personalStore';
import { Input } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const iniciarSesion = useAuthStore((s) => s.iniciarSesion);
  const personal = usePersonalStore((s) => s.personal);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setCargando(true);

    await new Promise((r) => setTimeout(r, 400)); // pequeño delay visual

    const resultado = iniciarSesion(email, password, personal);
    setCargando(false);

    if (!resultado.ok) {
      setError(resultado.error ?? 'Error al iniciar sesión');
      return;
    }

    router.push('/portal');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#FFFDE7' }}>
      <div className="w-full max-w-md">
        {/* Franja superior */}
        <div className="rounded-t-3xl px-8 pt-10 pb-8 text-center" style={{ background: '#F5C518' }}>
          <h1 className="text-2xl font-extrabold tracking-wide text-white">
            Ministerio de Niños
          </h1>
          <p className="mt-1 text-sm text-yellow-900">
            Portal de acceso para el equipo
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-b-3xl shadow-xl border border-yellow-200 px-8 py-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Iniciar sesión</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 rounded-xl font-bold text-white transition-opacity disabled:opacity-60"
              style={{ background: '#F5C518', color: '#4a2c00' }}
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">¿Eres maestro, asistente y aún no tienes acceso?</p>
              <p className="text-xs font-semibold" style={{ color: '#92400e' }}>Registro de maestros</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
