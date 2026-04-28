'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { usePersonalStore } from '@/stores/personalStore';

type Destinatario = 'todos_padres' | 'salon' | 'personal';

export default function ComunicacionPage() {
  const router = useRouter();
  const { usuarioActual, estaAutenticado, _hasHydrated } = useAuthStore();
  const alumnos = useAlumnosStore((s) => s.alumnos);
  const apoderados = useAlumnosStore((s) => s.apoderados);
  const salones = useSalonesStore((s) => s.salones);
  const personal = usePersonalStore((s) => s.personal);

  const [destinatario, setDestinatario] = useState<Destinatario>('todos_padres');
  const [salonId, setSalonId] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviados, setEnviados] = useState(0);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!estaAutenticado) router.replace('/login');
  }, [_hasHydrated, estaAutenticado, router]);

  if (!usuarioActual) return null;

  const puedeUsar = ['Director_General', 'Lider_General', 'Coordinadora'].includes(usuarioActual.rol);
  if (!puedeUsar) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFDE7' }}>
        <p className="text-gray-500 text-sm">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  // Calcular destinatarios según selección
  function obtenerTelefonos(): { nombre: string; tel: string }[] {
    if (destinatario === 'todos_padres') {
      return apoderados
        .filter((a) => a.whatsapp || a.telefono)
        .map((a) => ({ nombre: a.nombreCompleto, tel: (a.whatsapp ?? a.telefono).replace(/\D/g, '') }));
    }
    if (destinatario === 'salon' && salonId) {
      const alumnosSalon = alumnos.filter((a) => a.salonId === salonId);
      return alumnosSalon
        .map((al) => apoderados.find((ap) => ap.id === al.apoderadoId))
        .filter(Boolean)
        .map((a) => ({ nombre: a!.nombreCompleto, tel: (a!.whatsapp ?? a!.telefono).replace(/\D/g, '') }));
    }
    if (destinatario === 'personal') {
      return personal
        .filter((p) => p.telefono)
        .map((p) => ({ nombre: p.nombreCompleto, tel: p.telefono.replace(/\D/g, '') }));
    }
    return [];
  }

  const telefonos = obtenerTelefonos();
  const salonSeleccionado = salones.find((s) => s.id === salonId);

  function abrirWhatsApp(tel: string, msg: string) {
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  async function handleEnviarTodos() {
    if (!mensaje.trim() || telefonos.length === 0) return;
    setEnviando(true);
    setEnviados(0);

    for (let i = 0; i < telefonos.length; i++) {
      const { tel, nombre } = telefonos[i];
      const msgPersonalizado = mensaje
        .replace('{nombre}', nombre.split(' ')[0])
        .replace('{nombre_completo}', nombre);
      abrirWhatsApp(tel, msgPersonalizado);
      setEnviados(i + 1);
      // Pequeña pausa para no saturar
      await new Promise((r) => setTimeout(r, 800));
    }
    setEnviando(false);
  }

  const PLANTILLAS = [
    {
      label: '📅 Recordatorio domingo',
      texto: 'Hola {nombre} 👋\n\nTe recordamos que este domingo tenemos nuestro servicio del Ministerio de Niños. ¡Los esperamos!\n\n✝️ Ministerio de Niños',
    },
    {
      label: '🎉 Evento especial',
      texto: 'Hola {nombre} 👋\n\nTe invitamos a nuestro próximo evento especial. ¡Será una experiencia increíble para toda la familia!\n\nMás detalles próximamente. ✝️ Ministerio de Niños',
    },
    {
      label: '📋 Información importante',
      texto: 'Hola {nombre} 👋\n\nTenemos una información importante que compartir contigo sobre el Ministerio de Niños.\n\n✝️ Ministerio de Niños',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#FFFDE7' }}>
      {/* Header */}
      <div className="px-6 py-6 text-center" style={{ background: '#F5C518' }}>
        <h1 className="text-2xl font-extrabold" style={{ color: '#4a2c00' }}>📱 Comunicación Masiva</h1>
        <p className="text-sm mt-1" style={{ color: '#78350f' }}>Envía mensajes de WhatsApp al equipo o familias</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Selección de destinatarios */}
        <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
          <div className="px-4 py-3" style={{ background: '#FFF9C4' }}>
            <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>👥 ¿A quién enviar?</p>
          </div>
          <div className="px-4 py-4 space-y-3">
            {[
              { value: 'todos_padres', label: 'Todos los padres / apoderados', emoji: '👨‍👩‍👧', count: apoderados.length },
              { value: 'salon', label: 'Padres de un salón específico', emoji: '🏫', count: null },
              { value: 'personal', label: 'Personal del ministerio', emoji: '👥', count: personal.length },
            ].map((op) => (
              <label key={op.value} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="destinatario" value={op.value}
                  checked={destinatario === op.value}
                  onChange={() => setDestinatario(op.value as Destinatario)}
                  className="w-4 h-4 accent-yellow-500" />
                <span className="text-lg">{op.emoji}</span>
                <span className="text-sm font-medium text-gray-700 flex-1">{op.label}</span>
                {op.count !== null && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#FFF9C4', color: '#D97706' }}>
                    {op.count}
                  </span>
                )}
              </label>
            ))}

            {destinatario === 'salon' && (
              <select value={salonId} onChange={(e) => setSalonId(e.target.value)}
                className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 mt-2">
                <option value="">Seleccionar salón...</option>
                {salones.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({alumnos.filter((a) => a.salonId === s.id).length} niños)
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Contador de destinatarios */}
        {telefonos.length > 0 && (
          <div className="rounded-xl px-4 py-3 text-center border-2 border-green-200"
            style={{ background: '#dcfce7' }}>
            <p className="text-sm font-bold text-green-700">
              ✅ {telefonos.length} destinatario{telefonos.length !== 1 ? 's' : ''} seleccionado{telefonos.length !== 1 ? 's' : ''}
              {salonSeleccionado && ` — ${salonSeleccionado.nombre}`}
            </p>
          </div>
        )}

        {/* Plantillas */}
        <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
          <div className="px-4 py-3" style={{ background: '#FFF9C4' }}>
            <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>📝 Plantillas rápidas</p>
          </div>
          <div className="px-4 py-3 flex flex-col gap-2">
            {PLANTILLAS.map((p) => (
              <button key={p.label} onClick={() => setMensaje(p.texto)}
                className="text-left text-xs px-3 py-2 rounded-xl border-2 border-yellow-100 hover:border-yellow-300 hover:bg-yellow-50 transition-all"
                style={{ color: '#4a2c00' }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mensaje */}
        <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
          <div className="px-4 py-3" style={{ background: '#FFF9C4' }}>
            <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>✍️ Mensaje</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Usa <strong>{'{nombre}'}</strong> para personalizar con el primer nombre del destinatario
            </p>
          </div>
          <div className="px-4 py-4">
            <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              rows={6}
              className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
            <p className="text-xs text-gray-400 mt-1 text-right">{mensaje.length} caracteres</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          {/* Envío masivo */}
          <button
            onClick={handleEnviarTodos}
            disabled={enviando || !mensaje.trim() || telefonos.length === 0}
            className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: '#25D366' }}>
            {enviando
              ? `Enviando... ${enviados}/${telefonos.length}`
              : `📱 Enviar a ${telefonos.length} destinatario${telefonos.length !== 1 ? 's' : ''} por WhatsApp`}
          </button>

          <p className="text-xs text-center text-gray-400">
            Se abrirá WhatsApp para cada destinatario. Asegúrate de permitir ventanas emergentes.
          </p>
        </div>

        {/* Lista de destinatarios */}
        {telefonos.length > 0 && (
          <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
            <div className="px-4 py-3" style={{ background: '#FFF9C4' }}>
              <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>
                Lista de destinatarios ({telefonos.length})
              </p>
            </div>
            <div className="divide-y divide-yellow-50 max-h-48 overflow-y-auto">
              {telefonos.map((t, i) => (
                <div key={i} className="px-4 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#4a2c00' }}>{t.nombre}</p>
                    <p className="text-xs text-gray-400">{t.tel}</p>
                  </div>
                  <button
                    onClick={() => abrirWhatsApp(t.tel, mensaje.replace('{nombre}', t.nombre.split(' ')[0]).replace('{nombre_completo}', t.nombre))}
                    disabled={!mensaje.trim()}
                    className="text-xs px-2 py-1 rounded-lg font-bold text-white disabled:opacity-40"
                    style={{ background: '#25D366' }}>
                    Enviar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
