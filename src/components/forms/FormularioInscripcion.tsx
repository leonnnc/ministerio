'use client';

import React, { useState } from 'react';
import { DISTRITOS_LIMA, DEPARTAMENTOS_PERU } from '@/lib/ubicacionesPeru';
import { Card } from '@/components/ui';
import type { Alumno, Apoderado } from '@/types';

interface Props {
  onExito: (alumno: Alumno, apoderado: Apoderado) => void;
}

const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

function base64(archivo: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej();
    r.readAsDataURL(archivo);
  });
}

const cls = (err?: boolean) => [
  'w-full rounded-lg border px-3 py-2 text-sm text-gray-900',
  'focus:outline-none focus:ring-2 focus:ring-offset-1',
  err
    ? 'border-red-500 focus:ring-red-400'
    : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
].join(' ');

function Campo({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function FormularioInscripcion({ onExito }: Props) {
  // Datos del niño
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [sexo, setSexo] = useState('');
  const [colegio, setColegio] = useState('');
  const [grado, setGrado] = useState('');
  const [foto, setFoto] = useState<string | undefined>();
  const [errorFoto, setErrorFoto] = useState('');

  // Datos del apoderado
  const [apNombre, setApNombre] = useState('');
  const [apRelacion, setApRelacion] = useState('');
  const [apTelefono, setApTelefono] = useState('');
  const [apEmail, setApEmail] = useState('');
  const [apDireccion, setApDireccion] = useState('');
  const [apDepartamento, setApDepartamento] = useState('Lima');
  const [apDistrito, setApDistrito] = useState('');
  const [apEmergenciaNombre, setApEmergenciaNombre] = useState('');
  const [apEmergenciaTel, setApEmergenciaTel] = useState('');
  const [apPersonasAut, setApPersonasAut] = useState('');
  const [apServicio, setApServicio] = useState('');
  const [apMiembro, setApMiembro] = useState(false);

  // Espiritual
  const [primeraVez, setPrimeraVez] = useState(true);
  const [bautizado, setBautizado] = useState(false);
  const [aceptoCristo, setAceptoCristo] = useState(false);
  const [asistenciaReg, setAsistenciaReg] = useState(false);
  const [comoSeEntero, setComoSeEntero] = useState('');

  // Médico
  const [alergias, setAlergias] = useState('');
  const [condiciones, setCondiciones] = useState('');
  const [medicamentos, setMedicamentos] = useState('');
  const [restricciones, setRestricciones] = useState('');
  const [tipoSangre, setTipoSangre] = useState('');
  const [seguro, setSeguro] = useState('');
  const [hospital, setHospital] = useState('');
  const [discapacidad, setDiscapacidad] = useState(false);
  const [detalleDisc, setDetalleDisc] = useState('');

  // Errores
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    setErrorFoto('');
    const f = e.target.files?.[0];
    if (!f) return;
    if (!TIPOS_FOTO.includes(f.type)) { setErrorFoto('Solo JPG, PNG o WebP'); return; }
    if (f.size > MAX_BYTES) { setErrorFoto('Máximo 5MB'); return; }
    setFoto(await base64(f));
  }

  function validar(): boolean {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!fecha) e.fecha = 'La fecha de nacimiento es requerida';
    if (!sexo) e.sexo = 'Selecciona el sexo';
    if (!apNombre.trim()) e.apNombre = 'El nombre del apoderado es requerido';
    if (!apRelacion) e.apRelacion = 'Selecciona la relación';
    if (!apTelefono.trim() || apTelefono.trim().length < 7) e.apTelefono = 'Teléfono inválido';
    if (!apEmail.trim() || !apEmail.includes('@')) e.apEmail = 'Correo electrónico inválido';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    setEnviando(true);

    const ahora = new Date().toISOString();
    const apoderadoId = crypto.randomUUID();
    const alumnoId = crypto.randomUUID();
    const codigoQR = `MIN-${alumnoId.slice(0, 8).toUpperCase()}`;

    const apoderado: Apoderado = {
      id: apoderadoId,
      nombreCompleto: apNombre.trim(),
      relacion: apRelacion as Apoderado['relacion'],
      telefono: apTelefono.trim(),
      email: apEmail.trim(),
      direccion: apDireccion || undefined,
      distrito: apDistrito || undefined,
      departamento: apDepartamento,
      telefonoEmergencia: apEmergenciaTel || undefined,
      nombreEmergencia: apEmergenciaNombre || undefined,
      personasAutorizadas: apPersonasAut || undefined,
      servicioHabitual: (apServicio as Apoderado['servicioHabitual']) || undefined,
      esMiembroIglesia: apMiembro,
    };

    const alumno: Alumno = {
      id: alumnoId,
      nombreCompleto: nombre.trim(),
      fechaNacimiento: fecha,
      sexo: sexo as Alumno['sexo'],
      fotografiaUrl: foto,
      salonId: '',
      apoderadoId,
      fechaRegistro: ahora,
      codigoQR,
      colegio: colegio || undefined,
      grado: grado || undefined,
      alergias: alergias || undefined,
      condicionesMedicas: condiciones || undefined,
      medicamentos: medicamentos || undefined,
      restriccionesAlimentarias: restricciones || undefined,
      tipoSangre: (tipoSangre as Alumno['tipoSangre']) || undefined,
      seguroMedico: (seguro as Alumno['seguroMedico']) || undefined,
      hospitalPreferencia: hospital || undefined,
      tieneDiscapacidad: discapacidad,
      detalleDiscapacidad: detalleDisc || undefined,
      esBautizado: bautizado,
      haAceptadoCristo: aceptoCristo,
      primeraVez,
      asistenciaRegular: asistenciaReg,
      comoSeEntero: comoSeEntero || undefined,
    };

    try {
      await onExito(alumno, apoderado);
    } catch {
      // el error lo maneja la página padre
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

      {/* ── 1. DATOS DEL NIÑO ── */}
      <Card>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#4a2c00' }}>👦 Datos del Niño(a)</h2>
        <div className="flex flex-col gap-4">

          <Campo label="Nombre completo *" error={errores.nombre}>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Juan Pérez García" className={cls(!!errores.nombre)} />
          </Campo>

          <Campo label="Fecha de nacimiento *" error={errores.fecha}>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              max={new Date().toISOString().split('T')[0]} className={cls(!!errores.fecha)} />
          </Campo>

          <Campo label="Sexo *" error={errores.sexo}>
            <select value={sexo} onChange={e => setSexo(e.target.value)} className={cls(!!errores.sexo)}>
              <option value="">Seleccionar...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </Campo>

          <Campo label="Colegio donde estudia">
            <input value={colegio} onChange={e => setColegio(e.target.value)}
              placeholder="Ej: I.E. San Martín" className={cls()} />
          </Campo>

          <Campo label="Grado / Año escolar">
            <select value={grado} onChange={e => setGrado(e.target.value)} className={cls()}>
              <option value="">Seleccionar...</option>
              <optgroup label="Cuna">
                <option value="Cuna - 0 años">0 años</option>
                <option value="Cuna - 1 año">1 año</option>
                <option value="Cuna - 2 años">2 años</option>
              </optgroup>
              <optgroup label="Inicial">
                <option value="3 años - Inicial">3 años</option>
                <option value="4 años - Inicial">4 años</option>
                <option value="5 años - Inicial">5 años</option>
              </optgroup>
              <optgroup label="Primaria">
                <option value="1° Primaria">1° Primaria</option>
                <option value="2° Primaria">2° Primaria</option>
                <option value="3° Primaria">3° Primaria</option>
                <option value="4° Primaria">4° Primaria</option>
                <option value="5° Primaria">5° Primaria</option>
                <option value="6° Primaria">6° Primaria</option>
              </optgroup>
              <optgroup label="Secundaria">
                <option value="1° Secundaria">1° Secundaria</option>
                <option value="2° Secundaria">2° Secundaria</option>
                <option value="3° Secundaria">3° Secundaria</option>
                <option value="4° Secundaria">4° Secundaria</option>
                <option value="5° Secundaria">5° Secundaria</option>
              </optgroup>
            </select>
          </Campo>

          {/* Fotografía */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Fotografía <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            {foto && (
              <div className="relative w-24 h-24 mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto} alt="Vista previa"
                  className="w-24 h-24 rounded-full object-cover border-4 border-yellow-300 shadow" />
                <button type="button" onClick={() => setFoto(undefined)}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">✕</button>
              </div>
            )}
            <div className="flex gap-2">
              <label htmlFor="foto-cam" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-semibold hover:bg-yellow-50"
                style={{ borderColor: '#F5C518', color: '#92400e' }}>
                📷 Tomar foto
                <input id="foto-cam" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFoto} />
              </label>
              <label htmlFor="foto-gal" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-semibold hover:bg-yellow-50"
                style={{ borderColor: '#FDE68A', color: '#92400e' }}>
                🖼️ Galería
                <input id="foto-gal" type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFoto} />
              </label>
            </div>
            {errorFoto && <p className="text-xs text-red-600">{errorFoto}</p>}
          </div>
        </div>
      </Card>

      {/* ── 2. DATOS DEL APODERADO ── */}
      <Card>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#4a2c00' }}>👨‍👩‍👧 Datos de los Padres o Apoderados</h2>
        <div className="flex flex-col gap-4">

          <Campo label="Nombre completo *" error={errores.apNombre}>
            <input value={apNombre} onChange={e => setApNombre(e.target.value)}
              placeholder="Ej: María García López" className={cls(!!errores.apNombre)} />
          </Campo>

          <Campo label="Relación con el niño *" error={errores.apRelacion}>
            <select value={apRelacion} onChange={e => setApRelacion(e.target.value)} className={cls(!!errores.apRelacion)}>
              <option value="">Seleccionar...</option>
              <option value="padre">Padre</option>
              <option value="madre">Madre</option>
              <option value="tutor">Tutor / Apoderado</option>
            </select>
          </Campo>

          <Campo label="Teléfono / WhatsApp *" error={errores.apTelefono}>
            <input type="tel" value={apTelefono} onChange={e => setApTelefono(e.target.value)}
              placeholder="+51 999 999 999" className={cls(!!errores.apTelefono)} />
          </Campo>

          <Campo label="Correo electrónico *" error={errores.apEmail}>
            <input type="email" value={apEmail} onChange={e => setApEmail(e.target.value)}
              placeholder="correo@ejemplo.com" className={cls(!!errores.apEmail)} />
          </Campo>

          <Campo label="Dirección">
            <input value={apDireccion} onChange={e => setApDireccion(e.target.value)}
              placeholder="Ej: Av. Los Olivos 123" className={cls()} />
          </Campo>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Departamento">
              <select value={apDepartamento} onChange={e => setApDepartamento(e.target.value)} className={cls()}>
                {DEPARTAMENTOS_PERU.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Campo>
            <Campo label="Distrito">
              {apDepartamento === 'Lima' ? (
                <select value={apDistrito} onChange={e => setApDistrito(e.target.value)} className={cls()}>
                  <option value="">Seleccionar distrito...</option>
                  {DISTRITOS_LIMA.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <input value={apDistrito} onChange={e => setApDistrito(e.target.value)}
                  placeholder="Ingresa tu distrito" className={cls()} />
              )}
            </Campo>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 space-y-3">
            <p className="text-sm font-semibold" style={{ color: '#92400e' }}>🚨 Contacto de emergencia</p>
            <p className="text-xs text-gray-500">Este contacto también se agregará automáticamente como persona autorizada para recoger al niño.</p>
            <Campo label="Nombre del contacto">
              <input value={apEmergenciaNombre} onChange={e => {
                setApEmergenciaNombre(e.target.value);
                // Sincronizar con personas autorizadas
                const nuevo = e.target.value.trim();
                if (nuevo) {
                  // Agregar o reemplazar el contacto de emergencia en la lista
                  setApPersonasAut(prev => {
                    const partes = prev.split(',').map(p => p.trim()).filter(p => p && p !== apEmergenciaNombre.trim());
                    return [...partes, nuevo].join(', ');
                  });
                }
              }}
                placeholder="Ej: Carlos García (tío)" className={cls()} />
            </Campo>
            <Campo label="Teléfono de emergencia">
              <input type="tel" value={apEmergenciaTel} onChange={e => setApEmergenciaTel(e.target.value)}
                placeholder="+51 999 999 999" className={cls()} />
            </Campo>
          </div>

          <Campo label="Personas autorizadas para recoger al niño">
            <input value={apPersonasAut} onChange={e => setApPersonasAut(e.target.value)}
              placeholder="Ej: Carlos García, Rosa Pérez" className={cls()} />
            <p className="text-xs text-gray-400 mt-1">Puedes agregar más personas separadas por coma</p>
          </Campo>

          <Campo label="Servicio al que asiste habitualmente">
            <select value={apServicio} onChange={e => setApServicio(e.target.value)} className={cls()}>
              <option value="">Seleccionar...</option>
              <option value="8am">8:00 AM — Primer Servicio</option>
              <option value="11am">11:00 AM — Segundo Servicio</option>
              <option value="1pm">1:00 PM — Tercer Servicio</option>
              <option value="730pm">7:30 PM — Servicio Nocturno</option>
            </select>
          </Campo>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="miembro" checked={apMiembro} onChange={e => setApMiembro(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-yellow-500" />
            <label htmlFor="miembro" className="text-sm text-gray-700">Es miembro activo de la iglesia</label>
          </div>
        </div>
      </Card>

      {/* ── 3. INFORMACIÓN ESPIRITUAL (opcional) ── */}
      <Card>
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold" style={{ color: '#4a2c00' }}>✝️ Información Espiritual</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#D97706' }}>Opcional</span>
            </div>
            <span className="text-gray-400 group-open:rotate-180 transition-transform text-lg select-none">▼</span>
          </summary>
          <div className="flex flex-col gap-3 mt-4">
            {[
              { id: 'pv', label: '¿Es la primera vez que asiste?', val: primeraVez, set: setPrimeraVez },
              { id: 'baut', label: '¿El niño está bautizado?', val: bautizado, set: setBautizado },
              { id: 'ac', label: '¿Ha aceptado a Cristo?', val: aceptoCristo, set: setAceptoCristo },
              { id: 'ar', label: '¿Asiste regularmente?', val: asistenciaReg, set: setAsistenciaReg },
            ].map(({ id, label, val, set }) => (
              <div key={id} className="flex items-center gap-3">
                <input type="checkbox" id={id} checked={val} onChange={e => set(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-yellow-500" />
                <label htmlFor={id} className="text-sm text-gray-700">{label}</label>
              </div>
            ))}
            <Campo label="¿Cómo se enteró del ministerio?">
              <select value={comoSeEntero} onChange={e => setComoSeEntero(e.target.value)} className={cls()}>
                <option value="">Seleccionar...</option>
                <option value="amigo">Un amigo / familiar</option>
                <option value="redes">Redes sociales</option>
                <option value="iglesia">Anuncio en la iglesia</option>
                <option value="volante">Volante / flyer</option>
                <option value="otro">Otro</option>
              </select>
            </Campo>
          </div>
        </details>
      </Card>

      {/* ── 4. INFORMACIÓN MÉDICA (opcional) ── */}
      <Card>
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold" style={{ color: '#4a2c00' }}>🏥 Información Médica</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#D97706' }}>Opcional</span>
            </div>
            <span className="text-gray-400 group-open:rotate-180 transition-transform text-lg select-none">▼</span>
          </summary>
          <div className="flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Tipo de sangre">
                <select value={tipoSangre} onChange={e => setTipoSangre(e.target.value)} className={cls()}>
                  <option value="">No sé / No especificar</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Campo>
              <Campo label="Seguro médico">
                <select value={seguro} onChange={e => setSeguro(e.target.value)} className={cls()}>
                  <option value="">Seleccionar...</option>
                  <option value="SIS">SIS</option>
                  <option value="EsSalud">EsSalud</option>
                  <option value="privado">Seguro privado</option>
                  <option value="ninguno">Ninguno</option>
                </select>
              </Campo>
            </div>
            {[
              { label: 'Alergias', val: alergias, set: setAlergias, ph: 'Ej: Polen, mariscos...' },
              { label: 'Condiciones médicas', val: condiciones, set: setCondiciones, ph: 'Ej: Asma, diabetes...' },
              { label: 'Medicamentos que toma', val: medicamentos, set: setMedicamentos, ph: 'Ej: Salbutamol...' },
              { label: 'Restricciones alimentarias', val: restricciones, set: setRestricciones, ph: 'Ej: Sin gluten...' },
              { label: 'Hospital / Clínica de preferencia', val: hospital, set: setHospital, ph: 'Ej: Clínica San Pablo' },
            ].map(({ label, val, set, ph }) => (
              <Campo key={label} label={label}>
                <input value={val} onChange={e => set(e.target.value)} placeholder={ph} className={cls()} />
              </Campo>
            ))}
            <div className="flex items-center gap-3">
              <input type="checkbox" id="disc" checked={discapacidad} onChange={e => setDiscapacidad(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-yellow-500" />
              <label htmlFor="disc" className="text-sm text-gray-700">El niño tiene alguna discapacidad o necesidad especial</label>
            </div>
            {discapacidad && (
              <Campo label="Describe la discapacidad">
                <input value={detalleDisc} onChange={e => setDetalleDisc(e.target.value)}
                  placeholder="Ej: Síndrome de Down, autismo leve..." className={cls()} />
              </Campo>
            )}
          </div>
        </details>
      </Card>

      <button type="submit" disabled={enviando}
        className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-60"
        style={{ background: '#F5C518', color: '#4a2c00' }}>
        {enviando ? 'Registrando...' : '✅ Inscribir Niño(a)'}
      </button>
    </form>
  );
}
