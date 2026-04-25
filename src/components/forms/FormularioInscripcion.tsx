'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SchemaInscripcion, type InscripcionFormData } from '@/lib/validaciones';
import { DISTRITOS_LIMA, DEPARTAMENTOS_PERU } from '@/lib/ubicacionesPeru';
import { Button, Input, Card } from '@/components/ui';
import type { Alumno, Apoderado } from '@/types';

interface FormularioInscripcionProps {
  onExito: (alumno: Alumno, apoderado: Apoderado) => void;
}

const TIPOS_FOTO_ACEPTADOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FOTO_BYTES = 5 * 1024 * 1024;

function convertirArchivoABase64(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(archivo);
  });
}

const selectClass = (error?: string) => [
  'w-full rounded-lg border px-3 py-2 text-sm text-gray-900',
  'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1',
  error ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
].join(' ');

const checkboxClass = 'w-4 h-4 rounded border-gray-300 accent-yellow-500';

export default function FormularioInscripcion({ onExito }: FormularioInscripcionProps) {
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | undefined>(undefined);
  const [departamento, setDepartamento] = useState('Lima');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } =
    useForm<InscripcionFormData>({
      resolver: zodResolver(SchemaInscripcion),
      defaultValues: {
        alumno: { nombreCompleto: '', fechaNacimiento: '', sexo: undefined,
          tieneDiscapacidad: false, esBautizado: false, haAceptadoCristo: false,
          primeraVez: true, asistenciaRegular: false },
        apoderado: { nombreCompleto: '', relacion: undefined, telefono: '',
          email: '', esMiembroIglesia: false },
      },
    });

  const tieneDiscapacidad = watch('alumno.tieneDiscapacidad');

  async function manejarCambioFoto(e: React.ChangeEvent<HTMLInputElement>) {
    setErrorFoto(null);
    const archivo = e.target.files?.[0];
    if (!archivo) { setFotoBase64(undefined); return; }
    if (!TIPOS_FOTO_ACEPTADOS.includes(archivo.type)) {
      setErrorFoto('Solo se aceptan imágenes en formato JPG, PNG o WebP');
      setFotoBase64(undefined); return;
    }
    if (archivo.size > MAX_FOTO_BYTES) {
      setErrorFoto('La imagen no debe superar los 5MB');
      setFotoBase64(undefined); return;
    }
    try {
      setFotoBase64(await convertirArchivoABase64(archivo));
    } catch {
      setErrorFoto('Error al procesar la imagen');
      setFotoBase64(undefined);
    }
  }

  async function onSubmit(datos: InscripcionFormData) {
    const ahora = new Date().toISOString();
    const apoderadoId = crypto.randomUUID();
    const alumnoId = crypto.randomUUID();
    const codigoQR = `MIN-${alumnoId.slice(0, 8).toUpperCase()}`;

    const apoderado: Apoderado = {
      id: apoderadoId,
      ...datos.apoderado,
      departamento,
    };

    const alumno: Alumno = {
      id: alumnoId,
      ...datos.alumno,
      fotografiaUrl: fotoBase64,
      salonId: '',
      apoderadoId,
      fechaRegistro: ahora,
      codigoQR,
    };

    onExito(alumno, apoderado);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">

      {/* ── 1. DATOS DEL NIÑO ── */}
      <Card>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#4a2c00' }}>👦 Datos del Niño(a)</h2>
        <div className="flex flex-col gap-4">

          <Input label="Nombre completo *" placeholder="Ej: Juan Pérez García"
            error={errors.alumno?.nombreCompleto?.message} {...register('alumno.nombreCompleto')} />

          <Input label="Fecha de nacimiento *" type="date"
            max={new Date().toISOString().split('T')[0]}
            error={errors.alumno?.fechaNacimiento?.message} {...register('alumno.fechaNacimiento')} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Sexo *</label>
            <select className={selectClass(errors.alumno?.sexo?.message)} defaultValue=""
              {...register('alumno.sexo')}>
              <option value="" disabled>Seleccionar...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
            {errors.alumno?.sexo && <p className="text-xs text-red-600">{errors.alumno.sexo.message}</p>}
          </div>

          <Input label="Colegio donde estudia" placeholder="Ej: I.E. San Martín"
            {...register('alumno.colegio')} />

          <Input label="Grado / Año escolar" placeholder="Ej: 3° Primaria"
            {...register('alumno.grado')} />

          {/* Fotografía */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Fotografía <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            {fotoBase64 && (
              <div className="relative w-24 h-24 mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fotoBase64} alt="Vista previa"
                  className="w-24 h-24 rounded-full object-cover border-4 border-yellow-300 shadow" />
                <button type="button" onClick={() => setFotoBase64(undefined)}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow">
                  ✕
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <label htmlFor="foto-camara"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-semibold hover:bg-yellow-50"
                style={{ borderColor: '#F5C518', color: '#92400e' }}>
                📷 Tomar foto
                <input id="foto-camara" type="file" accept="image/*" capture="environment"
                  className="hidden" onChange={manejarCambioFoto} />
              </label>
              <label htmlFor="foto-galeria"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-semibold hover:bg-yellow-50"
                style={{ borderColor: '#FDE68A', color: '#92400e' }}>
                🖼️ Galería
                <input id="foto-galeria" type="file" accept=".jpg,.jpeg,.png,.webp"
                  className="hidden" onChange={manejarCambioFoto} />
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

          <Input label="Nombre completo *" placeholder="Ej: María García López"
            error={errors.apoderado?.nombreCompleto?.message} {...register('apoderado.nombreCompleto')} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Relación con el niño *</label>
            <select className={selectClass(errors.apoderado?.relacion?.message)} defaultValue=""
              {...register('apoderado.relacion')}>
              <option value="" disabled>Seleccionar...</option>
              <option value="padre">Padre</option>
              <option value="madre">Madre</option>
              <option value="tutor">Tutor / Apoderado</option>
            </select>
            {errors.apoderado?.relacion && <p className="text-xs text-red-600">{errors.apoderado.relacion.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Teléfono / WhatsApp *" type="tel" placeholder="+51 999 999 999"
              error={errors.apoderado?.telefono?.message} {...register('apoderado.telefono')} />
            <Input label="WhatsApp (si es diferente)" type="tel" placeholder="+51 999 999 999"
              {...register('apoderado.whatsapp')} />
          </div>

          <Input label="Correo electrónico *" type="email" placeholder="correo@ejemplo.com"
            error={errors.apoderado?.email?.message} {...register('apoderado.email')} />

          <Input label="Dirección" placeholder="Ej: Av. Los Olivos 123"
            {...register('apoderado.direccion')} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Departamento</label>
              <select className={selectClass()} value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}>
                {DEPARTAMENTOS_PERU.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Distrito</label>
              {departamento === 'Lima' ? (
                <select className={selectClass()} defaultValue="" {...register('apoderado.distrito')}>
                  <option value="">Seleccionar distrito...</option>
                  {DISTRITOS_LIMA.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <Input placeholder="Ingresa tu distrito" {...register('apoderado.distrito')} />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 space-y-3">
            <p className="text-sm font-semibold" style={{ color: '#92400e' }}>🚨 Contacto de emergencia</p>
            <Input label="Nombre del contacto de emergencia" placeholder="Ej: Carlos García (tío)"
              {...register('apoderado.nombreEmergencia')} />
            <Input label="Teléfono de emergencia" type="tel" placeholder="+51 999 999 999"
              {...register('apoderado.telefonoEmergencia')} />
          </div>

          <Input label="Personas autorizadas para recoger al niño"
            placeholder="Ej: Carlos García, Rosa Pérez (separados por coma)"
            {...register('apoderado.personasAutorizadas')} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Servicio al que asiste habitualmente</label>
            <select className={selectClass()} defaultValue="" {...register('apoderado.servicioHabitual')}>
              <option value="">Seleccionar...</option>
              <option value="8am">8:00 AM — Primer Servicio</option>
              <option value="11am">11:00 AM — Segundo Servicio</option>
              <option value="1pm">1:00 PM — Tercer Servicio</option>
              <option value="730pm">7:30 PM — Servicio Nocturno</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="miembro" className={checkboxClass}
              {...register('apoderado.esMiembroIglesia')} />
            <label htmlFor="miembro" className="text-sm text-gray-700">
              Es miembro activo de la iglesia
            </label>
          </div>
        </div>
      </Card>

      {/* ── 3. INFORMACIÓN ESPIRITUAL (opcional, colapsable) ── */}
      <Card>
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold" style={{ color: '#4a2c00' }}>✝️ Información Espiritual</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#D97706' }}>
                Opcional
              </span>
            </div>
            <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200 text-lg select-none">▼</span>
          </summary>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Nos ayuda a conocer mejor la etapa espiritual de tu hijo.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { id: 'primeraVez', label: '¿Es la primera vez que asiste al ministerio?', field: 'alumno.primeraVez' as const },
              { id: 'esBautizado', label: '¿El niño está bautizado?', field: 'alumno.esBautizado' as const },
              { id: 'haAceptadoCristo', label: '¿Ha aceptado a Cristo?', field: 'alumno.haAceptadoCristo' as const },
              { id: 'asistenciaRegular', label: '¿Asiste regularmente al ministerio?', field: 'alumno.asistenciaRegular' as const },
            ].map(({ id, label, field }) => (
              <div key={id} className="flex items-center gap-3">
                <input type="checkbox" id={id} className={checkboxClass} {...register(field)} />
                <label htmlFor={id} className="text-sm text-gray-700">{label}</label>
              </div>
            ))}
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-sm font-medium text-gray-700">¿Cómo se enteró del ministerio?</label>
              <select className={selectClass()} defaultValue="" {...register('alumno.comoSeEntero')}>
                <option value="">Seleccionar...</option>
                <option value="amigo">Un amigo / familiar</option>
                <option value="redes">Redes sociales</option>
                <option value="iglesia">Anuncio en la iglesia</option>
                <option value="volante">Volante / flyer</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
        </details>
      </Card>

      {/* ── 4. INFORMACIÓN MÉDICA (opcional, colapsable) ── */}
      <Card>
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold" style={{ color: '#4a2c00' }}>🏥 Información Médica</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#D97706' }}>
                Opcional
              </span>
            </div>
            <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200 text-lg select-none">▼</span>
          </summary>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Esta información nos ayuda a cuidar mejor a tu hijo en caso de emergencia.
          </p>
          <div className="flex flex-col gap-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Tipo de sangre</label>
                <select className={selectClass()} defaultValue="" {...register('alumno.tipoSangre')}>
                  <option value="">No sé / No especificar</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Seguro médico</label>
                <select className={selectClass()} defaultValue="" {...register('alumno.seguroMedico')}>
                  <option value="">Seleccionar...</option>
                  <option value="SIS">SIS</option>
                  <option value="EsSalud">EsSalud</option>
                  <option value="privado">Seguro privado</option>
                  <option value="ninguno">Ninguno</option>
                </select>
              </div>
            </div>

            <Input label="Alergias" placeholder="Ej: Polen, mariscos, penicilina..."
              {...register('alumno.alergias')} />

            <Input label="Condiciones médicas" placeholder="Ej: Asma, diabetes, epilepsia..."
              {...register('alumno.condicionesMedicas')} />

            <Input label="Medicamentos que toma" placeholder="Ej: Salbutamol, insulina..."
              {...register('alumno.medicamentos')} />

            <Input label="Restricciones alimentarias" placeholder="Ej: Sin gluten, sin lactosa..."
              {...register('alumno.restriccionesAlimentarias')} />

            <Input label="Hospital / Clínica de preferencia" placeholder="Ej: Clínica San Pablo"
              {...register('alumno.hospitalPreferencia')} />

            <div className="flex items-center gap-3">
              <input type="checkbox" id="discapacidad" className={checkboxClass}
                {...register('alumno.tieneDiscapacidad')} />
              <label htmlFor="discapacidad" className="text-sm text-gray-700">
                El niño tiene alguna discapacidad o necesidad especial
              </label>
            </div>
            {tieneDiscapacidad && (
              <Input label="Describe la discapacidad o necesidad especial"
                placeholder="Ej: Síndrome de Down, autismo leve..."
                {...register('alumno.detalleDiscapacidad')} />
            )}
          </div>
        </details>
      </Card>

      <Button type="submit" loading={isSubmitting} size="lg" className="w-full"
        style={{ background: '#F5C518', color: '#4a2c00', border: 'none' }}>
        {isSubmitting ? 'Registrando...' : '✅ Inscribir Niño(a)'}
      </Button>
    </form>
  );
}
