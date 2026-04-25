'use client';

import { useState } from "react";
import Link from "next/link";
import CarruselFondo, { type MediaItem } from "@/components/ui/CarruselFondo";
import { usePersonalStore } from "@/stores/personalStore";
import { useSalonesStore } from "@/stores/salonesStore";
import type { GrupoEdad } from "@/types";

const MEDIA_CARRUSEL: MediaItem[] = [
  { tipo: 'imagen', src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80', alt: 'Niños en el ministerio' },
  { tipo: 'imagen', src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1600&q=80', alt: 'Niños aprendiendo' },
  { tipo: 'imagen', src: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1600&q=80', alt: 'Comunidad infantil' },
];

const FOTOS_REUNION = [
  { src: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80', alt: 'Reunión 1' },
  { src: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&q=80', alt: 'Reunión 2' },
  { src: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=600&q=80', alt: 'Reunión 3' },
  { src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80', alt: 'Reunión 4' },
  { src: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80', alt: 'Reunión 5' },
  { src: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=600&q=80', alt: 'Reunión 6' },
];

const VIDEOS = [
  { src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', titulo: 'Alabanza dominical' },
  { src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', titulo: 'Mensaje para los niños' },
  { src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', titulo: 'Actividades especiales' },
  { src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', titulo: 'Testimonio de familias' },
];

// Descripción de actividades por grupo
const INFO_GRUPOS: Record<GrupoEdad, {
  nombre: string;
  subtitulo: string;
  rango: string;
  emoji: string;
  bg: string;
  border: string;
  text: string;
  color: string;
  descripcion: string;
  actividades: string[];
}> = {
  Cuna: {
    nombre: 'Cuna',
    subtitulo: 'Grupo de Niños',
    rango: '0 – 2 años',
    emoji: '🍼',
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
    color: '#F59E0B',
    descripcion: 'Un espacio seguro y lleno de amor para los más pequeños del ministerio. Nuestro equipo cuida a cada bebé con dedicación mientras sus padres participan del servicio.',
    actividades: [
      'Cuidado y atención personalizada',
      'Canciones y música suave de alabanza',
      'Historias bíblicas con imágenes coloridas',
      'Juego libre supervisado',
      'Tiempo de descanso y refrigerio',
    ],
  },
  PrimerNivel: {
    nombre: 'Primer Nivel',
    subtitulo: 'Grupo de Niños — Preescolares',
    rango: '3 – 5 años',
    emoji: '🎨',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    text: 'text-amber-800',
    color: '#F59E0B',
    descripcion: 'Un ambiente creativo y divertido donde los niños aprenden sobre el amor de Dios a través del juego, el arte y las canciones. Cada domingo es una aventura nueva.',
    actividades: [
      'Alabanza con movimiento y baile',
      'Historias bíblicas con títeres y dramatizaciones',
      'Manualidades y arte creativo',
      'Memorización de versículos con canciones',
      'Oración y tiempo de refrigerio',
    ],
  },
  SegundoNivel: {
    nombre: 'Segundo Nivel',
    subtitulo: 'Grupo de Niños — Escolares',
    rango: '6 – 9 años',
    emoji: '📚',
    bg: 'bg-yellow-200',
    border: 'border-yellow-400',
    text: 'text-yellow-900',
    color: '#D97706',
    descripcion: 'Un espacio donde los niños profundizan en la Palabra de Dios con dinámicas interactivas, juegos y actividades que refuerzan los valores del Reino.',
    actividades: [
      'Alabanza y adoración participativa',
      'Estudio bíblico con dinámicas y juegos',
      'Actividades en grupo y trabajo en equipo',
      'Memorización de versículos con premios',
      'Oración, testimonio y refrigerio',
    ],
  },
  TercerNivel: {
    nombre: 'Tercer Nivel',
    subtitulo: 'Grupo de Niños — Preadolescentes',
    rango: '10 – 13 años',
    emoji: '🌟',
    bg: 'bg-amber-200',
    border: 'border-amber-400',
    text: 'text-amber-900',
    color: '#B45309',
    descripcion: 'Un espacio de crecimiento espiritual para los preadolescentes, donde se abordan temas relevantes para su edad con profundidad bíblica y espacio para preguntas.',
    actividades: [
      'Alabanza contemporánea y reflexión',
      'Estudio bíblico temático y aplicado',
      'Debates y preguntas sobre fe y vida',
      'Proyectos de servicio y liderazgo',
      'Oración intercesora y refrigerio',
    ],
  },
};

export default function Home() {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<GrupoEdad | null>(null);
  const personal = usePersonalStore((s) => s.personal);
  const salones = useSalonesStore((s) => s.salones);

  const infoModal = grupoSeleccionado ? INFO_GRUPOS[grupoSeleccionado] : null;
  const salonModal = grupoSeleccionado
    ? salones.find((s) => s.grupoEdad === grupoSeleccionado)
    : null;
  const maestroModal = salonModal?.maestroId
    ? personal.find((p) => p.id === salonModal.maestroId)
    : null;
  const auxiliaresModal = salonModal
    ? salonModal.auxiliaresIds.map((id) => personal.find((p) => p.id === id)).filter(Boolean)
    : [];

  return (
    <>
      {/* ── 1. HERO carrusel ── */}
      <CarruselFondo items={MEDIA_CARRUSEL} intervalo={6000}>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg mb-4">
          ✝️ Ministerio de Niños
        </h1>
        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10 drop-shadow">
          Formando el corazón de los niños con amor, fe y propósito.
        </p>
        <Link href="/inscripcion"
          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-8 py-3 rounded-xl shadow-lg transition-colors text-lg">
          Inscribir a mi hijo
        </Link>
      </CarruselFondo>

      {/* ── 2. FOTOS última reunión ── */}
      <section className="py-16 overflow-hidden" style={{ background: '#FFFDE7' }} id="reunion">
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <h2 className="text-3xl font-bold text-center mb-1" style={{ color: '#F57F17' }}>
            Última Reunión Dominical
          </h2>
          <p className="text-center" style={{ color: '#F9A825' }}>Momentos especiales de nuestra familia</p>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #FFFDE7, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #FFFDE7, transparent)' }} />
          <div className="flex gap-4 pb-2" style={{ animation: 'scrollInfinito 28s linear infinite', width: 'max-content' }}>
            {[...FOTOS_REUNION, ...FOTOS_REUNION].map((foto, i) => (
              <div key={i} className="flex-none w-72 h-52 sm:w-80 sm:h-60 rounded-2xl overflow-hidden shadow-md border-2 border-yellow-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto.src} alt={foto.alt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. HISTORIA / VISIÓN / MISIÓN ── */}
      <section id="historia" className="relative py-20 px-6 overflow-hidden"
        style={{ background: '#FFD600' }}>
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="relative max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-16" style={{ color: '#4a2c00' }}>
            Nuestra Historia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { emoji: '📖', titulo: 'Cómo Empezamos', texto: 'Nació de un sueño: ver a cada niño conocer el amor de Dios. Con un pequeño grupo de familias comprometidas, comenzamos a construir un espacio seguro donde los niños pudieran crecer en fe, valores y comunidad.' },
              { emoji: '🔭', titulo: 'Nuestra Visión', texto: 'Ser un ministerio de referencia que forme niños con carácter, identidad y propósito, preparándolos para ser líderes que transformen su generación con los valores del Reino de Dios.' },
              { emoji: '🎯', titulo: 'Nuestra Misión', texto: 'Enseñar la Palabra de Dios de manera creativa y relevante, crear un ambiente de amor y pertenencia, y acompañar a cada familia en el proceso de formación espiritual de sus hijos.' },
            ].map((item) => (
              <div key={item.titulo} className="rounded-2xl p-6 shadow-lg bg-white/40 border border-yellow-200">
                <div className="text-4xl mb-4 text-center">{item.emoji}</div>
                <h3 className="text-xl font-bold text-center mb-3" style={{ color: '#4a2c00' }}>{item.titulo}</h3>
                <p className="text-sm leading-relaxed text-center" style={{ color: '#5a3500' }}>{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. GRUPOS — con modal al hacer clic ── */}
      <section className="py-16 px-6" style={{ background: '#FFF9C4' }} id="grupos">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: '#E65100' }}>Grupo de Nuestros Niños</h2>
          <p className="text-center mb-2" style={{ color: '#F57F17' }}>
            Cada niño tiene un lugar especial preparado para su edad y etapa de vida
          </p>
          <p className="text-center text-sm mb-4" style={{ color: '#92400e' }}>
            Contamos con 4 grupos diseñados para acompañar a tu hijo desde sus primeros meses hasta los 13 años.
          </p>
          <div className="flex justify-center mb-10">
            <Link
              href="/inscripcion"
              className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl shadow-md transition-all hover:scale-105 text-sm"
              style={{ background: '#F5C518', color: '#4a2c00' }}
            >
              ✨ ¡Inscribe a tu hijo hoy!
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(Object.keys(INFO_GRUPOS) as GrupoEdad[]).map((key) => {
              const g = INFO_GRUPOS[key];
              return (
                <button
                  key={key}
                  onClick={() => setGrupoSeleccionado(key)}
                  className={`rounded-2xl border-2 ${g.border} ${g.bg} p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:scale-105 transition-all cursor-pointer w-full`}
                >
                  <span className="text-5xl mb-3">{g.emoji}</span>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#92400e' }}>{g.subtitulo}</p>
                  <h3 className={`text-xl font-bold ${g.text}`}>{g.nombre}</h3>
                  <p className="text-sm mt-1" style={{ color: '#78350f' }}>{g.rango}</p>
                  <span className="mt-3 text-xs font-semibold px-3 py-1 rounded-full bg-white/60 border border-yellow-300" style={{ color: '#92400e' }}>
                    Ver más →
                  </span>
                </button>
              );
            })}
          </div>

          {/* CTA inferior */}
          <div className="mt-12 rounded-3xl p-8 text-center border-2 border-yellow-300" style={{ background: '#FFD600' }}>
            <p className="text-2xl font-extrabold mb-2" style={{ color: '#4a2c00' }}>
              ¿Tu hijo aún no está inscrito?
            </p>
            <p className="text-sm mb-6 max-w-lg mx-auto" style={{ color: '#78350f' }}>
              El proceso es rápido y sencillo. Solo necesitas sus datos básicos y los de un apoderado.
              Al finalizar recibirás una tarjeta de identificación con código QR para el check-in cada domingo.
            </p>
            <div className="flex justify-center mb-10">
                <Link
                  href="/inscripcion"
                  className="inline-flex items-center justify-center gap-2 font-bold px-8 py-3 rounded-xl shadow-lg transition-all hover:scale-105 text-base"
                  style={{ background: '#4a2c00', color: '#FFD600' }}
                >
                  🎒 Inscribir a mi hijo ahora
                </Link>
              </div>
          </div>
        </div>
      </section>

      {/* ── 5. VIDEOS ── */}
      <section className="py-16 px-6" style={{ background: '#FFF3E0' }} id="videos">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: '#E65100' }}>Videos del Ministerio</h2>
          <p className="text-center mb-10" style={{ color: '#F57F17' }}>Revive los mejores momentos</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VIDEOS.map((video, i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-md border-2 border-yellow-200" style={{ background: '#FFFDE7' }}>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe src={video.src} title={video.titulo}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen />
                </div>
                <div className="px-3 py-2">
                  <p className="font-semibold text-xs" style={{ color: '#78350f' }}>{video.titulo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODAL de grupo ── */}
      {grupoSeleccionado && infoModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setGrupoSeleccionado(null)} />

          {/* Panel — pantalla completa en móvil, modal en desktop */}
          <div className="relative z-10 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95dvh] sm:max-h-[90vh]">

            {/* Header */}
            <div className="px-6 py-6 text-center flex-none" style={{ background: '#FFD600' }}>
              {/* Pill de arrastre en móvil */}
              <div className="w-10 h-1 rounded-full bg-black/20 mx-auto mb-4 sm:hidden" />
              <span className="text-5xl sm:text-6xl">{infoModal.emoji}</span>
              <p className="text-xs font-bold uppercase tracking-widest mt-2" style={{ color: '#78350f' }}>
                {infoModal.subtitulo}
              </p>
              <h2 className="text-2xl font-extrabold mt-1" style={{ color: '#4a2c00' }}>
                {infoModal.nombre}
              </h2>
              <p className="text-sm font-semibold mt-1" style={{ color: '#78350f' }}>
                {infoModal.rango}
              </p>
            </div>

            {/* Contenido scrolleable */}
            <div className="bg-white px-6 py-6 overflow-y-auto flex-1">

              {/* Descripción */}
              <p className="text-gray-700 text-sm leading-relaxed mb-5">
                {infoModal.descripcion}
              </p>

              {/* Actividades */}
              <div className="mb-5">
                <h3 className="font-bold text-base mb-3" style={{ color: '#E65100' }}>
                  📋 Actividades del salón
                </h3>
                <ul className="space-y-2">
                  {infoModal.actividades.map((act, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-0.5 w-5 h-5 rounded-full flex-none flex items-center justify-center text-xs font-bold"
                        style={{ background: '#F5C518', color: '#4a2c00' }}>
                        {i + 1}
                      </span>
                      {act}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Equipo del salón */}
              <div className="rounded-2xl border-2 border-yellow-200 p-4 mb-5" style={{ background: '#FFFDE7' }}>
                <h3 className="font-bold text-base mb-3" style={{ color: '#E65100' }}>
                  👨‍🏫 Equipo del salón
                </h3>
                {maestroModal ? (
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-none"
                      style={{ background: '#F5C518', color: '#4a2c00' }}>
                      {maestroModal.nombreCompleto.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{maestroModal.nombreCompleto}</p>
                      <p className="text-xs text-gray-500">Maestro/a del salón</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mb-2">Maestro por asignar</p>
                )}
                {auxiliaresModal.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {auxiliaresModal.map((aux) => aux && (
                      <div key={aux.id} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-none"
                          style={{ background: '#FDE68A', color: '#78350f' }}>
                          {aux.nombreCompleto.charAt(0)}
                        </div>
                        <p className="text-xs text-gray-600">{aux.nombreCompleto} — <span className="text-gray-400">Auxiliar</span></p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bloque CTA dentro del modal */}
              <div className="rounded-2xl p-4 border-2 border-yellow-300 text-center" style={{ background: '#FFF9C4' }}>
                <p className="font-bold text-sm mb-1" style={{ color: '#4a2c00' }}>
                  ¿Tu hijo tiene entre {infoModal.rango}?
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  Este grupo es perfecto para él/ella. La inscripción es gratuita y solo toma unos minutos.
                </p>
                <Link
                  href="/inscripcion"
                  className="inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
                  style={{ background: '#F5C518', color: '#4a2c00' }}
                  onClick={() => setGrupoSeleccionado(null)}
                >
                  🎒 Inscribir a mi hijo aquí
                </Link>
              </div>
            </div>

            {/* Footer fijo */}
            <div className="bg-white px-6 pb-6 pt-3 border-t border-yellow-100 flex-none">
              <button
                onClick={() => setGrupoSeleccionado(null)}
                className="w-full py-2.5 rounded-xl font-semibold text-sm border-2 border-yellow-300 text-gray-600 hover:bg-yellow-50 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
