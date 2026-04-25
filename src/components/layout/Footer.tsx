import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(135deg, #F57F17 0%, #FFD600 60%, #FFEE58 100%)' }}>
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">

        {/* Columna 1: Identidad */}
        <div>
          <h3 className="text-lg font-bold mb-3" style={{ color: '#4a2c00' }}>✝️ Ministerio de Niños</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#5a3500' }}>
            Formando el corazón de los niños con amor, fe y propósito en cada reunión dominical.
          </p>
        </div>

        {/* Columna 2: Navegación */}
        <div>
          <h3 className="text-lg font-bold mb-3" style={{ color: '#4a2c00' }}>Navegación</h3>
          <ul className="space-y-2 text-sm" style={{ color: '#5a3500' }}>
            <li><Link href="/" className="hover:text-yellow-900 transition-colors">Inicio</Link></li>
            <li><Link href="/inscripcion" className="hover:text-yellow-900 transition-colors">Inscripción</Link></li>
            <li><Link href="/#grupos" className="hover:text-yellow-900 transition-colors">Nuestros Grupos</Link></li>
            <li><Link href="/#historia" className="hover:text-yellow-900 transition-colors">Historia</Link></li>
            <li><Link href="/#videos" className="hover:text-yellow-900 transition-colors">Videos</Link></li>
          </ul>
        </div>

        {/* Columna 3: Grupos */}
        <div>
          <h3 className="text-lg font-bold mb-3" style={{ color: '#4a2c00' }}>Grupos</h3>
          <ul className="space-y-2 text-sm" style={{ color: '#5a3500' }}>
            <li>🍼 Cuna — 0 a 2 años</li>
            <li>🎨 Preescolar — 3 a 5 años</li>
            <li>📚 Primaria Baja — 6 a 10 años</li>
            <li>🌟 Primaria Alta — 11 a 13 años</li>
          </ul>
        </div>
      </div>

      <div className="border-t py-4 text-center text-xs" style={{ borderColor: '#F9A825', color: '#78350f' }}>
        © {new Date().getFullYear()} Ministerio de Niños. Todos los derechos reservados.
      </div>
    </footer>
  );
}
